const main = async () => {
  if (window.location.href.match(/https:\/\/(.*)nhentai\.net\/g\/(.+)\//i)) {
    console.log(window.location.href);

    const exuDataURL = await chrome.runtime.sendMessage({ atDoujin: true });
    console.log(exuDataURL);

    document.body.innerHTML += `<img style="position:fixed; top:10px; right:10px; border-radius:10px; cursor:pointer;" width="64" height="64" src='${exuDataURL}'>`;
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
