const asyncHandler = require('express-async-handler');
const User = require('../schemas/User');
const { PrintError } = require('./common');
const fs = require("fs");
var getDirName = require('path').dirname
const moment = require('moment-timezone');

const logger = asyncHandler(async (req, res, next) => {


    const date = moment().format('YYYY-MM-DD');
    const filepath = __dirname + `/backend/logs/access_${date}.log`;
    const file = fs.existsSync(filepath);
    if (file !== false) {
        fs.writeFileSync(`backend/logs/${date}_access.json`, JSON.stringify({}), 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                throw new Error(err);
            }

            // console.log("JSON file has been saved.");
        });

    }
    return next();





    // res.on("finish", function () {
    //     const date = moment().format("YYYYMMDD");
    //     const requestBody = {}
    //     // const responseBody = {}
    //     requestBody.body = req.body;
    //     requestBody.request_url = req.originalUrl;

    //     console.log(req.method, decodeURI(req.url), res.statusCode, res.statusMessage, req.body);
    //     const file = fs.readFileSync(`backend/logs/${date}_access.json`);
    //     if (file) {
    //         fs.appendFileSync(`backend/logs/${date}_access.json`, JSON.stringify(requestBody), 'utf8', function (err) {
    //             if (err) {
    //                 console.log("An error occured while writing JSON Object to File.");
    //                 throw new Error(err);
    //             }

    //             // console.log("JSON file has been saved.");
    //         });

    //     }
    //     else {
    //         fs.writeFileSync(`backend/logs/${date}_access.json`, JSON.stringify(requestBody), 'utf8', function (err) {
    //             if (err) {
    //                 console.log("An error occured while writing JSON Object to File.");
    //                 throw new Error(err);
    //             }

    //             // console.log("JSON file has been saved.");
    //         });
    //     }
    // });

    // next();
    // try {


    //     // console.log(res);
    //     // // console.log(res);
    //     // return false
    //     // jsonContent = {
    //     //     persons:
    //     //         [{ name: 'John', city: 'New York' },
    //     //         { name: 'Phil', city: 'Ohio' }]
    //     // },
    //     //     { "persons": [{ "name": "John", "city": "New York" }, { "name": "Phil", "city": "Ohio" }] };
    //     // const jsonContent = { req: req, res: res }
    //     // if (fs.existsSync(`backend/logs/${date}_access.log`))
    //     next()
    // } catch (error) {
    //     console.log(error)
    //     PrintError(400, error.message, res);
    // }
})

module.exports = {
    logger
}