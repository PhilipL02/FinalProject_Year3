const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var fs = require("fs");
module.exports = {changePlayer, clearedLevel, checkIfLoggedIn, register, login, add, users, players, delete_level, delete_user}

async function checkIfLoggedIn(req, res){
  try{
    let id = req.headers.id;
    dbUser = await req.users.findOne({"_id":ObjectId(id)});
    res.send({message: "User is logged in", loggedIn: true, user: dbUser});
  }
  catch(err){
    console.log(err.message)
    res.send({message: "Not logged in", loggedIn: false});
  }
}

async function clearedLevel(req, res){
  try{
    let id = req.headers.id;
    let level = req.headers.level;
    let onLevel = 1+parseInt(level);
    user = await req.users.findOne({"_id":ObjectId(id)});
    console.log(user);

    if(user.onLevel>onLevel) return res.send({message:"User has already cleared this level"});

    var myquery = {"_id":ObjectId(id)};
    var newvalues = { $set: {"username": user.username, "password": user.password, "onLevel": onLevel, "admin": user.admin} };
    req.users.updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
      console.log("onLevel updated");
    });
    res.send({user});
  }
  catch(err){
    console.log(err);
  }
}

async function delete_user(req, res){
  try{
    let userId = req.headers.user_id;
    console.log(userId);

    let deleteId = req.headers.delete_id;
    console.log(deleteId);

    if(userId==deleteId) return res.send({message: "You can't delete yourself!", success: false})

    let loggedInUser = await req.users.findOne({"_id":ObjectId(userId)});
    console.log(loggedInUser);

    if(loggedInUser.admin){

      let deleteUser = await req.users.findOne({"_id":ObjectId(deleteId)});
      console.log(deleteUser);

      await req.users.deleteOne(deleteUser);
      res.send({message: "The user: " + deleteUser.username + " has been deleted", success: true});

    }
    else if(!loggedInUser.admin){
      res.send({message: "User is not admin", success: false});
    }
  }
  catch(err){
    console.log(err);
  }
}

async function delete_level(req, res){
  try{
    let id = req._parsedUrl.query;
    console.log(id);
  
    let player = await req.players.findOne({"_id":ObjectId(id)});
    await console.log(player);

    fs.unlink('./images/'+player.image,function(err){
        if(err) return console.log(err);
        console.log('file deleted successfully');
    });

    await req.players.deleteOne(player);
    res.send({message: "The player: " + player.name + " has been deleted"});
  }
  catch(err){
    console.log(err);
  }
}

async function users(req, res){
  try{
    if(req.headers.id){
      let id = req.headers.id
      res.send(await req.users.findOne({"_id":ObjectId(id)}));
    }
    else res.send(await req.users.find().toArray());
  }
  catch(err){
    console.log(err.message);
  }
}

async function players(req, res){
  try{
    let levels = await req.players.find().toArray();
    //SORTERA I ORDER (LÄGST LEVEL FÖRST)
    levels = levels.sort((firstItem, secondItem) => firstItem.level - secondItem.level);
    if(req.headers.id){
      let id = req.headers.id;
      res.send(await req.players.findOne({"_id":ObjectId(id)}));
    }
    else res.send(levels);
  }
  catch(err){
    console.log(err.message);
  }
}

async function register(req, res){
  try{
    let user = {"username": req.body.username, "password": req.body.password, "onLevel": "1", "admin": false};

    //Kolla om användarnamnet är upptaget
    let dbUser = await req.users.findOne({username:user.username});
    if(dbUser) return res.send({message: "The username is already taken", success: false});
   
    bcrypt.hash(user.password, 12, async function(err, hash){
      if(err) return res.send({message: "Error when trying to register", success: false});
      user.password = hash;
    });

    //Lägg till användare i databas
    await req.users.insertOne(user);
    dbUser = await req.users.findOne({username:user.username});
    let {_id} = dbUser;
    let token = jwt.sign({_id},process.env['secret'],{expiresIn:600});
    console.log(dbUser);
    res.send({message:"The user " + dbUser.username + " has been created", user: dbUser, token, success: true});
  }
  catch(err){
    res.send({message: err.message});
  }
}

