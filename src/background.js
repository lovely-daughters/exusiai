function wrappedLog(text) {
  console.log(`E_X_U_S_I_A_I\n${text}`);
}

wrappedLog(`ID: ${chrome.runtime.id} \nService Worker Active`);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  wrappedLog(
    `Message Received From: ${sender.tab.url}\n${JSON.stringify(request)}`
  );

  if (request.query === "exuKyaaDataURL") {
    const exuDataURL = chrome.runtime.getURL("../images/exuKyaa.png");
    sendResponse(exuDataURL);
  } else if (request.query === "download") {
    const { doujinTitle, imageURL, fileName } = request.body;
    chrome.downloads.download({
      filename: `${doujinTitle}/${fileName}`,
      url: imageURL,
    });
    sendResponse("sanity check");
  }
});
