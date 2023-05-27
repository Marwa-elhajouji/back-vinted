const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");
//SignUp
router.post("/user/signup", async (req, res) => {
  try {
    if (
      req.body.username &&
      req.body.email &&
      req.body.password &&
      req.body.newsletter !== undefined
    ) {
      const isEmailExist = await User.findOne({ email: req.body.email });
      if (isEmailExist === null) {
        const password = req.body.password;
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);

        const newUser = new User({
          email: req.body.email,
          account: {
            username: req.body.username,
          },
          newsletter: req.body.newsletter,
          token: token,
          salt: salt,
          hash: hash,
        });
        await newUser.save();
        return res.status(201).json({
          id: newUser._id,
          token: newUser.token,
          account: {
            username: newUser.account.username,
          },
        });
      } else {
        return res.status(409).json({ message: "Email not available " });
      }
    } else {
      return res.status(400).json({ message: "Missing parameters" });
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

//Log in
router.post("/user/login", async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });

    if (userFound) {
      const newHash = SHA256(req.body.password + userFound.salt).toString(
        encBase64
      );
      if (newHash === userFound.hash) {
        return res.status(200).json({
          id: userFound._id,
          token: userFound.token,
          account: {
            username: userFound.account.username,
          },
        });
      } else {
        return res.status(400).json({ message: "email or password incorrect" });
      }
    } else {
      return res.status(400).json({ message: "email or password incorrect" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
module.exports = router;
