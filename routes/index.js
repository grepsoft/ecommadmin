const express = require("express");
const product = require('./product');
const setting = require("./setting");

module.exports = (config) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.send({ code: 0, message: "Welcome to the bags online store api" });
  });

  router.use("/product", product(config));
  router.use("/setting", setting(config));

  return router;
};
