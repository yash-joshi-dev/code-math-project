const express = require('express');
const dbConnection = require('../../db');
const router = express.Router();

//get all teachers with their rights and owner for a particular class
//only allow authenticated teachers in the class
router.get("/:class_id", async (req, res, next) => {

    const sql = `SELECT users.name, users.email_address, class_owners.teacher_id, class_owners.rights, class_owners.is_owner
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
router.post("/:class_id", async (req, res, next) => {

    //get teacher data using the email
    let sql = `SELECT id, name FROM users WHERE role = "teacher" AND email = "${req.body.teacherEmail}"`

    await dbConnection(async (conn) => {
        
        const response = (await conn.query(sql));
        if(response[0].length === 0) return res.status(400).json({message: "No teacher with the specified email exists."});

        const teacherData = response[0][0];

        const newClassTeacherData = {
            teacher_id: teacherData.id,
            teacher_name: teacherData.name,
            class_id: req.params.class_id,
            rights: req.body.rights,
            is_owner: 0
        }

        await conn.query(`INSERT INTO class_owners SET ?`, newClassTeacherData);

    }, res, 500, "Teacher sharing failed due to server error.")

})


//change rights for another teacher
//only allow if teacher is owner? and authenticated
router.patch("/:class_id/:teacher_id", async (req, res, next) => {

    await dbConnection(async (conn) => {
        await conn.query(`UPDATE class_owners SET rights = "${req.body.rights}" WHERE class_id = ${req.params.class_id} AND teacher_id = ${req.params.teacher_id}`);
        res.status(200).json({message: "Successfully update teacher rights."})
    }, res, 500, "Updating teacher rights failed.")

})

//unshare class with another teacher
//check if teacher is owner? and authenticated and this teacher exists in the class
router.delete("/:class_id/:teacher_id", async(req, res, next) => {

    await dbConnection(async (conn) => {

        await conn.query(`DELETE FROM class_owners WHERE class_id = ${req.params.class_id} AND teacher_id = ${req.params.teacher_id}`);
        res.status(200).json({message: "Un-shared with teacher successfully."})
        
    }, res, 500, "Deleting teacher failed.")

})

module.exports = router;