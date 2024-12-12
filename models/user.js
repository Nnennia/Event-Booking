const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	username: { type: String, required: true },
	password: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	bookedEvent: [
		{
			eventBooked: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
			bookingDate: { type: Date, required: true },
			ticketPrice: { type: Number, required: true },
		},
	],
	notification: [
		{
			notifybookedEvents: [
				{
					eventBooked: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
					bookingDate: { type: Date, required: true },
					ticketPrice: { type: Number, required: true },
				},
			],
			notificationMessage: { type: String, required: true },
			date: { type: Date, default: Date.now },
		},
	],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
