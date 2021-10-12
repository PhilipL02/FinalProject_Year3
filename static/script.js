window.onload = function() {
  checkIfLoggedIn(); 
}

const registerForm = document.querySelector(".register form");
const loginForm = document.querySelector(".login form");
const addForm = document.querySelector(".addForm form");
const changePlaForm = document.querySelector(".changePlayer form");

registerForm.addEventListener("submit", register);
loginForm.addEventListener("submit", login);
addForm.addEventListener("submit", addPlayer);
changePlaForm.addEventListener("submit", changePlayer);

function play(){
  showElement(".btnShowAddForm");
  showElement(".btnShowLevels");
  showElement(".btnShowUsers");
  hideElement(".btnHideAddForm");
  hideElement(".btnHideLevels");
  hideElement(".btnHideUsers");
  hideElement(".buttons");
  hideElement(".showLevels");
  hideElement(".showUsers");
  hideElement(".addForm");
  hideElement(".changePlayer");
  showLevels();
}

function closebtnClick(){
  hideElement(".alert");
}

function logOut(){
  try{
    localStorage.clear();
    checkIfLoggedIn();
  
    deleteContent(".main .buttons");

    let alertText = "LOGGED OUT";
    let alertBackground = "orange";
    showAlert(alertText, alertBackground);

    deleteContent(".openLevel div");

    hideElement(".openLevel");
    hideElement(".player");
    hideElement(".main");
    hideElement(".logOut");

    showElement(".divRegLog");

    //Finns bara om användaren är admin
    hideElement(".addForm");
    hideElement(".btnShowLevels");
    hideElement(".btnHideLevels");
    hideElement(".showLevels");
    hideElement(".btnShowAddForm");
    hideElement(".btnHideAddForm");
    hideElement(".btnShowUsers");
    hideElement(".showUsers");
  }
  catch(err){
    console.log(err.message)
  }
}

async function checkIfLoggedIn(){
  try{
    let response = await fetch("/checkIfLoggedIn", {
      method: 'GET',
      headers:{
        "token": localStorage.getItem('token'),
        "id": localStorage.getItem('id')
      }
    });
    response = await response.json()
    console.log(response);

    if(response.loggedIn){
      userLoggedIn(response.user);
    }
    else{
      localStorage.clear();
      showElement(".divRegLog");
    }
  }
  catch(err){
    console.log(err.message);
  }
}

function userLoggedIn(user){
  try{
    registerForm.reset();
    loginForm.reset();

    showElement(".main");

    hideElement(".divRegLog");

    showElement(".logOut");

    let alertText = "WELCOME " + (user.username).toUpperCase();
    let alertBackground = "rgb(22, 218, 22)";
    showAlert(alertText, alertBackground);
  
    showElement(".main .buttons");

    let output = `
      <button class="btnPlay" onclick="play()">Play</button>
    `;
    document.querySelector(".main .buttons").innerHTML = output;

    admin = user.admin;
    console.log(admin);
    if(admin) adminView();
  }
  catch(err){
    console.log(err.message);
  } 
}

async function register(event){
  try{
    event.preventDefault();

    let buttons = document.querySelector(".divRegLog").querySelectorAll("button");
    buttons.forEach(function(button){
      button.disabled = true;
    });

    console.log(this.username.value);
    console.log(this.password.value);

    let data = {username:this.username.value, password:this.password.value};
    data = JSON.stringify(data);
    console.log(data);

    let response = await fetch("/register", {
      method: 'POST',
      body: data,
      headers:{
        "content-type":"application/json"
      }
    });

    buttons.forEach(function(button){
      button.disabled = false;
    });

    response = await response.json();
    console.log(response);

    if(!response.success){
      alertText = response.message.toUpperCase();
      alertBackground = "red";
      showAlert(alertText, alertBackground);
    }

    if(response.token){
      let token = response.token;
      console.log(token);
      let userId = response.user._id;

      localStorage.setItem('token', token);
      localStorage.setItem('id', userId);

      checkIfLoggedIn();
    }
  } 
  catch(err){
    console.log(err.message);
  }
}

