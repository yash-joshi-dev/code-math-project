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

//add new tags for a teacher
//delete tags (that are no longer used) not including premade tags but do just in problems
//get all tags for a teacher + premade tags (with like teacher id = 0)

//for glossary get for a student, add defs for a student (through an array); also each glossary is for a particular class (not cross class)


//and finally, of course student progress
