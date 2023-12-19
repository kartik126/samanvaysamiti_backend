import { NextFunction, Request, Response } from "express";

import cors from 'cors';
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var mandalRouter = require("./routes/mandal");

var dbConnect = require("./utils/dbConnect");
require('dotenv').config()

var app = express();
app.use(cors());

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/users/", usersRouter);
app.use("/api/mandal/", mandalRouter);


// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // respond with JSON
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : "Internal Server Error",
  });
});

app.listen(8000, () => {
  dbConnect();
  console.log(`Example app listening on port ${8000}`);
});

module.exports = app;