async function login(event){
  try{
    event.preventDefault();

    let buttons = document.querySelector(".divRegLog").querySelectorAll("button");
    buttons.forEach(function(button){
      button.disabled = true;
    });

    console.log(this.username.value);
    console.log(this.password.value);

    let data = {username:this.username.value, password:this.password.value};
    data = JSON.stringify(data);
    console.log(data);

    let response = await fetch("/login", {
      method: 'POST',
      body: data,
      headers:{
        "content-type":"application/json"
      }
    });

    buttons.forEach(function(button){
      button.disabled = false;
    });

    response = await response.json();
    console.log(response);
    console.log(response.loggedIn);

    if(response.loggedIn == false){
      let alertText = "LOGIN ERROR";
      let alertBackground = "red";
      showAlert(alertText, alertBackground);
    }
    else if(response.loggedIn){
      let token = response.token;
      console.log(token);
      let userId = response.user._id;
      
      localStorage.setItem('token', token);
      localStorage.setItem('id', userId);

      checkIfLoggedIn();
    }
  }
  catch(err){
    console.log(err.message);
  }
}

function adminView(){
  try{
    let output = `
      <button style="display: none" class="btnShowAddForm" onclick="showAddForm()">Add Player</button>
      <button style="display: none" class="btnHideAddForm" onclick="hideAddForm()">Hide</button>

      <button style="display: none" class="btnShowLevels" onclick="showLevelsOverview()">Show Levels</button>
      <button style="display: none" class="btnHideLevels" onclick="hideLevels()">Hide</button>

      <button style="display: none" class="btnShowUsers"  onclick="showUsers()">Show Users</button>
      <button style="display: none" class="btnHideUsers"  onclick="hideUsers()">Hide</button>
    `;
    document.querySelector(".main .buttons").innerHTML += output;

    showElement(".btnShowAddForm");
    showElement(".btnShowLevels");
    showElement(".btnShowUsers");
  }
  catch(err){
    console.log(err.message);
  }
}

async function addPlayer(event){
  try{
    event.preventDefault();
  
    const formData = new FormData(this);

    let response = await fetch("/add", {
      method: 'POST',
      body: formData
    });
    response = await response.json();
    console.log(response);

    if(response.playerAdded){
      addForm.reset();

      let alertText = "PLAYER'S SUCCESSFULLY ADDED!";
      let alertBackground = "rgb(22, 218, 22)";
      showAlert(alertText, alertBackground);
    }
    else if(!response.playerAdded){
      let alertText = response.message.toUpperCase();
      let alertBackground = "red";
      showAlert(alertText, alertBackground);
    }
  }
  catch(err){
    console.log(err.message);
  }
}

function hideLevels(){
  hideElement(".btnHideLevels");
  hideElement(".changePlayer");
  hideElement(".showLevels");
  showElement(".btnShowLevels");
  deleteContent(".showLevels");
}

function hideUsers(){
  hideElement(".btnHideUsers");
  hideElement(".showUsers");
  showElement(".btnShowUsers");
  deleteContent(".showUsers");
}

async function deleteLevel(id){
  try{
    var result = confirm("Are you sure you want to delete this level?");
    if (result) {
      let response = await fetch("/delete_level?" + id, {
        method: 'DELETE',
        headers:{
          "token": localStorage.getItem('token')
        }
      });

      console.log(await response.json());
      showLevelsOverview();
    }
  }
  catch(err){
    console.log(err.message);
  }
}

function showAddForm(){
  showElement(".addForm");
  showElement(".btnHideAddForm");
  showElement(".btnShowLevels");
  showElement(".btnShowUsers");
  hideElement(".btnHideUsers");
  hideElement(".changePlayer");
  hideElement(".btnHideLevels");
  hideElement(".player");
  hideElement(".btnShowAddForm");
  hideElement(".showLevels");
  hideElement(".showUsers");
}

function hideAddForm(){
  hideElement(".addForm");
  hideElement(".btnHideAddForm");
  showElement(".btnShowAddForm");
}

