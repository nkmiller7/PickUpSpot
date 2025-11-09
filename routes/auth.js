import { Router } from "express";
import { userData } from "../data/index.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await userData.getUserByEmail(email);
    if (user.password !== password)
      throw("Error: auth failed");

    req.session.user = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    return res.redirect("/locations");
  } catch (e) {
    return res.redirect("/");   // Auth failed
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  return res.redirect("/");
});

export default router;