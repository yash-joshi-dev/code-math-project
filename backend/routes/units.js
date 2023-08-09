const express = require('express');
const dbConnection = require('../db');
const router = express.Router();
const checkAuth = require('../middleware/check_auth');
const checkTeacher = require('../middleware/check_teacher');
const checkInClass = require('../middleware/check_in_class');
const checkStudent = require('../middleware/check_student');
const check_auth = require('../middleware/check_auth');

//UNITS:
// for /units/ have GET POST (get all for a particular teacher only)
// for /units/:class_id, have GET, POST
// for /units/:unit_id, have GET, PUT, DELETE

//check if person is authenticated teacher - but why?
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

        req.status(201).json({message: "Successfully created unit!", newUnitData: {
            id: newUnitId,
            name: req.body.name,
            is_released: req.body.isReleased,
            content_mapping: [],
            is_owner: true,
            rights: 'editing',
            content: []
        }});
    }, res, 500, "Could not create unit.")

})

//check if person is authenticated and in the class
router.get("/:class_id", check_auth, async (req, res, next) => {
    const role = req.userData.role;

    await dbConnection(async (conn) => {
        //get class info
        let sql = `SELECT units_mapping FROM classes WHERE id=${req.params.class_id}`;
        let classData = (await conn.query(sql))[0][0];

        //all units ordered by the unit_mapping
        const unitsMapping = classData.units_mapping.join(", ");

        let unitsData = [];

        if (unitsMapping.length > 0) {
          if (role === "teacher") {
            sql = `SELECT units.id, units.name, units.is_released, units.content_mapping, unit_owners.is_owner, unit_owners.rights
                          FROM units INNER JOIN unit_owners ON units.id = unit_owners.unit_id WHERE unit_owners.teacher_id = ${req.userData.id}
                          AND units.id IN (${unitsMapping}) ORDER BY FIELD(units.id, ${unitsMapping})`;
          } else if (role === "student") {
            sql = `SELECT * FROM units WHERE id IN (${unitsMapping}) AND is_released = 1 ORDER BY FIELD(id, ${unitsMapping})`;
          }
          unitsData = (await conn.query(sql))[0];
        }

        //for every unit, retrieve all the problems and lessons within it and order them according to the content-mapping
        for(const unit of unitsData) {

            const contentMapping = unit.content_mapping.join(", ");

            //if teacher, content data with rights in is owner, if student, get with status
            unit.content = [];
            if(contentMapping.length > 0) {
                if (role === "teacher") {
                sql = `SELECT content.id, content.name, content.type, content_owners.rights, content_owners.is_owner
                            FROM content INNER JOIN content_owners ON content.id = content_owners.id WHERE content_owners.teacher_id = ${req.userData.id}
                            AND content.id IN (${contentMapping}) ORDER BY FIELD(content.id, ${contentMapping})`;
                } else if (role === "student") {
                sql = `SELECT content.id, content.name, content.type, student_progress.status FROM content 
                            INNER JOIN student_progress ON content.id = student_progress.content_id
                            WHERE content.id IN (${contentMapping}) AND student_progress.unit_id = ${unit.id} AND student_progress.class_id = ${req.params.class_id}
                            AND student_id = ${req.userData.id} ORDER BY FIELD(content.id, ${contentMapping})`;
                }

                unit.content = (await conn.query(sql))[0];
            }


        }
        res.status(200).json({
        units: unitsData
        });
    }, res, 401, "Units cannot be accessed.")

})

