const loadLocale = require("../helpers/loadlocale");

const language = (req, res, next) => {
    const user = req.user;

    if (!user && !user.language) {
        return res.status(403).json({ success: false, message: 'Language not specified' });
    } else {
        const lang = user.language
        req.locales = loadLocale(lang)
        next();
    }
};

module.exports = { language }