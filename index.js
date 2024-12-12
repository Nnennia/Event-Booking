const Event = require("./models/events");
const client = require("./handler/elastic.search.handler");

const indexEvent = async (req, res) => {
	try {
		const events = await Event.find();
		for (const event of events) {
			await client.index({
				index: "event",
				id: event._id.toString(),
				body: {
					eventName: event.eventName,
					Date: event.Date,
					venue: event.venue,
					ticketPrice: event.ticketPrice,
				},
			});
			console.log("Event indexed");
		}
		res.status(200).json({ message: "Events indexed successfully!" });
	} catch (error) {
		console.error("Error indexing events:", error);
		res.status(500).json({ error: error.message });
	}
};
module.exports = { indexEvent };
