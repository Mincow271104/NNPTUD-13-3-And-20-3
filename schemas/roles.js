/**
 * Role Schema - In-Memory version
 */
let db = require('../utils/db');

module.exports = {
    createRole: function (data) {
        let roleData = {
            name: data.name,
            description: data.description || '',
            isDeleted: false
        };
        return db.createDocument('roles', roleData);
    },

    find: function (filter) {
        return db.find('roles', filter);
    },

    findOne: function (filter) {
        return db.findOne('roles', filter);
    },

    findById: function (id) {
        return db.findById('roles', id);
    },

    findByIdAndUpdate: function (id, updateData, options) {
        return db.findByIdAndUpdate('roles', id, updateData, options);
    }
};