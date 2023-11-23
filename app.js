require("dotenv").config();
const mongoose = require('mongoose');
const App = require("./start");
const config = require("./config");

/************************************************************* */
//             Main
/************************************************************* */
async function run() {
  const uri = `mongodb+srv://${config.database.options.username}:${config.database.options.password}@cluster0.qobehe1.mongodb.net/${config.database.options.database}`;

  // connect to database
  const db = await mongoose.connect(uri);

  console.log("db connection [OK]");

  // save client
  config.database.client = db;

  // setup app
  const app = App(config);

  // start listening
  app.listen(process.env.PORT || 30000);
  console.log("listening on port ", process.env.PORT);

  app.on("error", (err) => {
    console.error("server error", err);
  });
}

run().catch(error => console.log(error));




