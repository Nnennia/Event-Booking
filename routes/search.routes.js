const express = require("express");
const searchRouter = express.Router();
const { searchEvent } = require("../handler/search.handler");
searchRouter.get("/search", async (req, res) => {
	const query = req.query.query;
	if (!query) {
		return res.status(400).json({ error: "Search query is required" });
	}
	try {
		const results = await searchEvent(query);
		res.json(results);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Internal server Error" });
	}
});

module.exports = searchRouter;
