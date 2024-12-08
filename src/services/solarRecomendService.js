const axios = require("axios");
const { saveRecommendationToDB } = require("../services/recommendationService");

const recommendSolar = async (req) => {
    const { location, landSize } = req;

    // Validate inputs
    if (!location || !landSize) {
        return {
            success: false,
            message: "Both 'location' and 'landSize' are required inputs."
        };
    }

    try {
        // Send data to the Python Flask API
        const response = await axios.post('http://127.0.0.1:5000/recommend', {
            location,
            land_size: landSize
        });

        const recommendationData = response.data;

        // Call the save function to store data in the database
        const savedRecommendation = await saveRecommendationToDB(recommendationData);

        // Return the API response and database save confirmation
        return {
            success: true,
            data: recommendationData,
            savedToDb: savedRecommendation
        };
    } catch (error) {
        // Log error for debugging
        console.error("Error fetching solar recommendation:", error.message);

        // Handle API errors
        if (error.response) {
            // API responded with a status code outside the 2xx range
            return {
                success: false,
                message: "Flask API error occurred.",
                status: error.response.status,
                error: error.response.data
            };
        } else if (error.request) {
            // Request was made but no response was received
            return {
                success: false,
                message: "No response from Flask API.",
                error: error.message
            };
        } else {
            // Other errors
            return {
                success: false,
                message: "Unexpected error occurred.",
                error: error.message
            };
        }
    }
};

module.exports = {
    recommendSolar
};
