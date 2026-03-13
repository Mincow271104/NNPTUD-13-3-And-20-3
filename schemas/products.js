/**
 * Product Schema - In-Memory version
 */
let db = require('../utils/db');

module.exports = {
    createProduct: function (data) {
        let productData = {
            title: data.title,
            slug: data.slug,
            price: data.price || 0,
            description: data.description || '',
            category: data.category,
            images: data.images || ['https://smithcodistributing.com/wp-content/themes/hello-elementor/assets/default_product.png'],
            isDeleted: false
        };
        return db.createDocument('products', productData);
    },

    find: function (filter) {
        return db.find('products', filter);
    },

    findOne: function (filter) {
        return db.findOne('products', filter);
    },

    findById: function (id) {
        return db.findById('products', id);
    },

    findByIdAndUpdate: function (id, updateData, options) {
        return db.findByIdAndUpdate('products', id, updateData, options);
    }
};