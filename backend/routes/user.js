const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbConnection = require('../db');
const router = express.Router();
const JWT_KEY = process.env.JWT_KEY;
const checkAuth = require('../middleware/check_auth');
const checkTeacher = require('../middleware/check_teacher');
const checkAdmin = require('../middleware/check_admin');

router.post("/signup", async (req, res, next) => {

    //encrypt the password
    const hash = await bcrypt.hash(req.body.password, 10);

    // create user object
    const user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        name: req.body.first_name + " " + req.body.last_name,
        email_address: req.body.email_address,
        password: hash,
        role: req.body.role,
        user_name: req.body.email_address.split("@")[0]
    }

    const sql = "INSERT INTO users SET ?";
    const sql2 = "SELECT id, name, email_address, role, user_name FROM users WHERE email_address = '" + user.email_address + "'";

    //possibly add redirection
    await dbConnection(async (conn) => {

        await conn.query(sql, user);
        const response = await conn.query(sql2)

        //create user token
        const token = jwt.sign(
            {id: response[0][0].id, role: user.role},
            JWT_KEY,
            { expiresIn: "1h" }
        );

        res.status(201).json({
            token: token,
            expiresIn: 3600,
            userData: response[0][0]
        });

    }, res, 401, "Could not sign up user, please try again.");
    
});

router.post("/login", async (req, res, next) => {

    await dbConnection(async (conn) => {

        //first get password of actual user
        let sql = "SELECT password FROM users WHERE email_address = '" + req.body.email_address + "'";
        let response = await conn.query(sql);
        const userValid = (response[0].length != 0) && (await bcrypt.compare(req.body.password, response[0][0].password));

        if(!userValid) {
            return res.status(401).json({
                message: "Email or password incorrect."
            })
        }

        //now get full data without password
        sql = "SELECT id, name, email_address, role, user_name FROM users WHERE email_address = '" + req.body.email_address + "'";
        response = await conn.query(sql);

        //create a new token
        const token = jwt.sign(
            {id: response[0][0].id, role: response[0][0].role},
            JWT_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            token: token,
            expiresIn: 3600,
            userData: response[0][0]
        });

    }, res, 401, "Could not login user, please try again later.");

});

router.get("/:user_id", checkAuth, checkTeacher, async (req, res, next) => {


    //later add check if student is teacher's student ************************************************************************************
    const sql = "SELECT id, name, email_address, role, user_name FROM users WHERE user_id=" + req.params.user_id;

    await dbConnection(async (conn) => {

        const response = (await conn.query(sql));

        if(response[0].length === 0) {
            return res.status(401).json({
                message: "Specified user does not exist."
            });
        }

        res.status(200).json({
            userData: response[0][0]
        })

    }, res, 500, "Some weird error occurred while getting the user.")

})

router.delete("/:user_id", checkAuth, checkAdmin, async(req, res, next) => {

    //perchance implement later
    res.status(401).json({
        message: "this deletion has not been implemented yet"
    });

})

module.exports = router;