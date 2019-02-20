const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const userRoute = require("./routes/api/users");

// Set up the express app
const app = express();

// Log requests to the console.
app.use(logger("dev"));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// require the database config.
const db = require("./config/keys").MONGO_URI;

// checking the routes
app.get("/", (req, res, next) => {
  res.json({ msg: "Hello" });
});

// passport middleware
app.use(passport.initialize());

// Passport Config
require("./services/passport")(passport);

// use routes
app.use("/api/users", userRoute);

if (process.env.NODE_ENV == "production") {
  // express will serve up production assets
  // like our main.js file,or main.css file.
  app.use(express.static("client/build"));
  // express will serve up the index.html file
  // if it doesnot recognize the route.
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

//production mode
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "client/build")));
//   //
//   app.get("*", (req, res) => {
//     res.sendfile(path.join((__dirname = "client/build/index.html")));
//   });
// }

// initialoze the port.
const PORT = process.env.PORT || 5000;

// connect to the mongo cluster.
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to mongoDB cluster");
    app.listen(PORT, () => {
      console.log(`The server is Running on ${PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
