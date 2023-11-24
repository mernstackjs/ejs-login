require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const port = process.env.PORT;
const app = express();

app.use(
  session({
    secret: "ahmed",
    resave: false,
    saveUninitialized: false,
  })
);

const users = [];

const findUserByEmail = (email) => {
  const foundUser = users.find((user) => user.email === email);
  return foundUser ? foundUser : "User not found";
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  res.render("index", { user });
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username | !email | !password) return res.send("you have to fill all");

    const hashedPassword = await bcrypt.hash(password, 12);
    users.push({
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
    });
    console.log(users);
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (user === "User not found") {
    return res.send("User not found");
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    return res.send("Your password is incorrect");
  }

  req.session.user = user; // Set the user in the session
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.send("Error logging out");
    }
    res.redirect("/login");
  });
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
