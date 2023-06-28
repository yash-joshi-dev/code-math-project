const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const classesRoutes = require("./routes/classes");
const classStudentsRoutes = require("./routes/class_students");
const unitsRoutes = require("./routes/units");
const contentRoutes = require("./routes/content");
const studentProgressRoutes = require("./routes/student_progress");
const classOwnersRoutes = require("./routes/ownership/class_owners");
const unitOwnersRoutes = require("./routes/ownership/unit_owners");
const contentOwnersRoutes = require("./routes/ownership/content_owners");


const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, PUT, OPTIONS"
  );

  next();
});

//Routes:
app.use("/api/user", userRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/units", unitsRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/class-students", classStudentsRoutes);
app.use("/api/student-progress", studentProgressRoutes);
app.use("/api/class_owners", classOwnersRoutes);
app.use("/api/unit_owners", unitOwnersRoutes);
app.use("/api/content_owners", contentOwnersRoutes);
app.use("/api/unit_management", unitManagementRoutes);
app.use("/api/content_management", contentManagementRoutes);

//export app
module.exports = app;

//USER:
//post for /login and post for /sign-up

//CLASSES:
// for /classes alone, have GET (all classes for a particular teacher), POST (creates a new class for a teacher)
// for /classes/:code, have GET, PUT, DELETE

//CLASS STUDENTS:
// for /class-students/:code, have GET, POST, PATCH, DELETE

//CLASS TEACHERS:
// for /class-teachers/:code, have GET, POST, PATCH, DELETE

//DEFINITIONS:
// for /definitions, have GET
// for /definitions/:teacher_id, have GET, POST, PUT, DELETE

//GLOSSARY (for each student):
// for /glossary/:student_id (we already have this), have GET
// for /glossary/:word, have GET

//LESSON_DEFINITIONS:
// for /lesson-definitions/:lesson-id, have GET, POST <---- don't need GET since pass up when getting a lesson anyway
// for /lesson-definitions/:lesson-id/:definition-id, have DELETE

//LESSONS:
// for /lessons/:unit_id, have GET, POST
// for /lessons/:unit_id/:lesson_id, have GET, PUT, DELETE

//PENDING CODE CHECKS:
// for /pending-code-checks/ ... do later

//Tags

//PROBLEMS:
// for /problems/:class_id, have GET
// for /problems/:unit, have GET, POST
// for /problems, have GET, POST
// for /problems/:problem-id, have GET, PUT, DELETE

//UNITS:
// for /units/:code, have GET, POST
// for /units/:unit_id, have GET, PUT, DELETE

//OWNERSHIP: sharing stuff with other people, unsharing, rights, and so on
//MOVING: units (adding to class/removing from )


