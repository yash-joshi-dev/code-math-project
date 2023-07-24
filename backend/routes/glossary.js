const express = require("express");
const dbConnection = require("../db");
const router = express.Router();


//for glossary get for a student also each glossary is for a particular class (not cross class)
router.get("/", async (req, res, next) => {

    await dbConnection(async (conn) => {
        
        //get all definitions for a particular student in a particular class (if class_id provided as a query parameter)
        const sql = `SELECT definitions.id, definitions.word, definitions.definition FROM (definitions INNER JOIN glossary ON definitions.id = glossary.definition_id)
                    WHERE glossary.student_id = ${req.userData.id}` + (req.query.class_id ? ` AND glossary.class_id = ${req.query.class_id}` : "");
        
        const definitions = (await conn.query(sql))[0];
        return res.status(200).json({
            definitions: definitions
        })


    }, res, 500, "Error retrieving definitions for glossary.");

})

module.exports = router;