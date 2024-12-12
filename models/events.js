const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
	eventName: String,
	Date: Date,
	venue: String,
	ticketPrice: Number,
	ticketQuantity: Number,
});
const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
