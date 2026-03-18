
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.HOST_DB,
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  database: process.env.DATABASE,
  port: process.env.PORT_DB,
  ssl: {
        rejectUnauthorized: false
    },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});



module.exports = {pool};