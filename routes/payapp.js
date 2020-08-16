const express = require("express");
const router = express.Router();
const request = require('request');
const bodyParser = require('body-parser');
const _ = require('lodash');
const path = require('path');
var Cart = require('../models/cart');

const {Pay} = require('../models/pay')
const {initializePayment, verifyPayment} = require('../config/paystack')(request);




//  router.route("/silver")
//  .get((req, res) => {
//     res.render("subscription/silver")
//  });


 router.get('/checkout', isLoggedIn, function(req, res, next){
    if(!req.session.cart){
      return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/checkout', {totalPrice: cart.totalPrice});
  })



 


router.post('/paystack/pay', isLoggedIn,  (req, res) => {
    const form = _.pick(req.body,['amount','email','full_name']);
    form.metadata = {
        full_name : form.full_name
    }
    form.amount *= 100;
    
    
    initializePayment(form, (error, body)=>{
        if(error){
            //handle errors
            console.log(error);
            return res.redirect('/error')
            return;
        }
        response = JSON.parse(body);
        res.redirect(response.data.authorization_url)
        console.log(response);
    });
});

// router.get('/paystack/callback', (req,res) => {
//     const ref = req.query.reference;
//     verifyPayment(ref, (error,body)=>{
//         if(error){
//             //handle errors appropriately
//             console.log(error)
//             return res.redirect('/error');
//         }
//         response = JSON.parse(body);        

//         const data = _.at(response.data, ['reference', 'amount','customer.email', 'metadata.full_name']);

//         [reference, amount, email, full_name] =  data;
        
//         newPay = {reference, amount, email, full_name}

//         const pay = new Pay(newPay)

//         pay.save().then((pay)=>{
//             if(!pay){
//                 return res.redirect('/error');
//             }
//             res.redirect('/receipt/'+pay._id);
//         }).catch((e)=>{
//             res.redirect('/error');
//         })
//     })
// });

// router.get('/receipt/:id', (req, res)=>{
//     const id = req.params.id;
//     Pay.findById(id).then((pay)=>{
//         if(!pay){
//             //handle error when the donor is not found
//             res.redirect('/users/error')
//         }
//          res.render('subscription/bronze',{pay});
//     }).catch((e)=>{
//         res.redirect('/users/error')
//     })
// })

router.get('user/error', (req, res)=>{
    res.render('error.hdb');
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}


module.exports = router;


