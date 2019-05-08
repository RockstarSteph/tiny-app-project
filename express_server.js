
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

// Setting the Express app to use EJS as its templating engine for the HTML
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//adding a route handler for /urls and res.render to pass to our template
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars); // param 1 file that's outputed to user. 2nd param is what we're passing to the file
});

// route + render short URL to Long URL
app.get("/urls/:shortURL", (req, res) => {
  const shortUrlParam = req.params.shortUrl;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortUrlParam] };
  res.render("urls_show", templateVars);
});

// registers a handler on the root path "/"
//whenever browser goes to url - registers req and sends Hello as response.
app.get("/", (req, res) => {
  res.send("Hello!");
});


// other URi / route on a get req specifically on path /url.json
// we can see the response - the database - will be in json so string
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// other route
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});