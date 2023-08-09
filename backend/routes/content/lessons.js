//create lesson FUNCTION (add part about adding and removing definitions in this)
async function createLesson(conn, req, lessonId) {
  //first create the record
  const newLessonData = {
    id: lessonId,
    content: req.body.content,
    definitions_mapping: JSON.stringify(req.body.definitionsMapping),
  };

  await conn.query(`INSERT INTO lessons SET ?`, newLessonData);
}

//update lesson FUNCTION (add part about adding and removing definitions in this)
async function updateLesson(conn, req, lessonId) {
  const updatedLessonData = {
    content: req.body.content,
    definitions_mapping: JSON.stringify(req.body.definitionsMapping),
  };

  await conn.query(`UPDATE lessons SET ? WHERE id = ${lessonId}`, updatedLessonData);
}

//get lesson FUNCTION (get all definitions for the lesson with it)
async function getLesson(conn, req, lessonId) {
  const lessonData = (await conn.query(`SELECT * FROM lessons WHERE id = ${lessonId}`))[0][0];
  const definitionsMapping = lessonData.definitions_mapping.join(", ");
  let definitions = [];
  if(definitionsMapping.length > 0) {
    definitions = (await conn.query(`SELECT * FROM definitions WHERE id IN (${lessonData.definitions_mapping}) ORDER BY FIELD (id, ${definitionsMapping})`))[0];
  }
  lessonData.definitions = definitions;
  return lessonData;
}

module.exports = {
  createLesson,
  updateLesson,
  getLesson
}