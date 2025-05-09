const express = require("express");
const session = require("express-session");
const connectDB = require("./config/db");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");

app.use("/", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
