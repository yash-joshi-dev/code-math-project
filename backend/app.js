const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const classesRoutes = require('./routes/classes');
const classStudentsRoutes = require('./routes/class_students');
const pendingChecksRoutes = require('./routes/pending_checks');
const problemSetsRoutes = require('./routes/problem_sets');
const problemsRoutes = require('./routes/problems');
const studentProgressRoutes = require('./routes/student_progress');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    
    res.setHeader('Access-Control-Allow-Origin', "*");
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