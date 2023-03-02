const express = require("express");
const bodyParser = require("body-parser");
const nationController = require("../controllers/nationController");
const adminGuard = require("../guard/adminGuard");
const nationsRouter = express.Router();
nationsRouter.use(bodyParser.json());
nationsRouter
  .route("/")
  .get(nationController.index)
  .post(nationController.create);

nationsRouter.get("/:id", nationController.getNation);
nationsRouter.post("/:id", adminGuard, nationController.update);

nationsRouter.get("/delete/:id", adminGuard, nationController.delete);
module.exports = nationsRouter;
