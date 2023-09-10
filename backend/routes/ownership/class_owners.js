const express = require('express');
const dbConnection = require('../../db');
const { shareClass } = require('./sharing_functions');
const check_auth = require('../../middleware/check_auth');
const router = express.Router();

//get all teachers with their rights and owner for a particular class
//only allow authenticated teachers in the class
router.get("/:class_id", check_auth, async (req, res, next) => {

    const sql = `SELECT users.id, users.name, users.email_address, class_owners.teacher_id, class_owners.rights, class_owners.is_owner
                FROM users INNER JOIN class_owners ON users.id = class_owners.teacher_id
                WHERE class_owners.class_id = ${req.params.class_id}`;

    await dbConnection(async (conn) => {
        
        const classTeachers = (await conn.query(sql))[0];
        res.status(200).json({
            teachers: classTeachers
        })
    }, res, 500, "Failed to get teachers for class.")

})

//share class with another teacher
//only allow if teacher is owner?
router.post("/:class_id", check_auth, async (req, res, next) => {

    //get teacher data using the email
    let sql = `SELECT id, name FROM users WHERE role = "teacher" AND email_address = "${req.body.teacherEmail}"`

    await dbConnection(async (conn) => {
        
        //first check if teacher exists
        const teacherData = (await conn.query(sql))[0];
        if(teacherData.length === 0) return res.status(400).json({message: "No teacher with the specified email exists."});
        
        //share class
        await shareClass(req.params.class_id, teacherData[0], req.body.teacherEmail, req.body.rights, conn, res);

        return res.status(200).json({message: "Successfully shared with teacher."})

    }, res, 500, "Teacher sharing failed due to server error.")

})


//change rights for another teacher
//only allow if teacher is owner? and authenticated
//don't actually allow this;
// router.patch("/:class_id/:teacher_id", async (req, res, next) => {

//     await dbConnection(async (conn) => {
//         await conn.query(`UPDATE class_owners SET rights = "${req.body.rights}" WHERE class_id = ${req.params.class_id} AND teacher_id = ${req.params.teacher_id}`);
//         res.status(200).json({message: "Successfully update teacher rights."})
//     }, res, 500, "Updating teacher rights failed.")

// })

//unshare class with another teacher
//check if teacher is owner? and authenticated and this teacher exists in the class
router.delete("/:class_id/:teacher_id", check_auth, async(req, res, next) => {

    await dbConnection(async (conn) => {

        await conn.query(`DELETE FROM class_owners WHERE class_id = ${req.params.class_id} AND teacher_id = ${req.params.teacher_id}`);

        //for every unit within the class, remove record
        const unitsMapping = (await conn.query(`SELECT units_mapping FROM classes WHERE id = ${req.params.class_id}`))[0][0].units_mapping;

        if(unitsMapping.length > 0) {
            await conn.query(`DELETE FROM unit_owners WHERE unit_id IN (${unitsMapping.join(", ")}) AND teacher_id = ${req.params.teacher_id}`);
        }

        //for every content within each unit, delte record
        for(const unitId of unitsMapping) {

            const contentMapping = (await conn.query(`SELECT content_mapping FROM units WHERE id = ${unitId}`))[0][0].content_mapping;
            if(contentMapping.length > 0) {
                await conn.query(`DELETE FROM content_owners WHERE content_id IN ${contentMapping.join(", ")} AND teacher_id = ${req.params.teacher_id}`);
            }

        }


        res.status(200).json({message: "Un-shared with teacher successfully."})
        
    }, res, 500, "Deleting teacher failed.")

})

module.exports = router;
