function wrappedLog(text) {
  console.log(`EXUSIAI: ${text}`);
}

wrappedLog(chrome.runtime.id);
wrappedLog("service worker active");

const exuDataURL = chrome.runtime.getURL("../images/exu265.png");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  wrappedLog(`Message Received: ${sender.tab.url}`);

  if (request.atDoujin === true) {
    wrappedLog(`Doujin Found: ${sender.tab.url}`);
    sendResponse(exuDataURL);
  }
});
