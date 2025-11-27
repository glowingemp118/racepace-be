
const express = require("express");
const app = express();
const dotenv = require('dotenv').config();
var cors = require('cors')
const { errorHandler } = require('./backend/middleware/errorMiddleware');
const db = require('./backend/config/db');
const fileUpload = require("express-fileupload");
app.use("/uploads", express.static("uploads"));
app.use(express.static('public'));

app.use(fileUpload({
  createParentPath: true,
  // useTempFiles: true,
  // tempFileDir: "/tmp/",
}));


// load db
db();


app.use(express.json())
app.use(express.urlencoded({ extended: false }))



app.use(cors())


app.get("/", (req, res) => {
  res.send("Hello from Node.js!");
});
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());
app.use('/api/admin', cors(), require('./backend/routes/adminRoutes'));
app.use('/api/auth', cors(), require('./backend/routes/userRoutes'));
app.use('/api/file', cors(), require('./backend/routes/fileHandlingRouter'));
app.use('/api/athlete', cors(), require('./backend/routes/athleteRoutes'));
app.use('/api/log', cors(), require('./backend/routes/logsRoutes'));
app.use(errorHandler);
  app.use((req, res, next) => {
    return res.status(404).json({
      error: "Route Not Found",
    });
  });

app.listen(process.env.PORT, () => console.log(`Server listening in port ${process.env.PORT} url: http://localhost:${process.env.PORT}`))


module.exports = app;
