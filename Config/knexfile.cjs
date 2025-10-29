require("dotenv").config();

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host:"localhost",
      user:"root",
      password:"mansi.1788",
      database:"crud",
      port: 4040,
    },
    migrations: {
      directory: "./migrations",
      extension: "ts", // keep your TS migrations
    },
  },
};
