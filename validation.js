const Joi = require("@hapi/joi");

const registerValidation = (data) => {
  const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required().min(6),
    password: Joi.string().min(6).required(),
  });

  return userSchema.validate(data);
};

const loginValidation = (data) => {
  const userSchema = Joi.object({
    email: Joi.string().email().required().min(6),
    password: Joi.string().min(6).required(),
  });

  return userSchema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
