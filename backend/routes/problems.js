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
//GET all problems for a teacher, can also differentiate by class_id, unit_id, and/or tags
router.get("/", async (req, res, next) => {

    await dbConnection(async (conn) => {

        //conditions for each query parameter
        const conditions = [];
        if(req.query.class_id) conditions.push(`class_units.class_id = ${req.query.class_id}`);
        if(req.query.unit_id)  conditions.push(`class_units.unit_id = ${req.query.unit_id}`);
        if(req.query.tags) conditions.push(`problems.id IN (SELECT tags.problem_ids FROM tags WHERE tag IN (${req.query.tags.join(", ")}))`);

        conditions.push(`problem_owners.teacher_id = ${req.userData.id}`);

        const whereClause = `WHERE ${conditions.join(" AND ")}`;

        //get problems
        const sql = `SELECT problems.id, problems.name, problems.type, problem_owners.is_owner, problem_owners.rights
                    FROM (((problems INNER JOIN problem_owners ON problems.id = problem_owners.problem_id)
                    INNER JOIN unit_problems ON problems.id = unit_problems.problem_id)
                    INNER JOIN class_units ON unit_problems.unit_id = class_units.unit_id) ${whereClause}`;

        problems = (await conn.query(sql))[0];
        res.status(201).json({
            problems: problems
        })        
    }, res, 500, "Getting problems failed.");

})

//create a new problem in a teachers library
router.post("/", async(req, res, next) => {

    const newProblemData = {
        name: req.body.name,
        type: req.body.type,
    }

    await dbConnection(async (conn) => {

        //first add problem
        const newProblemId = (await conn.query(`INSERT INTO problems SET ?`, newProblemData))[0].insertId;

        //now add new record in problem owners table
        await conn.query('INSERT INTO problem_owners SET ?', {teacher_id: req.userData.id, problem_id: newProblemId});
        res.status(201).json({message: "Problem created successfully."});

    }, res, 500, "Problem creation failed.")

    //later create stuff in different tables depending on what type is given

})

//check if authenticated teacher in class trying to do this
// router.get("/:unit_id", async (req, res, next)) {

//     //

// }

//check if authenticated teacher with editing rights trying to do this thats in the class
//create a new problem in teh class
router.post("/:unit_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        //create the new problem
        const newProblemData = {
            name: req.body.name,
            type: req.body.type,
        }
        const newProblemId = (await conn.query(`INSERT INTO problems SET ?`, newProblemData))[0].insertId;

        //add the teacher as an owner
        await conn.query('INSERT INTO problem_owners SET ?', {teacher_id: req.userData.id, problem_id: newProblemId});
        res.status(201).json({message: "Problem created successfully."});

        //add the problem in the unit problems table
        await conn.query('INSERT INTO unit_problems SET ?', {unit_id: req.params.unit_id, problem_id: newProblemId});

        //add the problem in the unit mapping array
        const unitData = (await conn.query(`SELECT * FROM units WHERE unit_id = ${req.params.unit_id}`))[0][0];
        unitData.content_mapping.push("Problem:" + newProblemId);
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
                        problem_id: newProblemId, 
                        unit_id: req.params.unit_id,
                        class_id: classId,
                        status: "unattempted",
                        prev_solutions: JSON.stringify([])
                    }
                    newStudentProgressRecords.push(newRecordData);
                }
            }

            //insert all new records
            await conn.query(`INSERT INTO student_progress SET ?`, newStudentProgressRecords);
        }

        //LATER INSERT MORE DATA INTO SPECIFIC TABLE FOR DIFFERENT TYPES OF PROBLEMS

        res.status(201).json({message: "Problem creation successful."})

    }, res, 500, "Problem creation failed.")

})

//LATER ADD ROUTES TO GET DIFFERENT TYPES OF PROBLEMS
//AND UPATE DIFFERENT TYPES OF PROBLEMS

//only allow authenticated, editing teachers
router.put("/:problem_id", async (req, res, next) => {
    
    await dbConnection(async (conn) => {

        //update the problem
        await conn.query(`UPDATE problems SET name = ${req.body.name} WHERE problem_id = ${req.params.problem_id}`);

        //update every student progress record for this problem to unattempted where the unit its in has been released
        //but since only for released units are records present, that check is unecessary
        await conn.query(`UPDATE student_progress SET status = "unattempted" WHERE problem_id=${req.params.problem_id}`)

        //also update stuff according to the problem type ---------------------------------------------TODO

        res.status(201).json({message:"Updated stuff successfully"});


    }, res, 500, "Problem update failed.")

})


//only allow editing teachers
router.delete("/:problem_id", async (req, res, next) => {
    await dbConnection(async (conn) => {

        //delete this from the content_mapping under all units that have this problem in them
        //first get all units which had this as a problem
        const problemUnits = (await conn.query(`SELECT * FROM units WHERE id IN (SELECT unit_id FROM unit_problems WHERE problem_id = ${req.params.problem_id_id})`))[0];

        //for each class, delete the unit from the units_mapping array
        for(let unit of problemUnits) { 

            //can check if index is -1, but shouldn't be EVER because 
            unit.content_mapping.splice(unit.content_mapping.indexOf("Problem:" + req.params.problem_id), 1);
            await conn.query(`UPDATE units SET content_mapping = ${unit.content_mapping} WHERE id = ${unit.id}`);
        }
        
        await conn.query(`DELETE FROM problems WHERE problem_id = ${req.params.problem_id}`);
        res.status(201).json({message: "Problem deleted successfully."});
    }, res, 500, "Problem deletion failed.")
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