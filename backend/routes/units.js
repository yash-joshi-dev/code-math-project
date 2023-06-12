const express = require('express');
const dbConnection = require('../db');
const router = express.Router();
const checkAuth = require('../middleware/check_auth');
const checkTeacher = require('../middleware/check_teacher');
const checkInClass = require('../middleware/check_in_class');
const checkStudent = require('../middleware/check_student');

//UNITS:
// for /units/ have GET POST (get all for a particular teacher only)
// for /units/:class_id, have GET, POST
// for /units/:unit_id, have GET, PUT, DELETE

//check if person is authenticated teacher
router.get("/", async (req, res, next) => {

    //get all units for a teacher in alpha order
    let sql = `SELECT id, name, is_released FROM units WHERE id IN (SELECT units_id FROM unit_owners WHERE teacher_id = ${req.userData.id}) ORDER BY name`;

    await dbConnection(async (conn) => {
        
        const units = (await conn.query(sql))[0];
        res.status(201).json({
            units: units
        })

    }, res, 500, "Couldn't get units for some reason.")


})

//check if person is authenticated teacher
router.post("/", async (req, res, next) => {

    const newUnitData = {
        name: req.body.name,
        is_released: req.body.isReleased ? 1 : 0,
        content_mapping: JSON.stringify([]),
    }

    const sql = "INSERT INTO units SET ?";

    await dbConnection(async (conn) => {
        const newUnitId = (await conn.query(sql, newUnitData))[0].insertId;

        //add to unit_owners table
        const newRecordData = {
            unit_id: newUnitId,
            teacher_id: req.userData.id,
        }

        await conn.query(`INSERT INTO unit_owners SET ?`, newRecordData);

        req.status(201).json({message: "Successfully created unit!"});
    }, res, 500, "Could not create unit.")

})

//check if person is authenticated and in the class
router.get("/:class_id", async (req, res, next) => {
    const role = req.userData.role;

    await dbConnection(async (conn) => {
          //get class info
          let sql = `SELECT units_mapping FROM classes WHERE id=${req.params.class_id}`;
          let classData = (await conn.query(sql))[0][0];
    
          //all units ordered by the unit_mapping
          const unitsMapping = classData.units_mapping.join(", ");
          studentCondition = role === "student" ? "AND is_released = 1" : "";
          sql = `SELECT * FROM units WHERE id IN (${unitsMapping}) ${studentCondition} ORDER BY FIELD(id, ${unitsMapping})`;
          let unitsData = (await conn.query(sql))[0];
    
          //for every unit, retrieve all the problems and lessons within it and order them according to the content-mapping
          for(const unit of unitsData) {

            //get all lessons and problems for this unit
            let lessonsData = (await conn.query(`SELECT * FROM lessons WHERE id IN (SELECT lesson_id FROM unit_lessons WHERE unit_id = ${unit.id})`))[0]
            let problemsData;

            //for problems if user is student, also get statuses for each problem
            if(role === "teacher") {
                problemsData = (await conn.query(`SELECT problems.id, problems.name, problems.type FROM problems WHERE id IN ((SELECT problem_id FROM unit_problems WHERE unit_id = ${unit.id}))`))[0]
            }
            else if(role === "student") {
                sql = `SELECT problems.id, problems.name, problems.type, student_progress.status FROM problems 
                       INNER JOIN student_progress ON problems.id = student_progress.problem_id
                       WHERE problems.id IN (SELECT problem_id FROM unit_problems WHERE unit_id = ${unit.id}) AND student_progress.unit_id = ${unit.id} AND student_progress.class_id = ${req.params.class_id}`
                problemsData = (await conn.query(`CALL GetStudentUnitProblems()`))[0];
            }
    
            //first store all problem and lesson ids in hash map with their respective objects
            const hashMap = new Map();
            lessonsData.forEach((lesson) => {hashMap.set("Lesson:" + lesson.id, lesson)});
            problemsData.forEach((problem) => {hashMap.set("Problem:" + problem.id, problem)});
    
            //now for each mapping, we store the respective object in a content array
            unit.content = [];
            unit.content_mapping.forEach((mappingId) => {unit.content.push(hashMap.get(mappingId))});
    
          }
          res.status(200).json({
            units: unitsData
          });
    }, res, 401, "Units cannot be accessed.")

})

