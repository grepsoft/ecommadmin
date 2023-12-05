const pkg = require('../package.json');

module.exports = {
  // The name of the project
  name: pkg.name,

  // The version of the project
  version: pkg.version,

  apibasepath: process.env.BASE_PATH,

  // wit
  wit: {
    app_id: process.env.WIT_APP_ID,
    server_access_token: process.env.WIT_SERVER_ACCESS_TOKEN,
    client_access_token: process.env.WIT_CLIENT_ACCESS_TOKEN
  },

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