async function showLevels(){
  try{
    let data = await fetch("/players");
    let players = await data.json();
    console.log(players);

    let levelArray = players.map(function(player){
      return player.level;
    });

    let response = await fetch("/users", {
      method: 'GET',
      headers:{
        "token": localStorage.getItem('token'),
        "id": localStorage.getItem('id')
      }
    });
    
    let user = await response.json();
    let onLevel = user.onLevel;
    console.log(onLevel);
    
    if(!onLevel){
      let alertText = "YOU HAVE TO LOGIN AGAIN TO CONTINUE PLAYING";
      let alertBackground = "red";
      showAlert(alertText, alertBackground);
    }

    showElement(".openLevel");
  
    levelArray.forEach(function(level){
      let output = `
        <button onclick="getLevel()">${level}</button>
      `;
      document.querySelector(".openLevel div").innerHTML += output;
    });

    let buttons = document.querySelector(".openLevel div").querySelectorAll("button");
    buttons.forEach(function(button){
      button.disabled = true;
    });

    for(let i = 0; i<parseInt(onLevel); i++){
      if(buttons[i]) buttons[i].disabled = false;
    }

    let clearedLevels = parseInt(onLevel)-1;
    for(let i = 0; i<clearedLevels; i++){
      buttons[i].style.background = "rgb(150, 255, 112)";
    }
  }
  catch(err){
    console.log(err);
  }
}

function getLevel(){
  let levelNumber = event.target.textContent;
  loadLevel(levelNumber);
}

async function loadLevel(levelNumber){
  try{
    let buttons = document.querySelector(".player .letters").querySelectorAll("button");
      buttons.forEach(function(button){
    button.disabled = false;
    });

    document.querySelector(".player").style.backgroundImage = "url('/backgroundImages/Blue_Background.png')";
    document.querySelector("#name").textContent = "";
  
    deleteContent(".openLevel div");

    document.querySelector(".level_toGetName").textContent = levelNumber;

    let data = await fetch("/players");
    let players = await data.json();
    console.log(players);

    let player = players.filter(function(player){
      return player.level == levelNumber;         
    });

    let activePlayer = player[0];
    if(!activePlayer){
      let alertText = "THERE'S UNFORTUNATELY NO LEVEL " + levelNumber + " RIGHT NOW";
      let alertBackground = "red";
      showAlert(alertText, alertBackground);
      return;
    }

    document.getElementById("playerImg").src = activePlayer.image;
    showElement(".player");
    hideElement(".addForm");
    hideElement(".openLevel");

    let letters = activePlayer.letters;
  
    let btn1 = document.querySelector("#btn1");
    let btn2 = document.querySelector("#btn2");
    let btn3 = document.querySelector("#btn3");
    let btn4 = document.querySelector("#btn4");
    let btn5 = document.querySelector("#btn5");
    let btn6 = document.querySelector("#btn6");
    let btn7 = document.querySelector("#btn7");
    let btn8 = document.querySelector("#btn8");
    let btn9 = document.querySelector("#btn9");
    let btn10 = document.querySelector("#btn10");
    let btn11 = document.querySelector("#btn11");
    let btn12 = document.querySelector("#btn12");
    let btn13 = document.querySelector("#btn13");
    let btn14 = document.querySelector("#btn14");
    let btn15 = document.querySelector("#btn15");
    let btn16 = document.querySelector("#btn16");

    btn1.textContent = letters[0];  
    btn1.value = letters[0]; 
    btn2.textContent = letters[1];  
    btn2.value = letters[1]; 
    btn3.textContent = letters[2];  
    btn3.value = letters[2]; 
    btn4.textContent = letters[3];  
    btn4.value = letters[3]; 
    btn5.textContent = letters[4];  
    btn5.value = letters[4]; 
    btn6.textContent = letters[5];  
    btn6.value = letters[5]; 
    btn7.textContent = letters[6];  
    btn7.value = letters[6]; 
    btn8.textContent = letters[7];  
    btn8.value = letters[7]; 
    btn9.textContent = letters[8];  
    btn9.value = letters[8]; 
    btn10.textContent = letters[9];  
    btn10.value = letters[9]; 
    btn11.textContent = letters[10];  
    btn11.value = letters[10]; 
    btn12.textContent = letters[11];  
    btn12.value = letters[11]; 
    btn13.textContent = letters[12];  
    btn13.value = letters[12]; 
    btn14.textContent = letters[13];  
    btn14.value = letters[13]; 
    btn15.textContent = letters[14];  
    btn15.value = letters[14]; 
    btn16.textContent = letters[15];  
    btn16.value = letters[15]; 
  }
  catch(err){
    console.log(err);
  }
}

