require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const database = require("./database.js");
const passport = require("passport");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session")({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  //rolling will refresh the session expiry date
  //every time a request is made before the session expires,
  //meaning that if the person stays idel for the actual time
  //of expiry, only then will he/she have to relogin
  //note: resave must be true to wrok
  rolling: true,
  //set the time of session cookie expiration time
  //in milliseconds
  cookie: { maxAge: 20 * 60 * 1000 }
});
const authenticationRoutes = require("./routes/authentication");
const websiteRoutes = require("./routes/website");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(flash());
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

//start the database and set the client const
database.initialize();
const client = database.client;

//intialize passport local strategy
const intializePassport = require("./passport-config");
intializePassport(
  passport,
  email => {
    return client.query("select * from users where email = $1", [email]);
  },
  id => {
    return client.query("select * from users where user_id = $1", [id]);
  }
);

console.log("hello world");

app.use(websiteRoutes);
app.use(authenticationRoutes);

var listener = app.listen(8080, function() {
  console.log("Listening on port " + listener.address().port);
});
