const locationService = require('../services/locationService')

const getAllLocations = async (req, res) => {
    try {
        const locations = await locationService.getAllLocations();
        if (locations) {
            res.status(200).json({ status: true, locations, message: "Data retreived sucess" });
        }
        else {
            res.status(404).json({ status: false, message: "Not Data Available" })
        }
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving locations', message: error });
    }
};

const getLocationById = async (req, res) => {
    const { id } = req.params;
    try {
        const location = await locationService.getLocationById(id);
        if (location) {
            res.status(200).json({ status: true, location, message: "Location found" });
        } else {
            res.status(404).json({ status: false, error: 'Location not found' });
        }
    } catch (error) {
        res.status(500).json({ status: false, error: 'Error retrieving location', message: error });
    }
};

const createLocation = (req, res) => {
    try {
        const location = locationService.createLocation(req.body);
        location.then(() => { res.status(201).json({ status: true, message: "Location Created Sucessfully" }); })
            .catch((error) => {
                if (error.message == 'P2002') {
                    res.status(500).json({ status: false, message: "New Location cannot be created with this email", code: "P2002" });
                }
                else {
                    res.status(404).json({ status: false, message: "Location Creation UnSucessfull" });
                }
            })
    } catch (error) {
        res.status(500).json({ error: `Location could not be created - ${error} ` });
    }
};

const updateLocation = async (req, res) => {
    const { id } = req.params;
    try {
        const location = await locationService.updateLocation(id, req.body);
        if (location) {
            res.status(200).json({ status: true, message: "Location Updated Sucessfully" });
        }
        else {
            res.status(404).json({ status: false, message: "No user found to update" })
        }
    } catch (error) {
        res.status(500).json({ error: 'Location could not be updated', message: error });
    }
};

const deleteLocation = async (req, res) => {
    const { id } = req.params;
    const userId = req.body.id;
    try {
        const response = await locationService.deleteLocation(id, userId);
        res.status(200).json({ status: true, message: 'Location deleted' });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Location could not be deleted', message: error });
    }
};

module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
};
