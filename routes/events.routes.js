const express = require("express");
const bookEvent = require("../handler/event.handler");
const eventRouter = express.Router();

// Route to Book an Event
eventRouter.post("/bookEvent", bookEvent);
eventRouter.get("/bookEvent", bookEvent);

module.exports = eventRouter;
