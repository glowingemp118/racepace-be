const asyncHandler = require('express-async-handler');
const { successResponse, SuccessWithoutBody, PrintError, verifyrequiredparams } = require('../../middleware/common');
const Faq = require('../../schemas/FAQ');
const { getFAQS, getFAQ } = require('../../helpers/admin/FAQHelper');

const saveFAQ = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const { title, message } = req.body;
    try {
        const data = await Faq.findOne({ title, message });
        if (data) {
            throw new Error("Already exists");
        }
        else {
            await Faq.create({ user_id, title, message });
        }
        let { pageno } = req.query;
        pageno = pageno ? pageno : 1;
        const returndata = await getFAQS(pageno);
        successResponse(200, "Added successfully", returndata.faqs, res, returndata.total_length)

    } catch (error) {
        return PrintError(400, error.message, res);
    }
})

const UpdateFAQ = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const { faq_id, title, message } = req.body;
    try {
        const data = await Faq.findOne({ _id: faq_id });
        if (!data) {
            throw new Error("invalid faq_id");
        }
        else {
            await Faq.updateOne({ _id: faq_id }, { $set: { user_id, title, message } });
        }
        let { pageno } = req.query;
        pageno = pageno ? pageno : 1;
        const returndata = await getFAQS(pageno);
        successResponse(200, "Updated successfully", returndata.faqs, res, returndata.total_length)
    } catch (error) {
        return PrintError(400, error.message, res);
    }
})



const DeleteFAQ = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const { faq_id, title, message } = req.body;
    try {
        const data = await Faq.findOne({ _id: faq_id });
        if (!data) {
            throw new Error("invalid faq_id");
        }
        else {
            await Faq.deleteOne({ _id: faq_id });
        }
        let { pageno } = req.query;
        pageno = pageno ? pageno : 1;
        const returndata = await getFAQS(pageno);
        successResponse(200, "delete successfully", returndata.faqs, res, returndata.total_length)
    } catch (error) {
        return PrintError(400, error.message, res);
    }
})


const getFAQs = asyncHandler(async (req, res) => {
    try {
        // let { pageno } = req.query;
        // pageno = pageno ? pageno :
        // const returndata = await getFAQS(pageno);
        const faqs = await Faq.find()
        successResponse(200, "Fetched successfully", faqs, res,)
    } catch (error) {
        return PrintError(400, error.message, res);
    }
})


module.exports = { getFAQs, saveFAQ, UpdateFAQ, DeleteFAQ }