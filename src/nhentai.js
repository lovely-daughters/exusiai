const getDoujinPageCount = async () => {
  const tagsElementText = document.getElementById("tags").outerText;
  console.log(tagsElementText);
  // const match = tagsElementText.matchAll(/Pages:\s*([0-9]+)\s*Uploaded/g);
  const match = [
    ...tagsElementText.matchAll(/Pages:\s*([0-9]+)\s*Uploaded/g),
  ][0];
  // console.log(matches);
  // for (match of matches) {
  //   console.log("SANITY CHECK");
  //   console.log(match);
  // }

  // console.log(match);
  return match;
};

const getGalleryURLs = async () => {
  const firstPageHTML = await fetch(`${window.location.href}/1/`, {
    method: "GET",
  }).then((res) => res.text());

  const match = [
    ...firstPageHTML.matchAll(
      /<img src="(https:\/\/\S*nhentai\.net\/galleries)\/([0-9]+)\/([0-9]+)(\.\S+)" width="[0-9]+" height="[0-9]+" \/>/g
    ),
  ][0];

  return match;
};

const getDoujinImageURLs = async () => {
  const galleryURLs = await getGalleryURLs();
  console.log(galleryURLs);
  const doujinPageCount = await getDoujinPageCount();
  console.log(doujinPageCount);
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
    exu.addEventListener("click", getDoujinImageURLs);
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
