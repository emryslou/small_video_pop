!(function (window, undefined) {
    let videoClose = () => {
        let videoEleNode = document.querySelector('*[extVideoQry]');
        videoEleNode.classList.remove('playerToothbrush');
        videoEleNode.removeAttribute('extVideoData');
        let parentVideoEleNode = videoEleNode.parentNode;
        while (parentVideoEleNode.nodeName.toLowerCase() !== 'body') {
            parentVideoEleNode.classList.remove('parentToothbrush');
            if (parentVideoEleNode.classList.contains('absoluteToothbrush')) {
                parentVideoEleNode.classList.remove('absoluteToothbrush');
            }
            parentVideoEleNode = parentVideoEleNode.parentNode;
        }
        document.body.removeAttribute('id');
        document.body.parentElement.removeAttribute('id');
        if (videoEleNode.nodeName === 'IFRAME') {
            videoEleNode.contentWindow.postMessage({
                action: 'videoClose',
                from: 'small_video'
            }, videoEleNode.src);
        }
    };
    window.addEventListener('message', (event) => {
        let msgInfo = event.data;
        console.log('get message open', window.location.href, msgInfo);
        if (msgInfo.from === 'small_video' && msgInfo.action === 'videoClose') {
            videoClose();
        }
    });
    (window.top === window.self) && videoClose();
})(window, undefined);