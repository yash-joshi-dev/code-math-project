const express = require('express');
const dbConnection = require('../db');
const router = express.Router();
const checkAuth = require('../middleware/check_auth');
const checkTeacher = require('../middleware/check_teacher');
const checkInClass = require('../middleware/check_in_class');
const checkStudent = require('../middleware/check_student');


// for / GET POST
// for /units_id GET POST
// for /problem_id PUT DELETE

// for /problems/:unit_id, have GET, POST
// for /problems, have GET, POST
// for /problems/:problem_id, have PUT, DELETE
// for /problems/block_problem

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

//check if authenticated teacher trying to do this
//GET all content for a teacher, can also differentiate by class_id, unit_id, and/or tags, and whether we want lessons or problems
router.get("/", async (req, res, next) => {

    await dbConnection(async (conn) => {

        //conditions for each query parameter
        const conditions = [];
        if(req.query.class_id) conditions.push(`class_units.class_id = ${req.query.class_id}`);
        if(req.query.unit_id)  conditions.push(`class_units.unit_id = ${req.query.unit_id}`);
        if(req.query.tags) conditions.push(`content.id IN (SELECT tags.content_ids FROM tags WHERE tag IN (${req.query.tags.join(", ")}))`);
        if(req.query.content_type) conditions.push(`content.type = ${req.query.content_type}`);

        conditions.push(`content_owners.teacher_id = ${req.userData.id}`);

        const whereClause = `WHERE ${conditions.join(" AND ")}`;

        //get problems
        const sql = `SELECT content.id, content.name, content.type, content_owners.is_owner, content_owners.rights
                    FROM (((content INNER JOIN content_owners ON content.id = content_owners.content_id)
                    INNER JOIN unit_content ON content.id = unit_content.content_id)
                    INNER JOIN class_units ON unit_content.unit_id = class_units.unit_id) ${whereClause}`;

        problems = (await conn.query(sql))[0];
        res.status(201).json({
            content: content
        });
    }, res, 500, "Getting content failed.");

})

//create a new piece of content in a teachers library
router.post("/", async(req, res, next) => {

    const newContentData = {
        name: req.body.name,
        type: req.body.type,
    }

    await dbConnection(async (conn) => {

        //first add content
        const newContentId = (await conn.query(`INSERT INTO content SET ?`, newContentData))[0].insertId;

        //now add new record in content owners table
        await conn.query('INSERT INTO content_owners SET ?', {teacher_id: req.userData.id, content_id: newContentId});
        res.status(201).json({message: "Content created successfully."});

    }, res, 500, "Content creation failed.")

    //later create stuff in different tables depending on what type is given

})

//check if authenticated teacher in class trying to do this
// router.get("/:unit_id", async (req, res, next)) {

//     //

// }

//check if authenticated teacher with editing rights trying to do this thats in the class
//create a new piece of content in the class
router.post("/:unit_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        //create the new content
        const newContentData = {
            name: req.body.name,
            type: req.body.type,
        }
        const newContentId = (await conn.query(`INSERT INTO content SET ?`, newContentData))[0].insertId;

        //add the teacher as an owner
        await conn.query('INSERT INTO content_owners SET ?', {teacher_id: req.userData.id, content_id: newContentId});

        //add the content in the unit content table
        await conn.query('INSERT INTO unit_content SET ?', {unit_id: req.params.unit_id, content_id: newContentId});

        //add the content in the unit content mapping array
        const unitData = (await conn.query(`SELECT * FROM units WHERE unit_id = ${req.params.unit_id}`))[0][0];
        unitData.content_mapping.push(newContentId);
        await conn.query('UPDATE units SET ?', {content_mapping: JSON.stringify(unitData.content_mapping)});

        //add a new record in student progress for every student in every class in which the unit is IF it is released
        if(unitData.is_released) {

            //now get all classes that this unit is in
            const classIds = (await conn.query(`SELECT class_id FROM class_units WHERE unit_id = ${req.params.unit_id}`))[0].map((item) => {return item.class_id});
            let newStudentProgressRecords = []

            for(const classId of classIds) {
                //get all student ids for each class
                let sql = `SELECT student_id FROM class_students WHERE class_id = ${classId} AND approved = 1`;
                const studentIds = (await conn.query(sql)).map(item => {return item.student_id});

                for(const studentId of studentIds) {
                    const newRecordData = {
                        student_id: studentId,
                        content_id: newContentId, 
                        unit_id: req.params.unit_id,
                        class_id: classId,
                        status: "unread",
                        prev_solutions: JSON.stringify([])
                    }
                    newStudentProgressRecords.push(newRecordData);
                }
            }

            //insert all new records
            await conn.query(`INSERT INTO student_progress SET ?`, newStudentProgressRecords);
        }

        //LATER INSERT MORE DATA INTO SPECIFIC TABLE FOR DIFFERENT TYPES OF CONTENT

        res.status(201).json({message: "Content creation successful."})

    }, res, 500, "Content creation failed.")

})

