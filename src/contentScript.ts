// chrome.runtime.sendMessage(chrome.runtime.id, {action:'script_loaded'})
//     chrome.runtime.onMessage.addListener((msg) => {
//         console.log(msg);
//     })

(function(){
    // Суперуникальный идентификатор скрипта
    let hash = window.btoa((new Date).getTime()+'sortofhash')
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.hash === hash) {
            if (msg.action === 'give_me_dimensions') {
                console.log(msg.tab);
                // Определение размера страницы
                // создание частей для отправки на задание
            }
        }
    });
    return {status: 'script_loaded', hash}
})()