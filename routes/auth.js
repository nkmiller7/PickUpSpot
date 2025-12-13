import { Router } from "express";
import { userData } from "../data/index.js";
import validation from "../data/validation.js";
import bcrypt from "bcrypt";

const router = Router();

router.get("/signup", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  return res.render("signup/index", { layout: "landing" });
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  return res.render("login/index", { layout: "landing" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render("login/index", {
        layout: "landing",
        error: "Email and password are required",
        formData: {
          email: (req.body && req.body.email) || "",
        },
      });
    }

    const validPassword = validation.checkString(password, "Password");

    const user = await userData.getUserByEmail(email);

    const isValidPassword = await bcrypt.compare(validPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Incorrect password");
    }

    req.session.user = {
      userId: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAnonymous: user.isAnonymous || false,
    };
    return res.redirect("/");
  } catch (e) {
    let errorMessage = "Invalid email or password";

    if (e.message && e.message.includes("Email")) {
      errorMessage = "Please enter a valid email address";
    } else if (e.message && e.message.includes("User not found")) {
      errorMessage = "No account found with this email address";
    } else if (e.message && e.message.includes("Password")) {
      errorMessage = "Password is required";
    } else if (e.message && e.message.includes("Incorrect password")) {
      errorMessage = "Incorrect password";
    }

    return res.status(400).render("login/index", {
      layout: "landing",
      error: errorMessage,
      formData: {
        email: (req.body && req.body.email) || "",
      },
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  return res.redirect("/");
});

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, isAnonymous, isOfAge } =
      req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).render("signup/index", {
        layout: "landing",
        error: "First name, last name, email, and password are all required",
        formData: {
          firstName: (req.body && req.body.firstName) || "",
          lastName: (req.body && req.body.lastName) || "",
          email: (req.body && req.body.email) || "",
          isAnonymous: (req.body && req.body.isAnonymous) || false,
        },
      });
    }
    const anonymousUser = isAnonymous === "on";

    if (!isOfAge) {
      throw new Error(
        "You must confirm that you are at least 18 years old to sign up."
      );
    }

    const newUser = await userData.addUser(
      firstName,
      lastName,
      email,
      password,
      anonymousUser
    );

    req.session.user = {
      userId: newUser._id.toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      isAnonymous: newUser.isAnonymous || false,
    };

    return res.redirect("/");
  } catch (e) {
    return res.status(400).render("signup/index", {
      layout: "landing",
      error: e.message || "Signup failed. Please try again.",
      formData: {
        firstName: (req.body && req.body.firstName) || "",
        lastName: (req.body && req.body.lastName) || "",
        email: (req.body && req.body.email) || "",
        isAnonymous: (req.body && req.body.isAnonymous) || false,
      },
    });
  }
});

export default router;
