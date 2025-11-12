import { Router } from "express";
import { userData } from "../data/index.js";
import validation from "../data/validation.js";
import bcrypt from "bcrypt";

const router = Router();


router.get("/signup", (req, res) => {
  return res.render("signup/index", { layout: "landing" });
});


router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/locations");
  }
  return res.redirect("/");
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const validPassword = validation.checkString(password, "Password");

    const user = await userData.getUserByEmail(email);

    const isValidPassword = await bcrypt.compare(validPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Incorrect password");
    }

    req.session.user = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAnonymous: user.isAnonymous || false
    };
    return res.redirect("/locations");
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
    
    return res.status(400).render("landing/index", {
      layout: "landing", 
      error: errorMessage,
      formData: {
        email: req.body.email || ""
      }
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  return res.redirect("/");
});

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, isAnonymous } = req.body;
    const anonymousUser = isAnonymous === "on"; 

    const newUser = await userData.addUser(firstName, lastName, email, password, anonymousUser);

    req.session.user = {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      isAnonymous: newUser.isAnonymous || false
    };

    return res.redirect("/locations");
  } catch (e) {
    return res.status(400).render("signup/index", {
      layout: "landing",
      error: e.message || "Signup failed. Please try again.",
      formData: {
        firstName: req.body.firstName || "",
        lastName: req.body.lastName || "",
        email: req.body.email || "",
        isAnonymous: req.body.isAnonymous || false
      }
    });
  }
});

export default router;