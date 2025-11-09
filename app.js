import express from "express";
import configRoutesFunction from "./routes/index.js";
import exphbs from "express-handlebars";
import session from "express-session";

const app = express();

app.use(session({
  name: "PickUpSpotSession",
  secret: "960ad0d5e52653b8ba4ea4d5a96b59af1ea965f848eb380287f56f94a1a729bd",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));

app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutesFunction(app);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
