async function shareContent(contentId, teacherId, email, rights, conn, res) {

    //check if can share the content
    const alreadyShared = (await conn.query(`SELECT content_owners.id FROM content_owners INNER JOIN users ON content_owners.teacher_id = users.id WHERE users.email_address = "${email}" && content_owners.content_id = ${contentId}`))[0].length > 0;
    if(alreadyShared) {
        return res.status(400).json({message: "You have already shared this content with this teacher."});
    }

    //if not already shared, insert with given rights as record in the content owners table
    const newContentTeacherData = {
        teacher_id: teacherId,
        content_id: contentId,
        rights: rights,
        is_owner: 0
    }

    await conn.query(`INSERT INTO content_owners SET ?`, newContentTeacherData);

}

//function to take in a unit id, rights, and teacher id and add content rights for all content within that particular unit
// (make sure that content is not already shared, if it is, don't do anything);
async function shareUnit(unitId, teacherId, email, rights, conn, res) {

    //check if can share it
    const alreadyShared = (await conn.query(`SELECT unit_owners.id FROM unit_owners INNER JOIN users ON unit_owners.teacher_id = users.id WHERE users.email_address = "${email}" && unit_owners.unit_id = ${unitId}`))[0].length > 0;
    if(alreadyShared) {
        return res.status(400).json({message: "You have already shared this unit with this teacher."});
    }

    //first share unit
    const newUnitTeacherData = {
        teacher_id: teacherId,
        unit_id: unitId,
        rights: rights,
        is_owner: 0,
    };

    await conn.query(`INSERT INTO unit_owners SET ?`, newUnitTeacherData);

    //now share all contents (make sure not to share already shared contents)
    const contentIds = (await conn.query(`SELECT content_mapping FROM units WHERE id = ${unitId}`))[0][0].content_mapping;

    for(const contentId in contentIds) {
        await shareContent(contentId, teacherId, email, rights, conn, res);
    }

}

//function to share a class
async function shareClass(classId, teacherData, email, rights, conn, res) {

    //first check if the class has already been shared
    const alreadyShared = (await conn.query(`SELECT class_owners.id FROM class_owners INNER JOIN users ON class_owners.teacher_id = users.id WHERE users.email_address = "${email}" && class_owners.class_id = ${classId}`))[0].length > 0;
    if(alreadyShared) {
        return res.status(400).json({message: "You have already shared this class with the specified teacher."});
    }

    //share with teacher
    const newClassTeacherData = {
        teacher_id: teacherData.id,
        teacher_name: teacherData.name,
        class_id: classId,
        rights: rights,
        is_owner: 0
    }

    await conn.query(`INSERT INTO class_owners SET ?`, newClassTeacherData);

    //now share every unit with the teacher
    const unitIds = (await conn.query(`SELECT units_mapping FROM classes WHERE id = ${classId}`))[0][0].units_mapping;
    for(const unitId of unitIds) {
        await shareUnit(unitId, teacherData.id, email, rights, conn, res);
    }

}

module.exports = {
    shareContent,
    shareUnit,
    shareClass
}