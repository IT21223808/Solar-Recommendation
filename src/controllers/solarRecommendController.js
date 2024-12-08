const solarRecommendService = require('../services/solarRecomendService');

const getSolarRecommendation = async (req, res) => {
    try {
        // Validate input
        const { location, landSize } = req.body;
        if (!location || !landSize) {
            return res.status(400).json({
                status: false,
                message: "Both 'location' and 'landSize' are required."
            });
        }

        // Fetch recommendation from the service
        const recommendation = await solarRecommendService.recommendSolar(req.body);

        // Handle the response
        if (recommendation && recommendation.success) {
            console.log("Recommendation:", recommendation.data);
            return res.status(200).json({
                status: true,
                recommendation: recommendation.data,
                message: "Data retrieved successfully."
            });
        } else {
            console.error("No data available:", recommendation?.message || "Unknown error.");
            return res.status(404).json({
                status: false,
                message: recommendation?.message || "No data available."
            });
        }
    } catch (error) {
        console.error("Error retrieving recommendation:", error.message);
        res.status(500).json({
            status: false,
            message: "Error retrieving recommendation.",
            error: error.message || "Unknown error."
        });
    }
};

module.exports = {
    getSolarRecommendation
};
