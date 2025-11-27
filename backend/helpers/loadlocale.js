const fs = require('fs');
const path = require('path');
require('../locales/en.json')

const loadLocale = (lang) => {
    const filePath = path.join(__dirname,'..', 'locales', `en.json`);
    console.log(filePath ,"filePath")
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
        throw new Error(`Locale file for language '${lang}' not found.`);
    }
};

module.exports = loadLocale