/**
 * Mark object keys with array values
 * by adding them here
 * @type {object}
 */
const PLURAL = {};

function onOpen() {
    const menu = [
        {
            name: 'Whole Sheet',
            functionName: 'exportSheet',
        },
        {
            name: 'Selected Rows',
            functionName: 'exportRows',
        },
    ];

    /** @type {GoogleAppsScript.Spreadsheet.Spreadsheet} */
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ss.addMenu('Export JSON', menu);
}

function exportSheet() {
    /** @type {GoogleAppsScript.Spreadsheet.Spreadsheet} */
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    /** @type {GoogleAppsScript.Spreadsheet.Sheet} */
    const sheet = ss.getActiveSheet();

    // Get data in each row
    const data = _getSheetData(sheet);

    // Parse to JSON
    const json = _JSONParser(data);

    // Display for now
    _displayText(json);

    return;
}

function exportRows() {
    /** @type {GoogleAppsScript.Spreadsheet.Spreadsheet} */
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    /** @type {GoogleAppsScript.Spreadsheet.Sheet} */
    const sheet = ss.getActiveSheet();
    /** @type {GoogleAppsScript.Spreadsheet.RangeList} */
    const activeRangeList = sheet.getActiveRangeList();

    if (activeRangeList === null) {
        return;
    }

    /** @type {Array<Array<number>>} */
    const rows = [];
    /** @type {Array<GoogleAppsScript.Spreadsheet.Range>} */
    const ranges = activeRangeList.activate().getRanges();
    ranges.forEach(range => {
        /** @type {Array<number>} */
        const to_push = [range.getRow(), range.getNumRows()];
        if (to_push[0] === 1) {
            if (to_push[1] !== 1) {
                rows.push([to_push[0] + 1, to_push[1] - 1]);
            }
        } else {
            rows.push(to_push);
        }
    });

    // Get data in the selected rows
    const data = _getRowData(sheet, rows);

    // Parse to JSON
    const json = _JSONParser(data);

    // Display for now
    _displayText(json);

    return;
}

/**
 * Gets sheet data
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {Array}
 */
function _getSheetData(sheet) {
    const key_rows = sheet.getFrozenRows();
    const max_cols = sheet.getLastColumn();

    /** @type {GoogleAppsScript.Spreadsheet.Range} */
    const raw_keys = sheet.getRange(1, 1, key_rows, max_cols);
    /** @type {GoogleAppsScript.Spreadsheet.Range} */
    const values = sheet.getRange(key_rows + 1, 1, sheet.getLastRow() - key_rows, max_cols);

    const keys = _parseKeys(raw_keys.getValues()[0]);
    const objects = _parseObjects(sheet.getName(), keys, values.getValues());

    return objects;
}

/**
 * Gets data from selected rows
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Array<Array<number>>} rows // Format per entry: [start row of range, number of rows in range]
 * @returns {Array}
 */
function _getRowData(sheet, rows) {
    const key_rows = sheet.getFrozenRows();
    const max_cols = sheet.getLastColumn();

    /** @type {GoogleAppsScript.Spreadsheet.Range} */
    const raw_keys = sheet.getRange(1, 1, key_rows, max_cols);
    const keys = _parseKeys(raw_keys.getValues()[0]);

    /** @type {Array} */
    let objects = [];
    rows.forEach(row => {
        /** @type {GoogleAppsScript.Spreadsheet.Range} */
        const values = sheet.getRange(row[0], 1, row[1], max_cols);
        objects = objects.concat(_parseObjects(sheet.getName(), keys, values.getValues()));
    });

    return objects;
}

/**
 * Parses the header row to become object key strings
 * @param {Array} raw_keys
 * @returns {Array<string>}
 */
function _parseKeys(raw_keys) {
    /** @type {Array<string>} */
    const keys = [];

    raw_keys.forEach(raw_key => {
        const str_key = String(raw_key).toLowerCase();
        keys.push(
            str_key.replace(/./g, c => {
                return /[a-zA-Z0-9_:]/.test(c) ? c : /[ ]/.test(c) ? '_' : '';
            }),
        );
    });

    // If there is an empty key, throw an error
    keys.forEach(key => {
        if (!key.length > 0) {
            throw new Error('Invalid key detected. Please recheck header row.');
        }
    });
    return keys;
}

