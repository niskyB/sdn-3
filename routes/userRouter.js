const express = require("express");
const bodyParser = require("body-parser");
const userController = require("../controllers/userController");
const adminGuard = require("../guard/adminGuard");
const userRouter = express.Router();
userRouter.use(bodyParser.json());

userRouter.route("/logout").get(userController.logout);

userRouter
  .route("/me/update-password")
  .get(userController.renderUpdatePassword)
  .post(userController.updatePassword);

userRouter
  .route("/me")
  .get(userController.renderMePage)
  .post(userController.updateProfile);

userRouter
  .route("/login")
  .get(userController.renderLoginPage)
  .post(userController.login);

userRouter
  .route("/register")
  .get(userController.renderRegisterPage)
  .post(userController.register);

userRouter.route('/list').get(adminGuard, userController.list);
userRouter.route('/:id').get(adminGuard, userController.getById);
module.exports = userRouter;
