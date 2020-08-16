var Product = require('../models/product');
const mongoose = require("mongoose");
const express = require('express');
const app = express();
const logger = require("morgan");


//Database connections
mongoose.Promise = global.Promise;
const MONGO_URL = require("../config/db").MONGOURL;

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true })
  .then(() => console.log(`Database connected at ${MONGO_URL}`))
  .catch(err => console.log(`Database Connection failed ${err.message}`));


app.use(logger("dev"));  




// =================================================================
var products = [
  new Product({
      imagePath: './img/caper.png',
      title: 'caper',
      discription: 'food',
      price: 578
  }),
  new Product({
    imagePath: './img/apple.jpg',
    title: 'APPLE',
    discription: 'food',
    price: 877
}),
new Product({
    imagePath: './img/pepper.jpg',
    title: 'GREEN PAPPER',
    discription: 'food',
    price: 754
}),
new Product({
    imagePath: './img/potato.jpg',
    title: 'Potator',
    discription: 'food',
    price: 50
}),
new Product({
    imagePath: './img/carot.jpg',
    title: 'CAROT',
    discription: 'food',
    price: 50
}),
new Product({
    imagePath: './img/Fresh-Cavendish-Banana-New-Crop.jpg',
    title: 'BANNAN',
    discription: 'food',
    price: 50
}),
new Product({
    imagePath: './img/tomato.jpg',
    title: 'Tomato',
    discription: 'food',
    price: 50
}),
new Product({
    imagePath: './img/how-it-works-h.jpg',
    title: 'Apple',
    discription: 'food',
    price: 50
}),
new Product({
    imagePath: './img/images (5).jpg',
    title: 'Cabbage',
    discription: 'food',
    price: 50
}),
new Product({
    imagePath: './img/FB_IMG_15595897512770761.jpg',
    title: 'Strawberies',
    discription: 'foods',
    price: 50
}),
new Product({
    imagePath: './img/images (3).jpg',
    title: 'Pepper',
    discription: 'foods',
    price: 50
}),
new Product({
    imagePath: './img/FB_IMG_15595890257342383.jpg',
    title: 'Currant',
    discription: 'foods',
    price: 50
}),


];

var done = 0;
for(var i=0; i < products.length; i++){
    products[i].save((err, result) => {
        done++;
        if (done === products.length){
            exit();
        }
    });
}


function exit(){
    mongoose.disconnect();
}