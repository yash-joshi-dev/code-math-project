const express = require('express');
const dbConnection = require('../db');
const router = express.Router();
const checkAuth = require('../middleware/check_auth');
const checkTeacher = require('../middleware/check_teacher');
const checkStudent = require('../middleware/check_student');
const checkInClass = require('../middleware/check_in_class');

//create anew pending student
//delete class student
//approve and remove pending student


//GET all students for a class
//check authenticating viewing teacher in the class
router.get('/:class_id', async (req, res, next) => {

    const sql = `SELECT id, name FROM users WHERE id IN (SELECT student_id FROM class_students WHERE class_id = ${req.params.class_id} AND approved = 1) ORDER BY name`;
    await dbConnection(async (conn) => {
        let response = await conn.query(sql);
        res.status(201).json({
            students: response[0]
        });
    }, res, 401, "An error occurred while getting students.");

});

//GET all pending students
router.get('/pending/:class_id', checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    const sql = `SELECT id, name FROM users WHERE id IN (SELECT student_id FROM class_students WHERE class_id = ${req.params.class_id} AND approved = 0) ORDER BY name`;
    await dbConnection(async (conn) => {
        let response = await conn.query(sql);
        res.status(201).json({
            pendingStudents: response[0]
        });
    }, res, 401, "An error occurred while getting pending students.");

});


//POST to add pending student to the class_students table
router.post("/:code", checkAuth, checkStudent, async (req, res, next) => {

    await dbConnection(async (conn) => {

        let sql = "SELECT id FROM classes WHERE code='" + req.params.code + "'";
        const response = await conn.query(sql);

        if(response[0].length === 0) {
            return res.status(401).json({
                message: "Check class code and try again."
            });
        }

        const id = response[0][0].id;
        const addingData = {
            class_id: id,
            student_id: req.userData.id
        }

        sql = "INSERT INTO class_students SET ?";

        await conn.query(sql, addingData);
        res.status(201).json({
            message: "Student has been added to the pending list for class."
        });
    }, res, 401, "An error occurred while enrolling pending student.");

});

//add student progress to this
//patch to approve student into a class
router.patch("/", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    const sql = "UPDATE class_students SET approved=1 WHERE class_id=" + req.body.classId + " AND student_id=" + req.body.studentId;
    await dbConnection(async (conn) => {
        await conn.query(sql);

        //add student progress for this student; get all released units in class, and get all content for each unit, and then add for each content
        const classUnits = (await conn.query(`SELECT units.id, units.content_mapping FROM units INNER JOIN class_units ON units.id = class_units.unit_id WHERE class_units.class_id = ${req.body.classId} AND units.is_released = 1`))[0];
        const newStudentProgressRecords = [];

        for(const unit of classUnits) {

            for(const contentId of unit.content_mapping) {
                const newRecordData = {
                    student_id: req.body.studentId,
                    content_id: contentId, 
                    unit_id: unit.id,
                    class_id: req.body.classId,
                    status: "unread",
                    prev_solutions: JSON.stringify([])
                }
                newStudentProgressRecords.push(newRecordData);
            }
        }
        await conn.query(`INSERT INTO student_progress SET ?`, newStudentProgressRecords);

        res.status(200).json({message: "Updated student to be in class."})
    }, res, 401, "Couldn't add student to class.");

});

//DELETE from class table (to remove student)
router.delete("/:class_id/:student_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    const sql = "DELETE FROM class_students WHERE class_id=" + req.params.class_id + " AND student_id=" + req.params.student_id;
    
    await dbConnection(async (conn) => {
        await conn.query(sql);
        res.status(201).json({
            message: "Student has been deleted."
        })
    }, res, 401, "An error ocurred while deleting student");

});

module.exports = router;
