const express = require("express");
const indexRouter = express.Router();
const { indexEvent } = require("../index");

indexRouter.post("/indexEvent", indexEvent);

module.exports = indexRouter;
