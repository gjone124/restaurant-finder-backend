const router = require("express").Router();

const userRouter = require("./users");
const itemRouter = require("./restaurantItems");
const { createUser, login } = require("../controllers/users");
const {
  validateCreateUser,
  validateLogin,
} = require("../middlewares/validation");

const NotFoundError = require("../utils/errors/NotFoundError");

// CRUD (Create, Read, Update, Delete)

// Create Method #1 (POST /signup route)
router.post("/signup", validateCreateUser, createUser);

// Create Method #2 (POST /signin route)
router.post("/signin", validateLogin, login);

router.use("/users", userRouter);
router.use("/items", itemRouter);

router.use((request, response, next) => {
  next(new NotFoundError("Router not found."));
});

module.exports = router;
