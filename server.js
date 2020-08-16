require("dotenv").config("./.env");

const express = require('express');
const app = express();
const expbs = require('express-handlebars');
const path = require('path');
const hbs = require ('hbs');
const assert = require("assert"); 
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expresshandlebars = require("express-handlebars");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("mongoose");
const logger = require("morgan");
const passport = require("passport");
const request = require('request');
const {Pay} = require('./models/pay')
const _ = require('lodash');
const {initializePayment, verifyPayment} = require('./config/paystack')(request);
const port = process.env.PORT;
const mongoStore = require("connect-mongo")(session);



//Require the passport module
require("./config/passport");

// Database connections
mongoose.Promise = global.Promise;
const MONGO_URL = require("./config/db").MONGOURL;

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true })
  .then(() => console.log(`Database connected at ${MONGO_URL}`))
  .catch(err => console.log(`Database Connection failed ${err.message}`));

app.use(logger("dev"));

//setting the templating engine
app.engine(
  ".hbs",
  expresshandlebars({
    defaultLayout: "layout",
    extname: ".hbs"
  })
);
app.set("view engine", ".hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "zacks",
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
      maxAge: 180 * 60 * 1000
    }
  })
);



//initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Setup flash/ Environmental variables
app.use((req, res, next) => {
  res.locals.success_messages = req.flash("success");
  res.locals.error_messages = req.flash("error");
  res.locals.isAuthenticated = req.user ? true : false;
  res.locals.user = req.user ? true : false;
  res.locals.session = req.session;
  next();
});



//rout grouping
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/users", require("./routes/users2"));
app.use("/users", require("./routes/payapp"));
// app.use("/users", require("./seed/product-seeder"));
// app.use('/users', usersRoute);


app.get('/paystack/callback', (req,res) => {
  const ref = req.query.reference;
  verifyPayment(ref, (error,body)=>{
      if(error){
          //handle errors appropriately
          console.log(error)
          return res.redirect('/error');
      }
      response = JSON.parse(body);        

      const data = _.at(response.data, ['reference', 'amount','customer.email', 'metadata.full_name']);

      [reference, amount, email, full_name] =  data;
      
      newPay = {reference, amount, email, full_name}

      const pay = new Pay(newPay)

      pay.save().then((pay)=>{
          if(!pay){
              return res.redirect('/error');
          }
          res.redirect('/receipt/'+pay._id);
      }).catch((e)=>{
          res.redirect('/error');
      })
  })
});

app.get('/receipt/:id', (req, res)=>{
  const id = req.params.id;
  console.log(id)

  Pay.findById(id).then((pay)=>{
      if(!pay){
          //handle error when the donor is not found
          res.redirect('/users/error')
      }
      console.log(pay)
      let payAmount = pay.amount/100
      req.flash('success', 'successfully bought product');
      req.session.cart = null;
       res.render('shop/success', {pay, payAmount});
  }).catch((e)=>{
      res.redirect('/users/error')
  })
})



app.listen(port, () => {
    console.log(`server start at port ${port}`);
});