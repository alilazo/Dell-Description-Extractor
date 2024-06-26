# Dell Description Extractor Test Plan

## Test Cases

### Test Case 1: Verify Extension Installation

- **Test Case ID**: TC001
- **Description**: Verify that the extension can be installed successfully in Microsoft Edge.
- **Preconditions**: None
- **Steps**:
  1. Open Edge and navigate to `edge://extensions/`.
  2. Enable Developer mode.
  3. Click on "Load unpacked".
  4. Select the `Dell Description Extractor` folder.
- **Expected Result**: The extension should be listed in the Extensions page without any errors.

### Test Case 2: Verify System Description Extraction

- **Test Case ID**: TC002
- **Description**: Verify that the extension extracts the system description correctly from the Dell support page.
- **Preconditions**: The extension is installed and enabled.
- **Steps**:
  1. Navigate to a Dell support page with a system description, e.g., `https://www.dell.com/support/home/en-us/product-support/servicetag/<serial_number>/overview`.
  2. Observe the system description extraction.
- **Expected Result**: The extension should extract and display the correct system description.

### Test Case 3: Verify Warranty Expiration Date Extraction

- **Test Case ID**: TC003
- **Description**: Verify that the extension extracts the warranty expiration date correctly.
- **Preconditions**: The extension is installed and enabled.
- **Steps**:
  1. Navigate to a Dell support page with a warranty expiration date, e.g., `https://www.dell.com/support/home/en-us/product-support/servicetag/<serial_number>/overview`.
  2. Observe the warranty expiration date extraction.
- **Expected Result**: The extension should extract and display the correct warranty expiration date.

### Test Case 4: Verify Auto-Copy to Clipboard

- **Test Case ID**: TC004
- **Description**: Verify that the system description is automatically copied to the clipboard after extraction.
- **Preconditions**: The extension is installed and enabled.
- **Steps**:
  1. Navigate to a Dell support page with a system description, e.g., `https://www.dell.com/support/home/en-us/product-support/servicetag/<serial_number>/overview`.
  2. Observe the clipboard contents after extraction.
- **Expected Result**: The system description should be automatically copied to the clipboard.

### Test Case 5: Verify Storage in Local Storage

- **Test Case ID**: TC005
- **Description**: Verify that the extracted system descriptions and expiration dates are stored correctly in local storage.
- **Preconditions**: The extension is installed and enabled.
- **Steps**:
  1. Navigate to multiple Dell support pages with system descriptions and expiration dates.
  2. Check the local storage for stored data.
- **Expected Result**: The extracted data should be stored correctly in local storage.

### Test Case 6: Verify Handling of Missing System Description

- **Test Case ID**: TC006
- **Description**: Verify that the extension handles cases where the system description is missing.
- **Preconditions**: The extension is installed and enabled.
- **Steps**:
  1. Navigate to a Dell support page without a system description, e.g., `https://www.dell.com/support/home/en-us/product-support/servicetag/<serial_number>/overview`.
  2. Observe the extension behavior.
- **Expected Result**: The extension should display "System Description Not Found" and handle the missing data gracefully.

### Test Case 7: Verify Handling of Expired Warranty

- **Test Case ID**: TC007
- **Description**: Verify that the extension highlights expired warranties correctly.
- **Preconditions**: The extension is installed and enabled.
- **Steps**:
  1. Navigate to a Dell support page with an expired warranty, e.g., `https://www.dell.com/support/home/en-us/product-support/servicetag/<serial_number>/overview`.
  2. Observe the warranty expiration date extraction.
- **Expected Result**: The word "Expired" in the expiration date should be highlighted in light red.

### Test Case 8: Verify UI Elements

- **Test Case ID**: TC008
- **Description**: Verify that all UI elements (confirmation prompts, buttons, labels) are displayed and functional.
- **Preconditions**: The extension is installed and enabled.
- **Steps**:
  1. Open the extension popup.
  2. Interact with all UI elements (e.g., enable/disable confirmation prompt, clear saved data, export to CSV).
- **Expected Result**: All UI elements should be displayed correctly and functional.

### Test Case 9: Verify Export to CSV

- **Test Case ID**: TC009
- **Description**: Verify that the extension exports the saved data to a CSV file correctly.
- **Preconditions**: The extension is installed, enabled, and has saved data.
- **Steps**:
  1. Open the extension popup.
  2. Click on the "Export to CSV" button.
  3. Check the downloaded CSV file.
- **Expected Result**: The CSV file should contain the correct saved data.

### Test Case 10: Verify Deletion of Saved Data

- **Test Case ID**: TC010
- **Description**: Verify that the extension allows deletion of individual and all saved data correctly.
- **Preconditions**: The extension is installed, enabled, and has saved data.
- **Steps**:
  1. Open the extension popup.
  2. Delete individual entries.
  3. Delete all entries.
  4. Check the local storage for remaining data.
- **Expected Result**: The deleted entries should be removed from local storage, and the remaining data should be correct.
