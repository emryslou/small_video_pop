chrome.extension.onMessage.addListener(function () {
    let data = arguments[0].data,
        tabInfo = arguments[1],
        cb = arguments[2],
        action = arguments[0].action;
    console.log('send message', data, tabInfo, cb);
    switch (action) {
       case "video_open":
           chrome.windows.create({
               type: 'popup',
               state: 'normal',
               tabId: tabInfo.tab.id,
               width: data.width,
               height: data.height,
               top: parseInt(data.top),
               left: parseInt(data.left)
           },  win => {
               console.log('video win info', win);
               chrome.storage.local.set({
                   tabInfo: {
                       windowId: tabInfo.tab.windowId,
                       index: tabInfo.tab.index,
                       tabId: tabInfo.tab.id,
                       videoWinId: win.id
                   }
               }, function () {
                   console.log('storage set', ...arguments);
               });
               chrome.tabs.insertCSS(win.tabs[0].id, {
                   file: 'css/video_win.css',
                   allFrames: true
               }, function () {
                   chrome.tabs.executeScript(win.tabs[0].id, {
                       file: 'js/videoWindow/open.js',
                       allFrames: true,
                       runAt: 'document_end'
                   });
               });
           });
           break;
       case "video_close":
           chrome.storage.local.get('tabInfo', function(localTabInfo) {
               let videoTabInfo = localTabInfo.tabInfo;
               chrome.windows.get(videoTabInfo.windowId, () => {
                   if (chrome.runtime.lastError) {
                     chrome.windows.create({
                         type: "normal",
                         tabId: videoTabInfo.tabId
                     }, (newWinInfo) => {
                         chrome.tabs.update(videoTabInfo.tabId, {
                             selected: true
                         });
                         chrome.tabs.executeScript(videoTabInfo.tabId, {
                             file: 'js/videoWindow/close.js',
                             allFrames: true,
                             runAt: 'document_end'
                         });
                     });
                   } else {
                       chrome.tabs.get(videoTabInfo.tabId, function (tabInfo) {
                           chrome.tabs.move(tabInfo.id, {
                               windowId: videoTabInfo.windowId,
                               index: videoTabInfo.index
                           }, function () {
                               chrome.tabs.update(tabInfo.id, {
                                   selected: true
                               });
                               chrome.tabs.executeScript(videoTabInfo.tabId, {
                                   file: 'js/videoWindow/close.js',
                                   allFrames: true,
                                   runAt: 'document_end'
                               });
                           })
                       })
                   }
               })
           });
           break;
       default:
           console.log(arguments);
           break;
    }
    cb({status:'done'});
});
chrome.runtime.onSuspend.addListener(function () {
    console.log('suspend event', ...arguments);
})