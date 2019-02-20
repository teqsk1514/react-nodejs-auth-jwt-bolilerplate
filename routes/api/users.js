const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../../models/User");
const keys = require("../../config/keys");

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// /api/users/*

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res, next) => {
  res.json({
    msg: "Users works"
  });
});

// @route   POST api/users/register
// @desc    Register the user
// @access  Public
router.post("/register", (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = "Email already exist";
        return res.status(404).json(errors);
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt
            .hash(newUser.password, salt)
            .then(hash => {
              newUser.password = hash;
              return newUser.save();
            })
            .then(user => res.json(user))
            .catch(err => {
              console.log(err);
            });
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

// @route   POST api/users/login
// @desc    Login user and return the token
// @access  Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  // find the user by email
  User.findOne({ email: email })
    .then(user => {
      // check for user
      if (!user) {
        errors.email = "User not found";
        return res.status(400).json(errors);
      }
      // check for the password
      bcrypt
        .compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // user matched
            // res.json({ msg: 'success' });
            const payload = {
              id: user.id,
              name: user.name,
              email: user.email
            }; //create jwt payload
            jwt.sign(
              payload,
              keys.secretOrkey,
              { expiresIn: 3600 },
              (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token
                });
              }
            );
          } else {
            errors.password = "Password Incorrect";
            return res.status(400).json({ ...errors, success: false });
          }
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});

// @route   GET api/users/current
// @desc    return current user
// @access  private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user;
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      date: user.createdAt
    });
  }
);

module.exports = router;
