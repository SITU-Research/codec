const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context, callback) => {
    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_CLIENT_PRIVATE_KEY.replace(/\\n/gm, '\n')
        });
        await doc.loadInfo()

        const request = event.queryStringParameters.request
        const requested_sheet_offset = parseInt(event.queryStringParameters.offset) - 2
        const requested_sheet_range_start = parseInt(event.queryStringParameters.rangeStart)
        const requested_sheet_range_end = parseInt(event.queryStringParameters.rangeEnd)

        let sheet_ids_by_title = {}
        Object.keys(doc._rawSheets).forEach((key) => {
            let sheet = doc._rawSheets[key]
            sheet_ids_by_title[sheet._rawProperties.title] = sheet._rawProperties.index
        })


        if (request === 'platformconfig') {
            let platform_config_rows = await doc.sheetsByIndex[sheet_ids_by_title['Platform config']].getRows({ offset: requested_sheet_offset })
            let platform_config = {}
            platform_config_rows.forEach((platform_config_row) => {
                platform_config[platform_config_row._rawData[0]] = platform_config_row._rawData[1]
            })
            return {
                statusCode: 200,
                body: JSON.stringify(platform_config),
            }
        } else if (request.includes('size')) {
            let requested_sheet = request.slice(5)
            const list_sheet_index = sheet_ids_by_title[requested_sheet]
            //ensure an non empty columns exists after the last filled column in that top row
            let sheet_rows = await doc.sheetsByIndex[list_sheet_index].getRows({ offset: requested_sheet_offset })
            let items = []
            sheet_rows.forEach((sheet_row) => {
                if (sheet_row._rawData[0] !== '') {
                    items.push(sheet_row._rawData)
                }
            })
            let assets_info = {
                total_size: Buffer.byteLength(JSON.stringify(items)),
                n_rows: items.length,
            }
            return {
                statusCode: 200,
                body: JSON.stringify(assets_info),
            }
        } else {
            const list_sheet_index = sheet_ids_by_title[request]
            //ensure an non empty columns exists after the last filled column in that top row
            let sheet_rows
            if (requested_sheet_range_end && requested_sheet_range_end) {
                sheet_rows = await doc.sheetsByIndex[list_sheet_index].getRows(
                    {
                        offset: requested_sheet_offset + requested_sheet_range_start,
                        limit: requested_sheet_range_end - requested_sheet_range_start
                    })

            } else {
                sheet_rows = await doc.sheetsByIndex[list_sheet_index].getRows({ offset: requested_sheet_offset })
            }
            let items = []
            sheet_rows.forEach((sheet_row) => {
                if (sheet_row._rawData[0] !== '') {
                    items.push(sheet_row._rawData)
                }
            })
            return {
                statusCode: 200,
                body: JSON.stringify(items),
            }
        }
    } catch (err) {
        console.log(err)
        return { statusCode: 500, body: err.toString() }
    }
}
