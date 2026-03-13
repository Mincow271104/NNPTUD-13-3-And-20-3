/**
 * User Controller - In-Memory version
 */
let userSchema = require('../schemas/users');
let db = require('../utils/db');

module.exports = {
    CreateAnUser: function (username, password, email, role, fullname, avatar, status, logincount) {
        return userSchema.createUser({
            username: username,
            password: password,
            email: email,
            fullName: fullname,
            avatarUrl: avatar,
            status: status,
            role: role,
            loginCount: logincount
        });
    },
    FindByUsername: async function (username) {
        let users = db.collections.users.filter(u => u.username === username && u.isDeleted === false);
        return users.length > 0 ? users[0] : null;
    },
    FailLogin: async function (user) {
        user.loginCount++;
        if (user.loginCount == 3) {
            user.loginCount = 0;
            user.lockTime = new Date(Date.now() + 60 * 60 * 1000);
        }
        // Update in collection
        let index = db.collections.users.findIndex(u => u._id === user._id);
        if (index >= 0) {
            db.collections.users[index] = user;
        }
    },
    SuccessLogin: async function (user) {
        user.loginCount = 0;
        let index = db.collections.users.findIndex(u => u._id === user._id);
        if (index >= 0) {
            db.collections.users[index] = user;
        }
    },
    GetAllUser: async function () {
        let users = db.collections.users.filter(u => u.isDeleted === false);
        // Populate role
        return users.map(u => {
            let copy = { ...u };
            if (copy.role) {
                let role = db.collections.roles.find(r => r._id === copy.role);
                if (role) {
                    copy.role = { _id: role._id, name: role.name };
                }
            }
            return copy;
        });
    },
    FindById: async function (id) {
        try {
            let user = db.collections.users.find(u => u._id === id && u.isDeleted === false);
            if (!user) return false;
            let copy = { ...user };
            // Populate role
            if (copy.role) {
                let role = db.collections.roles.find(r => r._id === copy.role);
                if (role) {
                    copy.role = { _id: role._id, name: role.name };
                }
            }
            return copy;
        } catch (error) {
            return false;
        }
    }
};