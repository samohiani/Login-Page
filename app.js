const express = require("express");
const session = require("express-session");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo");

dotenv.config();
const app = express();

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.set("view engine", "ejs");

app.use("/", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
