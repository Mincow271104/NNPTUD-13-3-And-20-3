/**
 * Category Schema - In-Memory version
 */
let db = require('../utils/db');

module.exports = {
    createCategory: function (data) {
        let categoryData = {
            name: data.name,
            slug: data.slug,
            description: data.description || '',
            images: data.images || ['https://smithcodistributing.com/wp-content/themes/hello-elementor/assets/default_product.png'],
            isDeleted: false
        };
        return db.createDocument('categories', categoryData);
    },

    find: function (filter) {
        return db.find('categories', filter);
    },

    findOne: function (filter) {
        return db.findOne('categories', filter);
    },

    findById: function (id) {
        return db.findById('categories', id);
    },

    findByIdAndUpdate: function (id, updateData, options) {
        return db.findByIdAndUpdate('categories', id, updateData, options);
    }
};