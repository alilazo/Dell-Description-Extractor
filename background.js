// Initialize variables to manage the queue and the current index
let serialNumberQueue = [];
let currentIndex = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to process the next serial number
async function processNextSerialNumber() {
    if (currentIndex < serialNumberQueue.length) {
        const serialNumber = serialNumberQueue[currentIndex];
        const url = `https://www.dell.com/support/home/en-us/product-support/servicetag/${serialNumber}/overview`;
        
        await sleep(5000);

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            // Reuse the current tab to navigate to the next URL
            chrome.tabs.update(tabs[0].id, { url: url });
        });
    } else {
        alert('Processing completed.');
    }
}

// Listener for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (['SAVED', 'NOT_SAVED', 'NOT_FOUND'].includes(message.type)) {
      currentIndex++;
      processNextSerialNumber();
  } else if (message.type === 'START_PROCESS') {
      serialNumberQueue = message.serialNumbers;
      currentIndex = 0;
      processNextSerialNumber();
  } 
});