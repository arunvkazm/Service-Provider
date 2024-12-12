const express = require("express");
const router = express.Router();
const jobController = require('../controller/jobController');
const upload = require("../middleware/multer");

router.post(
    "/",
    upload.array('images',5),
    jobController.createJob
  );
  
  router.get("/", jobController.getJobs);
  router.get("/:id", jobController.getJobById);  
  router.put("/:id",upload.array('images',5), jobController.updateJob);
  router.delete("/:id", jobController.deleteJob);
  
  module.exports = router;