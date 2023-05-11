var socket = io();

// Join room
let userInfo = JSON.parse(localStorage.getItem("userInfo"));
userInfo.location = "waiting room";

if (userInfo.nickname == "undefined") location.href = window.location.origin;

document.querySelector(".nickname").textContent = userInfo.nickname;

socket.emit("get socketid", userInfo.nickname);
socket.on("here is socketid", (socketid) => {
    userInfo.socketid = socketid;
    localStorage.setItem("userInfo", JSON.stringify(userInfo));

    socket.emit("user data updated", userInfo);
    socket.emit("player connecting to room", userInfo);
});


socket.on("you were let in", (roomname) => {
    location.href = window.location.origin + `/multi/${roomname}`;
});

socket.on("leader left lobby", () => {
    alert("Leader has left! Sorry, you're being redirected.");
    location.href = window.location.origin;
});
