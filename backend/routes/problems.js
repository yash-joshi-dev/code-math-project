const express = require('express');
const dbConnection = require('../db');
const router = express.Router();
const checkAuth = require('../middleware/check_auth');
const checkTeacher = require('../middleware/check_teacher');
const checkInClass = require('../middleware/check_in_class');
const checkStudent = require('../middleware/check_student');

// add / :class_id to router thing and set_id

// //GET all problems for a problem set (only need id, name, description, set_id, class_id, and type)
// router.get("/:class_id/:set_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

//     const sql = "SELECT id, name, description, type, requests FROM problems WHERE set_id=" + req.params.set_id;
//     await dbConnection(async (conn) => {
//         let response = await conn.query(sql);
//         res.status(200).json({problems: response[0]});
//     }, res, 401, "Problems cannot be accessed.")

// })

// //GET all problems for a problem set with student status
// router.get("/:class_id/:set_id/:student_id", checkAuth, checkInClass, async (req, res, next) => {

//     const sql = "CALL Get_Student_Status_Problems_SP(" + req.params.set_id + ", " + req.params.student_id + ")";
//     await dbConnection(async (conn) => {
//         let response = await conn.query(sql);
//         res.status(200).json({problems: response[0][0]});
//     }, res, 401, "Problems cannot be accessed.")

// })

// GET single problem with an id
router.get("/:class_id/single/:problem_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    const sql = "SELECT * FROM problems WHERE id=" + req.params.problem_id;

    await dbConnection(async (conn) => {
        let response = await conn.query(sql);
        res.status(200).json({problem: response[0][0]});
    }, res, 401, "Problem cannot be accessed.")

})

// GET single problem with an id and student status
router.get("/single/:class_id/:problem_id/:student_id", checkAuth, checkInClass, async (req, res, next) => {

    const sql = "CALL Get_Student_Status_Problem_SP(" + req.params.problem_id + ", " + req.params.student_id + ")";;
    await dbConnection(async (conn) => {
        let response = await conn.query(sql);
        res.status(200).json({problem: response[0][0]});
    }, res, 401, "Problem cannot be accessed.")

})

router.post("/:class_id/:set_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    const postData = {
        name: req.body.name,
        description: req.body.description,
        class_id: req.params.class_id,
        set_id: req.params.set_id,
        type: req.params.set_id,
        problem_data: JSON.stringify(req.body.problemData)
    }

    await dbConnection(async (conn) => {
        await conn.query("INSERT INTO problems SET ?", postData);
        res.status(201).json({message: "Problem successfully created."})
    }, res, 401, "Problem creation failed.")

});

router.put("/:class_id/:problem_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    const postData = {
        name: req.body.name,
        description: req.body.description,
        type: req.params.set_id,
        problem_data: JSON.stringify(req.body.problemData)
    }

    await dbConnection(async (conn) => {
        await conn.query("UPDATE problems SET ? WHERE id=" + req.params.problem_id, postData);
        res.status(201).json({message: "Problem successfully updated."})
    }, res, 401, "Problem update failed.")

});

router.delete("/:class_id/:problem_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    await dbConnection(async (conn) => {
        await conn.query("DELETE FROM problems WHERE id=" + req.params.problem_id);
        res.status(200).json({message: "Problem successfully deleted."})
    }, res, 401, "Problem delete failed.")

});

module.exports = router;