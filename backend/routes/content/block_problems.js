const express = require("express");
const dbConnection = require("../../db");
const router = express.Router();


//create block problem func
async function createBlockProblem(conn, req, problemId) {

}
//update block problem func
async function updateBlockProblem(conn, req, problemId) {

}
//get block problem func
async function getBlockProblem(conn, problemId) {

}

//run sample tests on block problem route -- later
async function runSampleTests() {

}
//run hidden + random tests route --- later
async function runHiddenTests() {
    
}

module.exports = {
    createBlockProblem,
    updateBlockProblem,
    getBlockProblem,
    runSampleTests,
    runHiddenTests,
}

//delete tags (that are no longer used) not including premade tags but do just in problems, do later maybe