const express = require('express');
const dbConnection = require('../db');
const router = express.Router();
const checkAuth = require('../middleware/check_auth');
const checkTeacher = require('../middleware/check_teacher');
const checkInClass = require('../middleware/check_in_class');
const checkStudent = require('../middleware/check_student');


// get all for particular problem if person in the class
// delete one (accept and reject)
// add one

router.get("/:class_id/:problem_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    //later make an SP so that get student name with pending check ********
    const sql = "SELECT * FROM pending_code_checks WHERE problem_id=" + req.params.problem_id;

    await dbConnection(async (conn) => {
        const response = await conn.query(sql);
        res.status(200).json({pendingChecks: response[0]});
    }, res, 401, "Pending checks can not be accessed");

})

router.post("/:class_id", checkAuth, checkStudent, async (req, res, next) => {

    const postData = {
        problem_id: req.body.problemId,
        class_id: req.body.classId,
        student_id: req.userData.id,
        pseudocode: req.body.pseudocode
    }

    await dbConnection(async (conn) => {
        await conn.query("INSERT INTO pending_code_checks SET ?", postData);
        res.status(200).json({message: "Inserted successfully."});
    }, res, 401, "Error inserting.");

});

router.delete("/approve/:class_id/:problem_id/:student_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    let sql = "DELETE FROM pending_code_checks WHERE problem_id=" + req.params.problem_id + " AND student_id=" + req.params.student_id;

    await dbConnection(async (conn) => {
        await conn.query(sql);
        sql = "UPDATE student_progress SET status='accepted' WHERE student_id=" + req.params.student_id + " AND problem_id=" + req.params.problemId;
        await conn.query(sql)
        res.status(200).json({message: "approved successfully"});
    }, res, 401, "Pending check can not be approved");

})

router.delete("/reject/:class_id/:problem_id/:student_id", checkAuth, checkInClass, async (req, res, next) => {

    let sql = "DELETE FROM pending_code_checks WHERE problem_id=" + req.params.problem_id + " AND student_id=" + req.params.student_id;

    await dbConnection(async (conn) => {
        await conn.query(sql);
        sql = "UPDATE student_progress SET status='rejected' WHERE student_id=" + req.params.student_id + " AND problem_id=" + req.params.problemId;
        await conn.query(sql)
        res.status(200).json({message: "Rejected successfully"});
    }, res, 401, "Pending check can not be rejected");

})



module.exports = router;