function leaveLevel(){
  hideElement(".player");
  hideElement(".openLevel");
  deleteContent(".player .nextLevel");  
  deleteContent(".openLevel div");
  showElement(".buttons");

  document.querySelector(".player").style.backgroundImage = "url('/backgroundImages/Blue_Background.png')";
  document.querySelector("#name").textContent = "";

  let buttons = document.querySelector(".player .letters").querySelectorAll("button");
  buttons.forEach(function(button){
    button.disabled = false;
  });
}

function removeLastCharacter(){
  let text = document.getElementById("name").innerHTML;
  let newText = text.slice(0, -1);
  document.getElementById("name").innerHTML = newText;
}

async function check(){
  try{
    let buttons = document.querySelector(".player .letters").querySelectorAll("button");
    buttons.forEach(function(button){
      button.disabled = true;
    });

    let data = await fetch("/players");
    let players = await data.json();

    let level = document.querySelector(".level_toGetName").textContent;
  
    let player = players.filter(function(player){
      return player.level == level;         
    });

    let guess = document.querySelector("#name").textContent;
    if(player[0].name.toUpperCase() == guess) correctPlayer(level);
    else if(player[0].name.toUpperCase() != guess){
      buttons.forEach(function(button){
        button.disabled = false;
      });
    }
  }
  catch(err){
    console.log(err);
  }
}

async function correctPlayer(level){
  try{
    let response = await fetch("/clearedLevel", {
      method: 'POST',
      headers:{
        "level": level,
        "id": localStorage.getItem('id')
      }
    });

    document.querySelector(".player").style.backgroundImage = "url('/backgroundImages/Green_Background.jpg')";
    let nextButton = `
      <button class="btnNextLevel" onclick='loadNextLevel(${level})'>Next Level</button>
    `;
    document.querySelector(".player .nextLevel").innerHTML += nextButton;
  }
  catch(err){
    console.log(err);
  }
}

function loadNextLevel(level){
  deleteContent(".player .nextLevel");
  console.log(level);
  let nextLevel = level+1;
  loadLevel(nextLevel);
}

function newLetter(){
  let letter = window.event.target.value;
  document.getElementById("name").innerHTML += letter;
}

async function showLevelsOverview(){
  try{
    let response = await fetch("/players", {
      method: 'GET',
      headers:{
        "token": localStorage.getItem('token')
      }
    });

    response = await response.json();
    if(response.message){
      let alertText = "YOU HAVE TO LOGIN AGAIN TO ACCESS THIS";
      let alertBackground = "red";
      showAlert(alertText, alertBackground);
      return;
    }
    let players = response;
    console.log(players);
    printLevelsOverview(players);
  }
  catch(err){
    console.log(err);
  }
}

function printLevelsOverview(levels){
  showElement(".btnHideLevels");
  hideElement(".btnShowLevels");

  deleteContent(".showLevels");
  hideElement(".addForm");
  hideElement(".btnHideAddForm");
  hideElement(".btnShowLevels");
  hideElement(".btnHideUsers");
  hideElement(".player");
  hideElement(".showUsers");
  showElement(".showLevels");
  showElement(".btnShowUsers");
  showElement(".btnHideLevels");
  showElement(".btnShowAddForm");

  levels.forEach(function(level){
    let output = `
      <div id = "${level._id}" class="levelOverview">
        <h1>Level: ${level.level}</h1>
        <h3>${level.name}</h3>
        <i>${level.image}</i>
        <div class="levelOButtons">
          <button onclick='changePlayerForm("${level._id}")'>Change Player</button>
          <button onclick='deleteLevel("${level._id}")'>Delete Level</button>
        </div>
      </div>
    `;
    document.querySelector(".showLevels").innerHTML += output;
  });
}

