var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let { RegisterValidator, changePasswordValidator, handleResultValidator } = require('../utils/validatorHandler')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let { checkLogin } = require('../utils/authHandler')
let { getPrivateKey } = require('../utils/keys')
let db = require('../utils/db')

/* Register */
router.post('/register', RegisterValidator, handleResultValidator, async function (req, res, next) {
    // Kiểm tra username đã tồn tại chưa
    let existingUser = await userController.FindByUsername(req.body.username);
    if (existingUser) {
        return res.status(400).send({ message: "username da ton tai" });
    }

    // Kiểm tra email đã tồn tại chưa
    let existingEmail = db.collections.users.find(u => u.email === req.body.email.toLowerCase());
    if (existingEmail) {
        return res.status(400).send({ message: "email da ton tai" });
    }

    // Tìm role mặc định hoặc dùng role đầu tiên
    let defaultRole = db.collections.roles.length > 0 ? db.collections.roles[0]._id : null;

    let newUser = userController.CreateAnUser(
        req.body.username,
        req.body.password,
        req.body.email,
        defaultRole
    );
    await newUser.save()
    res.send({
        message: "dang ki thanh cong"
    })
});

/* Login */
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let getUser = await userController.FindByUsername(username);
    if (!getUser) {
        res.status(403).send("tai khoan khong ton tai")
    } else {
        if (getUser.lockTime && getUser.lockTime > Date.now()) {
            res.status(403).send("tai khoan dang bi ban");
            return;
        }
        if (bcrypt.compareSync(password, getUser.password)) {
            await userController.SuccessLogin(getUser);
            // Sử dụng RS256 private key để sign token
            let token = jwt.sign({
                id: getUser._id
            }, getPrivateKey(), {
                algorithm: 'RS256',
                expiresIn: '30d'
            })
            res.send(token)
        } else {
            await userController.FailLogin(getUser);
            res.status(403).send("thong tin dang nhap khong dung")
        }
    }

});

/* Get current user info */
router.get('/me', checkLogin, function (req, res, next) {
    res.send(req.user)
})

/* Change Password */
router.post('/change-password', checkLogin, changePasswordValidator, handleResultValidator, async function (req, res, next) {
    try {
        let { oldPassword, newPassword } = req.body;

        // Tìm user gốc (có password hash) từ in-memory DB
        let user = db.collections.users.find(u => u._id === req.user._id);
        if (!user) {
            return res.status(404).send({ message: "user khong ton tai" });
        }

        // Kiểm tra oldPassword có đúng không
        if (!bcrypt.compareSync(oldPassword, user.password)) {
            return res.status(403).send({ message: "mat khau cu khong dung" });
        }

        // Kiểm tra newPassword không được giống oldPassword
        if (oldPassword === newPassword) {
            return res.status(400).send({ message: "mat khau moi khong duoc giong mat khau cu" });
        }

        // Hash và cập nhật newPassword
        let salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(newPassword, salt);
        user.updatedAt = new Date();

        res.send({ message: "doi mat khau thanh cong" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})


module.exports = router;
