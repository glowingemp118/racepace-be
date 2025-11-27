const User = require("../schemas/User");
const Devices = require("../schemas/Devices");
const Notifications = require("../schemas/Notifications");
// const moment = require('moment-timezone');
// const fs = require('fs');
// const path = require('path');
const successResponse = (
  statusCode = 200,
  Message,
  Body,
  res,
  total_pages = null
) => {
  // const date = moment().format('YYYY-MM-DD')
  // const accessLogStream = fs.createWriteStream(path.join(__dirname + '/backend/logs/', `access_${date}.log`), { flags: 'a' })
  if (total_pages != null) {
    return res.status(statusCode).json({
      status: statusCode,
      message: Message,
      total_pages: total_pages,
      body: Body,
    });
  } else {
    return res
      .status(statusCode)
      .json({ status: statusCode, message: Message, body: Body });
  }
};
const PrintError = (statusCode = 400, Message, res) => {
  return res.status(statusCode).json({ status: statusCode, message: Message });
  // return res.status(statusCode).json({ status: statusCode, message: Message });
};
const SuccessWithoutBody = (statusCode = 200, Message, res) => {
  return res.status(statusCode).json({ status: statusCode, message: Message });
};
const Status205 = (statusCode = 205, Message, res) => {
  return res.status(statusCode).json({ status: statusCode, message: Message });
};
const verifyrequiredparams = (statusCode = 200, body, fields, res) => {
  try {
    let error = false;
    let error_fields = "";
    if (Object.keys(body).length < 1) {
      throw new Error("Body is missing");
      // return res.status(statusCode).json({ status: statusCode, "message": "Body is missing" });
    }
    const element = Object.getOwnPropertyNames(body);
    for (const field of fields) {
      if (element.some((e) => e == field)) {
        if (Object.keys(body[field]).length === 0) {
          if (typeof body[field] == "number") {
            continue;
          } else {
            error = true;
            error_fields += field + ", ";
          }
        }
        continue;
      } else {
        error = true;
        error_fields += field + ", ";
      }
    }
    if (error) {
      // Required field(s) are missing or empty
      throw new Error(
        "Required field(s) " +
        error_fields.slice(0, -2) +
        " is missing or empty"
      );
    } else {
      return Promise.resolve();
    }
  } catch (error) {
    throw new Error(error.message);
    // return res.status(statusCode).json({ status: statusCode, message: error.message });
    // return PrintError(statusCode, error.message, res)
  }
};

const StringUppercase = (string) => {
  const value = string;
  const splited_names = value.split(" ");
  let capitalizedValue = "";
  for (const iterator of splited_names) {
    capitalizedValue += ` ${iterator.charAt(0).toUpperCase()}${iterator.slice(
      1
    )}`;
  }
  return capitalizedValue.trim();
};

// get employer name and email
const userworker = async (user_id) => {
  // find user and return
  let user = await User.findById(user_id, { name: 1, email: 1 });
  return user;
};

const addDays = (Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
});

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function convertTZ(date, tzString, format) {
  return moment(new Date(date)).tz(tzString).format(format);
}

function sortArrByKey(unordered) {
  return Object.keys(unordered)
    .sort()
    .reduce((obj, key) => {
      obj[key] = unordered[key];
      return obj;
    }, {});
  // return array.sort(function (a, b) {
  //     var x = a[key]; var y = b[key];
  //     return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  // });
}

const sendNotification = async (user_id, notification_obj) => {
  var FCM = require("fcm-node");
  var serverKey = process.env.FIREBASEKEY;
  var fcm = new FCM(serverKey);
  const devices = await Devices.find(
    { user_id: user_id },
    { device_id: 1, _id: 0, device_type: 1 },
    { sort: { createdAt: -1 } }
  );
  const devicesList = [];
  const resp = [];
  for (const device of devices) {
    let message = {};
    if (device.device_id.length < 10) continue
    if (device.device_type == "android") {
      message = {
        to: device.device_id,
        data: notification_obj,
      };
    } else if (device.device_type == "ios") {
      notification_obj.sound = "default"
      notification_obj.badge = 1,
        notification_obj.body = notification_obj.message
      message = {
        to: device.device_id,
        notification: notification_obj,
      };
    }
    const notificationSave = {
      user_id: user_id,
      title: notification_obj.title,
      message: notification_obj.message,
      type: notification_obj.type,
      status: notification_obj.status,
      color: notification_obj.color,
      object: notification_obj.object
    }
    const notification_check = await Notifications.findOne(notificationSave)
    if (notification_check) continue;
    fcm.send(message, function (err, response) { });
    await Notifications.create(notificationSave);
  }
  // return { data: resp };
};
const sendFCMNotification = async (userId, notification_obj) => {
  const {body,type,title,itemId}=notification_obj;
  const devices = await Devices.find(
    { user_id: userId },
    { device_id: 1, _id: 0, device_type: 1 },
    { sort: { createdAt: -1 } }
  ).lean();
  const notificationSave = {
    user: userId,
    title: title,
    body: {message:body,item:itemId},
    type:type,
  };
  const notification_check = await Notifications.findOne(notificationSave);
    if (notification_check) {
      return 
    };
  await Notifications.create(notificationSave);
  const fcmPayload = {
    registration_ids: devices?.map((v) => v?.device_id),
    notification: {
      title,
      body,
    },
    data:{
      userId,
      title,
      body,
    }
  };
  try {
    if (fcmPayload?.registration_ids.length===0) return;
    const response = await axios.post(
      "https://fcm.googleapis.com/fcm/send",
      fcmPayload,
      {
        headers: {
          Authorization: `key=${process.env.FIREBASEKEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("FCM notification sent:", response.data);
  } catch (error) {
    console.error("Error sending FCM notification:", error);
  }
};
module.exports = {
  successResponse,
  PrintError,
  SuccessWithoutBody,
  Status205,
  verifyrequiredparams,
  StringUppercase,
  userworker,
  addDays,
  daysInMonth,
  convertTZ,
  sortArrByKey,
  sendNotification,
  sendFCMNotification
};
