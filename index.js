const { MongoClient } = require("mongodb");
const express = require("express");
const fu = require("express-fileupload");

const uri = process.env['mongo'];

const client = new MongoClient(uri,{useUnifiedTopology: true });

async function run() {
  try {
    
    await client.connect();
    
    const databaseSlutprojekt = client.db('Slutprojekt');
    const users = databaseSlutprojekt.collection('Users');
    const players = databaseSlutprojekt.collection('Players');
    
    const app = express();

    app.use(function (req, res, next){
      req.users = users;
      req.players = players;
      next();
    });

    app.use(express.static(__dirname +"/static"));
    app.use(fu());
    app.use(express.urlencoded({extended:false}));
    app.use(express.json());

    var images = require('path').join(__dirname,'/images');
    app.use(express.static(images));

    require("./routes")(app);

    app.listen(3400);

  } 
  catch(error)
   {
     console.log(error.message);
  }
}
run();
