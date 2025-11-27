const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});
const from = {
  email: process.env.MAIL, // sender email address
  name :'Race Pace AI',
};
const otpMail = async (mailData) => {
  try {
    const { email, subject, otp } = mailData;
    // Read the HTML email template file
    const templatePath = path.join(
      __dirname,
      "/../email_temps/new-email-template.html"
    );
    const emailTemplate = fs.readFileSync(templatePath, "utf-8");
    // Modify email template file
    const modifiedTemplate = emailTemplate
      // .replace("{{title}}", "Account Verification")
      // .replace("{{name}}", name)
      .replace(
        "{{content}}",
        `<tr style="height: 19px">
      <td
        style="
          font-size: 14px;
          padding-bottom: 20px;
          color: #cccccc;
          height: 19px;
        "
      >
        Please use the following code to verify your account:
      </td>
    </tr>
    <tr style="height: 56px">
      <td style="height: 56px">
        <div
          style="
            border: 2px solid white;
            border-radius: 12px;
            display: inline-block;
            padding: 10px 25px;
            font-weight: bold;
            font-size: 24px;
            letter-spacing: 2px;
            color: #ffffff;
          "
        >
          ${otp}
        </div>
      </td>
    </tr>`
      );

    // Define email options
    const mailOptions = {
      from,
      to: email,
      subject: subject,
      html: modifiedTemplate,
      text : modifiedTemplate,
    };
    // Send email
    // const info = await transporter.sendMail(mailOptions);
    const info = await sgMail.send(mailOptions);
  } catch (error) {
    // console.log('Error sending email:', error);
    // console.error('Error sending email:', error.message);
    throw new Error(error.message);
  }
};

const supportReplyMail = async (mailData) => {
  try {
    const { email, name, query, replyMessage } = mailData;

    // Read the HTML email template file
    const templatePath = path.join(
      __dirname,
      "/../email_temps/support_reply.html"
    );
    const emailTemplate = fs.readFileSync(templatePath, "utf-8");

    // Modify email template
    const modifiedTemplate = emailTemplate
      .replace("{{name}}", name)
      .replace("{{query}}", query)
      .replace("{{replyMessage}}", replyMessage);

    const subject = "Support Reply From Inkspire Studio";
    // Define email options
    const mailOptions = {
      from: process.env.Mail,
      to: email,
      subject: subject,
      html: modifiedTemplate,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Support reply sent:", info.response);
  } catch (error) {
    console.error("Error sending support reply:", error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  otpMail,
  supportReplyMail,
};
