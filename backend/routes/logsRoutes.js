const express = require("express");
const { addLog, getAllLogs, updateLog, deleteLog, getLogById } = require("../controllers/logsController");
const { protect } = require("../middleware/authMiddleware");

const LogsRouter = express.Router();

LogsRouter.use(protect)

LogsRouter.post('/', addLog);

LogsRouter.get('/', getAllLogs);

LogsRouter.get('/:id', getLogById);

LogsRouter.put('/:id', updateLog);

LogsRouter.delete('/:id', deleteLog);

module.exports = LogsRouter;