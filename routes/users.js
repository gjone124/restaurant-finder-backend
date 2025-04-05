const router = require("express").Router();
const {
  getCurrentUser,
  updateProfile,
  getUserLocation,
} = require("../controllers/users");
const auth = require("../middlewares/auth");

const { validateUpdateProfile } = require("../middlewares/validation");

// CRUD (Create, Read, Update, Delete)

// Read #1 (GET /users/me route) (gets user info)
router.get("/me", auth, getCurrentUser);

// Read #2 (GET /users/location route) (gets user location)
// this was previously in the frontend but was moved to the backend
// to prevent a user from potentially seeing the API key
router.get("/location", getUserLocation);

// Update (PATCH /users/me route) (updates user info)
router.patch("/me", auth, validateUpdateProfile, updateProfile);

module.exports = router;
