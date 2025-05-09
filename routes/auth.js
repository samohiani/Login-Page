const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/user");

router.get("/", (req, res) => {
  res.render("welcome");
});

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

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash("error_msg", "Invalid credentials.");
        return res.redirect("/login"); // Redirect back to login
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (!isMatch) {
          req.flash("error_msg", "Invalid credentials.");
          return res.redirect("/login");
        }

        req.session.userId = user._id;
        req.flash("success_msg", "Login successful!");
        res.redirect("/dashboard");
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Something went wrong. Please try again.");
      res.redirect("/login");
    });
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
