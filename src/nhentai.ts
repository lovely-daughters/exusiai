const log = (text: string): void => {
  console.log(text);
};
log(`***-APPLE_CREAM_PIE-***`);
log(`Content Script Active`);

const getDoujinTitle = async (): Promise<[string, string]> => {
  const titleElement = document.getElementsByTagName("h1")[0];
  const title = titleElement.textContent!;
  const sluggedTitle = title!.replace(/[^a-z0-9_\-\[\]() ]/gi, "_");
  return [title, sluggedTitle];
};

const getDoujinPageCount = async (): Promise<number> => {
  const tagsElementText = document.getElementById("tags")!.outerText;
  const matches = tagsElementText.matchAll(/Pages:\s*([0-9]+)\s*Uploaded/g);
  const match = [...matches][0];
  return Number(match[1]);
};

interface GalleryURLComponents {
  urlBase: string;
  galleryID: string;
  fileType: string;
}
const getGalleryURLComponents = async (): Promise<GalleryURLComponents> => {
  const firstPageHTML = await fetch(`${window.location.href}1/`, {
    method: "GET",
  }).then((res) => res.text());

  const matches = firstPageHTML.matchAll(
    /<img src="(https:\/\/\S*nhentai\.net\/galleries)\/([0-9]+)\/([0-9]+)\.(\S+)" width="[0-9]+" height="[0-9]+" \/>/g
  );
  const match = [...matches][0];

  return {
    urlBase: match[1],
    galleryID: match[2],
    fileType: match[4],
  };
};

const generateGalleryURLs = (
  pageCount: number,
  galleryURLComponents: GalleryURLComponents
): string[] => {
  const galleryURLs: string[] = [];
  for (var index = 1; index <= pageCount; index++) {
    galleryURLs.push(
      `${galleryURLComponents.urlBase}/${galleryURLComponents.galleryID}/${index}.${galleryURLComponents.fileType}`
    );
  }
  return galleryURLs;
};

const downloadDoujinImage = async (
  doujinTitle: string,
  galleryBaseURL: string,
  fileName: string,
  fileExtension: string,
  timesFailed = 0
): Promise<void> => {
  const imageURL = `${galleryBaseURL}/${fileName}.${fileExtension}`;
  log(`Download Request Sent: ${imageURL}`);

  chrome.runtime
    .sendMessage({
      query: "download",
      body: {
        doujinTitle,
        imageURL,
        fileName,
        fileExtension,
      },
    })
    .then(({ success, error }) => {
      if (success) {
        log(`COMPLETE: ${imageURL}`);
      } else if (error.current === "SERVER_BAD_CONTENT") {
        log(`SERVER_BAD_CONTENT`);
        if (timesFailed === 0) {
          const otherFileExtension =
            fileExtension.toLowerCase() === "jpg" ? "png" : "jpg";
          log(`Trying ${otherFileExtension}`);
          downloadDoujinImage(
            doujinTitle,
            galleryBaseURL,
            fileName,
            otherFileExtension,
            timesFailed + 1
          );
        }
      } else if (error.current === "SERVER_FAILED") {
        log("SERVER_FAILED");
        if (timesFailed < 3) {
          log(`TIMES FAILED (${timesFailed}): ${imageURL}`);
          downloadDoujinImage(
            doujinTitle,
            galleryBaseURL,
            fileName,
            fileExtension,
            timesFailed + 1
          );
        }
      }
    });
};

const exuOnClickHandler = async () => {
  const [title, sluggledTitle] = await getDoujinTitle();
  const pageCount = await getDoujinPageCount();
  const galleryURLComponents = await getGalleryURLComponents();
  const galleryURLs = generateGalleryURLs(pageCount, galleryURLComponents);

  for (const galleryURL of galleryURLs) {
    const galleryURLSplits = galleryURL.split("/");
    const [fileName, fileExtension] = galleryURLSplits.pop()!.split(".");
    const galleryURLBase = galleryURLSplits.join("/");
    downloadDoujinImage(sluggledTitle, galleryURLBase, fileName, fileExtension);
  }
};

const main = async () => {
  if (
    window.location.href.match(/^https:\/\/(.*)nhentai\.net\/g\/([0-9]+)\/$/i)
  ) {
    const exuKyaaDataURL = await chrome.runtime.sendMessage({
      query: "exuKyaaDataURL",
    });

    document.body.innerHTML += `<img id="exu" style="position:fixed; top:10px; right:10px; border-radius:10px; cursor:pointer;" width="64" height="64" src='${exuKyaaDataURL}'>`;

    const exu = document.getElementById("exu")!;
    exu.addEventListener("click", exuOnClickHandler);
  }
};

main();

export {};
