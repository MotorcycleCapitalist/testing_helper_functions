var cookieSesion = require('cookie-session')

const express = require("express");
const bcrypt = require("bcryptjs")

const app = express();
const PORT = 3001; // default port 8080

const {getUserEmail} = require("./helpers.js")

app.use(cookieSesion({
  name: 'session',
  keys: ['tinnyapp'],
}))
app.use(express.urlencoded({ extended: true }));

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123",
  },
};



app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": {
    longURL: "https://www.lighthouselabs.ca",
     userID: "aDlK20"
    },
  "9sm5xK": {
    longURL: "https://www.google.com",
     userID: "lifueD34"
    }, 
};

app.post("/urls", (req, res) => {
 

  const userLogged = req.session.user_id
    if(userLogged){
    const randomId = generateRandomString()
    const longURL = req.body.longURL
    const newURL = {
      [randomId]: {
        longURL: longURL,
        userID: userLogged
    }}
    Object.assign(urlDatabase, newURL)

    res.redirect("/urls"); 
  }else{
   
    res.send("<h3>You should be logged to do this action.</h3>");
  }
});
app.post("/urls/:id/delete", (req, res) => {
  const userLogged = req.session.user_id


  if(userLogged){

    const myURLS = Object.keys(urlDatabase)
    .filter((key) => key == req.params.id)
   if (myURLS.length > 0) {
    delete urlDatabase[req.params.id]

    const templateVars = {  
      user: users[req.session.user_id],
    urls: urlsForUser(userLogged)};
  
    res.render("urls_index", templateVars); // Respond with 'Ok' (we will replace this)
  
   } else {
    res.send("<h3>You dont have access to do this.</h3>");

   }
  }else{
    res.send("<h3>You should be logged to do this action.</h3>");
  }
});
app.post("/urls/:id", (req, res) => {
  const userLogged = req.session.user_id

  if(userLogged){

    const myURLS = Object.keys(urlDatabase)
    .filter((key) => key == req.params.id)
   if (myURLS.length > 0) {
    urlDatabase[req.params.id].longURL = req.body.longURL
    const templateVars = {  
      user: users[req.session.user_id],
    urls: urlsForUser(userLogged)};
  
    res.render("urls_index", templateVars); // Respond with 'Ok' (we will replace this)
  
   } else {
    res.send("<h3>You dont have access to do this.</h3>");

   }
  }else{
    res.send("<h3>You should be logged to do this action.</h3>");
  }
});

app.post("/login", (req, res) => {


  const { email,  password} = req.body
  const userLogin = getUserEmail(email, users)
  if(userLogin){
    if(bcrypt.compareSync(password, users[userLogin].password)){
      req.session.user_id = userLogin
      const templateVars = {  
        user: users[userLogin],
        urls: urlsForUser(userLogin)};
      
       res.render("urls_index",templateVars); 
    }else{
      res.json("403 Invalid credentials")
    }
   
   }else{
    res.json("403 Invalid credentials")
 
   }

});

app.post("/logout", (req, res) => {
  req.session = null;
    const templateVars = {  
   user: null,
   urls: null};
 
  res.render("urls_index",templateVars); // Respond with 'Ok' (we will replace this)
});

app.post("/register", (req, res) => {

  const { password, email } = req.body
  const randomId = generateRandomString()
  const newUser = {
    [randomId]: {
    id: randomId,
    email: email,
    password: bcrypt.hashSync(password, 10),
  }}
  if(email == "" || email == null || password == "" || password == null){
    res.json("400 All fields are required")

 }
  if(getUserEmail(email, users) ){
    res.json("400 User exist")
  }
  Object.assign(users, newUser)
  req.session.user_id = randomId
  const templateVars = { 
    user: users[randomId],
  urls: urlsForUser(randomId)};
  res.render("urls_index", templateVars);

});

app.get("/urls", (req, res) => {
   
  const userLogged = req.session.user_id

  if(userLogged){
    const templateVars = { 
      user: users[req.session.user_id],
      urls: urlsForUser(userLogged)
    };
      res.render("urls_index", templateVars);
  }else{
   
    res.send("<h3>You should be logged to do this action.</h3>");
  }
 
});

app.get("/register", (req, res) => {

  const userLogged = req.session.user_id
  if(userLogged){
    const templateVars = { 
      user: users[userLogged] ,
    urls: urlsForUser(userLogged)};
    res.redirect("/urls")
  }else{
    const templateVars = { 
      user: null ,
    urls: urlsForUser(userLogged)};
    res.render("form.ejs", templateVars);
  }
  
});

app.get("/login", (req, res) => {
  const userLogged = req.session.user_id
  if(userLogged){
    const templateVars = { 
      user: users[userLogged] ,
    urls: urlsForUser(userLogged)};
    res.redirect("/urls")
  }else{
    const templateVars = { 
      user: null ,
    urls: null};
    res.render("login.ejs", templateVars);
  }

})


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]?.longURL
  if (longURL) {
    res.redirect(longURL);

  }else{
    res.send("<h1>This URLs doesn't exists.")
  }
}); 
app.get("/urls/new", (req, res) => {

  const userLogged = req.session.user_id
  if(userLogged){
    const templateVars = { 
      user: users[req.session.user_id],
       id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_new", templateVars);
  }else{
    const templateVars = { 
      user: null ,
    urls: null};
    res.render("login.ejs", templateVars);
  }
 
 
}); 
app.get("/urls/:id", (req, res) => {


  const userLogged = req.session.user_id
  if(userLogged){

    const myURLS = Object.keys(urlDatabase)
    .filter((key) => key == req.params.id)
   if (myURLS.length > 0) {
    const templateVars = { 
      user: users[req.session.user_id],
       id: req.params.id, longURL: urlDatabase[req.params.id]?.longURL };


    res.render("urls_show", templateVars);
   } else {
    res.send("<h3>You dont have access to do this.</h3>");

   }
  }else{
    res.send("<h3>You should be logged to do this action.</h3>");
  }
}); 

app.get("/", (req, res) => {
    res.send("Hello!");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



const generateRandomString = function (){
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  var length = 10
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
    charactersLength));
 }
 return result;
}



const urlsForUser = (id) => {
  const names = Object.keys(urlDatabase)
    .filter((key) =>urlDatabase[key].userID ==id)
    .reduce((obj, key) => {
        return Object.assign(obj, {
          [key]: urlDatabase[key]
        });
  }, {});

  return names
}



