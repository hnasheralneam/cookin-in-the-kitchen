var socket = io();

// Join room
let userInfo = JSON.parse(localStorage.getItem("userInfo"));
userInfo.location = "lobby";

if (userInfo.nickname == "undefined") location.href = window.location.origin;


// Ensure that all user data is up-to-date

socket.emit("get socketid", userInfo.nickname); // If people have the same nickname...
socket.on("here is socketid", (socketid) => {
    let oldSocketId = userInfo.socketid;
    userInfo.socketid = socketid;
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    socket.emit("user data updated", userInfo, oldSocketId);

    if (userInfo.usertype == "leader") socket.emit("leader connecting to room", userInfo);
    else {
        document.querySelector(".waiting-text").textContent = "";
        socket.emit("player joining lobby", userInfo, userInfo.socketid);
    }
});


socket.emit("get roomcode", userInfo.roomname);
socket.on("here is roomcode", (roomcode) => {
    document.querySelector(".roomcode-display").textContent = "Room Code: " + roomcode;
});




// Leader only

socket.on("user in waiting room left", (departingUserSocketId) => {
    let userEl = document.querySelector("#id-" + departingUserSocketId);
    if (userEl) userEl.remove();
});

socket.on("someone in waiting room", (newUserInfo) => {
    if (userInfo.usertype == "leader") {
        let listItem = document.createElement("LI");
        listItem.innerHTML = `
            <p>${newUserInfo.nickname}<p>
            <button>Let in</button>
        `;
        listItem.id = "id-" + newUserInfo.socketid;
        listItem.querySelector("button").onclick = () => { letIn(newUserInfo); }
        document.querySelector(".waiting").append(listItem);
    }
});


// All user events

socket.on("you were kicked out", () => {
    location.href = window.location.origin;
});

socket.on("users in lobby updated", (usersList) => {
    updateUsersList(usersList);
});

socket.on("leader left lobby", () => {
    alert("Leader has left! Sorry, you're being redirected.");
    location.href = window.location.origin;
});



function letIn(newUser) {
    socket.emit("let in", newUser);
}

function kick(newUser) {
    socket.emit("kick", newUser);
}

function updateUsersList(users) {
    document.querySelector(".inRoom").innerHTML = "";
    users.forEach((user) => {
        let listItem = document.createElement("LI");
        listItem.innerHTML = `
            <p>${user.nickname}<p>
            <button>Kick</button>
        `;
        listItem.querySelector("button").onclick = () => { kick(user); }
        if ((userInfo.usertype == "player") || (user.usertype == "leader"))
            listItem.innerHTML = `<p>${user.nickname} ${userInfo.nickname == user.nickname ? "(you)" : ""}<p>`;
        document.querySelector(".inRoom").append(listItem);
    });
}
