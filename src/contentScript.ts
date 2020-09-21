interface WorkData {
    parts: number
    clientHeight: number  
    cutHeight: number
    startXY: number[],
    hash: string,
    scrollHeight: number
}
(function(){
    let hash = window.btoa((new Date).getTime()+'sortofhash')
    let bodyOverflow = ''
    let baseStartY = 0
    
    function createOpacityStyle() {
        let style = document.createElement('style');
        document.head.appendChild(style);
        style?.sheet?.insertRule('.nullopacityelement {opacity: 0}');
        return true
    }
    function getWorkParams(startX: number, startY: number, hash: string): WorkData {
        let scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,document.body.offsetHeight, document.documentElement.offsetHeight,document.body.clientHeight, document.documentElement.clientHeight)
        let clientHeight = document.documentElement.clientHeight
        let parts = Math.ceil(scrollHeight / clientHeight)
        let modul = scrollHeight % clientHeight
        let cutHeight = 0
        if (modul !== 0 && parts !== 1) {
            cutHeight = clientHeight - modul
        }
        baseStartY = startY
        return {
            parts,
            clientHeight,
            cutHeight,
            startXY: [startX, startY],
            scrollHeight,
            hash
        }
    }
    function hideFixedElements() {
        let els = document.body.getElementsByTagName('*');
        for (let i=0;i<els.length;i++) {
            if (window.getComputedStyle(els[i],null).getPropertyValue('position') == 'fixed') {
                els[i].classList.add('nullopacityelement')
            }
        }
        return true
    }
    function showFixedElements() {
        let els = document.body.getElementsByClassName('nullopacityelement')
        for (let i=0;i<els.length;i++) {
            els[i].classList.remove('nullopacityelement')
        }
        return true
    }
    function process(params: WorkData): void {
        chrome.runtime.sendMessage(chrome.runtime.id, {
            action:'make_some_work',
            params
        })
    }
    function allBack() {
        showFixedElements()
        document.body.style.overflow = bodyOverflow
        window.scrollTo({
            top: baseStartY,
            behavior: "auto"
        })
    }
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        if (msg.hash === hash) {
            if (msg.action === 'all_back') allBack()
            if (msg.action === 'give_me_dimensions') process(getWorkParams(window.pageXOffset, window.pageYOffset, hash))
            if (msg.action === 'please_scroll') {
                if (msg.part === 1) {
                    hideFixedElements()
                }
                window.scrollTo({
                    top: msg.XY[1],
                    behavior: "auto"
                })
                response('scroll_done')
            }
        }
    });
    bodyOverflow = document.body.style.overflow
    createOpacityStyle()
    document.body.style.overflow = 'hidden'
    return {status: 'script_loaded', hash}
})()