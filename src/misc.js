const raceConditionTest = () => {
  // you honestly just have to wait and check back constantly
  // there don't seem to be any issues with race conditions
  async function downloadWorker(workerId) {
    while (true) {
      if (downloadQueue.length) {
        const value = downloadQueue.shift();
        console.log(`${workerId}: ${value}`);
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 500)
        );
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  // initiate workers
  for (var index = 0; index < 3; index++) {
    downloadWorker(index);
  }

  for (var index = 0; index < 100; index++) {
    downloadQueue.push(index);
  }
};
