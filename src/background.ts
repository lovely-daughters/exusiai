const log = (text: string): void => {
  console.log(text);
};
log(`***-APPLE_CREAM_PIE-***`);
log(`ID: ${chrome.runtime.id} \nService Worker Active`);

interface DownloadItem {
  url: string;
}
const downloadQueue: DownloadItem[] = [];

/**
 * initiateDownloadSystem()
 *
 * The internals of the download system can be isolated from the rest of the
 * codebase. The only interactions with it should be to push DownloadItems
 * onto the downloadQueue. Said items will internally be distributed to
 * workers for automatic processing.
 *
 * @param downloadQueue
 * @param numWorkers
 */
async function initiateDownloadSystem<DownloadItem>(
  downloadQueue: DownloadItem[],
  numWorkers: number
) {
  const sleep = async (duration: number = 500) => {
    await new Promise((resolve) => setTimeout(resolve, duration));
  };

  const generateWorkerId = (index: number): string => {
    return `DW-${String(index).padStart(3, "0")}`;
  };

  const DWQueueMap = new Map<string, DownloadItem[]>();
  const initiateDownloadWorker = async (
    workerId: string // prettier-ignore
  ): Promise<void> => {
    const DWQueue: DownloadItem[] = [];
    DWQueueMap.set(workerId, DWQueue);

    const DWLog = (text: string): void => {
      log(`${workerId}: ${text}`);
    };
    DWLog(`Initiated`);

    while (true) {
      if (DWQueue.length) {
        const item = DWQueue.shift();
        DWLog(`Processed ${item}`);
        await sleep(Math.random() * 500);
      } else await sleep();
    }
  };

  const initiateDownloadWorkerManager = async (
    numWorkers: number
  ): Promise<void> => {
    var downloadsProcessed = 0;

    const DWMLog = (text: string): void => {
      log(`DWM: ${text}`);
    };
    DWMLog(`Initiated`);

    while (true) {
      if (downloadQueue.length) {
        const item = downloadQueue.shift()!;
        const assignedDWId = downloadsProcessed % numWorkers;

        // prettier-ignore
        DWQueueMap 
          ?.get(generateWorkerId(assignedDWId))
          ?.push(item);
        DWMLog(`${item} => ${assignedDWId}`);

        downloadsProcessed += 1;
      } else await sleep();
    }
  };

  for (var index = 0; index < numWorkers; index++) {
    initiateDownloadWorker(generateWorkerId(index));
  }
  initiateDownloadWorkerManager(numWorkers);
}

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
  downloadQueue.push({ url: `${doujinTitle}/${fileName}.${fileExtension}` });
  // const downloadId = await chrome.downloads.download({
  //   filename: `${doujinTitle}/${fileName}.${fileExtension}`,
  //   url: imageURL,
  // });
  // const result = await onDownloadComplete(downloadId);
  // wrappedLog(JSON.stringify(result.error));
  // sendResponse(result);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  log(`Message Received: ${sender?.tab?.url}\n${JSON.stringify(request)}`);

  if (request.query === "exuKyaaDataURL") {
    const exuDataURL = chrome.runtime.getURL("../images/exuKyaa.png");
    sendResponse(exuDataURL);
  } else if (request.query === "download") {
    downloadImage(request, sendResponse);
  }

  return true; // weird way to go about async
});
