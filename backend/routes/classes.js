const express = require("express");
const dbConnection = require("../db");
const router = express.Router();
const checkAuth = require("../middleware/check_auth");
const checkTeacher = require("../middleware/check_teacher");
const checkInClass = require("../middleware/check_in_class");

const codeSymbols = "abcdefghijklmnopqrstuvwxyz0123456789";

//CLASSES:
// for /classes alone, have GET (all classes for a particular teacher or student), GET with all units and such (only teachers), POST (creates a new class for a teacher)
// for /classes/:id, have GET, PUT, DELETE

//generates random 6 digit code
function generateRandCode() {
  let code = "";

  for (let i = 0; i < 6; i++) {
    const letter = codeSymbols[Math.floor(36 * Math.random())];
    code += letter;
  }

  return code;
}

//get all classes for a particular teacher or student
//check auth
router.get("", async (req, res, next) => {
  const role = req.userData.role;

  let sql;
  if(role === "teacher") {
    sql = `CALL GetTeacherClasses(${req.userData.id})`
  }
  else if(role === "student") {
    sql =  `GetStudentClasses(${req.userData.id})`
  }

  await dbConnection(
    async (conn) => {
      let [classes, teacherNames] = (await conn.query(sql))[0];
      console.log(teacherNames);

      teacherNames.forEach(({id, teacher_name}) => {
        let rightClass = classes.find((classInfo) => {return classInfo.id === id});
        if(!rightClass.teacherNames) {
          rightClass.teacherNames = [teacher_name];
        }
        else {
          rightClass.teacherNames.push(teacher_name);
        }
      })
      
      return res.status(200).json(classes);
    },
    res, 500, "Error retrieving your classes. Please try again later."
  );
});


//get a single class by id (retrieve full content, with units and problems and lessons within them?)
//check auth, check if in class; and if approved for students; check if class exists beforehand
router.get("/:class_id", async (req, res, next) => {

  await dbConnection(
    async (conn) => {

      //get class info
      let sql = `SELECT * FROM classes WHERE id=${req.params.class_id}`;
      let classData = (await conn.query(sql))[0][0];

      //all units ordered by the unit_mapping
      const unitsMapping = classData.units_mapping.join(", ");
      sql = `SELECT * FROM units WHERE id IN (${unitsMapping}) ORDER BY FIELD(id, ${unitsMapping})`;
      let unitsData = (await conn.query(sql))[0];

      //for every unit, retrieve all the problems and lessons within it and order them according to the content-mapping
      for(const unit of unitsData) {

        //get all lessons and problems for this unit
        const lessonsData = (await conn.query(`SELECT * FROM lessons WHERE id IN (SELECT lesson_id FROM unit_lessons WHERE unit_id = ${unit.id})`))[0]
        const problemsData = (await conn.query(`SELECT * FROM problems WHERE id IN (SELECT problem_id FROM unit_problems WHERE unit_id = ${unit.id})`))[0]

        //first store all problem and lesson ids in hash map with their respective objects
        const hashMap = new Map();
        lessonsData.forEach((lesson) => {hashMap.set("Lesson:" + lesson.id, lesson)});
        problemsData.forEach((problem) => {hashMap.set("Problem:" + problem.id, problem)});

        //now for each mapping, we store the respective object in a content array
        unit.content = [];
        unit.content_mapping.forEach((mappingId) => {unit.content.push(hashMap.get(mappingId))});

      }
      res.status(200).json({
        classData: classData,
        classUnits: unitsData
      });
    }, 
    res,
    401,
    "You do not have access to this class."
  );
});

//POST request handler to create new classes
//check if teacher and authenticated
router.post("", async (req, res, next) => {
  await dbConnection(
    async (conn) => {
      let validCodeFound = false;
      let code;

      while (!validCodeFound) {
        //generate a new code
        code = generateRandCode();

        //check if code exists already
        const sql = "SELECT EXISTS (SELECT * FROM classes WHERE code='" + code + "')";

        let response = await conn.query(sql);

        if (Object.values(response[0][0])[0] === 0) {
          validCodeFound = true;
        }
      }
      console.log(req.body);

      //create an object for the class
      const newClassData = {
        code: code,
        name: req.body.name,
        units_mapping: JSON.stringify([])
      };

      //insert into table
      //also add teacher as an editing rights person for this
      let sql = "INSERT INTO classes SET ?";
      await conn.query(sql, newClassData);
      const {id} = (await conn.query(`SELECT id FROM classes WHERE code="${code}"`))[0][0];
      const classOwnerData = {
        teacher_id: req.userData.id,
        teacher_name: req.body.teacherName,
        class_id: id,
        rights: "editing"
      }
      sql = "INSERT INTO class_owners SET ?"
      await conn.query(sql, classOwnerData);

      return res.status(201).json({message: "Succesfully created class"});
    },
    res,
    401,
    "Error creating new class."
  );
});

// PUT to modify existing class
//check if teacher authenticated and in class and editing rights
//also check if units mapping is still the same
router.put(
  "/:class_id",
  async (req, res, next) => {
    // req.userData = {id: 11};
    await dbConnection(
      async (conn) => {
        const classData = {
          name: req.body.name,
          code: req.body.code,
          units_mapping: JSON.stringify(req.body.unitsMapping),
        };

        //check if code DNE for all records (except possibly the current one)
        let sql = `SELECT * FROM classes WHERE id!= ${req.params.class_id} AND code="${req.body.code}"`;
        response = await conn.query(sql);
        if (response[0].length !== 0) {
          return res
            .status(401)
            .json({
              message:
                "Sorry, that class code is already taken! Class was not modified!",
            });
        }

        //update the class
        sql = "UPDATE classes SET ? WHERE id=" + req.params.class_id;
        await conn.query(sql, classData);

        //update teacher owner name
        sql = `UPDATE class_owners SET teacher_name = "${req.body.teacherName}" WHERE teacher_id = ${req.userData.id} AND class_id = ${req.params.class_id}`;
        await conn.query(sql);
        return res.status(200).json({ message: "Succesfully modified class." });
      },
      res,
      401,
      "Cannot modify that class."
    );
  }
);

//check if an authenticated teacher is in the class and has editing rights
router.delete(
  "/:class_id",
  async (req, res, next) => {
    await dbConnection(
      async (conn) => {
        let sql = "DELETE FROM classes WHERE id=" + req.params.class_id;
        await conn.query(sql);
        res.status(200).json({ message: "Successfully deleted class." });
      },
      res,
      401,
      "Could not delete class."
    );
  }
);

//export this file
module.exports = router;