async function showUsers(){
  try{
    let response = await fetch("/users", {
      method: 'GET',
      headers:{
        "token": localStorage.getItem('token')
      }
    });

    response = await response.json();
    if(response.message){
      let alertText = "YOU HAVE TO LOGIN AGAIN TO ACCESS THIS";
      let alertBackground = "red";
      showAlert(alertText, alertBackground);
      return;
    }

    let users = response;
    console.log(users);

    deleteContent(".showUsers");
    hideElement(".showLevels");
    hideElement(".changePlayer");
    hideElement(".addForm");
    hideElement(".btnHideAddForm");
    hideElement(".btnShowUsers");
    hideElement(".btnHideLevels");
    hideElement(".player");
    showElement(".btnShowLevels");
    showElement(".btnHideUsers");
    showElement(".btnShowAddForm");
    showElement(".showUsers");

    users.forEach(function(user){
      let username = user.username;
      if(user.username.length>10) username = (username.substring(0, 10))+"...";
      let output = `
        <div id = "${user._id}" class="userOverview">
          <h3>${username}</h3>
          <p>On level: ${user.onLevel}</p>
          <div class="userOButtons">
            <button onclick='deleteUser("${user._id}")'>Delete User</button>
          </div>
        </div>
      `;
      document.querySelector(".showUsers").innerHTML += output;
    });
  }
  catch(err){
    console.log(err.message);
  }
}

async function deleteUser(id){
  try{
    var result = confirm("Are you sure you want to delete this user?");
    if (result) {
      let response = await fetch("/delete_user", {
        method: 'DELETE',
        headers:{
          "token": localStorage.getItem('token'),
          "delete_id": id,
          "user_id": localStorage.getItem('id')
        }
      });
      response = await response.json();
      console.log(response);
      if(response.success){
        showUsers();
      }
      else if(!response.success){
        let alertText = response.message.toUpperCase();
        let alertBackground = "red";
        showAlert(alertText, alertBackground);
      }
    }
  }
  catch(err){
    console.log(err.message);
  }
}

async function changePlayerForm(id){
  try{
    console.log("changePlayer");

    let response = await fetch("/players", {
      method: 'GET',
      headers:{
        "token": localStorage.getItem('token'),
        "id": id
      }
    });

    let player = await response.json();
    console.log(player);

    showElement(".changePlayer");
    document.querySelector(".changePlayer #level").value = player.level;
  }
  catch(err){
    console.log(err.message);
  }
}

async function changePlayer(event){
  try{
    event.preventDefault();
  
    const formData = new FormData(this);

    let response = await fetch("/changePlayer", {
      method: 'POST',
      body: formData
    });
    response = await response.json();
    console.log(response);

    if(response.playerAdded){
      changePlaForm.reset();

      let alertText = "PLAYER'S SUCCESSFULLY CHANGED";
      let alertBackground = "rgb(22, 218, 22)";
      showAlert(alertText, alertBackground);

      showLevelsOverview();
      document.querySelector(".changePlayer").style.display = "none";
    }
  }
  catch(err){
    console.log(err.message);
  }
}

function showAlert(text, background){
  const newAlert = document.querySelector(".alert");
  const alertText = document.querySelector(".alert strong");
  alertText.textContent = text
  newAlert.style.background = background;
  newAlert.style.display = "block";
  setTimeout(function(){newAlert.style.display="none"},5000);
}

function hideElement(element){
  try{
    if(element) document.querySelector(element).style.display = "none";
    else return
  }
  catch(err){
    console.log(err.message);
  }
}

function showElement(element){
  try{
    if(typeof element != null) document.querySelector(element).style.display = "block";
  }
  catch(err){
    console.log(err.message);
  }
}

function deleteContent(element){
  try{
    if(element) document.querySelector(element).innerHTML = "";
  }
  catch(err){
    console.log(err.message);
  }
}
