const express = require("express");  
const assert = require("assert");
const router = express.Router();
const joi = require("joi");
const randomString = require("randomstring");
const passport = require("passport");
const mailer = require("../misc/mailer");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const MONGO_URL = require("../config/db").MONGOURL;
const _ = require('lodash');
const jwt = require('jsonwebtoken');








// USER VALIDATION SCHEMA
const userSchema = joi.object().keys({
    email: joi.string().email().required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    password: joi.string().regex(/^[a-zA-Z0-9]{5,30}$/).required(),
    password2: joi.any().valid(joi.ref("password")).required(),
    location: joi.string().required(),
    phoneNumber: joi.string().required()
});

//get the register route
router
    .route("/register")
    .get((req, res) => {
        res.render("use/register");
    })

    .post(async (req, res, next) => {
        try {
            const result = joi.validate(req.body, userSchema);

            // Checking the database if email is taken
            const userEmail = await User.findOne({
                email: result.value.email
            });

            // If email is taken
            if (userEmail) {
                req.flash("error", "Email is already used.");
                res.redirect("/users/register");
                return;
            }

            // Comparison of passwords
            if (req.body.password !== req.body.password2) {
                req.flash("error", "Passwords do not match.");
                res.redirect("/users/register");
                return;
            }

            // Hash the password
            const hash = await User.hashPassword(result.value.password);
            result.value.password = hash;
            delete result.value.password2;

            // Generation of secret token and saving to the database
            const secretToken = randomString.generate()
            result.value.secretToken = secretToken;

            

            // Setting user acct to be inactive
            result.value.active = false;

            // Saving user to database
            const newUser = await new User(result.value);
            await newUser.save();
            console.log(`${newUser} created successfully.`);
            
            // Create email
            const url = `http://localhost:4001/users/verify/${secretToken}`
            const html = `Hello ${result.value.firstName},

            <br/>
            <br>
            Please click below to verify your account:
            <br/>
             On the following page:
             <a href="${url}"><h1>VERIFY</h1></a>
             <br><br>
             <strong>All the best!!!</strong>
             `

            // Sending the mail
            await mailer.sendEmail('dungji.zacks.9@gmail.com', result.value.email, 'Please activate your email', html);

            req.flash('success', 'User created successfully, Please check your email to complete registration.');
            res.redirect('/users/login')
        } catch (error) {
            

            console.log(error);
            next(error);
        }
    });

router.route("/verify/:Token")
    .get(async (req, res, next) => {
        // res.render("use/verify");
        try {
            // const { Token } = req.body;
            // const {secretToken } = req.body;

            // Find acct with matching secret token in the database
            const user = await User.findOne({ secretToken :req.params.Token});

            // If the secretToken is invalid
            if (!user) {
                req.flash("error", "Your Token is not valid, Please Check your Token");
                res.redirect("/users/register");
                return;
            }

            // If the secretToken is valid
            user.active = true;
            user.secretToken = "";
            await user.save();

            req.flash("success", "Account verification successfull! You may log in");
            res.redirect("/users/login");
            
        } catch (error) {
            next(error);
            // req.flash("error", "dungji there is a problem with the Token oh!!!!");
            // res.redirect('/');
        }
    });
    // .post(async (req, res, next) => {
    //     try {
    //         const { secretToken } = req.body;

    //         // Find acct with matching secret token in the database
    //         const user = await User.findOne({ secretToken: secretToken.trim() });

    //         // If the secretToken is invalid
    //         if (!user) {
    //             req.flash("error", "Your Token is not valid, Please Check your Token");
    //             res.redirect("/users/register");
    //             return;
    //         }

    //         // If the secretToken is valid
    //         user.active = true;
    //         user.secretToken = "";
    //         await user.save();

    //         req.flash("success", "Account verification successfull! You may log in");
    //         res.redirect("/users/login");
    //     } catch (error) {
    //         next(error);
    //     }
    // });


router.route('/login')
    .get((req, res) => {
        res.render('use/login');
    })
    .post(passport.authenticate("local", {
        successRedirect: "/users/profile",
        failureRedirect: "/users/login",
        failureFlash: true
        // successFlash: "welcome "
    }));


router.route("/dashboard")
    .get(isLoggedIn, (req, res) => {
        res.render("use/dashboard")
    })

router.route("/profile")
    .get(isLoggedIn, (req, res) => {
         res.render("use/profile")
     });





     



    //  router.route("/profile")
    //  .get((req, res,) => {
    //      var item = {
    //          firstName: req.body.title,
    //          lastName: req.body.name,
    //          email: req.body.email,
    //          phoneNumber: req.body.phoneNumber,
    //          services: req.body.services,
    //          location: req.body.location
    //      };
    //      mongo.connect(url, function(err, db){
    //          assert.equal(null, err);
    //          db.collectons("users").insertOne(item, function(err, result) {
    //              assert.equal(null, error);
    //              console.log("item inserted");
    //              db.close();

    //          });

    //      });
    //      res.redirect("use/profile");
    //  });




router.route("/logout")
    .get((req, res) => {
        req.logout();
        req.flash("success", "See you later!")
        res.redirect("/");
    })



module.exports = router;



function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}
