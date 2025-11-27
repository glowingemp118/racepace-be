const asyncHandler = require('express-async-handler');
const { successResponse, SuccessWithoutBody, PrintError, verifyrequiredparams } = require('../../middleware/common');
const {  getSupport } = require('../../helpers/admin/supportHelper');
const Support = require('../../schemas/ContactSupport');
const { relativeTimeRounding } = require('moment');
const { supportReplyMail } = require('../../helpers/mailHelper');
const mongoose = require('mongoose');

// @desc  get all support requests
// @route  admin/support
// @method  post
// @access  private
const allSupport = asyncHandler(async (req, res) => {
    try {
        let { pageno , status , search ,limit } = req.query;
        pageno = pageno ? pageno : 1;
        limit = limit ? Number(limit) : Number(process.env.ITEMPERPAGE);
        const response = await getSupport(pageno , status , search ,limit );
        if (response) {
          return  successResponse(200, "Fetched successfully", response, res, )
        }
        else {
            throw new Error("Something Went Wrong");
        }

    } catch (error) {
        return PrintError(400, error.message, res);
    }
})


const addSupport = asyncHandler(async (req, res) => {
    try {
      const { name ,email , subject , message ,phone } = req.body;
  
      await verifyrequiredparams(200, req.body, ["name" ,"email" ,"subject" ,"message" ,"phone"], res);
  
      const contact_support = await Support.create({ name ,email , subject , message ,phone });
  
      if (!contact_support) return PrintError(400, "Support creation failed", res);
  
      return successResponse(200, "Support sent successfully", contact_support, res);
    } catch (error) {
      return PrintError(400, error.message, res);
    }
  });


  const supportReply = asyncHandler(async (req, res) => {
    try {
      const { support_id ,  message } = req.body;

  
      await verifyrequiredparams(200, req.body, ["support_id" ,"message"], res);

      if(!mongoose.Types.ObjectId.isValid(support_id)) throw new Error("Invalid support id");
  
      const contact_support = await Support.findById( support_id );

      if (!contact_support) throw new Error("Support request not found");

      // if(contact_support.status === "responded") throw new Error("Support request already responded");

      // await supportReplyMail({ email: contact_support.email, name: contact_support.name, query: contact_support.message, replyMessage: message });

      const updated = await Support.findByIdAndUpdate(contact_support._id, { reply: message  , status : "responded" }, { new: true });

      return successResponse(200, "Support reply send successfully", updated, res);
    } catch (error) {
      return PrintError(400, error.message, res);
    }
  });

  

  



module.exports = {  allSupport , addSupport ,supportReply }
