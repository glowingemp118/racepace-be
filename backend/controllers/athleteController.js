// controllers/AthleteController.js

const asyncHandler = require("express-async-handler");
const Athlete = require("../schemas/Athlete");
const { successResponse, PrintError, verifyrequiredparams } = require("../middleware/common");
const { getAthletes } = require("../helpers/dbHelper");
const { types } = require("../middleware/accessMiddleware");
const Log = require("../schemas/logs");

// ===========================================
// 1. Add New Athlete
// ===========================================
const addAthlete = asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const { name, age,team } = req.body;

    // Verifying required parameters
    await verifyrequiredparams(
      400,
      req.body,
      ["name", "age", "team"],
      res
    );

    const AthleteExists = await Athlete.findOne({ name,user:user._id });

    if (AthleteExists) {
      return PrintError(400, "Athlete with this name already exists", res);
    }

    const AthleteData = {user:user._id, name, age,team };
    const newAthlete = await Athlete.create(AthleteData);

    if (!newAthlete) return PrintError(400, "Athlete creation failed", res);

    return successResponse(201, "Athlete created successfully", newAthlete, res);
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});

// ===========================================
// 2. Get Athlete by ID
// ===========================================
const getAthleteById = asyncHandler(async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);

    if (!athlete) {
      return PrintError(404, "Athlete not found", res);
    }

    return successResponse(200, "Athlete fetched successfully", athlete, res);
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});

// ===========================================
// 3. Update Athlete
// ===========================================
const updateAthlete = asyncHandler(async (req, res) => {
  try {
    if (req.body.name) {
      const AthleteExists = await Athlete.findOne({ name: req.body.name, user: req.user._id });
      if (AthleteExists && AthleteExists._id.toString() !== req.params.id) {
        return PrintError(400, "Athlete with this name already exists", res);
      }
    }
    const athlete = await Athlete.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!athlete) {
      return PrintError(404, "Athlete not found", res);
    }

    return successResponse(200, "Athlete updated successfully", athlete, res);
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});

// ===========================================
// 4. Delete Athlete
// ===========================================
const deleteAthlete = asyncHandler(async (req, res) => {
  try {
    const athlete = await Athlete.findByIdAndDelete(req.params.id);

    if (!athlete) {
      return PrintError(404, "Athlete not found", res);
    }
    await Log.deleteMany({ athlete: athlete._id });
    return successResponse(200, "Athlete deleted successfully", athlete, res);
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});
// ===========================================
// 5. Get All Athletes
// ===========================================
const getAllAthletes = asyncHandler(async (req, res) => {
    try {
        const {pageno, limit,search} = req.query
        let filter = {}
        if (req.user.user_type !== types.admin) {
            filter.user = req.user._id
        }
        const athletes=await getAthletes({pageno, limit, search,filter})
        return successResponse(200, "Athletes fetched successfully", athletes, res);
    } catch (error) {
        return PrintError(400, error.message, res);
    }
});
module.exports = {
  addAthlete,
  getAthleteById,
  updateAthlete,
  deleteAthlete,
  getAllAthletes
};
