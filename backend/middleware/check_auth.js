const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

    //get the token, if there
    try {

        //get from header specifically (can also get from query parameters); also using 'bearer' keyword out front, since typical
        // console.log(res);
        const token = req.headers.authorization.split(" ")[1];

        //verify token; if fails, then will throw error, so must be in the block
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = {email: decodedToken.email, id: decodedToken.id, role: decodedToken.role};

        //if no error is thrown yet, user is authorized and they can continue
        next();

    } catch (error) {

        //if get error, means token DNE, so user is not authorized
        res.status(401).json({auth: false, message: "Sorry, you are not authenticated to view this content."});
        console.log(error);
    }

}