//check if editing, authenticated teacher in the class
router.post("/:class_id", async (req, res, next) => {


    const newUnitData = {
        name: req.body.name,
        is_released: req.body.isReleased ? 1 : 0,
        content_mapping: JSON.stringify([])
    }

    let sql = "INSERT INTO units SET ?";

    await dbConnection(async (conn) => {

        //create new unit
        newUnitId = (await conn.query(sql, newUnitData))[0].insertId;

        //add new record into unit owner table
        const newRecordData = {
            unit_id: newUnitId,
            teacher_id: req.userData.id,
        }

        await conn.query(`INSERT INTO unit_owners SET ?`, newRecordData);

        //add unit to unit mapping for class
        sql = `SELECT units_mapping FROM classes WHERE id = ${req.params.class_id}`
        const unitsMapping = (await conn.query(sql))[0][0].units_mapping;
        unitsMapping.push(newUnitId);

        sql = `UPDATE classes SET ? WHERE id = ${req.params.class_id}`;
        await conn.query(sql, {units_mapping: JSON.stringify(unitsMapping)});

        //add into class units table
        await conn.query(`INSERT INTO class_units SET ?`, {class_id: req.params.class_id, unit_id: newUnitId});

        res.status(201).json({message: "Successfully created unit!"});
    }, res, 500, "Could not create unit.")

});


//make sure no new problems or lessons are added to the content_mapping
//make sure an authenticated editing teacher
router.put("/:unit_id", async (req, res, next) => {

    const postData = {
        name: req.body.name,
        is_released: req.body.isReleased ? 1 : 0,
        content_mapping: JSON.stringify(req.body.contentMapping)
    }

    await dbConnection(async (conn) => {
        //check if previously released or not
        const wasReleased = (await conn.query(`SELECT is_released FROM units WHERE unit_id = ${req.params.unit_id}`))[0][0].is_released;

        if(wasReleased && !req.body.isReleased) {
            await conn.query(`DELETE FROM student_progress WHERE unit_id = ${req.params.unit_id}`);
        }
        else if(!wasReleased && req.body.isReleased) {
            //now add a student progress for every problem in the unit and for every student in every class that this unit is present
            //first get all problems in this unit
            const problemIds = (await conn.query(`SELECT problem_id FROM unit_problems WHERE unit_id = ${req.params.unit_id}`))[0].map((item) => {return item.problem_id});

            //now get all classes that this unit is in
            const classIds = (await conn.query(`SELECT class_id FROM class_units WHERE unit_id = ${req.params.unit_id}`))[0].map((item) => {return item.class_id});
            let newStudentProgressRecords = []

            for(const classId of classIds) {
                //get all student ids for each class
                let sql = `SELECT student_id FROM class_students WHERE class_id = ${classId} AND approved = 1`;
                const studentIds = (await conn.query(sql)).map(item => {return item.student_id});

                for(const studentId of studentIds) {
                    for(const problemId of problemIds) {
                        const newRecordData = {
                            student_id: studentId,
                            problem_id: problemId, 
                            unit_id: req.params.unit_id,
                            class_id: classId,
                            status: "unattempted",
                            prev_solutions: JSON.stringify([])
                        }
                        newStudentProgressRecords.push(newRecordData);
                    }
                }
            }

            //insert all new records
            await conn.query(`INSERT INTO student_progress SET ?`, newStudentProgressRecords);
            
        }

        await conn.query("UPDATE units SET ? WHERE id=" + req.params.unit_id, postData);
        res.status(201).json({message: "Unit successfully updated."})
    }, res, 401, "Unit update failed.")

});

router.delete("/:unit_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    await dbConnection(async (conn) => {

        //delete from units mapping array in any classes records that had this as a unit
        //first get all classes which had this as a unit
        const unitClasses = (await conn.query(`SELECT * FROM classes WHERE id IN (SELECT class_id FROM class_units WHERE unit_id = ${req.params.unit_id})`))[0];

        //for each class, delete the unit from the units_mapping array
        for(let unitClass of unitClasses) { 

            //can check if index is -1, but shouldn't be EVER because 
            unitClass.units_mapping.splice(unitClass.units_mapping.indexOf(req.params.unit_id), 1);
            await conn.query(`UPDATE classes SET units_mapping = ${unitClass.units_mapping} WHERE id = ${unitClass.id}`);
        }

        //delete unit
        await conn.query("DELETE FROM units WHERE id=" + req.params.unit_id);
        res.status(200).json({message: "Unit successfully deleted."})
    }, res, 401, "Unit deletetion failed.")

});

module.exports = router;