const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/user");

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send("Passwords do not match");
  }

  const existingEmail = await User.findOne({ email });
  const existingUsername = await User.findOne({ username });

  if (existingEmail || existingUsername) {
    return res.send("Email or Username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    username,
    email,
    password: hashedPassword,
  });

  await user.save();
  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.send("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.send("Invalid credentials");

  req.session.userId = user._id;
  res.redirect("/dashboard");
});

router.get("/reset", (req, res) => {
  res.render("reset");
});

router.post("/reset", async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.send("User not found");

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  res.send("Password updated. <a href='/login'>Login</a>");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
