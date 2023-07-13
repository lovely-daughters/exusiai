const images: string[] = [
    // chongzhen
    "https://pbs.twimg.com/media/FpC9WgqaAAALIux?format=jpg&name=large",
];

const hunted = [
    {
        name: "youtube_main_page",
        huntingGround: "https://www.youtube.com/",
        selector: ".ytd-two-column-browse-results-renderer.style-scope",
    },
    {
        name: "youtube_trending",
        huntingGround: "https://www.youtube.com/",
        selector:
            "ytd-guide-section-renderer.ytd-guide-renderer.style-scope:nth-of-type(3)",
    },
    {
        name: "youtube_services",
        huntingGround: "https://www.youtube.com/",
        selector:
            "ytd-guide-section-renderer.ytd-guide-renderer.style-scope:nth-of-type(4)",
    },
];

const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type == "childList") {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode.nodeType == 1) {
                    // check wanted list
                    for (const target of hunted) {
                        try {
                            if (
                                window.location.href == target.huntingGround &&
                                (<HTMLElement>addedNode).matches(
                                    target.selector
                                )
                            ) {
                                (<HTMLElement>addedNode).remove();
                                console.log(
                                    `\n\n\nHUNTED:\n${target.name}\n\n\n`
                                );
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

export {};

// (<HTMLElement>addedNode).replaceWith(
//     `<img
//         id="candy"
//         style="
//             position:fixed;
//             top:0px; right:0px;
//             border-radius:10px; cursor:pointer;
//             width: 100%;
//         "
//         src=${
//             images[
//                 Math.floor(
//                     Math.random() * images.length
//                 )
//             ]
//         }
//     >`
// );
