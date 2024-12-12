const express = require("express");
const userRouter = express.Router();
const auth = require("../handler/user.handler");
userRouter.post("/auth", auth);

module.exports = userRouter;
