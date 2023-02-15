const getDoujinTitle = async () => {
  const titleElement = document.getElementsByTagName("h1")[0];
  const title = titleElement.textContent;
  const sluggedTitle = title.replace(/[^a-z0-9_\-\[\]() ]/gi, "_");
  return [title, sluggedTitle];
};

const getDoujinPageCount = async () => {
  const tagsElementText = document.getElementById("tags").outerText;
  const match = [
    ...tagsElementText.matchAll(/Pages:\s*([0-9]+)\s*Uploaded/g),
  ][0];
  return Number(match[1]);
};

const getGalleryURLComponents = async () => {
  const firstPageHTML = await fetch(`${window.location.href}/1/`, {
    method: "GET",
  }).then((res) => res.text());

  const match = [
    ...firstPageHTML.matchAll(
      /<img src="(https:\/\/\S*nhentai\.net\/galleries)\/([0-9]+)\/([0-9]+)\.(\S+)" width="[0-9]+" height="[0-9]+" \/>/g
    ),
  ][0];

  return {
    urlBase: match[1],
    galleryID: match[2],
    fileType: match[4],
  };
};

const generateGalleryURLs = (pageCount, galleryURLComponents) => {
  const galleryURLs = [];
  for (var index = 1; index <= pageCount; index++) {
    galleryURLs.push(
      `${galleryURLComponents.urlBase}/${galleryURLComponents.galleryID}/${index}.${galleryURLComponents.fileType}`
    );
  }
  return galleryURLs;
};

const downloadDoujinImage = async (
  doujinTitle,
  galleryBaseURL,
  fileName,
  fileExtension,
  retrying = false
) => {
  const imageURL = `${galleryBaseURL}/${fileName}.${fileExtension}`;
  console.log(`Downloading: ${imageURL}`);

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
        console.log(`COMPLETE: ${imageURL}`);
      } else if (error.current === "SERVER_BAD_CONTENT") {
        console.log(`SERVER_BAD_CONTENT`);
        if (retrying === false) {
          otherFileExtension =
            fileExtension.toLowerCase() === "jpg" ? "png" : "jpg";
          console.log(`Trying ${otherFileExtension}`);
          downloadDoujinImage(
            doujinTitle,
            galleryBaseURL,
            fileName,
            otherFileExtension,
            true
          );
        }
      }
      // i need to observe to see the overload error
    });
};

const exuOnClickHandler = async () => {
  const [title, sluggledTitle] = await getDoujinTitle();
  const pageCount = await getDoujinPageCount();
  const galleryURLComponents = await getGalleryURLComponents();
  const galleryURLs = generateGalleryURLs(pageCount, galleryURLComponents);

  for (galleryURL of galleryURLs) {
    const galleryURLSplits = galleryURL.split("/");
    const [fileName, fileExtension] = galleryURLSplits.pop().split(".");
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

    const exu = document.getElementById("exu");
    exu.addEventListener("click", exuOnClickHandler);
  }
};

main();
