util.$('.sv_btn').addEventListener('click', function () {
    if (util.$('.sv_btn').getAttribute('window-status') === 'normal') {
        let videoInfo = JSON.parse(document.querySelector('data#videoInfo').innerText);
        chrome.extension.sendMessage({
            action: 'video_open',
            data: {
                width: Math.ceil(videoInfo.width),
                height: Math.ceil(videoInfo.height) + 21,
                top: (window.screen.height - videoInfo.height) / 2,
                left: (window.screen.width - videoInfo.width) / 2,
                scroll: videoInfo.y
            }
        }, function () {
            console.log('send message args:', arguments);
            if (chrome.runtime.lastError) {
                console.log("runtime", chrome.runtime.lastError);
            } else {
                util.$('.sv_btn').innerHTML = '关闭小窗';
                util.$('.sv_btn').style.cssText = 'top: 2px; right: 0px;';
                util.$('.sv_btn').setAttribute('window-status', 'popup');
            }
        });
    }
    else {
        chrome.tabs.getCurrent(tabInfo => {
            chrome.extension.sendMessage({
                action: 'video_close',
                data: {
                    curTabInfo: tabInfo,
                    lastWindowInfo: {}
                }
            }, function () {
                console.log('send message args:', arguments);
                if (chrome.runtime.lastError) {
                    console.log("runtime", chrome.runtime.lastError);
                } else {
                    util.$('.sv_btn').innerHTML = '开启小窗';
                    util.$('.sv_btn').setAttribute('window-status', 'normal');
                }
            });
        })
    }
});
window.addEventListener('message', function(event) {
    let postData = event.data;
    switch (postData.action) {
        case 'send_video_info':
            document.querySelector('data#videoInfo').innerText = JSON.stringify(postData.data);
            break;
        default:
            console.log("message", postData);
            break;
    }
});