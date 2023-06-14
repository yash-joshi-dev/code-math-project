const express = require('express');
const dbConnection = require('../db');
const router = express.Router();


//add content to unit
//only add authenticated teacher with editing rights
router.post("/:unit_id/:content_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        //add to unit_content table
        await conn.query(`INSERT INTO unit_content SET unit_id = ${req.params.unit_id}, content_id = ${req.params.content_id}`);

        //if unit is released, add student progress for this content for every student in every class this unit is in

        //get if unit is released
        const unitData = (await conn.query(`SELECT is_released, content_mapping FROM units WHERE unit_id = ${req.params.unit_id}`))[0][0];

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
                        content_id: req.params.content_id, 
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

        //add to unit's content mapping 
        unitData.content_mapping.push(req.params.content_id);
        await conn.query('UPDATE units SET ?', {content_mapping: JSON.stringify(unitData.content_mapping)});

        res.status(200).json({message: "Successfully added problem to unit."})
    }, res, 500, "Adding problem to unit failed due to server error.")

})

//delete content from unit
//only allow authenticated teacher with editing rights
router.delete("/:unit_id/:content_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        //delete from unit content table
        await conn.query(`DELETE FROM unit_content WHERE unit_id = ${req.params.unit_id} AND content_id = ${req.params.content_id}`)

        //delete all progress from student progress if unit was released (but this check would be redundant as it wouldn't be there in the first place)
        await conn.query(`DELETE FROM student_progress WHERE unit_id = ${req.params.unit_id} AND content_id = ${req.params.content_id}`)

        //delete from unit mapping
        const contentMapping = (await conn.query(`SELECT content_mapping WHERE unit_id = ${req.params.unit_id}`))[0][0].content_mapping;

        //can check if index is -1, but shouldn't be EVER because 
        const index = contentMapping.indexOf(req.params.content_id);
        if(index === -1) {
            return res.status(400).json({message: "This content already doesn't exist in the specified unit."})
        }
        contentMapping.splice(index, 1);
        await conn.query(`UPDATE units SET content_mapping = ${contentMapping} WHERE id = ${req.params.unit_id}`);

        res.status(200).json({message: "Successfully removed content from unit."});

    }, res, 500, "Failed to remove content from unit.")


})



module.exports = router;