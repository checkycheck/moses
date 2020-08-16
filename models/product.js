const mongoose = require('mongoose');
const {Schema} = mongoose;

const schemaProduct = new Schema({
    imagePath: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    discription: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const Product = mongoose.model("product", schemaProduct);

module.exports = Product;