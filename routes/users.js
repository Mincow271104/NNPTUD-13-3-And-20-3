var express = require("express");
var router = express.Router();
let { checkLogin } = require('../utils/authHandler')
let { userCreateValidator
    , userUpdateValidator
    , handleResultValidator } = require('../utils/validatorHandler')
let userController = require("../controllers/users");
let db = require("../utils/db");
let userSchema = require("../schemas/users");


router.get("/", checkLogin, async function (req, res, next) {
    let users = await userController.GetAllUser();
    res.send(users);
});

router.get("/:id", async function (req, res, next) {
    try {
        let result = await userController.FindById(req.params.id);
        if (result) {
            res.send(result);
        }
        else {
            res.status(404).send({ message: "id not found" });
        }
    } catch (error) {
        res.status(404).send({ message: "id not found" });
    }
});

router.post("/", userCreateValidator, handleResultValidator,
    async function (req, res, next) {
        try {
            let newItem = userController.CreateAnUser(
                req.body.username,
                req.body.password, req.body.email,
                req.body.role, req.body.fullName,
                req.body.avatarUrl, req.body.status, req.body.loginCount
            )
            await newItem.save();
            res.send(newItem);
        } catch (err) {
            res.status(400).send({ message: err.message });
        }
    });

router.put("/:id", userUpdateValidator, handleResultValidator, async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await userSchema.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedItem)
            return res.status(404).send({ message: "id not found" });
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

router.delete("/:id", async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await userSchema.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).send({ message: "id not found" });
        }
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;