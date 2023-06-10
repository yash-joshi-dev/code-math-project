const express = require('express');
const dbConnection = require('../db');
const router = express.Router();
const checkAuth = require('../middleware/check_auth');
const checkTeacher = require('../middleware/check_teacher');
const checkInClass = require('../middleware/check_in_class');
const checkStudent = require('../middleware/check_student');

router.get("/:class_id", checkAuth, checkInClass, async (req, res, next) => {

    const role = req.userData.role;
    let sql = "SELECT * FROM problem_sets WHERE class_id=" + req.params.class_id;
    await dbConnection(async (conn) => {
        let response = await conn.query(sql);
        let problems = [];

        //get all the problems for each problem set
        if(role === "teacher") {
            for(var i = 0; i < response[0].length; i++) {
                response[0][i].problem_mapping = JSON.parse(response[0][i].problem_mapping);
                sql = "SELECT id, name, description, type, requests FROM problems WHERE set_id=" + response[0][0].id;
                problems.push((await conn.query(sql))[0]);
            }
        }
        else if(role === "student") {
            for(var i = 0; i < response[0].length; i++) {
                response[0][i].problem_mapping = JSON.parse(response[0][i].problem_mapping);
                sql = "CALL Get_Student_Status_Problems_SP(" + response[0][0].id + ", " + req.userData.id + ")";
                problems.push((await conn.query(sql))[0]);
            }
        }

        //add problems as an object to the response
        response[0].problems = problems;

        res.status(200).json({problemSets: response[0]});
    }, res, 401, "Problem sets cannot be accessed.")

})

router.post("/:class_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {


    const postData = {
        name: req.body.name,
        class_id: req.params.class_id,
        released: (req.body.released ? 1 : 0)
    }

    await dbConnection(async (conn) => {
        await conn.query("INSERT INTO problem_sets SET ?", postData);
        
        let response = await conn.query("SELECT * FROM problem_sets WHERE class_id=" + postData.class_id + " ORDER BY id DESC", postData);

        res.status(201).json({message: "Problem set successfully created.", problemSetData: response[0][0]})
    }, res, 401, "Problem set creation failed.")

});

router.put("/:class_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    const postData = {
        name: req.body.name,
        released: req.body.released,
        problem_mapping: JSON.stringify(req.body.problemMap)
    }

    await dbConnection(async (conn) => {
        await conn.query("UPDATE problem_sets SET ? WHERE id=" + req.body.id, postData);
        res.status(201).json({message: "Problem set successfully updated."})
    }, res, 401, "Problem set update failed.")

});

router.delete("/:class_id/:problem_set_id", checkAuth, checkTeacher, checkInClass, async (req, res, next) => {

    await dbConnection(async (conn) => {
        await conn.query("DELETE FROM problem_sets WHERE id=" + req.params.problem_set_id);
        res.status(200).json({message: "Problem set successfully deleted."})
    }, res, 401, "Problem set delete failed.")

});

module.exports = router;