//check if editing, authenticated teacher in the class
router.post("/:class_id", checkAuth, async (req, res, next) => {


    const newUnitData = {
        name: req.body.name,
        is_released: req.body.isReleased ? 1 : 0,
        content_mapping: JSON.stringify([])
    }

    let sql = "INSERT INTO units SET ?";

    await dbConnection(async (conn) => {

        //create new unit
        newUnitId = (await conn.query(sql, newUnitData))[0].insertId;

        //for each teacher in the class, add new record into unit owner table
        const classOwners = (await conn.query(`SELECT teacher_id, rights FROM class_owners WHERE class_id = ${req.params.class_id}`))[0];
        const newUnitOwnerRecords = [];
        for(let i = 0; i < classOwners.length; i++) {

            const classOwner = classOwners[i];

            const newRecordData = {
                unit_id: newUnitId,
                teacher_id: classOwner.teacher_id,
                rights: classOwner.rights,
                is_owner: (classOwner.teacher_id === req.userData.id ? 1 : 0)
            }

            newUnitOwnerRecords.push(newRecordData);
        }
        await conn.query(`INSERT INTO unit_owners SET ?`, newUnitOwnerRecords);


        //add unit to unit mapping for class
        sql = `SELECT units_mapping FROM classes WHERE id = ${req.params.class_id}`
        const unitsMapping = (await conn.query(sql))[0][0].units_mapping;
        unitsMapping.push(newUnitId);

        sql = `UPDATE classes SET ? WHERE id = ${req.params.class_id}`;
        await conn.query(sql, {units_mapping: JSON.stringify(unitsMapping)});

        //add into class units table
        await conn.query(`INSERT INTO class_units SET ?`, {class_id: req.params.class_id, unit_id: newUnitId});

        res.status(201).json({message: "Successfully created unit!", newUnitData: {
            id: newUnitId,
            name: req.body.name,
            is_released: req.body.isReleased,
            content_mapping: [],
            is_owner: true,
            rights: 'editing',
            content: []
        }});
    }, res, 500, "Could not create unit.")

});


//make sure no new problems or lessons are added to the content_mapping
//make sure an authenticated editing teacher
router.put("/:unit_id", checkAuth, async (req, res, next) => {

    const postData = {
        name: req.body.name,
        is_released: req.body.isReleased ? 1 : 0,
        content_mapping: JSON.stringify(req.body.contentMapping)
    }

    await dbConnection(async (conn) => {
        //check if previously released or not
        const unitData = (await conn.query(`SELECT * FROM units WHERE id = ${req.params.unit_id}`))[0][0];
        if(unitData.is_released && !req.body.isReleased) {
            await conn.query(`DELETE FROM student_progress WHERE unit_id = ${req.params.unit_id}`);
        }
        else if(!unitData.is_released && req.body.isReleased) {
            //now add a student progress for all content in the unit and for every student in every class that this unit is present
            //first get all content in this unit
            const contentIds = unitData.content_mapping;

            //now get all classes that this unit is in
            const classIds = (await conn.query(`SELECT class_id FROM class_units WHERE unit_id = ${req.params.unit_id}`))[0].map((item) => {return item.class_id});
            let newStudentProgressRecords = []

            for(const classId of classIds) {
                //get all student ids for each class
                let sql = `SELECT student_id FROM class_students WHERE class_id = ${classId} AND approved = 1`;
                const studentIds = (await conn.query(sql))[0].map(item => {return item.student_id});

                for(const studentId of studentIds) {
                    for(const contentId of contentIds) {
                        const newRecordData = {
                            student_id: studentId,
                            content_id: contentId, 
                            unit_id: req.params.unit_id,
                            class_id: classId,
                            status: "unread",
                            prev_solutions: JSON.stringify([])
                        }
                        newStudentProgressRecords.push(newRecordData);
                    }
                }
            }

            //insert all new records
            if(newStudentProgressRecords.length > 0) {await conn.query(`INSERT INTO student_progress SET ?`, newStudentProgressRecords);}
            
        }

        await conn.query("UPDATE units SET ? WHERE id=" + req.params.unit_id, postData);
        res.status(201).json({message: "Unit successfully updated."})
    }, res, 401, "Unit update failed.")

});

router.delete("/:unit_id", checkAuth, async (req, res, next) => {

    await dbConnection(async (conn) => {

        //delete from units mapping array in any classes records that had this as a unit
        //first get all classes which had this as a unit
        const unitClasses = (await conn.query(`SELECT * FROM classes WHERE id IN (SELECT class_id FROM class_units WHERE unit_id = ${req.params.unit_id})`))[0];
        console.log(unitClasses);
        //for each class, delete the unit from the units_mapping array
        for(let unitClass of unitClasses) { 
            
            //can check if index is -1, but shouldn't be EVER because 
            const removingIndex = unitClass.units_mapping.indexOf(parseInt(req.params.unit_id));
            if(removingIndex === -1) {
                throw new Error("Something went wrong");
            }
            unitClass.units_mapping.splice(removingIndex, 1);
            await conn.query(`UPDATE classes SET units_mapping = '${JSON.stringify(unitClass.units_mapping)}' WHERE id = ${unitClass.id}`);
        }

        //delete unit
        await conn.query("DELETE FROM units WHERE id=" + req.params.unit_id);
        res.status(200).json({message: "Unit successfully deleted."})
    }, res, 401, "Unit deletion failed.")

});

module.exports = router;