function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to extract the SystemDescription
function extractSystemDescription() {
  const systemDescriptionElement = document.querySelector('h1[aria-label="SystemDescription"]');
  const expirationElement = document.querySelector('p.warrantyExpiringLabel.mb-0.ml-1.mr-1');
  let systemDescription = "System Description Not Found";
  let expirationDate = "N/A";

  if (systemDescriptionElement) {
      systemDescription = systemDescriptionElement.textContent.trim();
  }
  if (expirationElement) {
    expirationDate = expirationElement.textContent.trim();
  }
  const urlPath = window.location.pathname.split('/');
  const serialNumber = urlPath[urlPath.indexOf('servicetag') + 1];

  return { serialNumber, systemDescription, expirationDate  };
}

// Function to store the system description in local storage under the current folder
function storeSystemDescription({ serialNumber, systemDescription, expirationDate }) {
  chrome.storage.local.get(['systemDescriptions', 'currentFolder'], function(data) {
      const folderName = data.currentFolder || 'Default';
      const descriptions = (data.systemDescriptions && data.systemDescriptions[folderName]) ? data.systemDescriptions[folderName] : [];
      descriptions.push({ serialNumber, systemDescription, expirationDate });
      
      if (!data.systemDescriptions) {
          data.systemDescriptions = {};
      }
      
      data.systemDescriptions[folderName] = descriptions;
      
      chrome.storage.local.set({ systemDescriptions: data.systemDescriptions }, function() {
          console.log('(ContentJS) System description stored:', { serialNumber, systemDescription, expirationDate });
          chrome.runtime.sendMessage({ type: 'SAVED' });
      });
  });
}

// Main function to run when the DOM is ready
function main() {
  const { serialNumber, systemDescription, expirationDate } = extractSystemDescription();
  if (systemDescription !== "System Description Not Found") {
      chrome.storage.local.get({ showConfirmation: true }, async function(data) {
          if (data.showConfirmation) {
              const saveDescription = confirm(`Do you want to save the following description to DDDE?\n\n${systemDescription}`);
              if (saveDescription) {
                  
                  storeSystemDescription({ serialNumber, systemDescription, expirationDate });
                  navigator.clipboard.writeText(systemDescription)
              } else {
                  chrome.runtime.sendMessage({ type: 'NOT_SAVED' });
              }
          } else {
              storeSystemDescription({ serialNumber, systemDescription, expirationDate });
              navigator.clipboard.writeText(systemDescription)
          }
      });
  } else {
      chrome.runtime.sendMessage({ type: 'NOT_FOUND' });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
