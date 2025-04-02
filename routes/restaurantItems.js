const router = require("express").Router();

const {
  createItem,
  getItems,
  deleteItem,
} = require("../controllers/restaurantItems");

const auth = require("../middlewares/auth");

const {
  validateCreateItem,
  validateItemId,
} = require("../middlewares/validation");

// CRUD (Create, Read, Update, Delete)

// Create (POST /items route; add "auth" back in after testing)
router.post("/", auth, validateCreateItem, createItem);

// Read (GET /items route)
router.get("/", getItems);

// Delete Method #1 (DELETE /items/:itemId route)
router.delete("/:itemId", auth, validateItemId, deleteItem);

module.exports = router;
