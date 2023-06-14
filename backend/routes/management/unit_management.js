const express = require('express');
const dbConnection = require('../db');
const router = express.Router();


//add a unit to a class
//only an authenticated teacher with editing rights
router.post("/:class_id/:unit_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        //add the unit to the class units table
        await conn.query(`INSERT INTO class_units SET class_id = ${req.params.class_id}, unit_id = ${req.params.unit_id}`);


        //get the data for the unit and see if its released; if it is, create a student progress record for every student in the class for every content in the unit
        const isReleased = (await conn.query(`SELECT is_released FROM units WHERE unit_id = ${req.params.unit_id}`))[0][0].is_released;

        if(isReleased) {

            let newStudentProgressRecords = [];

            //get all student ids for each class
            let sql = `SELECT student_id FROM class_students WHERE class_id = ${req.params.class_id} AND approved = 1`;
            const studentIds = (await conn.query(sql)).map(item => {return item.student_id});

            for(const studentId of studentIds) {
                for(const contentId of contentIds) {
                    const newRecordData = {
                        student_id: studentId,
                        content_id: contentId, 
                        unit_id: req.params.unit_id,
                        class_id: req.params.class_id,
                        status: "unread",
                        prev_solutions: JSON.stringify([])
                    }
                    newStudentProgressRecords.push(newRecordData);
                }
            }

            //insert all new records
            await conn.query(`INSERT INTO student_progress SET ?`, newStudentProgressRecords);

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
router.delete("/:class_id/:unit_id", async (req, res, next) => {

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