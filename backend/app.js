const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const classesRoutes = require("./routes/classes");
const classStudentsRoutes = require("./routes/class_students");
const pendingChecksRoutes = require("./routes/pending_checks");
const problemSetsRoutes = require("./routes/problem_sets");
const problemsRoutes = require("./routes/problems");
const studentProgressRoutes = require("./routes/student_progress");

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
app.use("/api/class-students", classStudentsRoutes);
app.use("/api/pending", pendingChecksRoutes);
app.use("/api/problem-sets", problemSetsRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/student-progress", studentProgressRoutes);

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
// for /lesson-definitions/:lesson-id, have GET, POST
// for /lesson-definitions/:lesson-id/:definition-id, have DELETE

//LESSONS:
// for /lessons/:unit_id, have GET, POST
// for /lessons/:unit_id/:lesson_id, have GET, PUT, DELETE

//PENDING CODE CHECKS:
// for /pending-code-checks/ ... do later

//PROBLEMS:
// for /problems/:code, have GET
// for /problems/:unit, have GET, POST
// for /problems/:problem-id, have GET, PUT, DELETE

//UNITS:
// for /units/:code, have GET, POST
// for /units/:unit_id, have GET, PUT, DELETE

//STUDENT PROGRESS:
// for /student-progress/:code, have GET (when every student is registered/accepted, create for every released problem) and also everytime a new unit is released
// for /student-progress/:code/:unit, have GET
// for /student-progress/:code/:problem-id, have GET (inside a particular class, we never gonna have duplicate problems)
// for /student-progress/:code/:student, have GET
// for /student-progress/:code/:unit/:student, have GET
// for /student-progress/:code/:problem/:student, have GET, POST, PUT, DELETE
