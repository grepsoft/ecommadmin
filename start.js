const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const routeHandler = require("./routes");
const cors = require("cors");
require("dotenv").config();

module.exports = (config) => {
  const app = express();
  app.use(cors());

  // body parser middleware
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // routes
  app.use(config.apibasepath, routeHandler(config));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error(`Not Found (${req.url})`);
    err.status = 404;
    next(err);
  });

  return app;
};
