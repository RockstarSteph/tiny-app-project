
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080


// Setting the Express app to use EJS as its templating engine for the HTML
app.set("view engine", "ejs");


//req.body gets data from Form, body-parser will display it
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// function to generate ID for short URL when inputing a long URL on form
// this will be called in our Post route - this is essentiallly what it would provide - urlDatabase[nouveaucodecourt] = valeurduinput
function generateRandomString() {
let randomShortUrlId = Math.random().toString(36).substring(7);
return randomShortUrlId;
}


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//main page diplay - adding a route handler for /urls and res.render to pass to our template
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars); // param 1 file that's outputed to user. 2nd param is what we're passing to the file
});









// Add page - Get route to display new page for adding urls
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


//Post route for form submission to not our main page yet but yet another stupid display page.
//req.body (ties into body parser) - gets data from Form to be able to display it
// data sent to req.body is from this : from our urls_new file - The input tag has an important attribute as well: name. This attribute identifies the data we are sending; in this case, it adds the key longURL to the data we'll be sending in the body of our POST request.
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let cle = generateRandomString()
  urlDatabase[cle] = req.body.longURL
  res.redirect("/urls/"+cle);         // Respond with 'Ok' (we will replace this)
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