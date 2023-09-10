const express = require('express');
const dbConnection = require('../../db');
const router = express.Router();
const checkAuth = require("../../middleware/check_auth");


//add content to unit
//only add authenticated teacher with editing rights
router.post("/:unit_id/:content_id", checkAuth, async (req, res, next) => {

    await dbConnection(async (conn) => {

        //add to unit_content table
        await conn.query(`INSERT INTO unit_content SET unit_id = ${req.params.unit_id}, content_id = ${req.params.content_id}`);

        //for every teacher owning the unit, insert them as an owner with their rights
        const unitOwners = (await conn.query(`SELECT teacher_id, rights FROM unit_owners WHERE unit_id = ${req.params.unit_id}`))[0];
        let newContentOwnerRecords = [];
        for(let i = 0; i < unitOwners.length; i++) {
            const unitOwner = unitOwners[i];
            newContentOwnerRecords.push([unitOwner.teacher_id, unitOwner.rights, (unitOwner.teacher_id === req.userData.id ? 1 : 0), req.params.content_id]);
        }
        if(newContentOwnerRecords.length > 0) {
            await conn.quer(`INSERT INTO content_owners (teacher_id, rights, is_owner, content_id) VALUES ?`, [newContentOwnerRecords])
        }

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
                    const newRecordData = [
                        studentId,
                        req.params.content_id, 
                        req.params.unit_id,
                        classId,
                        "unread"
                    ]
                    newStudentProgressRecords.push(newRecordData);
                }
            }

            //insert all new records
            if(newStudentProgressRecords.length > 0) {await conn.query(`INSERT INTO student_progress (student_id, content_id, unit_id, class_id, status) VALUES?`, [newStudentProgressRecords]);}
        }

        //add to unit's content mapping 
        unitData.content_mapping.push(req.params.content_id);
        await conn.query('UPDATE units SET ?', {content_mapping: JSON.stringify(unitData.content_mapping)});

        res.status(200).json({message: "Successfully added problem to unit."})
    }, res, 500, "Adding problem to unit failed due to server error.")

})

//delete content from unit
//only allow authenticated teacher with editing rights
router.delete("/:unit_id/:content_id", checkAuth, async (req, res, next) => {

    await dbConnection(async (conn) => {

        //delete from unit content table
        await conn.query(`DELETE FROM unit_content WHERE unit_id = ${req.params.unit_id} AND content_id = ${req.params.content_id}`);

        //DONT DELETE ALL CONTENT OWNERS FOR THIS UNIT, ASK TEACHER ABOUT THIS

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