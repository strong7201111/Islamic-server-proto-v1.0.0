const express = require("express");
const router = express.Router();
const database = require("./../database");
const client = database.client;
const passport = require("passport");
const bcrypt = require("bcrypt");

//profile page
router.get("/profile", checkAuthenticated, async (req, res) => {
  var loggedIn = false;
  var user = null;
  if (req.isAuthenticated()) {
    //get user's courses
    const data = await client.query(
      "select * from courses where course_id in (select course_id from users_courses where user_id = $1)",
      [req.user.user_id]
    );

    loggedIn = true;
    user = req.user;

    res.render("profile", {
      loggedIn: loggedIn,
      user: user,
      courses: data.rows
    });
  }
});

//login
router.get("/login", async (req, res) => {
  var loggedIn = false;
  var user = null;
  if (!req.isAuthenticated()) {
    res.render("login", { loggedIn: loggedIn, user: user });
  } else {
    res.redirect("/profile");
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true
  })
);

//logout
router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

//add course to user
router.post("/addcoursetouser/:id", async (req, res) => {
  const course_id = req.params.id;
  try {
    //check that user is logged in to prevent access from direct link
    if (req.isAuthenticated()) {
      const data = await client.query(
        "INSERT INTO users_courses(user_id, course_id)VALUES ($1, $2)",
        [req.user.user_id, course_id]
      );
      res.redirect("/courses");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

//remove course from user
router.post("/removeCourseFromUser/:id", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const user = req.user.user_id;

      await client.query(
        "delete from users_courses where user_id = $1 and course_id = $2",
        [user, req.params.id]
      );

      res.redirect("/profile");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
});

//register
router.get("/register", async (req, res) => {
  var loggedIn = false;
  var user = null;
  if (!req.isAuthenticated()) {
    res.render("register", { loggedIn: loggedIn, user: user, error: null });
  } else {
    res.redirect("/profile");
  }
});

router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await client.query(
      "INSERT INTO users(first_name, last_name, email, password) VALUES ($1,$2,$3,$4)",
      [req.body.first_name, req.body.last_name, req.body.email, hashedPassword]
    );
    res.redirect("/login");
  } catch (e) {
    console.log(e);
    res.render("register", {
      loggedIn: false,
      user: null,
      error: "يوجد حساب بهذا الإيميل"
    });
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
