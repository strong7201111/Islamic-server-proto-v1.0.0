require("dotenv").config();
const { Client } = require("pg");
//setting up the database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.initialize = function() {
  client.connect();
};
exports.client = client;
