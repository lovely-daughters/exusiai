const log = (text) => { console.log(text); };
log(`***-APPLE_CREAM_PIE-***`);
log(`ID: ${chrome.runtime.id} \nService Worker Active`);

const downloadQueue = [];

const initiateDownloadSystem = async (downloadQueue, numWorkers) => {
  const sleep = async (duration = 500) => {
    await new Promise((resolve) => setTimeout(resolve, duration));
  };

  const generateWorkerId = (num) => {
    return `DW-${String(num).padStart(3, "0")}`;
  };

  const DWQueueMap = new Map();
  const initiateDownloadWorker = async (workerId) => {
    const DWQueue = [];
    DWQueueMap.set(workerId, DWQueue);

    const DWLog = (text) => {
      log(`${workerId}: ${text}`);
    };
    DWLog(`Initiated`);

    while (true) {
      if (DWQueue.length) {
        const item = DWQueue.shift();
        DWLog(`Processed ${item}`);
        await sleep(Math.random() * 500)
      } else await sleep();
    }
  };

  const initiateDownloadWorkerManager = async (numWorkers) => {
    var downloadsProcessed = 0;

    const DWMLog = (text) => { log(`DWM: ${text}`); };
    DWMLog(`Initiated`);

    while (true) {
      if (downloadQueue.length) {
        const item = downloadQueue.shift();
        const assignedDWId = downloadsProcessed % numWorkers
        const assignedDWQueue = DWQueueMap.get(generateWorkerId(assignedDWId));
        assignedDWQueue.push(item)
        DWMLog(`${item} => ${assignedDWId}`)

        downloadsProcessed += 1;
      } else await sleep();
    }
  };

  for (var index = 0; index < numWorkers; index++) {
    initiateDownloadWorker(generateWorkerId(index));
  }
  initiateDownloadWorkerManager(numWorkers);

  await sleep(1500);
  console.log(DWQueueMap)
  for (var index = 0; index < 100; index++) {
    downloadQueue.push(index);
  }
};

initiateDownloadSystem(downloadQueue, 3);



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
