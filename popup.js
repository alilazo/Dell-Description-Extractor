document.addEventListener('DOMContentLoaded', function () {
    const serialNumberInput = document.getElementById('serialNumberInput');
    const confirmationCheckbox = document.getElementById('confirmationCheckbox');
    const autoClipboardCheckbox = document.getElementById('autoClipboardCheckbox');

    // Load the saved checkbox state
    chrome.storage.local.get({ showConfirmation: true, autoCopy: true }, function(data) {
        confirmationCheckbox.checked = data.showConfirmation;
        autoClipboardCheckbox.checked = data.autoCopy;
    });

    // Save the checkbox state when it changes
    confirmationCheckbox.addEventListener('change', function() {
        chrome.storage.local.set({ showConfirmation: confirmationCheckbox.checked });
    });
    autoClipboardCheckbox.addEventListener('change', function() {
        chrome.storage.local.set({ autoCopy: autoClipboardCheckbox.checked });
    });

    // Add event listener to the form submission
    document.getElementById('searchForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        const serialNumber = document.getElementById('serialNumberInput').value.trim();
        const url = `https://www.dell.com/support/home/en-us/product-support/servicetag/${serialNumber}/overview`;
        chrome.tabs.create({ url: url });
    });

    function displaySystemDescriptions(descriptions) {
        const modelsList = document.getElementById('modelsList');
        const modelsListLabel = document.getElementById('modelsListLabel');
        const count = descriptions.length;

        let htmlContent = '';

        if (count > 0) {
            modelsListLabel.innerHTML = `<h2>(${count}) Dell System Descriptions:</h2><ul>`;
            htmlContent += '<ul>';
            descriptions.forEach(function ({ serialNumber, systemDescription, expirationDate }, index) {
                let styledExpirationDate = expirationDate;
                if (expirationDate.includes('Expired')) {
                    styledExpirationDate = expirationDate.replace('Expired', '<span style="color: lightcoral;">Expired</span>');
                }
                htmlContent += `
                    <li>
                        <span class="copyText" data-text="${serialNumber}" style="text-align: center">${serialNumber}</span> - 
                        <span class="copyText" data-text="${systemDescription}" style="text-align: center">${systemDescription}</span> - 
                        <span class="copyText" data-text="${expirationDate}" style="text-align: center">${styledExpirationDate}</span>
                        <button class="deleteButton" data-index="${index}">X</button>
                    </li>`;
            });
            htmlContent += '</ul>';
        } else {
            modelsListLabel.innerHTML = '';
            htmlContent = '<p>No Dell system descriptions saved.</p>';
        }        
        // Update status page
        modelsList.innerHTML = htmlContent; // Set the innerHTML once

        // Add copy to clipboard functionality
        document.querySelectorAll('.copyText').forEach(function(element) {
            element.addEventListener('click', function() {
                const text = element.getAttribute('data-text');
                navigator.clipboard.writeText(text).then(function() {
                    element.classList.add('clicked');
                    setTimeout(() => {
                        element.classList.remove('clicked');
                    }, 300);
                }, function(err) {
                    console.error('Could not copy text: ', err);
                });
            });
        });

        updateStatusPage(descriptions, count);
    }

    function updateStatusPage(descriptions, count) {
        chrome.runtime.sendMessage({ type: 'UPDATE_STATUS', descriptions: descriptions, count: count });
    }

    // Function to refresh the displayed list of devices
    function refreshDeviceList() {
        chrome.storage.local.get(['systemDescriptions', 'currentFolder'], function(data) {
            const folderName = data.currentFolder || 'Default';
            const descriptions = (data.systemDescriptions && data.systemDescriptions[folderName]) ? data.systemDescriptions[folderName] : [];
            displaySystemDescriptions(descriptions);
        });
    }

    refreshDeviceList();

    // Add event listener to handle deletion of individual devices
    document.getElementById('modelsList').addEventListener('click', function (event) {
        if (event.target.classList.contains('deleteButton')) {
            const index = parseInt(event.target.getAttribute('data-index'));
            chrome.storage.local.get(['systemDescriptions', 'currentFolder'], function (data) {
                const folderName = data.currentFolder || 'Default';
                const updatedDescriptions = data.systemDescriptions[folderName].filter((description, i) => i !== index);
                data.systemDescriptions[folderName] = updatedDescriptions;
                chrome.storage.local.set({ systemDescriptions: data.systemDescriptions }, function () {
                    displaySystemDescriptions(updatedDescriptions);
                });
            });
        }
    });

    // Add event listener to the clear button
    document.getElementById('clearButton').addEventListener('click', function () {
        chrome.storage.local.get(['systemDescriptions', 'currentFolder'], function (data) {
            const folderName = data.currentFolder || 'Default';
            if (data.systemDescriptions && data.systemDescriptions[folderName]) {
                if (confirm(`Are you sure you want to clear all devices in the folder "${folderName}"?`)) {
                    data.systemDescriptions[folderName] = [];
                    chrome.storage.local.set({ systemDescriptions: data.systemDescriptions }, function () {
                        document.getElementById('modelsList').innerHTML = '<p>No Dell system descriptions saved.</p>';
                        refreshDeviceList();
                        alert('Cleared All Devices in list');
                    });
                }
            }
        });
    });

    // Function to export descriptions to CSV
    function exportToCSV(descriptions) {
        let csvContent = "data:text/csv;charset=utf-8,Serial Number,System Description,Expiration Date\n";
        descriptions.forEach(function ({ serialNumber, systemDescription, expirationDate }) {
            csvContent += `${serialNumber},${systemDescription},${expirationDate}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "dell_system_descriptions.csv");
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
    }

    // Add event listener to the export button
    document.getElementById('exportButton').addEventListener('click', function () {
        chrome.storage.local.get(['systemDescriptions', 'currentFolder'], function (data) {
            const folderName = data.currentFolder || 'Default';
            if (data.systemDescriptions && data.systemDescriptions[folderName] && data.systemDescriptions[folderName].length > 0) {
                exportToCSV(data.systemDescriptions[folderName]);
                alert('Exporting completed.');
            } else {
                alert('No Dell system descriptions saved.');
            }
        });
    });

    // Function to import CSV and start parsing
    // function importCSVAndParse(file) {
    //     const reader = new FileReader();
    //     reader.onload = function (event) {
    //         const csvData = event.target.result;
    //         const serialNumbers = csvData.split('\n').slice(1).map(line => line.trim()).filter(line => line);
    //         chrome.runtime.sendMessage({ type: 'START_PROCESS', serialNumbers: serialNumbers });
    //     };
    //     reader.readAsText(file);
    // }

    // Add event listener to the file input
    // document.getElementById('fileInput').addEventListener('change', function (event) {
    //     const file = event.target.files[0];
    //     if (file) {
    //         importCSVAndParse(file);
    //     }
    // });

    // Folder Management Functionality
    const folderPopup = document.getElementById('folderPopup');
    const createFolderPopup = document.getElementById('createFolderPopup');
    const folderList = document.getElementById('folderList');
    const newFolderName = document.getElementById('newFolderName');
    const createFolderButton = document.getElementById('createFolderButton');
    const createFolderConfirmButton = document.getElementById('createFolderConfirmButton');
    const openFolderButton = document.getElementById('openFolderButton');
    const closeFolderPopup = document.getElementById('closeFolderPopup');
    const closeCreateFolderPopup = document.getElementById('closeCreateFolderPopup');
    const currentFolderNameDisplay = document.getElementById('currentFolderName');

    function loadFolders() {
        chrome.storage.local.get({ folders: [] }, function(data) {
            folderList.innerHTML = '';
            if (data.folders.length === 0) {
                serialNumberInput.disabled = true;
                serialNumberInput.placeholder = "Please create a folder";
            } else {
                serialNumberInput.disabled = false;
                serialNumberInput.placeholder = "Enter Serial Number";
            }
            data.folders.forEach(function(folder, index) {
                const folderItem = document.createElement('div');
                folderItem.className = 'folderItem';
                folderItem.innerHTML = `<span>${folder}</span>`;

                const buttonContainer = document.createElement('span');
                buttonContainer.className = 'createFolderOptionsButtonContainer createFolderOptions';

                const openButton = document.createElement('button');
                openButton.textContent = 'Open';
                openButton.addEventListener('click', function () {
                    alert(`Opening folder: ${folder}`);
                    folderPopup.style.display = 'none';
                    currentFolderNameDisplay.textContent = `Current Folder: ${folder}`
                    chrome.storage.local.set({ currentFolder: folder }, function() {
                        refreshDeviceList(); // Refresh device list when a new folder is opened
                    });
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.className = 'deleteFolderButton';
                deleteButton.dataset.index = index;

                buttonContainer.appendChild(openButton);
                buttonContainer.appendChild(deleteButton);

                folderItem.appendChild(buttonContainer);

                folderList.appendChild(folderItem);
            });
        });
    }

    document.getElementById('openFolderButton').addEventListener('click', function () {
        folderPopup.style.display = 'block';
        loadFolders();
    });

    document.getElementById('closeFolderPopup').addEventListener('click', function () {
        folderPopup.style.display = 'none';
    });

    document.getElementById('createFolderButton').addEventListener('click', function () {
        createFolderPopup.style.display = 'block';
    });

    document.getElementById('closeCreateFolderPopup').addEventListener('click', function () {
        createFolderPopup.style.display = 'none';
    });

    createFolderConfirmButton.addEventListener('click', function () {
        const folderName = newFolderName.value.trim();
        if (folderName) {
            chrome.storage.local.get({ folders: [] }, function(data) {
                const folders = data.folders;
                if (!folders.includes(folderName)) {
                    folders.push(folderName);
                    chrome.storage.local.set({ folders: folders }, function() {
                        newFolderName.value = '';
                        createFolderPopup.style.display = 'none';
                        loadFolders();
                    });
                } else {
                    alert('Folder name already exists.');
                }
            });
        } else {
            alert('Please enter a folder name.');
        }
    });

    // Add event listener to handle deletion of folders
    folderList.addEventListener('click', function (event) {
        if (event.target.classList.contains('deleteFolderButton')) {
            const index = parseInt(event.target.getAttribute('data-index'));
            chrome.storage.local.get({ folders: [], systemDescriptions: {} }, function(data) {
                const folders = data.folders;
                const folderName = folders[index];
                if (confirm(`Are you sure you want to delete the folder "${folderName}" and all its devices?`)) {
                    folders.splice(index, 1);
                    delete data.systemDescriptions[folderName]; // Remove the folder and its devices from systemDescriptions
                    chrome.storage.local.set({ folders: folders, systemDescriptions: data.systemDescriptions }, function() {
                        loadFolders();
                        if (data.currentFolder === folderName) {
                            const nextFolder = folders.length > 0 ? folders[0] : 'Default';
                            chrome.storage.local.set({ currentFolder: nextFolder }, function() {
                                currentFolderNameDisplay.textContent = `Current Folder: ${nextFolder}`;
                                refreshDeviceList();
                            });
                        }
                    });
                }
            });
        }
    });

    // Load the current folder when the extension is opened
    chrome.storage.local.get({ currentFolder: '' }, function(data) {
        if (data.currentFolder) {
            currentFolderNameDisplay.textContent = `Currently in ${data.currentFolder}`;
        } else {
            currentFolderNameDisplay.textContent = 'No folder selected';
        }
    });

    loadFolders()
});
