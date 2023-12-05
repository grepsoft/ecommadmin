const express = require("express");
const product = require('./product');
const setting = require("./setting");
const bot = require("./bot");
const { Wit } = require('node-wit')

module.exports = (config) => {
  const router = express.Router();
  const client = new Wit({accessToken: config.wit.server_access_token});

  router.get('/', (req, res) => {
    res.send({ code: 0, message: "Welcome to the bags online store api" });
  });

  router.use("/product", product(config));
  router.use("/setting", setting(config));
  router.use("/bot", bot(config, client));

  return router;
};
