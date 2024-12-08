const express = require('express');
const solarController = require('../src/controllers/solarRecommendController')
const locationController = require('../src/controllers/locationController')
const recommendationController = require('../src/controllers/recommendationService')
const router = express.Router();

// Solar Recommendation Routes
router.post('/api/recommend-solar', solarController.getSolarRecommendation);

// Location Routes
router.get('/locations/getAll', locationController.getAllLocations);
router.get('/locations/get/:id', locationController.getLocationById);
router.post('/locations/create', locationController.createLocation);
router.patch('/locations/update/:id', locationController.updateLocation);
router.delete('/locations/delete/:id', locationController.deleteLocation);

// Recommendation Routes
router.get('/recommendations/getAll', recommendationController.getRecommendation);

module.exports = router;


