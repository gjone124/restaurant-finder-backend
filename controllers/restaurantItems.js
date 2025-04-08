const mongoose = require("mongoose");
const RestaurantItem = require("../models/restaurantItem");

const BadRequestError = require("../utils/errors/BadRequestError");
const ForbiddenError = require("../utils/errors/ForbiddenError");
const NotFoundError = require("../utils/errors/NotFoundError");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

function handleServerResponse(response) {
  if (response.ok) {
    return response.json();
  }
  return Promise.reject(new Error(`Error: ${response.status}`));
}

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

const findRestaurants = async (request, response, next) => {
  const { query } = request.params;
  // Fetch restaurant details from Google Places API

  const { GOOGLE_PLACES_API_KEY } = process.env;

  // IMPORTANT: In a production environment, this request should be proxied through a backend server
  // Direct frontend calls to Google Places API will typically be blocked by CORS
  const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query
  )}&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`;

  try {
    const placesResponse = await fetch(googlePlacesUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!placesResponse.ok) {
      throw new Error(`Google Places API error: ${placesResponse.status}`);
    }

    const data = await handleServerResponse(placesResponse);

    console.log(`Searching for: ${query}`);

    if (data.results && data.results.length > 0) {
      // Process each place to get additional details including photos
      const placesWithDetails = await Promise.all(
        data.results.slice(0, 6).map(async (place) => {
          console.log(
            `Google Places Result - Name: ${place.name}, Lat: ${place.geometry.location.lat}, Lng: ${place.geometry.location.lng}`
          );
          // Get place details to retrieve website and other information
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,website,photos&key=${GOOGLE_PLACES_API_KEY}`;

          const detailsResponse = await fetch(detailsUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!detailsResponse.ok) {
            throw new Error(
              `Google Places Details API error: ${detailsResponse.status}`
            );
          }

          const detailsData = await detailsResponse.json();
          const details = detailsData.result || {};

          return {
            name: place.name,
            address: place.formatted_address,
            website: details.website || "No website available",
            // Get first photo or use placeholder
            image:
              details.photos && details.photos.length > 0
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${details.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                : "https://via.placeholder.com/400?text=No+Image",
            location: place.geometry.location,
          };
        })
      );

      return response.status(200).send(placesWithDetails);
    }
    return response.status(200).send([]);
  } catch (error) {
    console.error("Error fetching Google Places data:", error);
    return next(new Error(`Google Places API error: ${error.message}`));
  }
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  findRestaurants,
};
