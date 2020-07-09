const express = require("express");
const router = express.Router();
const database = require("./../database");
const client = database.client;

//home
router.get("/", async (req, res) => {
  //get lectures data
  const data = await client.query(
    "select * from lectures order by lecture_id desc limit 4"
  );
  const rows = data["rows"];
  const lectures = [];
  //save them in a list of objects
  rows.forEach(lecture => {
    lectures.push(lecture);
  });

  //get courses data
  const data2 = await client.query(
    "select * from courses order by course_id desc limit 4"
  );
  const rows2 = data2["rows"];
  const courses = [];
  //save them in a list of objects
  rows2.forEach(course => {
    courses.push(course);
  });

  var loggedIn = false;
  var user = null;
  if (req.isAuthenticated()) {
    loggedIn = true;
    user = req.user;
  }

  res.render("index", {
    loggedIn: loggedIn,
    user: user,
    lectures: lectures,
    courses: courses
  });
});

//courses page
router.get("/courses", async (req, res) => {
  //get courses data
  const data2 = await client.query(
    "select * from courses order by course_id desc limit 4"
  );
  const rows2 = data2["rows"];
  const courses = [];
  //save them in a list of objects
  rows2.forEach(course => {
    courses.push(course);
  });

  var loggedIn = false;
  var user = null;
  if (req.isAuthenticated()) {
    loggedIn = true;
    user = req.user;
  }

  res.render("courses", {
    loggedIn: loggedIn,
    user: user,
    courses: courses
  });
});

//course page
router.get("/course/:id", async (req, res) => {
  const data = await client.query(
    "select l.lecture_id, l.lecture_title, s.section_title, l.course_id , l.lecture_thumbnail_link from lectures l, sections s where l.section_id = s.section_id and l.course_id = $1 order by course_id, lecture_id",
    [req.params.id]
  );
  const rows = data["rows"];

  const lectures = [];
  //save them in a list of objects
  rows.forEach(lecture => {
    lectures.push(lecture);
  });

  var loggedIn = false;
  var user = null;
  if (req.isAuthenticated()) {
    loggedIn = true;
    user = req.user;
  }

  if (lectures.length === 0) {
    res.render("404", {
      loggedIn: loggedIn,
      user: user,
      lectures: lectures
    });
  } else {
    res.render("course", {
      loggedIn: loggedIn,
      user: user,
      lectures: lectures
    });
  }
});

//video
router.get("/video/:id", async (req, res) => {
  const data = await client.query(
    "select * from lectures where lecture_id = $1",
    [req.params.id]
  );

  var loggedIn = false;
  var user = null;
  if (req.isAuthenticated()) {
    loggedIn = true;
    user = req.user;
  }

  const video = data.rows[0];
  if (video === undefined) {
    res.render("404", { loggedIn: loggedIn, user: user, video: video });
  } else {
    res.render("video", { loggedIn: loggedIn, user: user, video: video });
  }
});

module.exports = router;
