const express = require('express');
const dbConnection = require('../../db');
const { shareUnit } = require('./sharing_functions');
const router = express.Router();

//get all teachers with their rights and owner for a particular unit
//only allow authenticated teachers that have the unit shared
router.get("/:unit_id", async (req, res, next) => {

    const sql = `SELECT users.name, unit_owners.teacher_id, unit_owners.rights, unit_owners.is_owner
                FROM users INNER JOIN unit_owners ON users.id = unit_owners.teacher_id
                WHERE unit_owners.unit_id = ${req.params.unit_id}`;

    await dbConnection(async (conn) => {
        
        const unitTeachers = (await conn.query(sql))[0];
        res.status(200).json({
            teachers: unitTeachers
        })
    }, res, 500, "Failed to get teachers for unit.")

})

//share unit with another teacher
//only allow if teacher is owner?
router.post("/:unit_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        //check if teacher exists
        const teacherData = (await conn.query(`SELECT id FROM users WHERE role = "teacher" AND email = "${req.body.teacherEmail}"`))[0];
        if(teacherData.length === 0) {
            return res.status(400).json({message: "No teacher with the specified email exists."});
        }

        await shareUnit(req.params.unit_id, teacherData[0].id, req.body.teacherEmail, req.body.rights, conn, res);

    }, res, 500, "Teacher sharing failed due to server error.")

})


//change rights for another teacher
//only allow if teacher is owner? and authenticated
//confusion on whether or not to update also content rights when this is updated - PLEASE ASK TEACHER ABOUT THIS
router.patch("/:unit_id/:teacher_id", async (req, res, next) => {

    await dbConnection(async (conn) => {
        await conn.query(`UPDATE unit_owners SET rights = "${req.body.rights}" WHERE unit_id = ${req.params.unit_id} AND teacher_id = ${req.params.teacher_id}`);


        res.status(200).json({message: "Successfully update teacher rights."})
    }, res, 500, "Updating teacher rights failed.")

})

//unshare unit with another teacher
//check if teacher is owner? and authenticated and this teacher exists as a owner for the unit
router.delete("/:unit_id/:teacher_id", async(req, res, next) => {

    await dbConnection(async (conn) => {

        await conn.query(`DELETE FROM unit_owners WHERE unit_id = ${req.params.unit_id} AND teacher_id = ${req.params.teacher_id}`);
        res.status(200).json({message: "Un-shared with teacher successfully."})
        
    }, res, 500, "Deleting teacher failed.")

})

module.exports = router;