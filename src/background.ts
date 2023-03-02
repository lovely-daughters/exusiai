const log = (text: string): void => {
  console.log(text);
};
log(`***-APPLE_CREAM_PIE-***`);
log(`ID: ${chrome.runtime.id} \nService Worker Active`);

interface DownloadItem {
  fileName: string;
  imageURL: string;
}
interface DownloadResult {
  error: any;
}
const downloadQueue: DownloadItem[] = [];

// sending results back to client-side
const sendResponseMap = new Map<string, (response?: any) => void>();
const enqueueDownload = (
  item: DownloadItem,
  sendResponse: (response?: any) => void
) => {
  sendResponseMap.set(item.imageURL, sendResponse);
  downloadQueue.push(item);
};

// tracking when downloads complete
const downloadPromiseMap = new Map<number, any>();
const onDownloadComplete = (
  downloadItemId: number
): Promise<{ error: any }> => {
  return new Promise((resolve) => {
    downloadPromiseMap.set(downloadItemId, resolve);
  });
};
chrome.downloads.onChanged.addListener(function ({ id, state, error }) {
  if (state && state.current !== "in_progress") {
    const resolve = downloadPromiseMap.get(id);
    downloadPromiseMap.delete(id);
    resolve({ error: error ? error : "" });
  }
});

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
  sendResultForItem: (result: DownloadResult, item: DownloadItem) => void
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
        sendResultForItem(result, item);

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
  (result: DownloadResult, item: DownloadItem) => {
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
    const sym = "doujindl_cli";
    const item: DownloadItem = {
      fileName: `symlinks/${sym}/${doujinTitle}/${fileName}.${fileExtension}`,
      imageURL: imageURL,
    };
    enqueueDownload(item, sendResponse);
  }

  return true;
});
