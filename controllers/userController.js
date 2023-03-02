const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET = require("../constant/secret");

class UserController {
  renderLoginPage(req, res, next) {
    res.render("login", {
      username: "",
      password: "",

      errors: {},
    });
  }
  renderRegisterPage(req, res, next) {
    res.render("register", {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      YOB: "",
      errors: {},
    });
  }

  async renderUpdatePassword(req, res, next) {
    const user = await User.findOne({ username: res.locals.user.username });
    res.render("updatePassword", {
      username: user.username,
      password: "",
      confirmPassword: "",
      errors: {},
    });
  }

  async renderMePage(req, res, next) {
    const user = await User.findOne({ username: res.locals.user.username });

    res.render("myProfile", {
      username: user.username,
      name: user.name,
      YOB: user.YOB,
      errors: {},
    });
  }

  login(req, res, next) {
    const errors = {};

    const { username, password } = req.body;
    if (!username || !password) {
      errors.msg = "Please enter all fields";
    }
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      res.render("login", {
        errors,
        username,
        password,
      });
    }

    User.findOne({ username: username }).then((user) => {
      if (user === null) {
        errors.username = "User " + username + " does not exist!";
        return res.render("login", { username, password, errors });
      }

      const isCorrectPassword = bcrypt.compareSync(password, user.password);

      if (!isCorrectPassword) {
        errors.password = "Your password is incorrect!";
        return res.render("login", { username, password, errors });
      }
      const token = jwt.sign(
        {
          ...user,
          isAuth: true,
        },
        SECRET
      );
      req.session.auth = token;
      res.redirect("/");
    });
  }

  logout(req, res, next) {
    if (req.session) {
      req.session.destroy();
      res.clearCookie("session-id");
      res.redirect("/");
    }
    res.json({ message: "no session" });
  }

  async register(req, res, next) {
    const { username, password, confirmPassword, name, YOB } = req.body;
    let errors = {};
    if (!username || !password || !confirmPassword || !name || !YOB) {
      errors.msg = "Please enter all fields";
    }

    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      res.render("register", {
        errors,
        username,
        password,
        confirmPassword,
        name,
        YOB,
      });
    } else {
      User.findOne({ username: username }).then(async (user) => {
        if (user) {
          errors.username = "Username already exists";
          res.render("register", {
            errors,
            username,
            password,
          });
        } else {
          const newUser = new User({
            username,
            password,
            name,
            YOB,
          });

          //Hash password
          bcrypt.hash(newUser.password, 10, function (err, hash) {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                res.redirect("/user/login");
              })
              .catch(next);
          });
        }
      });
    }
  }

  async updateProfile(req, res, next) {
    const { name, YOB, username } = req.body;

    const user = await User.findOneAndUpdate(
      {
        username: username,
      },
      { name, YOB },
      { new: true }
    );

    if (user) {
      res.redirect("/user/me");
    }
  }

  async updatePassword(req, res, next) {
    const { password, confirmPassword, username } = req.body;
    console.log(username);
    let errors = {};
    if (!password || !confirmPassword) {
      errors.msg = "Please enter all fields";
    }

    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      res.render("updatePassword", {
        password,
        confirmPassword,
        errors,
        username,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const newUser = await User.findOneAndUpdate(
        { username },
        { password: hashedPassword },
        { new: true }
      );
      if (newUser) {
        res.redirect("/user/me");
      }
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = new UserController();
