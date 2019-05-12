
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
// Setting the Express app to use EJS as its templating engine for the HTML
app.set("view engine", "ejs");

const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  //keys: [/* secret keys */],
  secret: 'TinyApp',
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))



//req.body gets data from Form, body-parser will display it
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Cookie-parser replaced with cookie-session for cookie encryption
//const cookieParser = require('cookie-parser')
//app.use(cookieParser());

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


function addShortURLtoDatabase(id, surl, lurl){
  let userId = req.session['user-id']
let shortUrl = req.params.shortURL
let longUrl = req.body.longURL
urlDatabase[shortUrl] = { longURL:longUrl, userID: userId };
}

function urlsForUser(id){
  const allUrlsForUser = {};
  for (key in urlDatabase){
    if (id === urlDatabase[key].userID){
      allUrlsForUser[key]=urlDatabase[key];
    }
  }
  console.log("id ",id)
  console.log('all ', allUrlsForUser)
  return allUrlsForUser
};


//

const findUser = email => Object.values(usersDatabase).find(userObjFromDb => userObjFromDb.email === email);
// const checkPassword = email => Object.values(usersDatabase).find(userObj => {
//   if (userObj.email === email) {
//     console.log("userObj.password :",userObj.password)
//     password = userObj.password;
//     return password
//   }
// });



// var urlDatabase = {
//   "b2xVn2": {"http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

var urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  let id = req.session['user-id'];
  let templateVars = { urls: urlsForUser(id), user: usersDatabase[req.session['user-id']]};

   // res.render("urls_index", templateVars); param 1 file that's outputed to user. 2nd param is what we're passing to the file


  if (req.session['user-id']) {
    res.render("urls_index", templateVars);
    // let userId = req.cookies['user-id']
    // let shortUrl = generateRandomString()
    // let longUrl = req.body.longURL
    // urlDatabase[shortUrl] = { longURL:longUrl, id: userId };
    // console.log(urlDatabase)
} else {
  res.redirect('login');
  res.send("You need to login to see your URLs")
}
});




app.post("/logout", (req, res) =>{
  //res.cookie('user-id', null);
  //res.clearCookie('name', { path: '/admin' });
  req.session = null;
  //req.session.destroy();
 // res.clearCookie('user-id');
  res.redirect("/login");
})

//adding a Edit function /update short link and redirect to main page
app.post("/urls/:shortURL/edit", (req, res) =>{
  let shortUrl = req.params.shortURL
  if (req.session['user-id'] === urlDatabase[shortUrl]['userID']) {

  //console.log(req.params.shortURL, req.body.longURL)
  urlDatabase[shortUrl].longURL = req.body.longURL;

  res.redirect("/urls") } else {
    res.redirect("/login")
  }
});

// Add page - Get route to display new page for adding urls
app.get("/urls/new", (req, res) => {
let templateVars = { user: usersDatabase[req.session['user-id']]};
  if (req.session['user-id']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

  //res.render("urls_new", templateVars);
});




// add the page for login - get route to display the login page
app.get("/login", (req, res) => {
  let templateVars = { user: usersDatabase[req.session['user-id']]};
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
 // console.log("email :", email)
  // console.log("password :", findUser(email).password);
  const hashedPassword = findUser(email).password;

  // verifying password match with hashing upon login
  if (bcrypt.compareSync(password, hashedPassword)){

    //setting the cookie
    //req.cookie('user-id', findUser(email).id);
    req.session['user-id'] = findUser(email).id;
    res.redirect("/urls");
  } else {

    res.status(403).send("Incorrect Password");
  }


});

// add the page for registration - get route to display the login page
app.get("/registration", (req, res) => {
  let templateVars = { user: usersDatabase[req.session['user-id']]};
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



  // add new user to the Database with a hashed password
  let userId = addUserToDb(email, bcrypt.hashSync(password, 10));

  req.session['user-id'] = userId;

  console.log(usersDatabase);
  res.redirect("/urls");

});

// /u/:ShortURL, get the longURL + redirect



//Post route for form submission to not our main page yet but another display page.
//req.body (ties into body parser) - gets data from Form to be able to display it
// data sent to req.body is from this : from our urls_new file - The input tag has an important attribute as well: name. This attribute identifies the data we are sending; in this case, it adds the key longURL to the data we'll be sending in the body of our POST request.
// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   let cle = generateRandomString();
//   urlDatabase[cle] = req.body.longURL
//   res.redirect("/urls/"+cle);         // Respond with 'Ok' (we will replace this)
// });

app.post("/urls", (req, res) => {
    let userId = req.session['user-id']
    let shortUrl = generateRandomString()
    let longUrl = req.body.longURL
    urlDatabase[shortUrl] = { longURL:longUrl, userID: userId };
    console.log(urlDatabase)
    res.redirect("/urls")

});

app.get("/u/:shortURL", (req, res) =>{
  //urlDatabase[shortUrl]
  let shortURL =  req.params.shortURL
  let externalSite = urlDatabase[shortURL]["longURL"];
  //urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(externalSite);
});

// adding a delete button on main page for each key/value pair representing short link & long link
// we're not in the body donc pas req.body - on est dans l'addresse url de la page thats why req.params - parametre de notre requete
app.post("/urls/:shortURL/delete", (req, res) => {

if (req.session['user-id'] === urlDatabase[req.params.shortURL].userID){
  delete urlDatabase[req.params.shortURL];
}


//what's our input
// what's our output
// where to say it's a button
res.redirect("/urls")
});




// route + render short URL to Long URL
// wild card - any key in our app.
app.get("/urls/:shortURL", (req, res) => {
  const shortUrlParam = req.params.shortUrl;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortUrlParam], user: usersDatabase[req.session['user-id']] };

  //addUserIdtoUrlDatabase()

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