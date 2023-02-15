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

const exuOnClickHandler = async () => {
  const pageCount = await getDoujinPageCount();
  const galleryURLComponents = await getGalleryURLComponents();
  const galleryURLs = generateGalleryURLs(pageCount, galleryURLComponents);
  console.log(galleryURLs);
};

const main = async () => {
  if (
    window.location.href.match(/^https:\/\/(.*)nhentai\.net\/g\/([0-9]+)\/$/i)
  ) {
    console.log(window.location.href);

    const exuDataURL = await chrome.runtime.sendMessage({ atDoujin: true });
    console.log(exuDataURL);

    document.body.innerHTML += `<img id="exu" style="position:fixed; top:10px; right:10px; border-radius:10px; cursor:pointer;" width="64" height="64" src='${exuDataURL}'>`;

    const exu = document.getElementById("exu");
    exu.addEventListener("click", exuOnClickHandler);
  }
};

main();

// console.log(messages);

// var imgURL = chrome.extension.getURL("../images/exu265.png");
// console.log(imgURL);

// (
//   async () => {
//     const response = await chrome.runtime.sendMessage({ greeting: "hello" });
//     // do something with response here, not outside the function
//     console.log(response);
//   }
// )();
