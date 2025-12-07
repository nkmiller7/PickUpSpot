import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  return res.render("home/index", { user: req.session.user, isHomePage: true });
});

export default router;
