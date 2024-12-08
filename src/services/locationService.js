const locationModel = require('../models/LocationModel')
const { Prisma } = require("@prisma/client");

const getAllLocations = async () => {
    const locations = await locationModel.findMany();
    return locations;
};

const getLocationById = async (id) => {
    return await locationModel.findUnique({ where: { id } });
};

const createLocation = async (locationDetails) => {
    console.log("Income to create a Location.....");
    return new Promise((resolve, reject) => {
        const data = {
            name: locationDetails.name,
            allowed_capacity: locationDetails.allowed_capacity,
        };
        locationModel.create({ data }).then((res) => {
            console.log("Location has been created sucessfully..");
            console.log(res);
            resolve(true);
        }).catch((error) => {
            console.log("Sorry cannot create location for you... :(");
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    reject(new Error("P2002"));
                } else {
                    reject(new Error("Prisma error"));
                }
            } else {
                reject(new Error("Unexpected error"));
            }
        });
    });
};


const updateLocation = async (id, locationDetails) => {
    const isfound = await locationModel.findUnique({ where: { id } })
    if (isfound) {
        new Promise(async (resolve, reject) => {
            locationModel.update({
                where: { id },
                data: locationDetails,
            }).then((response) => { resolve(response) }).catch((error) => { reject(error) })
        })
        return true
    }
    else {
        return false
    }
};

const deleteLocation = async (id, userId) => {
    try {
        await locationModel.delete({ where: { userId } }).then((admin) => { return admin }).catch((error) => { return error })
    }
    catch (error) {
        if (error === 'Not an admin') {
            console.error("User is not authorized to delete");
        } else {
            console.error("Error deleting location:", error);
        }
    }
};


module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
};
