const express = require('express');
const router = express.Router();
const subscriptionController = require('../controller/subscriptionController');

router.post('/',subscriptionController.createSubscription);
router.get('/', subscriptionController.getAllSubscription); 
router.get('/:id', subscriptionController.getSubscriptionById); 
router.put('/:id', subscriptionController.updateSubscription); 
router.delete('/:id', subscriptionController.deleteSubscription); 

module.exports = router;