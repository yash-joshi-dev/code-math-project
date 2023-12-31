const express = require('express');
const dbConnection = require('../../db');
const router = express.Router();
const checkAuth = require('../../middleware/check_auth')


//add a unit to a class
//only an authenticated teacher with editing rights
router.post("/:class_id/:unit_id", checkAuth, async (req, res, next) => {

    await dbConnection(async (conn) => {

        //add the unit to the class units table
        await conn.query(`INSERT INTO class_units SET class_id = ${req.params.class_id}, unit_id = ${req.params.unit_id}`);

        //get all teachers that own this class and add them as unit owners with their respective rights
        //for each teacher in the class, add new record into unit owner table
        const classOwners = (await conn.query(`SELECT teacher_id, rights FROM class_owners WHERE class_id = ${req.params.class_id}`))[0];
        const newUnitOwnerRecords = [];
        for(let i = 0; i < classOwners.length; i++) {

            const classOwner = classOwners[i];

            const newRecordData = [
                req.params.unit_id,
                classOwner.teacher_id,
                classOwner.rights,
                (classOwner.teacher_id === req.userData.id ? 1 : 0)
            ]

            newUnitOwnerRecords.push(newRecordData);
        }
        await conn.query(`INSERT INTO unit_owners (unit_id, teacher_id, rights, is_owner) VALUES ?`, [newUnitOwnerRecords]);

        //get the data for the unit and see if its released; if it is, create a student progress record for every student in the class for every content in the unit
        const isReleased = (await conn.query(`SELECT is_released FROM units WHERE unit_id = ${req.params.unit_id}`))[0][0].is_released;

        if(isReleased) {

            let newStudentProgressRecords = [];

            //get all student ids for each class
            let sql = `SELECT student_id FROM class_students WHERE class_id = ${req.params.class_id} AND approved = 1`;
            const studentIds = (await conn.query(sql)).map(item => {return item.student_id});

            for(const studentId of studentIds) {
                for(const contentId of contentIds) {
                    const newRecordData = [
                        studentId,
                        contentId, 
                        req.params.unit_id,
                        req.params.class_id,
                        "unread"
                    ]
                    newStudentProgressRecords.push(newRecordData);
                }
            }

            //insert all new records
            if(newStudentProgressRecords.length > 0) {await conn.query(`INSERT INTO student_progress (student_id, content_id, unit_id, class_id, status) VALUES?`, [newStudentProgressRecords]);}

        }

        //add unit to unit mapping for class
        sql = `SELECT units_mapping FROM classes WHERE id = ${req.params.class_id}`
        const unitsMapping = (await conn.query(sql))[0][0].units_mapping;
        unitsMapping.push(req.params.unit_id);

        sql = `UPDATE classes SET ? WHERE id = ${req.params.class_id}`;
        await conn.query(sql, {units_mapping: JSON.stringify(unitsMapping)});

        res.status(200).json({message: "Successfully added unit to class."})

    }, res, 500, "Adding unit to class failed.")

})

//remove a unit from a class
router.delete("/:class_id/:unit_id", checkAuth, async (req, res, next) => {

    await dbConnection(async (conn) => {
        
        //remove from class units table
        await conn.query(`DELETE FROM class_units WHERE class_id = ${req.params.class_id} AND unit_id = ${req.params.unit_id}`);

        //remove all progress for the unit in this specific class
        await conn.query(`DELETE FROM student_progress WHERE class_id = ${req.params.class_id} AND unit_id = ${req.params.unit_id}`);

        //remove from class unit mapping array
        let unitsMapping = (await conn.query(`SELECT units_mapping FROM classes WHERE class_id = ${req.params.class_id}`));

        //can check if index is -1, but shouldn't be EVER because 
        unitsMapping.splice(unitsMapping.indexOf(req.params.unit_id), 1);
        await conn.query(`UPDATE classes SET units_mapping = ${unitsMapping} WHERE id = ${req.params.class_id}`);


    })

})

module.exports = router;