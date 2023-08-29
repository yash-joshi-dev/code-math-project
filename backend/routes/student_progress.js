const express = require('express');
const dbConnection = require('../db');
const check_auth = require('../middleware/check_auth');
const router = express.Router();
// const checkAuth = require('../middleware/check_auth');
// const checkTeacher = require('../middleware/check_teacher');
// const checkInClass = require('../middleware/check_in_class');
// const checkStudent = require('../middleware/check_student');

//STUDENT PROGRESS:
// for /student-progress/:class_id, have GET (when every student is registered/accepted, create for every released problem) and also everytime a new unit is released
// for /student-progress/:class_id/:unit, have GET
// for /student-progress/:class_id/:problem-id, have GET (inside a particular class, we never gonna have duplicate problems)
// for /student-progress/:class_id/:student, have GET
// for /student-progress/:class_id/:unit/:student, have GET
// for /student-progress/:class_id/:problem/:student, have GET, PUT
//actually, just add defs to student glossary when change student progress for a lesson to read


router.get("/class/:class_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        const sql = `SELECT sp.class_id, sp.unit_id, sp.content_id, sp.student_id, sp.status FROM (student_progress AS sp INNER JOIN users ON sp.student_id = users.id)
                     WHERE class_id = ${req.params.class_id} ORDER BY users.name, users.id`;

        const progressData = (await conn.query(sql))[0];

        const sectionedData = [];
        let temp = [];
    
        for(var i = 0; i < progressData.length; i++) {
            if(i !== 0 && progressData[i].student_id !== progressData[i-1].student_id) {
                sectionedData.push([...temp]);
                temp = [];
            }
            temp.push(progressData[i]);
        }
        if(temp.length > 0) {sectionedData.push(temp);}

        return res.status(200).json({
            studentProgress: sectionedData
        })

    }, res, 500, "Error retrieving student progress for class.")

})

router.get("/unit/:class_id/:unit_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        const sql = `SELECT sp.class_id, sp.unit_id, sp.content_id, sp.student_id, sp.status FROM (student_progress AS sp INNER JOIN users ON sp.student_id = users.id)
                     WHERE class_id = ${req.params.class_id} AND unit_id = ${req.params.unit_id} ORDER BY users.name, users.id`;

        const progressData = (await conn.query(sql))[0];

        const sectionedData = [];
        let temp = [];
    
        for(var i = 0; i < progressData.length; i++) {
            if(i !== 0 && progressData[i].student_id !== progressData[i-1].student_id) {
                sectionedData.push([...temp]);
                temp = [];
            }
            temp.push(progressData[i]);
        }
        if(temp.length > 0) {sectionedData.push(temp);}

        return res.status(200).json({
            studentProgress: sectionedData
        })

    }, res, 500, "Error retrieving student progress for unit.")

})

router.get("/content/:class_id/:content_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        const sql = `SELECT sp.class_id, sp.unit_id, sp.content_id, sp.student_id, sp.status FROM (student_progress AS sp INNER JOIN users ON sp.student_id = users.id)
                     WHERE class_id = ${req.params.class_id} AND content_id = ${req.params.content_id} ORDER BY users.name, users.id`;

        const progressData = (await conn.query(sql))[0];

        return res.status(200).json({
            studentProgress: progressData
        })

    }, res, 500, "Error retrieving student progress for content.")

})

router.get("/student/:class_id/:student_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        const sql = `SELECT class_id, unit_id, content_id, student_id, status FROM student_progress 
                    WHERE class_id = ${req.params.class_id} AND student_id = ${req.params.student_id};`

        const progressData = (await conn.query(sql))[0];

        return res.status(200).json({
            studentProgress: progressData
        })

    }, res, 500, "Error retrieving student progress for student.")

})

router.get("/student-unit/:class_id/:unit_id/:student_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        const sql = `SELECT class_id, unit_id, content_id, student_id, status FROM student_progress 
                    WHERE class_id = ${req.params.class_id} AND unit_id = ${req.params.unit_id} AND student_id = ${req.params.student_id};`

        const progressData = (await conn.query(sql))[0];

        return res.status(200).json({
            studentProgress: progressData
        })

    }, res, 500, "Error retrieving student progress for student in this unit.")

})

router.get("/student-content/:class_id/:content_id/:student_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        const sql = `SELECT class_id, unit_id, content_id, student_id, status FROM student_progress 
                    WHERE class_id = ${req.params.class_id} AND content_id = ${req.params.content_id} AND student_id = ${req.params.student_id};`

        const progressData = (await conn.query(sql))[0][0];

        return res.status(200).json({
            studentProgress: progressData
        })

    }, res, 500, "Error retrieving student progress for this problem for this student.")

})

// router.put("/student/:class_id/:content_id/:student_id", async (req, res, next) => {

//     await dbConnection(async (conn) => {

//         const newStatus = req.body.status;
//         const oldStatus = (await conn.query(`SELECT status FROM student_progress WHERE class_id = ${req.params.class_id} AND content_id = ${req.params.content_id} AND student_id = ${req.params.student_id};`))[0][0].status;

//         //if the content is a lesson, and turning to read, add defs to glossary\
//         //if turning to unread, remove defs
//         const contentType = (await conn.query(`SELECT type FROM content WHERE content_id = ${req.params.content_id}`))[0][0].type;
//         if(newStatus !== oldStatus && contentType === "lesson") {
//             const definitions = (await conn.query(`SELECT definitions_mapping FROM lessons WHERE id = ${req.params.content_id}`))[0][0].definitions_mapping;
//             if(newStatus === "read") {
//                 const newDefinitions = definitions.map((def) => {
//                     return {
//                         student_id: req.params.student_id,
//                         class_id: req.params.class_id,
//                         definition_id: def
//                     }
//                 });
//                 await conn.query(`INSERT INTO glossary SET ?`, newDefinitions);
//             }
//             else if (newStatus === "unread") {
//                 const oldDefinitions = definitions.join(", ");
//                 await conn.query(`DELETE FROM glossary WHERE student_id = ${req.params.student_id} AND class_id = ${req.params.class_id} AND definition_id IN (${oldDefinitions})`);
//             }
//         }

//         //finally update the status
//         const sql = `UPDATE student_progress SET ? WHERE class_id = ${req.params.class_id} AND content_id = ${req.params.content_id} AND student_id = ${req.params.student_id};`;

//         await conn.query(sql, {status: newStatus});

//         return res.status(200).json({message: "Successfully updated student progress for this problem."})

//     }, res, 500, "Error retrieving student progress for this problem for this student.")

// })

//called from studend side when they read a problem for the first time
router.put("/:class_id/:content_id", check_auth, async (req, res, next) => {

    await dbConnection(async (conn) => {

        //finally update the status
        const sql = `UPDATE student_progress SET ? WHERE class_id = ${req.params.class_id} AND content_id = ${req.params.content_id} AND student_id = ${req.userData.id};`;

        await conn.query(sql, {status: "read"});

        return res.status(200).json({message: "Successfully updated student progress for this problem."})

    }, res, 500, "Error retrieving student progress for this problem for this student.")

})

// // Post when student submits problem for first time
// router.post("/:class_id", checkAuth, checkStudent, checkInClass, async (req, res, next) => {
//     await dbConnection(async (conn) => {
        
//         //ACTUALLY WHEN SUBMITTED, CHECK ON BACKEND IF ANSWER IS CORRECT, THEN CONTINUE to give a status


//         const postData = {problem_id: req.body.problemId, student_id: req.userData.id, status: req.body.status, prev_solution: req.body.solution};
//         await conn.query("INSERT INTO student_progress SET ?", postData);
//     }) 
// })


// // patch when status changed
// router.patch("/:class_id", checkAuth, checkStudent, checkInClass, async (req, res, next) => {
//     await dbConnection(async (conn) => {
//         const sql = "UPDATE student_progress SET status=" + req.body.status + " WHERE student_id=" + req.userData.id + " AND problem_id=" + req.body.problemId;
//         await conn.query(sql);
//     })
// })

//possibly delete if required if want to remove by resetting so never touched

module.exports = router;