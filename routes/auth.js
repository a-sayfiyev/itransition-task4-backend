const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).send("Email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    registrationTime: Date.now(),
    isActive: true,
  });

  try {
    const savedUser = await user.save();
    res.status(201).send({
      user: user._id,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("Email is not found!");
  }

  if (!user.isActive) {
    return res.status(400).send("User is Blocked!");
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).send("Invalid password!");
  }

  user.loginTime = Date.now();
  await user.save();

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.send({ token });
  // res.status(200).send("Logged in!");
});

module.exports = router;
