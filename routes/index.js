import userRoutes from "./users.js";
import locationRoutes from "./locations.js";
import reviewRoutes from "./reviews.js";
import forumRoutes from "./forums.js";
import aboutRoutes from "./about.js";
import authRoutes from "./auth.js"
import gameRoutes from "./games.js";
import profileRoutes from "./profile.js"; 
import inboxRoutes from "./inbox.js";

const constructorMethod = (app) => {
  app.use("/users", userRoutes);
  app.use("/locations", locationRoutes);
  app.use("/reviews", reviewRoutes);
  app.use("/forums", forumRoutes);
  app.use("/about", aboutRoutes);
  app.use("/games", gameRoutes)
  app.use("/profile", profileRoutes); 
  app.use("/inbox", inboxRoutes);
  app.use("/", authRoutes);
  app.get("/", (req, res) => {
    return res.render("landing/index", { layout: "landing" });
  });

  app.use("{*splat}", (req, res) => {
    return res.status(404).render("errors/404", { user: req.session.user });
  });
};

export default constructorMethod;