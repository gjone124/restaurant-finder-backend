const mongoose = require("mongoose");
const RestaurantItem = require("../models/restaurantItem");

const BadRequestError = require("../utils/errors/BadRequestError");
const ForbiddenError = require("../utils/errors/ForbiddenError");
const NotFoundError = require("../utils/errors/NotFoundError");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// CRUD (Create, Read, Update, Delete)

// Create (POST /items route)
const createItem = (request, response, next) => {
  const { name, cuisine, address, image, website } = request.body;
  const owner = request.user?._id;

  if (!name || !cuisine || !address || !image || !website) {
    return next(
      new BadRequestError("Missing required fields for item creation.")
    );
  }

  if (!request.user || !request.user._id) {
    return next(new BadRequestError("User is not authenticated."));
  }

  return RestaurantItem.create({
    name,
    cuisine,
    address,
    image,
    website,
    owner,
  })
    .then((item) => response.status(201).send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        next(
          new BadRequestError(
            "Error creating item. Invalid data. Ensure there is a valid name (2 to 100 characters), a valid cuisine (a String) , a valid address (at least 5 characters), a valid image, a valid website, and a valid owner ID."
          )
        );
      } else {
        next(err);
      }
    });
};

// Read (GET /items route)
const getItems = (request, response, next) => {
  RestaurantItem.find({})
    .then((items) => response.status(200).send(items))
    .catch((err) => {
      console.error(err);
      return next(err);
    });
};

// Delete Method #1 (DELETE /items/:itemId route)
const deleteItem = (request, response, next) => {
  const { itemId } = request.params;

  if (!itemId) {
    return next(new BadRequestError("Missing item ID."));
  }

  if (!isValidObjectId(itemId)) {
    return next(new BadRequestError("Invalid item ID."));
  }

  return RestaurantItem.findById(itemId)
    .then((item) => {
      if (!item) {
        return next(new NotFoundError("Item not found."));
      }
      if (item.owner.toString() !== request.user._id) {
        return next(
          new ForbiddenError("You do not have permission to delete this item.")
        );
      }

      return RestaurantItem.findByIdAndDelete(itemId).then(() =>
        response.status(200).send({ message: "Item deleted successfully." })
      );
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID."));
      }

      return next(err);
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
};
