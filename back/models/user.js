const db = require('../db/config');
const bcrypt = require('bcrypt');

module.exports = {
  createUser: (first_name, last_name, email, password) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hashed) => {
        if (err) return reject(err);
        const sql = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
        db.query(sql, [first_name, last_name, email, hashed], (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
      });
    });
  },
  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      db.query(sql, [email], (error, results) => {
        if (error) return reject(error);
        resolve(results[0]);
      });
    });
  }
};