const express = require('express');
const router = express.Router();
const axios = require('axios'); // Import axios

// Generate car recommendations based on user prompt
router.post("/generate-response", async (req, res) => {
    const userPrompt = req.body.prompt;

    // Basic validation: Check if prompt exists
    if (!userPrompt) {
        return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    try {
        const lambdaResponse = await axios.post("https://p9bh8fi9rh.execute-api.ap-south-1.amazonaws.com/dev/get-car", {
            preference: userPrompt,
        });

        // Check if the expected data is present in the Lambda response
        if (!lambdaResponse.data || !lambdaResponse.data.car_recommendations) {
             console.error("Unexpected response structure from Lambda:", lambdaResponse.data);
             return res.status(500).json({ error: "Received invalid response from generation service" });
        }

        const generatedText = lambdaResponse.data.car_recommendations
            .replace(/\[\/?INST\]/g, "")  // Remove any [INST] or [/INST] tags
            .trim();  // Remove extra spaces or newlines

        // Send JSON response instead of rendering a view
        res.json({ responseText: generatedText, error: null });

    } catch (error) {
        console.error("Error calling Lambda:", error.message); // Log the actual error message
        // Check if the error is from Axios and provide more details if possible
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Lambda Error Status:", error.response.status);
            console.error("Lambda Error Data:", error.response.data);
            res.status(error.response.status || 500).json({ error: "Failed to generate response due to upstream service error." });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received from Lambda:", error.request);
            res.status(504).json({ error: "No response received from generation service (timeout)." });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up Lambda request:', error.message);
            res.status(500).json({ error: "Failed to generate response due to an internal error." });
        }
    }
});

module.exports = router;