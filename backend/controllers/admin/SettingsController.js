const asyncHandler = require('express-async-handler');
const { successResponse, SuccessWithoutBody, PrintError, verifyrequiredparams } = require('../../middleware/common');
const Settings = require('../../schemas/AdminSettings');


const getTAC = asyncHandler(async (req, res) => {
    try {
        const tac = await Settings.findOne({}, { tac: 1, _id: 0 ,updatedAt: 1 });
        successResponse(200, "Fetched successfully", tac, res)

    } catch (error) {
        return PrintError(400, error.message, res);
    }
})

const getPrivacy = asyncHandler(async (req, res) => {
    try {
        const privacy = await Settings.findOne({}, { privacy: 1, _id: 0,updatedAt: 1 });
        successResponse(200, "Fetched successfully", privacy, res)

    } catch (error) {
        return PrintError(400, error.message, res);
    }
})
const getAbout = asyncHandler(async (req, res) => {
    try {
        const about = await Settings.findOne({}, { about: 1, _id: 0 ,updatedAt: 1 });
        successResponse(200, "Fetched successfully", about, res)

    } catch (error) {
        return PrintError(400, error.message, res);
    }
})


const saveAbout = asyncHandler(async (req, res) => {
    const { about } = req.body;
    try {
        let settings = await Settings.findOne({});
        if (!settings)
            settings = await Settings.create({ about: "", privacy: "", tac: "" })
        await Settings.updateOne({ _id: settings._id }, { $set: { about } });
        const data = await Settings.findOne({}, { about: 1, _id: 0 });
        successResponse(200, "Updated successfully", data, res)

    } catch (error) {
        return PrintError(400, error.message, res);
    }
})


const savePrivacy = asyncHandler(async (req, res) => {
    const { privacy } = req.body;
    try {
        let settings = await Settings.findOne({});
        if (!settings)
            settings = await Settings.create({ about: "", privacy: "", tac: "" })
        await Settings.updateOne({ _id: settings._id }, { $set: { privacy } });
        const data = await Settings.findOne({}, { privacy: 1, _id: 0 });
        successResponse(200, "Updated successfully", data, res)

    } catch (error) {
        return PrintError(400, error.message, res);
    }
})


const saveTerms = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const { tac } = req.body;
    try {
        let settings = await Settings.findOne({});
        if (!settings)
            settings = await Settings.create({ about: "", privacy: "", tac: "" })
        await Settings.updateOne({ _id: settings._id }, { $set: { tac } });
        const data = await Settings.findOne({}, { tac: 1, _id: 0 });
        successResponse(200, "Updated successfully", data, res)

    } catch (error) {
        return PrintError(400, error.message, res);
    }
})




module.exports = { getTAC, getPrivacy, getAbout, saveAbout, savePrivacy, saveTerms }