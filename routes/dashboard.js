const express = require("express");
const router = express.Router();
const User = require("../models/user");

function isAuth(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect("/login");
  }
}

router.get("/", isAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render("dashboard", { user });
});

module.exports = router;
