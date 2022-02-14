const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then((user) => {
          res.status(200).json(user);
        });
      });
    });
  } catch (error) {
    res.json(error);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(400).json("Invalid Credentials!!");
    
    bcrypt.compare(req.body.password + "", user.password).then((validated) => {
      if (!validated) return res.status(400).json("Invalid Credentials!!");

      //token generation
      jwt.sign(
        { email: user.email, id: user._id },
        "ictacademy",
        { expiresIn: "1d" },
        (err, token) => {
          if (err) {
            res.json({ status: "error in token generation" });
          } else {
            //res.json({ status: "login success", token, user });
            const { password, ...others } = user._doc;
             res.status(200).json({ token, user: others });
            // res.status(200).json(others);
          }
        }
      );
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;


