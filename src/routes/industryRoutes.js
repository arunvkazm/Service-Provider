const express = require('express');
const router = express.Router();
const industryController = require('../controller/industryController');
const  authenticateJWT  = require('../middleware/auth');

// Protect all routes and restrict to admin role
// router.use(authenticateJWT);

// Routes for industries
router.post('/', industryController.createIndustry); 
router.get('/', industryController.getIndustries); 
router.get('/:id', industryController.getIndustryById); 
router.put('/:id', industryController.updateIndustry); 
router.delete('/:id', industryController.deleteIndustry); 

module.exports = router;
