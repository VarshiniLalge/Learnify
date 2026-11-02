const express = require("express");
const{
    generateStudyPlan
}=require("../controllers/plannerController");
const router = express.Router();

router.post("/generate",generateStudyPlan);

module.exports = router;