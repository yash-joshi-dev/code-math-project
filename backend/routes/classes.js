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
router.get("/", checkAuth, async (req, res, next) => {
  const role = req.userData.role;

  let sql;
  if(role === "teacher") {
    sql = `CALL GetTeacherClasses(${req.userData.id})`
  }
  else if(role === "student") {
    sql =  `CALL GetStudentClasses(${req.userData.id})`
  }

  await dbConnection(
    async (conn) => {
      let [classes, teacherNames] = (await conn.query(sql))[0];
      // console.log(teacherNames);

      teacherNames.forEach(({id, teacher_name}) => {
        let rightClass = classes.find((classInfo) => {return classInfo.id === id});
        if(!rightClass.teacher_names) {
          rightClass.teacher_names = [teacher_name];
        }
        else {
          rightClass.teacher_names.push(teacher_name);
        }
      })
      
      //add on units for each class
      for(var i = 0; i < classes.length; i++) {
        // console.log(classes[i]);

        //all units ordered by the unit_mapping
        const unitsMapping = classes[i].units_mapping.join(", ");
        let unitsData = [];

        if (role === "teacher" && unitsMapping.length > 0) {
            sql = `SELECT units.id, units.name, units.is_released, units.content_mapping, unit_owners.is_owner, unit_owners.rights
                        FROM units INNER JOIN unit_owners ON units.id = unit_owners.unit_id WHERE unit_owners.teacher_id = ${req.userData.id}
                        AND units.id IN (${unitsMapping}) ORDER BY FIELD(units.id, ${unitsMapping})`;
            unitsData = (await conn.query(sql))[0];
        } else if (role === "student") {
          sql = `SELECT * FROM units WHERE id IN (${unitsMapping}) AND is_released = 1 ORDER BY FIELD(id, ${unitsMapping})`;
          unitsData = (await conn.query(sql))[0];
        }
        classes[i].units = unitsData;
      }
    
      return res.status(200).json({
        classes: classes
      });
    },
    res, 500, "Error retrieving your classes. Please try again later."
  );
});


//get a single class by id (retrieve full content, with units and problems and lessons within them?)
//check auth, check if in class; and if approved for students; check if class exists beforehand
router.get("/:class_id", checkAuth, async (req, res, next) => {
  await dbConnection(
    async (conn) => {
      //get class info
      let sql;
      if (req.userData.role === "student") {
        sql = `SELECT id, name, code FROM classes WHERE id=${req.params.class_id}`;
      } else if (req.userData.role === "teacher") {
        sql = `SELECT classes.id, classes.name, classes.code, class_owners.is_owner, class_owners.rights FROM classes 
                INNER JOIN class_owners ON class_owners.class_id = classes.id WHERE class_owners.teacher_id = ${req.userData.id};`;
      }
      let classData = (await conn.query(sql))[0][0];

      //get teacher info
      sql = `SELECT teacher_name FROM class_owners WHERE class_id = ${req.params.class_id} AND rights != "pending"`;
      let teacherNames = (await conn.query(sql))[0];
      classData.teacher_names = [];
      for (const teacherName of teacherNames) {
        classData.teacher_names.push(teacherName);
      }

      //add on unit info
      //all units ordered by the unit_mapping
      const unitsMapping = classData.units_mapping.join(", ");

      if (role === "teacher") {
        sql = `SELECT units.id, units.name, units.is_released, units.content_mapping, unit_owners.is_owner, unit_owners.rights
                        FROM units INNER JOIN unit_owners ON units.id = unit_owners.unit_id WHERE unit_owners.teacher_id = ${req.userData.id}
                        AND units.id IN (${unitsMapping}) ORDER BY FIELD(units.id, ${unitsMapping})`;
      } else if (role === "student") {
        sql = `SELECT * FROM units WHERE id IN (${unitsMapping}) AND is_released = 1 ORDER BY FIELD(id, ${unitsMapping})`;
      }
      let unitsData = (await conn.query(sql))[0];

      //for every unit, retrieve all the problems and lessons within it and order them according to the content-mapping
      for (const unit of unitsData) {
        const contentMapping = unit.content_mapping.join(", ");

        //if teacher, content data with rights in is owner, if student, get with status
        if (role === "teacher") {
          sql = `SELECT content.id, content.name, content.type, content_owners.rights, content_owners.is_owner
                            FROM content INNER JOIN content_owners ON content.id = content_owners.id WHERE content_owners.teacher_id = ${req.userData.id}
                            AND content.id IN (${contentMapping}) ORDER BY FIELD(content.id, ${contentMapping})`;
        } else if (role === "student") {
          sql = `SELECT content.id, content.name, content.type, student_progress.status FROM content 
                            INNER JOIN student_progress ON content.id = student_progress.content_id
                            WHERE content.id IN (${contentMapping}) AND student_progress.unit_id = ${unit.id} AND student_progress.class_id = ${req.params.class_id}
                            AND student_id = ${req.userData.id} ORDER BY FIELD(content.id, ${contentMapping})`;
        }

        unit.content = (await conn.query(sql))[0];
      }
      classData.units = unitsData;

      res.status(200).json({
        classData: classData,
      });
    },
    res,
    401,
    "You do not have access to this class."
  );
});

//POST request handler to create new classes
//check if teacher and authenticated
router.post("", checkAuth, async (req, res, next) => {
  await dbConnection(
    async (conn) => {
      let validCodeFound = false;
      let code;

      while (!validCodeFound) {
        //generate a new code
        code = generateRandCode();

        //check if code exists already
        const sql =
          "SELECT EXISTS (SELECT * FROM classes WHERE code='" + code + "')";

        let response = await conn.query(sql);

        if (Object.values(response[0][0])[0] === 0) {
          validCodeFound = true;
        }
      }
      // console.log(req.body);

      //create an object for the class
      const newClassData = {
        code: code,
        name: req.body.name,
        units_mapping: JSON.stringify([]),
      };

      //insert into table
      //also add teacher as an editing rights person for this
      const classId = (await conn.query("INSERT INTO classes SET ?", newClassData))[0].insertId;
      const teacherName = (await conn.query(`SELECT name FROM users WHERE id = ${req.userData.id}`))[0][0].name;

      const classOwnerData = {
        teacher_id: req.userData.id,
        teacher_name: teacherName,
        class_id: classId,
      };
      sql = "INSERT INTO class_owners SET ?";
      await conn.query(sql, classOwnerData);

      return res.status(201).json({ message: "Succesfully created class" });
    },
    res,
    401,
    "Error creating new class."
  );
});

// PUT to modify existing class
//check if teacher authenticated and in class and editing rights
//also check if units mapping is still has the same units within (only in a different order);
//cause otherwise, somehow, someone messed it up
router.put("/:class_id", checkAuth, async (req, res, next) => {
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
        return res.status(401).json({
          message:
            "Sorry, that class code is already taken! Class was not modified!",
        });
      }

      //check if the number of units is the same, if it isn't, don't update that
      const unitsMapping = (
        await conn.query(
          `SELECT units_mapping FROM classes WHERE id = ${req.params.class_id}`
        )
      )[0][0].units_mapping;
      if (unitsMapping.length !== req.body.unitsMapping.length) {
        return res
          .status(400)
          .json({ message: "Something weird happened with the units array." });
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
});

//check if an authenticated teacher is in the class and has editing rights
//DELETE ALL UNITS AND PROBLEMS AS WELL, IF TEACHER WANTS?
router.delete("/:class_id", checkAuth, async (req, res, next) => {
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
});

//export this file
module.exports = router;
