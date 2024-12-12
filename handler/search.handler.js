const connectToRedis = require("../config/redis");
const elasticsearchClient = require("./elastic.search.handler");

async function searchEvent(query) {
	const cacheKey = `search:${query}`;

	try {
		const client = await connectToRedis();

		const cachedData = await client.get(cacheKey);
		if (cachedData) {
			console.log("Cache hit");
			return JSON.parse(cachedData);
		}

		const result = await elasticsearchClient.search({
			index: "event",
			body: {
				query: {
					multi_match: {
						query: query,
						fields: ["eventName", "venue"],
						type: "best_fields",
						fuzziness: "AUTO",
					},
				},
			},
		});
		console.log("Elastic result:", result.hits.hits);
		const events = result.hits.hits.map((hit) => hit._source);

		// Store result in Redis with 1-hour expiration
		await client.setEx(cacheKey, 3600, JSON.stringify(events));

		console.log("Cache miss - Data stored in Redis");
		return events;
	} catch (error) {
		console.error("Error searching events:", error);
		throw error;
	}
}

module.exports = { searchEvent };
