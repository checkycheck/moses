const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  active: Boolean,
  password: String,
  secretToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("user", userSchema);

module.exports = User;

module.exports.hashPassword = async password => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error("Hashing failed", error);
  }
};
module.exports.comparePasswords = async (pass, hashPassword) => {
  try {
     await bcrypt.compare(pass, hashPassword);
    return console.log("comparing successful")
    
  } catch (error) {
    throw new Error("comparing failed", error);
  }
};
