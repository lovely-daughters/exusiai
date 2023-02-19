function wrappedLog(text) {
  console.log(`APPLE_PIE\n${text}`);
}

const downloadQueue = [];

wrappedLog(`ID: ${chrome.runtime.id} \nService Worker Active`);

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

// would there ever be an issue with race conditions?
// distributes a download to a worker
// asynchronous programming is taking me a bit to wrap my head around
// i guess that it will look at the shortest queue and add it to that one?
// i guess let me first see if there's going to be race conditions
async function downloadManager() {}

async function downloadImage(request, sendResponse) {
  const { doujinTitle, imageURL, fileName, fileExtension } = request.body;
  downloadQueue.push(`${doujinTitle}/${fileName}.${fileExtension}`);
  // const downloadId = await chrome.downloads.download({
  //   filename: `${doujinTitle}/${fileName}.${fileExtension}`,
  //   url: imageURL,
  // });
  // const result = await onDownloadComplete(downloadId);
  // wrappedLog(JSON.stringify(result.error));
  // sendResponse(result);
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

  return true; // weird way to go about async
});
