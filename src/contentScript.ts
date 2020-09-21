// chrome.runtime.sendMessage(chrome.runtime.id, {action:'script_loaded'})
//     chrome.runtime.onMessage.addListener((msg) => {
//         console.log(msg);
//     })

interface WorkData {
    parts: number
    clientHeight: number  
    cutHeight: number
    startXY: number[],
    hash: string
}

(function(){
    // Суперуникальный идентификатор скрипта
    let hash = window.btoa((new Date).getTime()+'sortofhash')
    function getWorkParams(startX: number, startY: number, hash: string): WorkData {
        let scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,document.body.offsetHeight, document.documentElement.offsetHeight,document.body.clientHeight, document.documentElement.clientHeight)
        let clientHeight = document.documentElement.clientHeight
        let parts = Math.ceil(scrollHeight / clientHeight)
        let modul = scrollHeight % clientHeight
        let cutHeight = 0
        if (modul !== 0 && parts !== 1) {
            cutHeight = clientHeight - modul
        }
        return {
            parts,
            clientHeight,
            cutHeight,
            startXY: [startX, startY],
            hash
        }
    }
    function process(params: WorkData): void {
        chrome.runtime.sendMessage(chrome.runtime.id, {
            action:'make_some_work',
            params
        })
    }
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.hash === hash) {
            if (msg.action === 'give_me_dimensions') {
                process(getWorkParams(window.pageXOffset, window.pageYOffset, hash))
            }
            if (msg.action === 'please_scroll') {
                window.scrollTo(...msg.XY)
            }
        }
    });
    return {status: 'script_loaded', hash}
})()