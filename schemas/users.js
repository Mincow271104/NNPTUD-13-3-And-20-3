/**
 * User Schema - In-Memory version
 * Thay thế Mongoose schema bằng in-memory DB
 */
let bcrypt = require('bcrypt');
let db = require('../utils/db');

module.exports = {
    createUser: function (data) {
        // Hash password before saving
        if (data.password) {
            let salt = bcrypt.genSaltSync(10);
            data.password = bcrypt.hashSync(data.password, salt);
        }
        // Set defaults
        let userData = {
            username: data.username,
            password: data.password,
            email: data.email ? data.email.toLowerCase() : '',
            fullName: data.fullName || '',
            avatarUrl: data.avatarUrl || 'https://i.sstatic.net/l60Hf.png',
            status: data.status !== undefined ? data.status : false,
            role: data.role,
            loginCount: data.loginCount || 0,
            lockTime: data.lockTime || null,
            isDeleted: false
        };
        return db.createDocument('users', userData);
    },

    find: function (filter) {
        return db.find('users', filter);
    },

    findOne: function (filter) {
        return db.findOne('users', filter);
    },

    findById: function (id) {
        return db.findById('users', id);
    },

    findByIdAndUpdate: function (id, updateData, options) {
        // Hash password if being updated
        if (updateData.password) {
            let salt = bcrypt.genSaltSync(10);
            updateData.password = bcrypt.hashSync(updateData.password, salt);
        }
        return db.findByIdAndUpdate('users', id, updateData, options);
    }
};