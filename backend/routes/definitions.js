const express = require("express");
const dbConnection = require("../../db");
const router = express.Router();

//get all words for a teacher (including ones for a null teacher; aka preset definitions)
router.get("/", async (req, res, next) => {
    await dbConnection(async (conn) => {

        //get all definitions for the teacher
        const teacherDefinitions = (await conn.query(`SELECT * FROM definitions WHERE teacher_id = ${req.userData.id}`))[0];
        const premadeDefinitions = (await conn.query(`SELECT * FROM definitions WHERE teacher_id = -1`))[0];
        return res.status(200).json({
            teacherDefinitions: teacherDefinitions,
            premadeDefinitions: premadeDefinitions
        });


    }, res, 500, "Error retrieving definitions.");
})

//add new definition for a teacher
router.post("/", async (req, res, next) => {

    await dbConnection(async (conn) => {

        const newDefinitionData = {
            word: req.body.word,
            definition: req.body.definition,
            teacher_id: req.userData.id
        }

        await conn.query(`INSERT INTO definitions SET ?`, newDefinitionData);

        return res.status(200).json({message: "Successfully created new definition."});

    }, res, 500, "Error occurred while creating definition.");

})

//update an existing definition
router.put("/:definition_id", async (req, res, next) => {
    
    await dbConnection(async (conn) => {

        const updatedDefinitionData = {
            word: req.body.word,
            definition: req.body.definition
        }

        await conn.query(`UPDATE definitions SET ? WHERE id = ${req.params.definition_id}`, updatedDefinitionData);

        return res.status(200).json({message: "Successfully updated definition."});

    }, res, 500, "Error updating definitions.");

})

//delete definition
router.delete("/:definition_id", async (req, res, next) => {

    await dbConnection(async (conn) => {

        await conn.query(`DELETE FROM definitions WHERE id = ${req.params.definition_id}`);

        res.status(200).json({message: "Successfully deleted definition."})
    }, res, 500, "Error deleting definition.")

})

//for definitons, get all for a teacher, get all default/suggested ones (with teacher_id = NULL), add new one to teacher def, delete, update

