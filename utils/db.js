/**
 * In-Memory Database Layer
 * Thay thế Mongoose - dữ liệu sẽ mất khi tắt server
 */
let crypto = require('crypto');

function generateId() {
    return crypto.randomBytes(12).toString('hex');
}

// In-memory collections
let collections = {
    users: [],
    roles: [],
    products: [],
    categories: []
};

/**
 * Tạo một document mới (chưa lưu vào collection)
 */
function createDocument(collectionName, data) {
    let now = new Date();
    let doc = {
        _id: generateId(),
        ...data,
        createdAt: now,
        updatedAt: now
    };

    doc.save = async function () {
        let collection = collections[collectionName];
        let existingIndex = collection.findIndex(item => item._id === doc._id);
        doc.updatedAt = new Date();
        if (existingIndex >= 0) {
            collection[existingIndex] = doc;
        } else {
            collection.push(doc);
        }
        return doc;
    };

    return doc;
}

/**
 * Tìm nhiều documents theo filter
 */
function find(collectionName, filter = {}) {
    let collection = collections[collectionName];
    let results = collection.filter(item => {
        for (let key in filter) {
            if (item[key] !== filter[key]) return false;
        }
        return true;
    });

    // Return a copy with populate support
    let query = {
        _results: results.map(r => ({ ...r })),
        populate: function (options) {
            if (options && options.path) {
                this._populateOptions = options;
            }
            return this;
        },
        then: function (resolve, reject) {
            try {
                let populated = this._results.map(r => {
                    let copy = { ...r };
                    if (this._populateOptions) {
                        let opt = this._populateOptions;
                        let refCollection = getRefCollection(collectionName, opt.path);
                        if (refCollection && copy[opt.path]) {
                            let refDoc = collections[refCollection].find(d => d._id === copy[opt.path]);
                            if (refDoc) {
                                if (opt.select) {
                                    let fields = opt.select.split(' ');
                                    let selected = { _id: refDoc._id };
                                    fields.forEach(f => { if (refDoc[f] !== undefined) selected[f] = refDoc[f]; });
                                    copy[opt.path] = selected;
                                } else {
                                    copy[opt.path] = { ...refDoc };
                                }
                            }
                        }
                    }
                    return copy;
                });
                resolve(populated);
            } catch (e) {
                reject(e);
            }
        }
    };
    return query;
}

/**
 * Tìm một document theo filter
 */
function findOne(collectionName, filter = {}) {
    let collection = collections[collectionName];
    let result = collection.find(item => {
        for (let key in filter) {
            if (item[key] !== filter[key]) return false;
        }
        return true;
    });

    let query = {
        _result: result ? { ...result } : null,
        populate: function (options) {
            if (options && options.path && this._result) {
                let refCollection = getRefCollection(collectionName, options.path);
                if (refCollection && this._result[options.path]) {
                    let refDoc = collections[refCollection].find(d => d._id === this._result[options.path]);
                    if (refDoc) {
                        if (options.select) {
                            let fields = options.select.split(' ');
                            let selected = { _id: refDoc._id };
                            fields.forEach(f => { if (refDoc[f] !== undefined) selected[f] = refDoc[f]; });
                            this._result[options.path] = selected;
                        } else {
                            this._result[options.path] = { ...refDoc };
                        }
                    }
                }
            }
            return this;
        },
        then: function (resolve, reject) {
            try {
                resolve(this._result);
            } catch (e) {
                reject(e);
            }
        }
    };
    return query;
}

/**
 * Tìm document theo ID
 */
function findById(collectionName, id) {
    return findOne(collectionName, { _id: id });
}

/**
 * Cập nhật document theo ID
 */
function findByIdAndUpdate(collectionName, id, updateData, options = {}) {
    let collection = collections[collectionName];
    let index = collection.findIndex(item => item._id === id);
    if (index < 0) return Promise.resolve(null);

    let doc = collection[index];
    for (let key in updateData) {
        if (key !== '_id' && key !== 'createdAt') {
            doc[key] = updateData[key];
        }
    }
    doc.updatedAt = new Date();
    collection[index] = doc;

    if (options.new) {
        return Promise.resolve({ ...doc });
    }
    return Promise.resolve({ ...doc });
}

/**
 * Xác định collection tham chiếu (populate)
 */
function getRefCollection(collectionName, fieldPath) {
    let refs = {
        users: { role: 'roles' },
        products: { category: 'categories' }
    };
    return refs[collectionName] ? refs[collectionName][fieldPath] : null;
}

module.exports = {
    collections,
    generateId,
    createDocument,
    find,
    findOne,
    findById,
    findByIdAndUpdate
};
