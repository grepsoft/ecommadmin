const pkg = require('../package.json');

module.exports = {
  // The name of the project
  name: pkg.name,

  // The version of the project
  version: pkg.version,

  apibasepath: process.env.BASE_PATH,

  // database
  database: {
    options: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    client: null,
  },

};