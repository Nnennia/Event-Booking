const Event = require("../models/events");
const User = require("../models/user");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const bookEvent = async (req, res) => {
	try {
		const { action, username, eventName, paymentMethod } = req.body;

		if (action === "book") {
			// Validate Input
			if (!username || !eventName || !paymentMethod) {
				return res
					.status(400)
					.json({ error: "Please provide all required details" });
			}

			// Find the Event
			const selectedEvent = await Event.findOne({ eventName });
			if (!selectedEvent) {
				return res.status(404).json({ error: "Event not found" });
			}

			// Check Ticket Availability
			if (selectedEvent.ticketQuantity <= 0) {
				const alternativeEvents = await Event.find({
					ticketQuantity: { $gt: 0 },
				});
				return res.status(404).json({
					error: "Tickets are sold out",
					message: "Consider booking another event",
					availableEvents: alternativeEvents,
				});
			}

			// Process Payment (Mock Stripe Payment)
			const payment = await stripe.paymentIntents.create({
				amount: selectedEvent.ticketPrice * 100, // Amount in cents
				currency: "usd",
				payment_method: paymentMethod,
				confirm: true,
				return_url: "http://localhost:4000",
			});

			// Update Ticket Count
			selectedEvent.ticketQuantity -= 1;
			await selectedEvent.save();

			// Update User's Booked Events
			await User.findOneAndUpdate(
				{ username },
				{
					$push: {
						bookedEvent: {
							eventBooked: selectedEvent._id,
							bookingDate: new Date(),
							ticketPrice: selectedEvent.ticketPrice,
						},
					},
				},
				{ upsert: true, new: true }
			);

			// Respond with Success
			return res.status(200).json({
				message: "Event successfully booked!",
				event: selectedEvent,
				ticketsLeft: selectedEvent.ticketQuantity,
			});
		}
		if (action === "myEvents") {
			// Validate Input
			if (!username) {
				return res.status(400).json({ error: "Username is required" });
			}

			// Find the User and their booked events
			const user = await User.findOne({ username });
			if (!user || user.bookedEvent.length === 0) {
				return res
					.status(404)
					.json({ error: "No booked events for this user" });
			}

			return res.status(200).json({
				message: "Events found!",
				myEvents: user.bookedEvent,
			});
		} else {
			return res.status(400).json({
				error: "Invalid action or missing required data",
			});
		}
	} catch (error) {
		console.error("Unexpected error:", error);
		return res.status(500).json({ error: "Server error" });
	}
};

module.exports = bookEvent;
