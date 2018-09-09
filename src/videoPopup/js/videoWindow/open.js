!(function (window, undefined) {
    let hasParentIframe = () => {
        return (window.top !== window.self);
    };
    let videoOpen = (qryStr) => {
        let videoEleNode = document.querySelector(qryStr);
        if (!!videoEleNode) {
            if (videoEleNode.nodeName === 'IFRAME') {
                videoEleNode.setAttribute('extVideoQry', videoEleNode.src);
            }
            videoEleNode.classList.add('playerToothbrush');
            let parentVideoEleNode = videoEleNode.parentNode;
            while (parentVideoEleNode.nodeName.toLowerCase() !== 'body') {
                parentVideoEleNode.classList.add('parentToothbrush');
                if (window.getComputedStyle(parentVideoEleNode).position === 'fixed') {
                    parentVideoEleNode.classList.add('absoluteToothbrush')
                }
                parentVideoEleNode = parentVideoEleNode.parentNode;
            }
            document.body.setAttribute('id', 'bodyToothbrush');
            document.body.parentElement.setAttribute('id', 'htmlToothbrush');
            hasParentIframe() && (videoEleNode.nodeName !== 'IFRAME') && (
                console.log('send message', window.location.href),
                window.parent.postMessage({
                    action: 'videoOpen',
                    from: 'small_video',
                    srcUrl: window.location.href
                }, '*')
            );
        }
    };
    window.addEventListener('message', (event) => {
        let msgInfo = event.data;
        console.log('get message open', window.location.href, msgInfo);
        if (msgInfo.from === 'small_video' && msgInfo.action === 'videoOpen' && !!msgInfo.srcUrl) {
            !!msgInfo.srcUrl && videoOpen(`iframe[src="${msgInfo.srcUrl}"]`);
        }
    });
    videoOpen('*[extVideoQry]');
})(window, undefined);