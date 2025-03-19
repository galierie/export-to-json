# export-to-json

This Google Apps Script exports data for a selected sheet/a range of selected rows as a JSON string, which can be copied into one `.json` file. This repository also has a Python program for splitting a huge `.json` file into individual `.json` files.

## Set-up

1. Either
    - Copy-paste the Apps Script in the `.gs` in your Apps Script Project; or
    - Push the script with `clasp`
        1. Copy your Apps Script Project's `appsscript.json` to the `src` folder.
            - **NOTE**: This file is included in the `.gitignore` file so it won't be git-tracked.
        1. Configure the `.clasp.json` file
            - Paste your project's Script ID in the `scriptId` attribute.
            - Note that the path to the actual directory for the Apps Script Project is
                ```
                {path_to_the_local_copy_of_your_repo}/export-to-json/src
                ```
                Paste this to the `rootDir` attribute.
        1. Run `clasp push`
            - **NOTE**: Login is required in `clasp`.
1. Ensure that the Apps Script Project is saved to Google Drive and refresh the spreadsheet you'll use this script with. An `Export JSON` menu should appear on the spreadsheet.

## Usage

**NOTE**: You'll have to give some permissions for the Apps Script.

1. Select one of the two options in the `Export JSON` menu:
    - `Whole Sheet`: This exports the _selected sheet_ into a JSON string.
    - `Selected Rows`: This exports _the rows of selected cells_ in the _selected sheet_ into a JSON string.
        - This means that you'll only need to select at least **one** cell in a row for the entire row to be exported as a JSON string.
1. Copy the JSON string and paste it into a `.json` file.
1. Download the Python file from the repo (`split.py` in the `src` folder).
1. Make a folder in the same folder as the Python file and name it `data`. Make a `.json` file in this folder and paste the JSON string in the file.
1. Run the Python file and input the file name (without the `.json` file extension) you used for the `.json` file.
    - If the file name is valid, `.json` files containing individual JSON should appear in the `data` folder.
    - Just run a formatter (e.g. [Prettier](https://prettier.io/)) to easily and quickly format the `.json` files.
