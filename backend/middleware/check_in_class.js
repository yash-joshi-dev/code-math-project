const dbConnection = require("../db");

module.exports = async (req, res, next) => {

    let sql;
    let classId;

    if(req.params.class_id) classId = req.params.class_id;
    else if(req.body.classId) classId = req.body.classId;
    else return res.status(401).json({message: "Class wasn't passed to request!"});
    
    if(req.userData.role === "teacher") {
        sql = "SELECT * FROM classes WHERE teacher_id=" + req.userData.id + " AND id=" + classId;
    }
    else if(req.userDate.role === "student") {
        sql = "SELECT * FROM class_students WHERE student_id=" + req.userData.id + " AND class_id=" + classId;
    }
    await dbConnection(async (conn) => {

        let response = await conn.query(sql);
        if(response[0].length === 0) {
            return res.status(401).json({message: "You are not authenticated to access this class."});
        }

        next();
    }, res, 401, "An error occured in the backend.");
}