/**
 * Parses strings into maps to object keys
 * @param {string} sheet_name
 * @param {Object} parsed_row
 * @param {Array<string>} nested_keys
 * @param {boolean} is_array
 * @returns {{ obj: Object, key: string, is_array: boolean }} for easy destructuring
 */
function _getObjKey(sheet_name, parsed_row, nested_keys, is_array = false) {
    /** @type {Object} */
    let obj = parsed_row;
    /** @type {string} */
    let key = nested_keys[0];

    if (!is_array && PLURAL[sheet_name] !== undefined && PLURAL[sheet_name].includes(key)) {
        is_array = true;
    }

    // Dive through the object to get the key with a non-object value
    for (let i = 1; i < nested_keys.length; i++) {
        if (obj[key] === undefined) {
            obj[key] = {};
        }

        obj = obj[key];
        key = nested_keys[i];

        if (!is_array && PLURAL[sheet_name] !== undefined && PLURAL[sheet_name].includes(key)) {
            is_array = true;
        }
    }

    return { obj, key, is_array };
}

/**
 * Parses each row into a JavaScript object
 * @param {string} sheet_name
 * @param {Array<string>} keys
 * @param {Array<Array>} values raw data from sheet
 * @returns {Array}
 */
function _parseObjects(sheet_name, keys, values) {
    /** @type {Array} */
    const objects = [];

    // Parse per sheet row
    values.forEach(row => {
        const parsed_row = {};

        // Get each cell
        for (let col = 0; col < keys.length; col++) {
            // Skip parsing if the cell is empty
            if (!(String(row[col]).length > 0)) {
                continue;
            }

            // Get the appropriate object key
            const obj_data = _getObjKey(sheet_name, parsed_row, keys[col].split(':'));

            // Split whatever's in the cell
            // as it could be
            //      an array of strings,
            //      an array of objects,
            //      or not an array
            const cell_values = row[col].toString().split(', ');
            cell_values.forEach(val => {
                // Destructure obj_data
                let obj = obj_data.obj;
                let key = obj_data.key;
                let is_array = obj_data.is_array;

                // If cell contains an object, update the keys
                if (val.includes(':')) {
                    let more_nested_keys = val.split(':');
                    const actual_val = more_nested_keys.pop(); // The last substring is the actual value
                    val = actual_val === undefined ? '' : actual_val;

                    // Only get the appropriate key if there is an actual value
                    if (val.length > 0) {
                        // Dive deeper into the object to get the appropriate key
                        const deeper_obj_data = _getObjKey(
                            sheet_name,
                            obj_data.obj,
                            [obj_data.key].concat(more_nested_keys),
                            obj_data.is_array,
                        );

                        // Destructure deeper_obj_data
                        obj = deeper_obj_data.obj;
                        key = deeper_obj_data.key;
                        is_array = deeper_obj_data.is_array;
                    }
                }

                // Check again if there is an actual value in the cell
                if (val.length > 0) {
                    if (is_array) {
                        if (obj[key] === undefined) {
                            obj[key] = [];
                        }
                        obj[key].push(val);
                    } else {
                        obj[key] = obj[key] === undefined ? val : obj[key].concat(', ' + val);
                    }
                }
            });
        }

        if (Object.keys(parsed_row).length > 0) {
            objects.push(parsed_row);
        }
    });

    return objects;
}

/**
 * Parses JavaScript Objects to a JSON string
 * @param {Array} objects
 * @returns {string}
 */
function _JSONParser(objects) {
    const json = JSON.stringify(objects);
    return json;
}

/**
 * Displays the JSON string in a dialog
 * @param {string} json
 */
function _displayText(json) {
    /** @type {GoogleAppsScript.HTML.HtmlOutput} */
    const output = HtmlService.createHtmlOutput(
        "<textarea style='width:100%;' rows='100'>" + json + '</textarea>',
    );

    output.setWidth(1600);
    output.setHeight(900);
    SpreadsheetApp.getUi().showModalDialog(output, 'Exported JSON');
}
