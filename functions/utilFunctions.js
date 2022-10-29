exports.postUpdate = async (event, doc, sheet_ids_by_title) => {
    const sheetIdToUpdate = doc.sheetsByIndex[sheet_ids_by_title['Testing Sheet']];
    const { column_names, ...values } = JSON.parse(event.body);
    console.log(column_names);
    console.log(values['ta236.jpg']);
    arrayOfValues = Object.values(values);
    rows = arrayOfValues.map(value => {
        return {
            "values": column_names.map(column => {
                return {
                    "userEnteredValue": {
                        "stringValue": _getCorrectColumnName(column, value)
                    }
                }
            })
        };
    })
    res = await doc.axios.post(':batchUpdate', {
        "requests": [{
            updateCells: {
                "rows": rows,
                "fields": '*',
                // Union field area can be only one of the following:
                "start": {
                    sheetId: sheetIdToUpdate._rawProperties.sheetId,
                    rowIndex: 2,
                    columnIndex: 0
                },
            }
        }],
        "includeSpreadsheetInResponse": false,
        "responseRanges": [],
        "responseIncludeGridData": false
    });

    console.log('updateSheet');

    return {
        statusCode: 200,
        body: JSON.stringify({ msg: "updatedSheet" }),
    }
}

_getCorrectColumnName = (column, value) => {
    if (typeof value[column] === "boolean"){
        return value[column].toString().toUpperCase();
    } else if (value[column]) {
            return value[column];
    } else {
        return '';
    }
}