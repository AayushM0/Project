function getUsers(){
    const savedUsers = localStorage.getItem("userData");
    if(savedUsers) {return JSON.parse(savedUsers)};
    localStorage.setItem("userData",JSON.stringify(loginData));
    return loginData
}

function getCurrentUser(){
    const currentUser = localStorage.getItem("currentUser");
    if(currentUser) {return JSON.parse(currentUser)}
    return null;
}


function saveUser(users){
    localStorage.setItem("userData",JSON.stringify(users));
}

function saveCurrentUser(user){
    localStorage.setItem("currentUser",JSON.stringify(user));
}

function removeCurrentUser(){
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

function handleLogin(event){
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorbox = document.getElementById("error");
    const users = getUsers();

    const found = users.find(u => u.username === username && u.password === password);

    if(!found){
        errorbox.textContent = "Invalid username or password"
        errorbox.style.display = "block";
        return;
    }

    saveCurrentUser(found);

    window.location.href = "dashboard.html";

}