async function login(req, res){
  try{
    let user = req.body;

    let dbUser = await req.users.findOne({username:user.username});
    if(!dbUser) return res.send({message: "No user found", loggedIn: false});

    bcrypt.compare(user.password, dbUser.password , function(err, result){
      if(err) return res.send({message: "Compare error", loggedIn: false});
      if(!result) return res.send({message: "Wrong password", loggedIn: false});

      let {_id} = dbUser;
      let token = jwt.sign({_id},process.env['secret'],{expiresIn:600});
      console.log(dbUser);
      res.send({message:"Logged in", loggedIn: true, token, user: dbUser})
    });

    
  }
  catch(err){
    res.send({message: err.message})
  }
}

async function add(req, res){
  try{
    let newPlayer = req.body;
    let dbPlayer = await req.players.findOne({name:newPlayer.name});
    if(dbPlayer) return res.send({message:"A player with that name already exists", playerAdded: false});

    dbPlayer = await req.players.findOne({level:newPlayer.level});
    if(dbPlayer) return res.send({message: "That level already has a player added to it", playerAdded: false});

    let image = req.files.image;
    let imageName = image.name;

    dbPlayer = await req.players.findOne({image:imageName});
    if(dbPlayer) return res.send({message: "A image with that name already exists", playerAdded: false});

    image.mv(__dirname + /images/ + imageName, function(err){
      if(err) return res.send(err.message);
    });

    //Skapa ett fält med alla bokstäver som ska tillhöra spelaren och leveln
    let nameLength = newPlayer.name.length;
    let charactersLeft = 16-nameLength;
    let name = newPlayer.name.toUpperCase();
    let chars = [...name];
  
    let length = charactersLeft;
    charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';    
    var randomString = '';
    for (var i = 0; i < length; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    newChars = randomString.split('');

    let letterArray = chars.concat(newChars);

    //Blandar fältet
    var currentIndex = letterArray.length,  randomIndex;

    while (0 !== currentIndex) {

      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [letterArray[currentIndex], letterArray[randomIndex]] = 
      [letterArray[randomIndex], letterArray[currentIndex]];
    } 
    
    let player = {"name": req.body.name, "image": imageName, "level": req.body.level, "letters": letterArray};

    req.players.insertOne(player);
    res.send({message: "The player " + player.name + " is added", "letters": letterArray, playerAdded: true});
  }
  catch(err){
    res.send({message: err.message});
    console.log(err.message);
  }
}

async function changePlayer(req, res){
  try{
    let newPlayer = req.body;

    let dbPlayer = await req.players.findOne({name:newPlayer.name});
    if(dbPlayer) return res.send({message:"A player with that name already exists"});

    let image = req.files.image;
    let imageName = image.name;

    dbPlayer = await req.players.findOne({image:imageName});
    if(dbPlayer) return res.send({message: "A image with that name already exists"});

    dbPlayer = await req.players.findOne({level:newPlayer.level});
    if(!dbPlayer) return res.send({message: "That level doesn't have a player"});

    fs.unlink('./images/'+dbPlayer.image,function(err){
      if(err) return console.log(err);
      console.log('file deleted successfully');
    });

    image.mv(__dirname + /images/ + imageName, function(err){

      if(err) return res.send(err.message);

    });

    //Skapa ett fält med alla bokstäver som ska tillhöra spelaren och leveln
    let nameLength = newPlayer.name.length;
    let charactersLeft = 16-nameLength;
    let name = newPlayer.name.toUpperCase();
    let chars = [...name];
  
    let length = charactersLeft;
    charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';    
    var randomString = '';
    for (var i = 0; i < length; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    newChars = randomString.split('');

    let letterArray = chars.concat(newChars);

    //Blandar fältet
    var currentIndex = letterArray.length,  randomIndex;

    while (0 !== currentIndex) {

      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [letterArray[currentIndex], letterArray[randomIndex]] = 
      [letterArray[randomIndex], letterArray[currentIndex]];
    } 

    let player = {"name": req.body.name, "image": imageName, "level": req.body.level, "letters": letterArray};

    var myquery = {"level":player.level};
    var newvalues = { $set: {"name": req.body.name, "image": imageName, "level": req.body.level, "letters": letterArray} };
    req.players.updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
      console.log("One player updated");
    });
    console.log(player);
    res.send({message: "The player " + player.name + " is added", "letters": letterArray, playerAdded: true});
  }
  catch(err){
    res.send({message: err.message});
    console.log(err.message);
  }      
}