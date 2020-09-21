const BG = new class {

    constructor() {}

    /** Сделать скриншот окна */
    takeScreenshot = (windowId: number): Promise<string> => {
        return new Promise((resolve) => {
            chrome.tabs.captureVisibleTab(windowId, {format: 'png', quality: 100}, (screenshotUrl) => {
                resolve(screenshotUrl)
            });
        })
    }
    /** Добавить скрипт на страницу */
    injectScript(tab: chrome.tabs.Tab): void {
        let tabId = tab.id!
        chrome.tabs.executeScript(tabId, {file: 'contentScript.js'}, (response: any) => {
            if (typeof response[0] !== 'undefined') {
                // Если скрипт успешно загружен
                if (response[0].status === 'script_loaded') {
                    let hash = response[0].hash
                    chrome.tabs.sendMessage(tabId, {action: 'give_me_dimensions', hash, tab: {tabId: tab.id, windowId: tab.windowId}})
                }
            }
        })
    }

}

// Отработка нажатия на иконку в быстром запуске
chrome.browserAction.onClicked.addListener((tab) => BG.injectScript(tab));

// Отработка получения сообщений из контент-скриптов
// chrome.runtime.onMessage.addListener((msg, sender, res) => {
//     if (msg.action === 'script_loaded') {
//         let tabId: number = sender.tab?.id!
//         // scroll to 0 (zero)
//         // make screenshot
//         console.log(msg);
//         chrome.tabs.sendMessage(tabId, {action: 'fuck you!'})
//     }
    
// })

// chrome.tabs.captureVisibleTab(null!, {format: 'jpeg', quality: 100}, function(screenshotUrl) {
//     let scrollHeight = Math.max(
//         document.body.scrollHeight, document.documentElement.scrollHeight,
//         document.body.offsetHeight, document.documentElement.offsetHeight,
//         document.body.clientHeight, document.documentElement.clientHeight
//       );

//     var ins = document.createElement('a');
//         ins.setAttribute('download', 'screenshot.jpg');
//         ins.href = screenshotUrl;
//     var ndiv = document.createElement('div');
//         ndiv.appendChild(ins);
        
//     document.body.innerHTML = ndiv.innerHTML
//     document.getElementsByTagName("a")[0].click();
//     document.body.removeChild(document.getElementsByTagName("a")[0]);
// });