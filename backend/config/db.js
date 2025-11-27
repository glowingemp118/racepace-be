const mongoose = require('mongoose');
const uri = process.env.MONGO_DB;
mongoose.set('strictQuery', true);
const db = async () => {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, autoIndex: true, dbName: "" });

    mongoose.connection.on('connected', function () {
        console.log("Database connection established");
    });

    mongoose.connection.on('error', function (err) {
        console.log("Database connection has occurred " + err + " error");
    });

    mongoose.connection.on('disconnected', function () {
        console.log("Database connection is disconnected");
    });

    process.on('SIGINT', function () {
        mongoose.connection.close().then(() => {
            console.log("Database connection is disconnected due to application termination");
            process.exit(0);
        }).catch((err) => {
            console.log("Error while closing database connection: " + err + "");
            process.exit(1);
        });
    });
}

module.exports = db