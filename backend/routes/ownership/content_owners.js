const express = require('express');
const dbConnection = require('../../db');
const { shareContent } = require('./sharing_functions');
const check_auth = require('../../middleware/check_auth');
const router = express.Router();

//get all teachers with their rights and owner for a particular content
//only allow authenticated teachers that have the content shared
router.get("/:content_id", check_auth, async (req, res, next) => {

    const sql = `SELECT users.name, content_owners.teacher_id, content_owners.rights, content_owners.is_owner
                FROM users INNER JOIN content_owners ON users.id = content_owners.teacher_id
                WHERE content_owners.content_id = ${req.params.content_id}`;

    await dbConnection(async (conn) => {
        
        const contentTeachers = (await conn.query(sql))[0];
        res.status(200).json({
            teachers: contentTeachers
        })
    }, res, 500, "Failed to get teachers for content.")

})

//share content with another teacher
//only allow if teacher is owner?
router.post("/:content_id", check_auth, async (req, res, next) => {
    await dbConnection(async (conn) => {

        //check if teacher exists
        const teacherData = (await conn.query(`SELECT id FROM users WHERE role = "teacher" AND email = "${req.body.teacherEmail}"`))[0];
        if(teacherData.length === 0) {
            return res.status(400).json({message: "No teacher with the specified email exists."});
        }

        await shareContent(req.params.content_id, teacherData[0].id, req.body.teacherEmail, req.body.rights, conn, res);
    }, res, 500, "Teacher sharing failed due to server error.")
})


//change rights for another teacher
//only allow if teacher is owner? and authenticated
router.patch("/:content_id/:teacher_id", check_auth, async (req, res, next) => {

    await dbConnection(async (conn) => {
        await conn.query(`UPDATE content_owners SET rights = "${req.body.rights}" WHERE content_id = ${req.params.content_id} AND teacher_id = ${req.params.teacher_id}`);
        res.status(200).json({message: "Successfully update teacher rights."})
    }, res, 500, "Updating teacher rights failed.")

})

//unshare content with another teacher
//check if teacher is owner? and authenticated and this teacher exists as a owner for the content
router.delete("/:content_id/:teacher_id", check_auth, async(req, res, next) => {

    await dbConnection(async (conn) => {

        await conn.query(`DELETE FROM content_owners WHERE content_id = ${req.params.content_id} AND teacher_id = ${req.params.teacher_id}`);
        res.status(200).json({message: "Un-shared with teacher successfully."})
        
    }, res, 500, "Deleting teacher failed.")

})

module.exports = router;