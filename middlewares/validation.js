const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

const validateCreateItem = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2 characters.',
      "string.max": 'The maximum length of the "name" field is 100 characters.',
      "string.empty": 'The "name" field must be filled in.',
    }),
    cuisine: Joi.string().required().messages({
      "string.empty": 'The "cuisine" field is required.',
    }),
    address: Joi.string().required().min(5).messages({
      "string.min":
        'The minimum length of the "address" field is 5 characters.',
      "string.empty": 'The "address" field is required.',
    }),
    image: Joi.string().required().custom(validateURL).messages({
      "string.uri": 'The "image" field must be a valid url.',
    }),
    website: Joi.string().required().custom(validateURL).messages({
      "string.uri": 'The "website" field must be a valid url.',
    }),
  }),
});

const validateCreateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2 characters.',
      "string.max": 'The maximum length of the "name" field is 30 characters.',
      "string.empty": 'The "name" field must be filled in.',
    }),
    // avatar can't be required to allow for situation mentioned in
    // Sprint 14 of creating a user logo w/ first letter of their
    // first name if no avatar is provided
    avatar: Joi.string().custom(validateURL).messages({
      "string.uri": 'The "avatar" field must be a valid url.',
    }),
    email: Joi.string().required().email().message({
      "string.empty": 'The "email" field must be filled in.',
      "string.email": 'The "email" field must be a valid url.',
    }),
    password: Joi.string().required().messages({
      "string.empty": 'The "password" field must be filled in.',
    }),
  }),
});

const validateLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().message({
      "string.empty": 'The "email" field must be filled in.',
      "string.email": 'The "email" field must be a valid url.',
    }),
    password: Joi.string().required().messages({
      "string.empty": 'The "password" field must be filled in.',
    }),
  }),
});

const validateItemId = celebrate({
  params: Joi.object().keys({
    itemId: Joi.string().length(24).hex().required().messages({
      "string.empty": 'The "id" field must be filled in.',
      "string.hex": 'The "id" must be a hexadecimal value.',
      "String.length": 'The "id" must be 24 characters.',
    }),
  }),
});

const validateUpdateProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.empty": 'The "name" field must be filled in.',
      "string.min": 'The minimum length of the "name" field is 2 characters.',
      "string.max": 'The maximum length of the "name" field is 30 characters.',
    }),
    // avatar can't be required to allow for situation mentioned in
    // Sprint 14 of creating a user logo w/ first letter of their
    // first name if no avatar is provided
    avatar: Joi.string().custom(validateURL).messages({
      "string.uri": 'The "avatar" field must be a valid URL.',
    }),
  }),
});

module.exports = {
  validateCreateItem,
  validateCreateUser,
  validateLogin,
  validateItemId,
  validateUpdateProfile,
};
