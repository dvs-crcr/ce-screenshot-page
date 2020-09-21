interface ImagesParts {
    img: any
    src: string
    width: number
    height: number
}

const BG = new class {

    constructor() {}

    /** Сделать скриншот окна */
    takeScreenshot = (windowId: number): Promise<string> => {
        return new Promise((resolve) => {
            chrome.tabs.captureVisibleTab(windowId, {format: 'jpeg', quality: 100}, (screenshotUrl) => {
                resolve(screenshotUrl)
            });
        })
    }
    /** Отправка сообщения о скролле и взятие скиншота */
    moveScrollAndTakeScreenshot(tabId: number, windowId: number, params: WorkData, ypos: number, part: number): Promise<string> {
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, {action: 'please_scroll', hash: params.hash, XY:[params.startXY[0], ypos], part}, async (response) => {
                if (response === 'scroll_done') {
                    window.setTimeout(async () => {
                        let screenshotUrl = await this.takeScreenshot(windowId)
                        resolve(screenshotUrl)
                    }, 100)
                }
            })
        })
    }
    /** Добавить скрипт на страницу */
    injectScript(tab: chrome.tabs.Tab): void {
        let tabId = tab.id!
        chrome.tabs.executeScript(tabId, {file: 'contentScript.js'}, (response: any) => {
            
            if (typeof response[0] !== 'undefined') {
                // Если скрипт успешно загружен
                if (response[0].status === 'script_loaded') {
                    chrome.tabs.sendMessage(tabId, {action: 'give_me_dimensions', hash: response[0].hash})
                }
            }
        })
    }
    /** Начало работы над скриншотом */
    async executeProcess(tabId: number, windowId: number, params: WorkData) {
        let images: ImagesParts[] = []
        let parts: [string, string][] = []
        for (let i = 0; i < params.parts; i++) {
            let ypos = i * params.clientHeight
            let screenshotData = await this.moveScrollAndTakeScreenshot(tabId, windowId, params, ypos, i)
            parts.push([screenshotData, i.toString()])
        }
        chrome.tabs.sendMessage(tabId, {action: 'all_back', hash: params.hash}) 
        for (let i in parts) {
            let img = new Image()
            img.src = parts[i][0]
            let imgdata: ImagesParts = await new Promise((resolve) => {
                img.onload = function() {
                    let that: any = this
                    resolve({
                        img: img,
                        src: parts[i][0],
                        width: that.width,
                        height: that.height
                    })
                }
            });
            images[i] = imgdata
        }
        let image = this.imageProcess(images, params.scrollHeight, params.cutHeight)
        this.downloadPart(image, '')
    }
    /** Обработка изображений */
    imageProcess(images: ImagesParts[], scrollHeight: number, cutHeight: number ) {
        let img_len = images.length - 1
        let canvas = window.document.createElement('canvas')
        canvas.width = images[0].width
        canvas.height = scrollHeight
        let context = canvas.getContext('2d')
        let XY: number[] = [0, 0]
        for (let i in images) {
            let from_top = XY[1]
            if (parseInt(i) === img_len) {
                from_top -= cutHeight
            }
            context!.drawImage(images[i].img, XY[0], from_top, images[i].width, images[i].height)
            XY[1] += images[i].height
        }
        return canvas.toDataURL('image/jpeg')
    }
    /** скачивание изображения по url */
    downloadPart(screenshotUrl: string, prefix: string) {
        let ins = document.createElement('a')
            ins.setAttribute('download', (prefix?prefix+'_':'')+'screenshot.jpg')
            ins.href = screenshotUrl
        let ndiv = document.createElement('div')
            ndiv.appendChild(ins)
        document.body.innerHTML = ndiv.innerHTML
        document.getElementsByTagName('a')[0].click()
        document.body.removeChild(document.getElementsByTagName('a')[0])
        return true
    }
}
// Отработка нажатия на иконку в быстром запуске
chrome.browserAction.onClicked.addListener((tab) => BG.injectScript(tab))
// Отработка получения сообщений из контент-скриптов
chrome.runtime.onMessage.addListener((msg, sender, res) => {
    if (msg.action === 'make_some_work') {
        let tabId: number = sender.tab?.id!
        let windowId: number = sender.tab?.windowId!
        BG.executeProcess(tabId, windowId, msg.params)
    }
})
