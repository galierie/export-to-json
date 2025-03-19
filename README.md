# export-to-json

This Google Apps Script exports data for a selected sheet/a range of selected rows as a JSON string, which can be copied into one `.json` file. This repository also has a Python program for splitting a huge `.json` file into individual `.json` files.

## Set-up

1. Either
    - Copy-paste the Apps Script; or
    - Push the script with `clasp`
        1. Copy your Apps Script project's `appsscript.json` to the `src/`. Note that this is included in the `.gitignore` file so the `appsscript.json` won't be git-tracked.
        2. Configure the `.clasp.json`
           a. Paste your project's Script ID in the `scriptId` attribute.
           b. Note that the path to the actual directory for the Apps Script is
        ```
        {path_to_the_local_copy_of_your_repo}/export-to-json/src
        ```
        Paste this to the `rootDir` attribute. 3. Run `clasp push`
        **NOTE**: Login is required with using `clasp`.
2. Ensure that the Apps Script Project is saved to Google Drive and refresh the spreadsheet you'll use this script with. An `Export JSON` menu should appear on the spreadsheet.

## Usage

**NOTE**: You'll have to give some permissions for the Apps Script.

1. Select one of the two options in the `Export JSON` menu:
    - `Whole Sheet`: This exports the _selected sheet_ into a JSON string.
    - `Selected Rows`: This exports _the rows of selected cells_ in the _selected sheet_ into a JSON string.
        - This means that you'll only need to select at least **one** cell in a row for the entire row to be exported as a JSON string.
2. Copy the JSON string and paste it into a `.json` file.
3. Download the Python file from the repo (`split.py` in the `src` folder).
4. Make a folder and name it `data`. Make a `.json` file in this folder and paste the JSON string in the file.
5. Run the Python file and input the file name (without the `.json` file extension) you used for the `.json` file.
    - If the file name is valid, `.json` files containing individual JSON should appear in the `data` folder.
    - Just run a formatter (e.g. [Prettier](https://prettier.io/)) to easily and quickly format the `.json` files.
