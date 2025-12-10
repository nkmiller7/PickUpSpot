import express from "express";
import configRoutesFunction from "./routes/index.js";
import exphbs from "express-handlebars";
import session from "express-session";
const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};
const app = express();

app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);
app.use(session({
  name: "PickUpSpotSession",
  secret: "960ad0d5e52653b8ba4ea4d5a96b59af1ea965f848eb380287f56f94a1a729bd",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1200000 }
}));

app.engine("handlebars", exphbs.engine({ 
  defaultLayout: "main",
  helpers: {
    lt: function (a, b) {
        return a < b;
    },
    gt : function (a, b) {
        return a > b;
    },
    eq: function(a, b) {
      return a == b;
    },
    json: function(a) {
        return JSON.stringify(a);
    },
    range: function(start, end) {
        let array = [];
        for (let i = start; i <= end; i++) {
            array.push(i);
        }
        return array;
    },
    upperFirstLetter: function(str) {
        return (str[0].toUpperCase() + str.slice(1));
    },
    getDate: function(stamp) {
      let stampList = stamp.split(" ");
      return stampList[1]+ " " +stampList[2] +" "+stampList[3]
    },
    getTime: function(stamp) {
      let stampList= stamp.split(" ");
      return stampList[4];
    },
    convertToAMPM(time24hr) {
        let [hr, min] = time24hr.split(":");
        hr = Number(hr);
        const isPM = hr >= 12;
        if (hr === 0)
            hr = 12;
        else if (hr > 12)
            hr -= 12;
        return isPM ? `${hr}:${min} PM` : `${hr}:${min} AM`;
    }
  }
}));
app.set("view engine", "handlebars");

app.use("/about", (req, res, next) => {
  if (!req.session.user)
    return res.redirect("/");
  next();
});
app.use("/games", (req, res, next) => {
  if (!req.session.user)
    return res.redirect("/");
  next();
});
app.use("/locations", (req, res, next) => {
  if (!req.session.user)
    return res.redirect("/");
  next();
});
app.use("/reviews", (req, res, next) => {
  if (!req.session.user)
    return res.redirect("/");
  next();
});
app.use("/users", (req, res, next) => {
  if (!req.session.user)
    return res.redirect("/");
  next();
});

app.use("/login", (req, res, next) => {
  if (req.session.user)
    return res.redirect("/");
  // req.method = "POST";
  next();
});

app.use("/signup", (req, res, next) => {
  if (req.session.user)
    return res.redirect("/");
  // req.method = "POST";
  next();
});

configRoutesFunction(app);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
