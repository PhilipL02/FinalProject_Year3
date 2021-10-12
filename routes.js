const {changePlayer, clearedLevel, checkIfLoggedIn, register, login, add, users, players, delete_level, delete_user} = require("./controller");
const auth = require("./auth");

module.exports = function(app){

  app.post("/register", register);
  app.post("/login", login);
  app.post("/add", add);
  app.post("/changePlayer", changePlayer);
  app.post("/clearedLevel", clearedLevel)
  app.get("/checkIfLoggedIn", auth, checkIfLoggedIn)
  app.get("/users", auth, users);
  app.get("/players", players);
  app.delete("/delete_user", delete_user)
  app.delete("/delete_level", delete_level)

}