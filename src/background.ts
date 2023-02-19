const log = (text: string): void => {
  console.log(text);
};
log(`***-APPLE_CREAM_PIE-***`);
log(`ID: ${chrome.runtime.id} \nService Worker Active`);

interface DownloadItem {
  fileName: string;
  imageURL: string;
}
const downloadQueue: DownloadItem[] = [];
interface DownloadResult {
  error: string;
}

/**
 * initiateDownloadSystem()
 *
 * The internals of the download system can be isolated from the rest of the
 * codebase. The only interactions with it should be trhough pushing
 * DownloadItems onto the downloadQueue. Said items will internally be
 * distributed to workers for automatic processing.
 *
 * @param downloadQueue
 * @param numWorkers
 */
async function initiateDownloadSystem<DownloadItem>(
  downloadQueue: DownloadItem[],
  numWorkers: number,
  download: (item: DownloadItem) => Promise<{ error: string }>,
  sendResult: (result: DownloadResult, item: DownloadItem) => void
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
        const item: DownloadItem = DWQueue.shift()!;
        const result = await download(item);
        sendResult(result, item);
        DWLog(`Processed ${JSON.stringify(item)}`);
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
        DWMLog(`${JSON.stringify(item)} => ${assignedDWId}`);

        downloadsProcessed += 1;
      } else await sleep();
    }
  };

  for (var index = 0; index < numWorkers; index++) {
    initiateDownloadWorker(generateWorkerId(index));
  }
  initiateDownloadWorkerManager(numWorkers);
}

const sendResponseMap = new Map<string, (response?: any) => void>();
const enqueueDownload = (
  item: DownloadItem,
  sendResponse: (response?: any) => void
) => {
  sendResponseMap.set(item.imageURL, sendResponse);
  downloadQueue.push(item);
};

const downloadPromises = new Map();
const onDownloadComplete = (
  downloadItemId: number
): Promise<{ success: string; error: string }> => {
  return new Promise((resolve) => {
    downloadPromises.set(downloadItemId, resolve);
  });
};
chrome.downloads.onChanged.addListener(function ({ id, state, error }) {
  if (state && state.current !== "in_progress") {
    const resolve = downloadPromises.get(id);
    downloadPromises.delete(id);
    resolve({ success: state.current === "complete", error });
  }
});

initiateDownloadSystem<DownloadItem>(
  downloadQueue,
  3,
  async ({ fileName, imageURL }: DownloadItem) => {
    const downloadItemId = await chrome.downloads.download({
      filename: fileName,
      url: imageURL,
    });
    const result = await onDownloadComplete(downloadItemId);
    return result;
  },
  (result, item) => {
    const sendResponse = sendResponseMap.get(item.imageURL)!;
    sendResponse(result);
  }
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  log(`Message Received: ${sender?.tab?.url}\n${JSON.stringify(request)}`);

  if (request.query === "exuKyaaDataURL") {
    const exuDataURL = chrome.runtime.getURL("../images/exuKyaa.png");
    sendResponse(exuDataURL);
  } else if (request.query === "download") {
    const { doujinTitle, imageURL, fileName, fileExtension } = request.body;
    enqueueDownload(
      {
        fileName: `${doujinTitle}/${fileName}.${fileExtension}`,
        imageURL: imageURL,
      },
      sendResponse
    );
  }

  return true;
});
