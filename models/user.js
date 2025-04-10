// still need to modify this file to allow avatar images uploaded by the user

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const removePassword = (user) => {
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    // required: [true, "The avatar field is required."], // (comment out if no avatar provided)
    validate: {
      validator(value) {
        return (
          // modified for no avatar scenario
          value === "" ||
          validator.isURL(value, {
            protocols: ["http", "https"],
            require_protocol: true,
          })
        );
      },
      message: "You must enter a valid URL.",
      default: "",
    },
  },
  email: {
    type: String,
    required: [true, "The email address field is required."],
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: "You must enter a valid email address.",
    },
  },
  password: {
    type: String,
    required: [true, "The password field is required."],
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Invalid email address or password."));
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            new Error("Invalid email address or password.")
          );
        }

        // hide password from user
        return removePassword(user);
      });
    });
};

module.exports = mongoose.model("user", userSchema);