//LATER ADD ROUTES TO GET DIFFERENT TYPES OF Content
//AND UPATE DIFFERENT TYPES OF CONTENT

//only allow authenticated, editing teachers
router.put("/:content_id", async (req, res, next) => {
    
    await dbConnection(async (conn) => {

        //update the content
        await conn.query(`UPDATE content SET name = ${req.body.name} WHERE content_id = ${req.params.content_id}`);

        //update every student progress record for this content to unread where the unit its in has been released
        //but since only for released units are records present, that check is unecessary
        await conn.query(`UPDATE student_progress SET status = "unread" WHERE content_id=${req.params.content_id}`)

        //also update stuff according to the content type ---------------------------------------------TODO

        res.status(201).json({message:"Updated content successfully"});


    }, res, 500, "Content update failed.")

})


//only allow editing teachers
router.delete("/:content_id", async (req, res, next) => {
    await dbConnection(async (conn) => {

        //delete this from the content_mapping under all units that have this content in them
        //first get all units which had this as content
        const contentUnits = (await conn.query(`SELECT * FROM units WHERE id IN (SELECT unit_id FROM unit_content WHERE content_id = ${req.params.content_id})`))[0];

        //for each class, delete the unit from the units_mapping array
        for(let unit of contentUnits) { 

            //can check if index is -1, but shouldn't be EVER because 
            unit.content_mapping.splice(unit.content_mapping.indexOf(req.params.content_id), 1);
            await conn.query(`UPDATE units SET content_mapping = ${unit.content_mapping} WHERE id = ${unit.id}`);
        }
        
        await conn.query(`DELETE FROM content WHERE content_id = ${req.params.content_id}`);
        res.status(201).json({message: "Content deleted successfully."});
    }, res, 500, "Content deletion failed.")
})

// // GET single problem with an id
// router.get("/:class_id/single/:problem_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

//     const sql = "SELECT * FROM problems WHERE id=" + req.params.problem_id;

//     await dbConnection(async (conn) => {
//         let response = await conn.query(sql);
//         res.status(200).json({problem: response[0][0]});
//     }, res, 401, "Problem cannot be accessed.")

// })

// // GET single problem with an id and student status
// router.get("/single/:class_id/:problem_id/:student_id", checkAuth, checkInClass, async (req, res, next) => {

//     const sql = "CALL Get_Student_Status_Problem_SP(" + req.params.problem_id + ", " + req.params.student_id + ")";;
//     await dbConnection(async (conn) => {
//         let response = await conn.query(sql);
//         res.status(200).json({problem: response[0][0]});
//     }, res, 401, "Problem cannot be accessed.")

// })

// router.post("/:class_id/:set_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

//     const postData = {
//         name: req.body.name,
//         description: req.body.description,
//         class_id: req.params.class_id,
//         set_id: req.params.set_id,
//         type: req.params.set_id,
//         problem_data: JSON.stringify(req.body.problemData)
//     }

//     await dbConnection(async (conn) => {
//         await conn.query("INSERT INTO problems SET ?", postData);
//         res.status(201).json({message: "Problem successfully created."})
//     }, res, 401, "Problem creation failed.")

// });

// router.put("/:class_id/:problem_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

//     const postData = {
//         name: req.body.name,
//         description: req.body.description,
//         type: req.params.set_id,
//         problem_data: JSON.stringify(req.body.problemData)
//     }

//     await dbConnection(async (conn) => {
//         await conn.query("UPDATE problems SET ? WHERE id=" + req.params.problem_id, postData);
//         res.status(201).json({message: "Problem successfully updated."})
//     }, res, 401, "Problem update failed.")

// });

// router.delete("/:class_id/:problem_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

//     await dbConnection(async (conn) => {
//         await conn.query("DELETE FROM problems WHERE id=" + req.params.problem_id);
//         res.status(200).json({message: "Problem successfully deleted."})
//     }, res, 401, "Problem delete failed.")

// });

module.exports = router;