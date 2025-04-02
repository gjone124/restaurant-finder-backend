const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");

const BadRequestError = require("../utils/errors/BadRequestError");
const ConflictError = require("../utils/errors/ConflictError");
const NotFoundError = require("../utils/errors/NotFoundError");
const UnauthorizedError = require("../utils/errors/UnauthorizedError");

// CRUD (Create, Read, Update, Delete)

// Create Method #1 (POST /signup route)
const createUser = (request, response, next) => {
  const { name, avatar, email, password } = request.body;

  if (!name) {
    return next(new BadRequestError("Name is a required field."));
  }

  // (comment out if avatar is not required)
  // if (!avatar) {
  //   return next(new BadRequestError("Avatar is a required field."));
  // }

  if (!email) {
    return next(new BadRequestError("Email address is a required field."));
  }

  if (!password) {
    return next(new BadRequestError("Password is a required field."));
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return next(
          new ConflictError("A user with this email address already exists.")
        );
      }

      return bcrypt
        .hash(password, 10)
        .then((hashedPassword) =>
          User.create({
            name,
            avatar,
            email,
            password: hashedPassword,
          })
        )
        .then((user) => {
          const userResponse = {
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
            email: user.email,
          };
          return response.status(201).send(userResponse);
        })
        .catch((err) => {
          console.error("Error creating user:", err);
          if (err.name === "ValidationError") {
            next(
              new BadRequestError("Invalid data provided for user creation.")
            );
          }

          return next(err);
        });
    })
    .catch(next);
};

// Create Method #2 (POST /signin route)
const login = (request, response, next) => {
  const { email, password } = request.body;

  if (!email) {
    return next(new BadRequestError("Email address is a required field."));
  }

  if (!password) {
    return next(new BadRequestError("Password is a required field."));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return response.status(200).send({ token });
    })
    .catch((err) => {
      console.error("Login error:", err.message);
      next(new UnauthorizedError("Invalid email address or password."));
    });
};

// Read (GET /users/me route (getUser renamed to getCurrentUser and route modified from "/:userId" to "/me"))
const getCurrentUser = (request, response, next) => {
  const userId = request.user._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new BadRequestError("Invalid user ID format."));
  }

  return User.findById(userId)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError("User not found."));
      }
      return response.status(200).send(user);
    })
    .catch((err) => {
      console.error("Error fetching user:", err);
      return next(err);
    });
};

// Update (PATCH /users/me route)
const updateProfile = (request, response, next) => {
  const userId = request.user._id;
  const { name, avatar } = request.body;

  if (!name) {
    return next(new BadRequestError("Name is a required field."));
  }

  // (comment out if avatar is not required)
  // if (!avatar) {
  //   return next(new BadRequestError("Avatar is a required field."));
  // }

  const updateData = { name };
  if (avatar) {
    updateData.avatar = avatar;
  }

  return User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })
    .then((updatedUser) => {
      if (!updatedUser) {
        return next(new NotFoundError("User not found."));
      }
      return response.status(200).send(updatedUser);
    })
    .catch((err) => {
      console.error("Error updating user profile:", err);
      if (err.name === "ValidationError") {
        return next(
          new BadRequestError("Invalid data provided for profile update.")
        );
      }
      return next(err);
    });
};

module.exports = { createUser, login, getCurrentUser, updateProfile };
