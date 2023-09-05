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


router.get("/class/:class_id", check_auth, async (req, res, next) => {

    await dbConnection(async (conn) => {

        //first get unit mapping, then get content mapping for released units only
        const unitsMapping = (await conn.query(`SELECT units_mapping FROM classes WHERE id = ${req.params.class_id}`))[0][0].units_mapping.join(", ");

        if(unitsMapping === "") {
            return res.status(200).json({studentProgress: []});
        } 

        const contentMappings = (await conn.query(`SELECT content_mapping FROM units WHERE is_released = 1 AND id IN (${unitsMapping}) ORDER BY FIELD (id, ${unitsMapping})`))[0];
        
        let studentProgress = [];
        for(var j = 0; j < contentMappings.length; j++) {
            const contentMapping = contentMappings[j].content_mapping;
            const mapping = contentMapping.join(", ");
            
            if(mapping !== "") {

                const sql = `SELECT sp.content_id, users.name, sp.student_id, sp.status FROM (student_progress AS sp INNER JOIN users ON sp.student_id = users.id)
                WHERE class_id = ${req.params.class_id} AND sp.content_id IN (${mapping}) ORDER BY FIELD (sp.content_id, ${mapping}), users.name, users.id`;

                const progressData = (await conn.query(sql))[0];
                // console.log(progressData);
                const sectionedData = [];
                let temp = [];
                for(var i = 0; i < progressData.length; i++) {
                    if(i !== 0 && progressData[i].content_id !== progressData[i-1].content_id) {
                        sectionedData.push([...temp]);
                        temp = [];
                    }
                    temp.push(progressData[i]);
                }
                sectionedData.push(temp);
                
                studentProgress.push(sectionedData);
            }
        }

        return res.status(200).json({
            studentProgress: studentProgress
        })

    }, res, 500, "Error retrieving student progress for class.")

})

// router.get("/unit/:class_id/:unit_id", async (req, res, next) => {

//     await dbConnection(async (conn) => {

//         const sql = `SELECT sp.class_id, sp.unit_id, sp.content_id, sp.student_id, sp.status FROM (student_progress AS sp INNER JOIN users ON sp.student_id = users.id)
//                      WHERE class_id = ${req.params.class_id} AND unit_id = ${req.params.unit_id} ORDER BY users.name, users.id`;

//         const progressData = (await conn.query(sql))[0];

//         const sectionedData = [];
//         let temp = [];
    
//         for(var i = 0; i < progressData.length; i++) {
//             if(i !== 0 && progressData[i].student_id !== progressData[i-1].student_id) {
//                 sectionedData.push([...temp]);
//                 temp = [];
//             }
//             temp.push(progressData[i]);
//         }
//         if(temp.length > 0) {sectionedData.push(temp);}

//         return res.status(200).json({
//             studentProgress: sectionedData
//         })

//     }, res, 500, "Error retrieving student progress for unit.")

// })

router.get("/content/:class_id/:content_id", check_auth, async (req, res, next) => {

    await dbConnection(async (conn) => {

        const sql = `SELECT sp.content_id, users.name, sp.student_id, sp.status FROM (student_progress AS sp INNER JOIN users ON sp.student_id = users.id)
                     WHERE class_id = ${req.params.class_id} AND content_id = ${req.params.content_id} ORDER BY users.name, users.id`;

        const progressData = (await conn.query(sql))[0];

        return res.status(200).json({
            studentProgress: progressData
        })

    }, res, 500, "Error retrieving student progress for content.")

})

router.get("/student/:class_id/:student_id", check_auth, async (req, res, next) => {

    await dbConnection(async (conn) => {

        let unitsMapping = (await conn.query(`SELECT units_mapping FROM classes WHERE id=${req.params.class_id}`))[0][0].units_mapping.join(", ");
        let unitsData = [];
        
        if (unitsMapping.length > 0) {
          unitsData = (await conn.query(`SELECT * FROM units WHERE id IN (${unitsMapping}) AND is_released = 1 ORDER BY FIELD(id, ${unitsMapping})`))[0];
        }
        
        //for every unit, retrieve all the problems and lessons within it and order them according to the content-mapping
        for (var i = 0; i < unitsData.length; i++) {
            const unit = unitsData[i];
          const contentMapping = unit.content_mapping.join(", ");

          if(contentMapping.length == 0) {
            unitsData.splice(i, 1);
            continue;
          }
        
          //if teacher, content data with rights in is owner, if student, get with status
              unit.content = [];
              if (contentMapping.length > 0) {
                let sql = `SELECT content.id, content.name, content.type, student_progress.status FROM content 
                              INNER JOIN student_progress ON content.id = student_progress.content_id
                              WHERE content.id IN (${contentMapping}) AND student_progress.unit_id = ${unit.id} AND student_progress.class_id = ${req.params.class_id}
                              AND student_id = ${req.params.student_id} ORDER BY FIELD(content.id, ${contentMapping})`;
                unit.content = (await conn.query(sql))[0];
              }
        }

        res.status(200).json({
          studentProgressUnits: unitsData,
        });
        

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

        //get the type of the problem 
        const contentType = (await conn.query(`SELECT type FROM content WHERE id = ${req.params.content_id}`))[0][0].type;

        //finally update the status
        const sql = `UPDATE student_progress SET ? WHERE class_id = ${req.params.class_id} AND content_id = ${req.params.content_id} AND student_id = ${req.userData.id};`;

        let status = "read";
        if(contentType === "lesson") status = "completed";

        await conn.query(sql, {status: status});

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