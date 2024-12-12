require("dotenv").config();
const { Client } = require("@elastic/elasticsearch");

const client = new Client({
	node: process.env.PORTCLIENT,
	auth: {
		apiKey: process.env.APIKEY,
	},
});
async function createIndex() {
	const indexExists = await client.indices.exists({ index: "event" });
	if (!indexExists) {
		await client.indices.create({
			index: "event",
			body: {
				mappings: {
					properties: {
						eventName: { type: "text" },
						Date: String,
						venue: { type: "text" },
						ticketPrice: { type: "float" },
					},
				},
			},
		});
		console.log("Index created");
	} else {
		console.log("Index already exists");
	}
}
createIndex().catch(console.error);
module.exports = client;
