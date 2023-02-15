function wrappedLog(text) {
  console.log(`E_X_U_S_I_A_I\n${text}`);
}

wrappedLog(`ID: ${chrome.runtime.id} \nService Worker Active`);

// https://stackoverflow.com/a/51601659/8056710
// const onDownloadComplete = function (downloadId) {
//   return new Promise((resolve) => {
//     chrome.downloads.onChanged.addListener(function ({ id, state }) {
//       if (id === downloadId && state && state.current !== "in_progress") {
//         // chrome.downloads.onChanged.removeListener(onChanged);
//         resolve(state.current === "complete");
//       }
//     });
//   });
// };

const downloadPromises = new Map();
const onDownloadComplete = (downloadId) => {
  return new Promise((resolve) => {
    downloadPromises.set(downloadId, resolve);
  });
};

chrome.downloads.onChanged.addListener(function ({ id, state, error }) {
  if (state && state.current !== "in_progress") {
    const resolve = downloadPromises.get(id);
    downloadPromises.delete(id);

    resolve({ success: state.current === "complete", error });
  }
});

async function downloadImage(request, sendResponse) {
  const { doujinTitle, imageURL, fileName, fileExtension } = request.body;
  const downloadId = await chrome.downloads.download({
    filename: `${doujinTitle}/${fileName}.${fileExtension}`,
    url: imageURL,
  });
  const success = await onDownloadComplete(downloadId);
  console.log("SANITY CHECK " + success);
  sendResponse(success);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  wrappedLog(
    `Message Received From: ${sender.tab.url}\n${JSON.stringify(request)}`
  );

  if (request.query === "exuKyaaDataURL") {
    const exuDataURL = chrome.runtime.getURL("../images/exuKyaa.png");
    sendResponse(exuDataURL);
  } else if (request.query === "download") {
    downloadImage(request, sendResponse);
  }

  return true;
});
