const express = require('express');
const router = express.Router();
const businessController = require('../controller/businessController');

router.post('/', businessController.createBusiness); 
router.get('/', businessController.getAllBusiness); 
router.get('/:id', businessController.getBusinessById); 
router.put('/:id', businessController.updateBusiness); 
router.delete('/:id', businessController.deleteBusiness); 

module.exports = router;
