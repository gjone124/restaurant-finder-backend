const router = require("express").Router();

const {
  createItem,
  getItems,
  deleteItem,
  findRestaurants,
} = require("../controllers/restaurantItems");

const auth = require("../middlewares/auth");

const {
  validateCreateItem,
  validateItemId,
} = require("../middlewares/validation");

// CRUD (Create, Read, Update, Delete)

// Create (POST /items route; add "auth" back in after testing)
router.post("/", auth, validateCreateItem, createItem);

// Read #1 (GET /items route) (gets data for items)
router.get("/", getItems);

// Read #2 (GET /items/:query route) (gets data for restaurants from Google Places API)
// this was previously in the frontend but was moved to the backend
// to prevent a user from potentially seeing the API key
router.get("/:query", findRestaurants);

// Delete (DELETE /items/:itemId route) (deletes specified item)
router.delete("/:itemId", auth, validateItemId, deleteItem);

module.exports = router;
