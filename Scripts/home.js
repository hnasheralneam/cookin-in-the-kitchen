var socket = io();

localStorage.setItem("userInfo", JSON.stringify({ }));

function openModal(name) {
    let modal = document.querySelector(`.${name}-room`);
    if (modal.style.opacity == 1) {
        modal.style.opacity = 0;
        modal.style.pointerEvents = "none";
    }
    else {
        modal.style.opacity = 1;
        modal.style.pointerEvents = "auto";
    }
}

let nickname;

function joinRoom() {
    event.preventDefault();
    nickname = document.querySelector(".join-form").querySelector(".nickname").value;
    roomcode = document.querySelector(".join-form").querySelector(".roomcode").value;
    socket.emit("join room", roomcode);
}

function createRoom() {
    event.preventDefault();
    nickname = document.querySelector(".create-form").querySelector(".nickname").value;
    socket.emit("create room", nickname);
}

socket.on("room created", (data) => {
    localStorage.setItem("userInfo", JSON.stringify({
        nickname: nickname,
        socketid: data.socketid,
        roomname: data.roomname,
        usertype: data.usertype,
        location: "home"
    }));
    location.href = location.href + `/multi/${data.roomname}`;
});

socket.on("joined room", (data) => {
    localStorage.setItem("userInfo", JSON.stringify({
        nickname: nickname,
        socketid: data.socketid,
        roomname: data.roomname,
        usertype: data.usertype,
        location: "home"
    }));
    location.href = location.href + `/multi/${data.roomname}/waiting-room`;
});

socket.on("no such room", (errorMessage) => {
    document.querySelector(".error-place").textContent = errorMessage;
});