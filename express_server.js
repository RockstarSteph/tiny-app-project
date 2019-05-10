
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const uuid = require('uuid/v4');

// Setting the Express app to use EJS as its templating engine for the HTML
app.set("view engine", "ejs");


//req.body gets data from Form, body-parser will display it
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser());

// function to generate ID for short URL when inputing a long URL on form
// this will be called in our Post route - this is essentiallly what it would provide - urlDatabase[nouveaucodecourt] = valeurduinput
function generateRandomString() {
let randomShortUrlId = Math.random().toString(36).substring(7);
return randomShortUrlId;
}




 //

function addUserToDb(email, password){
  let userId = generateRandomString();
  usersDatabase[userId] = {id: userId, email,password};
  return userId;
}



//

const findUser = email => Object.values(usersDatabase).find(userObj => userObj.email === email);
// const checkPassword = email => Object.values(usersDatabase).find(userObj => {
//   if (userObj.email === email) {
//     console.log("userObj.password :",userObj.password)
//     password = userObj.password;
//     return password
//   }
// });



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//main page diplay - adding a route handler for /urls and res.render to pass to our template
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: usersDatabase[req.cookies['user-id']]};
  res.render("urls_index", templateVars); // param 1 file that's outputed to user. 2nd param is what we're passing to the file
});




app.post("/logout", (req, res) =>{
  //res.cookie('user-id', null);
  //res.clearCookie('name', { path: '/admin' });
  res.clearCookie('user-id');
  res.redirect("/login");
})

//adding a Edit function /update short link and redirect to main page
app.post("/urls/:shortURL/edit", (req, res) =>{
let shortUrl = req.params.shortURL
console.log(req.params.shortURL, req.body.longURL)
urlDatabase[shortUrl] = req.body.longURL;

res.redirect("/urls")
});

// Add page - Get route to display new page for adding urls
app.get("/urls/new", (req, res) => {
  let templateVars = { user: usersDatabase[req.cookies['user-id']]};
  res.render("urls_new", templateVars);
});


// add the page for login - get route to display the login page
app.get("/login", (req, res) => {
  let templateVars = {feeling:"cloudy with chance of meatballs", user: usersDatabase[req.cookies['user-id']]};
  res.render("login", templateVars);
});

// login page with submit form
app.post("/login", (req, res) => {

 const {email, password} = req.body;
  // let username = req.body.username
  // let email = req.body.email;
  // let password = req.body.password;

  // find user in the Database
  //if (userId)
  console.log({email,password});

  if (!findUser(email)){
    res.status(403).send("Email not found. You need to register to create your account!");
  }
  console.log("email :", email)
  console.log("password :", findUser(email).password);
  if (password !== findUser(email).password){
    res.status(403).send("Incorrect Password");
  }
  else {
    //const userId = addUserToDb(email,password)
    res.cookie('user-id', findUser(email).id);
    res.redirect("/urls");
  }
  //console.log(usersDatabase);

});

// add the page for registration - get route to display the login page
app.get("/registration", (req, res) => {
  let templateVars = { user: usersDatabase[req.cookies['user-id']]};
  res.render("registration",templateVars);
});

//Post route to login page for page to exit with our login form

app.post("/registration", (req, res) => {

 const {email, password} = req.body;
  // let username = req.body.username
  // let email = req.body.email;
  // let password = req.body.password;

  if (email===""){
    res.status(400).send("Email can't be empty");
  };
  if (password===""){
    res.status(400).send("Password can't be empty");
  };
  if (findUser(email)){
    res.status(400).send("email already exists. Login instead.");
  }


  // add new user to the Database
  let userId = addUserToDb(email, password);
  res.cookie('user-id', userId);

  console.log(usersDatabase);
  res.redirect("/urls");

});

// /u/:ShortURL, get the longURL + redirect



//Post route for form submission to not our main page yet but yet another stupid display page.
//req.body (ties into body parser) - gets data from Form to be able to display it
// data sent to req.body is from this : from our urls_new file - The input tag has an important attribute as well: name. This attribute identifies the data we are sending; in this case, it adds the key longURL to the data we'll be sending in the body of our POST request.
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let cle = generateRandomString();
  urlDatabase[cle] = req.body.longURL
  res.redirect("/urls/"+cle);         // Respond with 'Ok' (we will replace this)
});


// adding a delete button on main page for each key/value pair representing short link & long link
// we're not in the body donc pas req.body - on est dans l'addresse url de la page thats why req.params - parametre de notre requete
app.post("/urls/:shortURL/delete", (req, res) => {
console.log(req.params.shortURL, urlDatabase[req.params.shortURL]);
delete urlDatabase[req.params.shortURL];
//what's our input
// what's our output
// where to say it's a button
res.redirect("/urls")
});




// route + render short URL to Long URL
// wild card - any key in our app.
app.get("/urls/:shortURL", (req, res) => {
  const shortUrlParam = req.params.shortUrl;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortUrlParam], user: usersDatabase[req.cookies['user-id']] };
  console.log(urlDatabase[shortUrlParam]);
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