// routes/clientRoutes.js

const express = require("express");
const router = express.Router();
const { addAthlete, getAthleteById, getAllAthletes, updateAthlete, deleteAthlete } = require("../controllers/athleteController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
// Route to add a new client
router.post("/", addAthlete);

router.get("/", getAllAthletes);
// Route to get a client by ID
router.get("/:id", getAthleteById);

// Route to update a client by ID
router.put("/:id", updateAthlete);

// Route to delete a client by ID
router.delete("/:id", deleteAthlete);

module.exports = router;
