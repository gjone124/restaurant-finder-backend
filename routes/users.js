const router = require("express").Router();
const { getCurrentUser, updateProfile } = require("../controllers/users");
const auth = require("../middlewares/auth");

const { validateUpdateProfile } = require("../middlewares/validation");

// CRUD (Create, Read, Update, Delete)

// Read (GET /users/me route (getUser renamed to getCurrentUser and route modified from "/:userId" to "/me"))
router.get("/me", auth, getCurrentUser);

// Update (PATCH /users/me route)
router.patch("/me", auth, validateUpdateProfile, updateProfile);

module.exports = router;
