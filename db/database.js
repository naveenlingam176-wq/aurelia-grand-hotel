/**
 * Database Connection & Migration Service
 * Hotel Management System
 */

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const { CREATE_USERS_TABLE_SQL } = require('./userEntity');

const DB_FILE_PATH = path.join(__dirname, '..', 'hotel.db');

let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_FILE_PATH);
    // Initialize tables
    dbInstance.exec(CREATE_USERS_TABLE_SQL);
  }
  return dbInstance;
}

function closeDatabase() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (err) {
      console.warn('Error closing database:', err.message);
    }
    dbInstance = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase,
  DB_FILE_PATH
};
