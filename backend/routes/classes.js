const express = require('express');
const dbConnection = require('../db');
const router = express.Router();
const checkAuth = require('../middleware/check_auth');
const checkTeacher = require('../middleware/check_teacher');
const checkInClass = require('../middleware/check_in_class')

const codeSymbols = "abcdefghijklmnopqrstuvwxyz0123456789";

//generates random 6 digit code
function generateRandCode() {

    let code = "";

    for(let i = 0; i < 6; i++) {
        const letter = codeSymbols[Math.floor(36 * Math.random())];
        code += letter;
    }

    return code;
}


//get all classes for a particular teacher or student
router.get("", checkAuth, async (req, res, next) => {

    const role = req.userData.role;
    let sql;

    if(role === "teacher") {
        sql = "SELECT * FROM classes WHERE teacher_id=" + req.userData.id;
    }
    else if(role === "student") {
        sql = "CALL Get_Student_Classes_SP(" + req.userData.id + ")";
    }

    await dbConnection(async (conn) => {
        response = await conn.query(sql);

        res.status(200).json({
            classes: role === "teacher" ? response[0] : response[0][0]
        });
    }, res, 401, "Error retrieving your classes. Please try again later.");

});

//get a single class by code
router.get('/:code', checkAuth, async (req, res, next) => {

    await dbConnection(async (conn) => {

        const role = req.userData.role;
        let sql = "SELECT * FROM classes WHERE code='" + req.params.code + "'";
        let classData = (await conn.query(sql))[0];

        if(classData.length === 0) {
            return res.status(401).json({message: "The class does not exist."});
        }

        //only if the student is approved, let them access class, else they can still view classes
        if(role === "teacher" && classData[0].teacher_id !== req.userData.id) {
            throw new Error();
        }
        else if(role === "student") {
            sql = "SELECT * FROM class_students WHERE student_id=" + req.userData.id + " AND class_id=" + classData[0].id;
            if((await conn.query(sql))[0].length === 0) {
                throw new Error();
            }
        }

        res.status(200).json({
            classData: classData[0]
        });

    }, res, 401, "You do not have access to this class.");
});


//POST request handler to create new classes
router.post("", checkAuth, checkTeacher, async (req, res, next) => {

    await dbConnection(async (conn) => {
        let validCodeFound = false;
        let code;

        while(!validCodeFound) {

            //generate a new code
            code = generateRandCode();

            //check if code exists already
            const sql = "SELECT EXISTS (SELECT * FROM classes WHERE code='" + code + "')";

            let response = await conn.query(sql);

            if(Object.values(response[0][0])[0] === 0) {
                validCodeFound = true;
            }

        }

        //create an object for the class
        const newClassData = {
            code: code,
            name: req.body.name,
            teacher_id: req.userData.id,
            teacher_name: req.body.teacher_name
        }

        //insert into table
        let sql = "INSERT INTO classes SET ?";
        await conn.query(sql, newClassData);
        sql = "SELECT * FROM classes WHERE code=?";
        const classData = (await conn.query(sql, newClassData.code))[0][0];

        res.status(201).json({
            classData: classData
        });
    }, res, 401, "Error creating new class.");

});


// PUT to modify existing class
router.put("/:class_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    await dbConnection(async (conn) => {

        const classData = {
            name: req.body.name,
            teacher_name: req.body.teacher_name,
            problem_set_array: JSON.stringify(req.body.problem_set_array)
        }
        let sql;
        if(req.body.code) {

            //check if code DNE for all records (except possibly the current one)
            sql = "SELECT * FROM classes WHERE id!=" + req.params.class_id + " AND code=" + req.body.code;
            response = await conn.query(sql);
            if(response[0].length !== 0) {
                return res.status(401).json({message: "You cannot modify the specified class."});
            }

            userData.code = req.body.code;
        }

        //update the class
        sql = "UPDATE classes SET ? WHERE id=" + req.params.class_id;
        await conn.query(sql, classData);
        res.status(200).json({message: "Succesfully modified class."});

    }, res, 401, "Cannot modify that class.")

});

router.delete("/:class_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {


    await dbConnection(async (conn) => {

        const sql = "DELETE FROM classes WHERE id=" + req.params.class_id;
        await conn.query(sql);

        res.status(200).json({message: "Successfully deleted class."});

    }, res, 401, "Could not delete class.");

});


//export this file
module.exports = router;
