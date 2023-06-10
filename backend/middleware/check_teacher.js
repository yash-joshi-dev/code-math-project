module.exports = (req, res, next) => {

    //if role is teacher, continue, else send back 401
    if(req.userData.role === "teacher") {
        next();
    }
    else {
        res.status(401).json({
            message: "Sorry, you are not authenticated to view this content."
        })
    }


}