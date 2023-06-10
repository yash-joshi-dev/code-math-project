const express = require('express');
const dbConnection = require('../db');
const router = express.Router();
const checkAuth = require('../middleware/check_auth');
const checkTeacher = require('../middleware/check_teacher');
const checkInClass = require('../middleware/check_in_class');
const checkStudent = require('../middleware/check_student');

// Post when student submits problem for first time
router.post("/:class_id", checkAuth, checkStudent, checkInClass, async (req, res, next) => {
    await dbConnection(async (conn) => {
        
        //ACTUALLY WHEN SUBMITTED, CHECK ON BACKEND IF ANSWER IS CORRECT, THEN CONTINUE to give a status


        const postData = {problem_id: req.body.problemId, student_id: req.userData.id, status: req.body.status, prev_solution: req.body.solution};
        await conn.query("INSERT INTO student_progress SET ?", postData);
    }) 
})


// patch when status changed
router.patch("/:class_id", checkAuth, checkStudent, checkInClass, async (req, res, next) => {
    await dbConnection(async (conn) => {
        const sql = "UPDATE student_progress SET status=" + req.body.status + " WHERE student_id=" + req.userData.id + " AND problem_id=" + req.body.problemId;
        await conn.query(sql);
    })
})

//possibly delete if required if want to remove by resetting so never touched

module.exports = router;