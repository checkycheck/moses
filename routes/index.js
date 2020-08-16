const express = require('express');
const router = express.Router();
const app = express();
var Product = require('../models/product')
var Cart = require('../models/cart');

//route grouping
router.get("/", (req, res) => {
  Product.find((err, docs) =>{
    var productChunks = [];
    var chunkSize = 3;
    for(var i = 0; i < docs.length; i += chunkSize){
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render("index.hbs", { title: 'shopping cart', products: productChunks});
  }); 
});
  
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  router.get("/contact", (req, res) => {
    res.render("contact.hbs");
  });

  router.get("/about", (req, res) =>{
    res.render("about.hbs");
  });
//======================add to cart route================================================
  router.get('/add-to-cart/:id', (req, res, next) =>{
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product){
      if (err) {
        req.flash('error has occured');
        return res.redirect('/');
      }
       cart.add(product, productId);
       req.session.cart = cart;
       console.log(req.session.cart);
       res.redirect('/');
    });
  });

  router.get('/shopping-cart', isLoggedIn, function(req, res, next){
    if(!req.session.cart){
      return res.render('shop/shopping-cart', {product: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
  });

  function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}


module.exports = router;