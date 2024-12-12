const socketIo = require("socket.io");
const User = require("../models/user");

require("dotenv").config();

module.exports = function (server) {
	const io = socketIo(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	const CHECK_INTERVAL = 5 * 60 * 1000;

	const notifySpecificUserEvents = async (username, socket) => {
		try {
			// Find the user by username and populate their booked events
			const user = await User.findOne({ username }).populate(
				"bookedEvent.eventBooked"
			);

			if (!user) {
				socket.emit("error", "User not found");
				return;
			}

			const recentEvents = user.bookedEvent
				.sort((a, b) => b.bookingDate - a.bookingDate) // Sort events by booking date descending
				.slice(0, 5); // Get the most recent 5 events

			const notifications = user.notification || [];

			// Create a new notification
			const newNotification = {
				notifybookedEvents: recentEvents.map((event) => ({
					eventBooked: event.eventBooked, // Full event data (populated)
					bookingDate: event.bookingDate,
					ticketPrice: event.ticketPrice,
				})),
				notificationMessage:
					"You have booked events. Check your upcoming plans!",
				date: Date.now(),
			};

			// Push new notification into the user's notifications array in the database
			await User.findOneAndUpdate(
				{ _id: user._id },
				{
					$push: {
						notification: newNotification,
					},
				}
			);

			// Emit the notification to the specific user via their socket
			socket.emit("userNotifications", {
				userId: user._id,
				notifications: user.notification, // Send the notifications with event data
			});

			console.log(`Notifications sent for user ${username}`);
		} catch (error) {
			console.error("Error sending notifications:", error.message);
		}
	};

	setInterval(() => {
		console.log("Checking for upcoming events...");
	}, CHECK_INTERVAL);

	io.on("connection", (socket) => {
		console.log("User connected:", socket.id);
		socket.emit("message", "Welcome to the event notifications service!");

		// On Manual Request for Upcoming Events
		socket.on("requestUpcomingEvents", async (username) => {
			console.log("Requesting upcoming events for user:", username);

			// Call the function to notify only the specific user who requested
			await notifySpecificUserEvents(username, socket);
		});

		// On User Disconnect
		socket.on("disconnect", () => {
			console.log("User disconnected:", socket.id);
		});
	});

	return io;
};
