const asyncHandler = require("express-async-handler");
const {
  verifyrequiredparams,
  successResponse,
  PrintError,
} = require("../middleware/common");
const Athlete = require("../schemas/Athlete");
const Log = require("../schemas/logs");
const { getLogs } = require("../helpers/dbHelper");
const User = require("../schemas/User");

const addLog = asyncHandler(async (req, res) => {
  const { _id: user_id, credits, plan } = req.user;
  const { type } = req.body;
  let user = null;

  if (plan === "free" && credits <= 0) {
    return PrintError(400, "You don't have enough credits to create a log", res);
  }

  await verifyrequiredparams(400, req.body, ["type"], res);

  const updateUserCredits = async () => {
    const usr = await User.findByIdAndUpdate(
      user_id,
      { $inc: { credits: -1 } },
      { new: true }
    );
    if (usr) {
      usr.image = `${process.env.IMAGEBASEURLAWS}${usr.image}`;
      usr.coverImage = `${process.env.IMAGEBASEURLAWS}${usr.coverImage}`;
    }
    return usr;
  };

  if (type === "split_calculator") {
    if (plan === "free") user = await updateUserCredits();
    return successResponse(200, "Split calculator used successfully", {}, res);
  }

  if (type === "live_race") {
    await verifyrequiredparams(400, req.body, [
      "type",
      "athlete",
      "laps",
      "raceDistance",
      "splitInterval",
      "finishTime",
    ], res);

    const { athlete, finishTime } = req.body;
    const isAthleteExists = await Athlete.findById(athlete);
    if (!isAthleteExists) return PrintError(400, "Athlete not found", res);
    if (!isValidTimeFormat(finishTime)) return PrintError(400, "Finish time is not in valid format", res);
  }

  const log = await Log.create({ ...req.body, user: user_id });
  const newCreatedLog = await Log.findById(log._id)
    .populate("athlete", "_id name team")
    .lean();

  if (plan === "free") user = await updateUserCredits();

  return successResponse(201, "Log created successfully", { log: newCreatedLog, user }, res);
});
const getAllLogs = asyncHandler(async (req, res) => {
  try {
    const user_id = req.user._id;
    const { pageno, limit, search, tab } = req.query;
    const filter = { user: user_id };
    const formatTab = getDateFromTab(tab);
    let logs = await getLogs({ pageno, limit, search, filter, tab: formatTab });

    return successResponse(200, "Logs fetched successfully", logs, res);
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});
const getLogById = asyncHandler(async (req, res) => {
  try {
    const user_id = req.user._id;
    const logId = req.params.id;

    const log = await Log.findById(logId).populate("athlete", "_id name team");

    if (!log) {
      return PrintError(404, "Log not found", res);
    }
    return successResponse(200, "Log fetched successfully", log, res);
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});
const updateLog = asyncHandler(async (req, res) => {
  try {
    const user_id = req.user._id;
    const logId = req.params.id;
    const { athlete, finishTime } = req.body;

    let isAthleteExists = await Athlete.findById(athlete);
    if (!isAthleteExists) {
      return PrintError(400, "Athlete not found", res);
    }
    if (!isValidTimeFormat(finishTime)) {
      return PrintError(400, "Finish time is not in valid format", res);
    }

    let log = await Log.findByIdAndUpdate(logId, req.body, { new: true });
    if (!log) {
      return PrintError(404, "Log not found", res);
    }
    return successResponse(200, "Log updated successfully", log, res);
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});
const deleteLog = asyncHandler(async (req, res) => {
  try {
    const user_id = req.user._id;
    const logId = req.params.id;

    const log = await Log.findByIdAndDelete(logId);
    if (!log) {
      return PrintError(404, "Log not found", res);
    }
    return successResponse(200, "Log deleted successfully", log, res);
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});
function isValidTimeFormat(timeStr) {
  const timeRegex = /^([0-5]?\d):([0-5]?\d)\.(\d{2,3})$/;

  return timeRegex.test(timeStr);
}

function getDateFromTab(tabValue) {
  if (!tabValue || tabValue === "all") return null;

  const now = new Date();
  const value = tabValue.toLowerCase();

  if (value === "recent") {
    const recentDate = new Date(now);
    // recentDate.setDate(now.getDate() - 5); // last 24 hours
    return null;
  }

  const match = value.match(/^(\d+)(days|day|weeks|week|months|month)$/);
  if (!match) return null;

  const [, numStr, unit] = match;
  const amount = parseInt(numStr, 10);

  const date = new Date(now);

  switch (unit) {
    case "day":
    case "days":
      date.setDate(now.getDate() - amount);
      break;
    case "week":
    case "weeks":
      date.setDate(now.getDate() - amount * 7);
      break;
    case "month":
    case "months":
      date.setMonth(now.getMonth() - amount);
      break;
  }

  return date;
}

module.exports = {
  addLog,
  getAllLogs,
  getLogById,
  updateLog,
  deleteLog,
};
