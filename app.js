const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const uuid = require("uuid");

app.set("view engine", "ejs");

app.use("/Scripts", express.static("Scripts"));
app.use("/Styles", express.static("Styles"));
app.use("/Images", express.static("Images"));

let rooms = [];
io.on("connection", (socket) => {
    let userData = {}
    socket.on("user data updated", (userInfo, oldSocketId) => {
        userData = userInfo;

        let indexInRooms = rooms.findIndex(room => room.info.name === userData.roomname);
        let indexInUsers = rooms[indexInRooms]["users"].findIndex(user => user.socketid == oldSocketId);
        if (indexInUsers != -1) rooms[indexInRooms]["users"][indexInUsers] = userData;
        io.in(rooms[indexInRooms]["info"].name).emit("users in lobby updated", rooms[indexInRooms]["users"]);
    });


    socket.on("disconnect", () => {
        if (userData.usertype == "leader") {
            let indexInRooms = rooms.findIndex(room => room.info.name === userData.roomname);
            io.in(rooms[indexInRooms]["info"].name).emit("leader left lobby", rooms[indexInRooms]["users"]);
        }
        else if (userData.location == "waiting room") {
            let indexInRooms = rooms.findIndex(room => room.info.name === userData.roomname);
            let leaderData = rooms[indexInRooms]["users"].filter(obj => obj.usertype == "leader");
            io.to(leaderData[0].socketid).emit("user in waiting room left", socket.id);
        }
        else if (userData.location == "lobby") {
            let indexInRooms = rooms.findIndex(room => room.info.name === userData.roomname);
            let indexInUsers = rooms[indexInRooms]["users"].findIndex(user => user.socketid == userData.socketid);
            if (indexInUsers != -1) rooms[indexInRooms]["users"].splice(indexInUsers, 1);
            io.in(rooms[indexInRooms]["info"].name).emit("users in lobby updated", rooms[indexInRooms]["users"]);
        }
    });


    // THIS PROGRAM HAS NOT BEEN TESTED WITH MULTIPLE ROOMS!
    socket.on("create room", () => {
        let roomid = uuid.v4();
        rooms.push({
            info: {
                name: roomid,
                code: Math.floor(100000 + Math.random() * 900000),
                open: true
            },
            users: []
        });
        socket.emit("room created", {
            socketid: socket.id,
            roomname: roomid,
            usertype: "leader"
        });
    });
    socket.on("get roomcode", (roomid) => {
        let indexInRooms = rooms.findIndex(room => room.info.name == roomid);
        let roomcode = rooms[indexInRooms].info.code;

        socket.emit("here is roomcode", roomcode);
    });
    socket.on("get socketid", () => {
        socket.emit("here is socketid", socket.id);
    });

    socket.on("join room", (roomcode) => {
        let room = rooms.find(room => room.info.code == roomcode);
        if (room && (room.info.open == true)) {
            socket.emit("joined room", {
                socketid: socket.id,
                roomname: room.info.name,
                usertype: "player"
            });
        }
        else if (room) socket.emit("no such room", "room is closed");
        else socket.emit("no such room", "room does not exist");
    });

    socket.on("leader connecting to room", (userInfo) => {
        let indexInRooms = rooms.findIndex(room => room.info.name === userInfo.roomname);
        rooms[indexInRooms]["users"].push(userInfo);

        socket.join(userInfo.roomname);
        io.in(rooms[indexInRooms]["info"].name).emit("users in lobby updated", rooms[indexInRooms]["users"]);
    });
    socket.on("player connecting to room", (userInfo) => {
        socket.join(userInfo.roomname);
        io.in(userInfo.roomname).emit("someone in waiting room", userInfo);
    });
    socket.on("player joining lobby", (userInfo, socketid) => {
        // Adds user to socket room
        let indexInRooms = rooms.findIndex(room => room.info.name === userInfo.roomname);
        socket.join(userInfo.roomname);

        // Sends to all in room
        io.in(rooms[indexInRooms]["info"].name).emit("users in lobby updated", rooms[indexInRooms]["users"]);
    });

    socket.on("let in", (newUser) => {
        // Finds room and adds new user's data
        let indexInRooms = rooms.findIndex(room => room.info.name === newUser.roomname);
        rooms[indexInRooms]["users"].push(newUser);

        // Respond only to socket in waiting room
        io.to(newUser.socketid).emit("you were let in", rooms[indexInRooms]["info"]["name"]);
    });
    socket.on("kick", (newUser) => {
        let indexInRooms = rooms.findIndex(room => room.info.name === newUser.roomname);
        let indexInUsers = rooms[indexInRooms]["users"].findIndex(user => user.socketid == newUser.socketid);
        rooms[indexInRooms]["users"].splice(indexInUsers, 1);

        // Sends only to socket to be kicked out
        io.to(newUser.socketid).emit("you were kicked out");
        // Sends to all in room
        io.in(rooms[indexInRooms]["info"].name).emit("users in lobby updated", rooms[indexInRooms]["users"]);
    });
});


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/play", (req, res) => {
    res.render("fastfood");
});

app.get("/multi/:roomname", (req, res) => {
    let roomname = req.params.roomname;
    res.render("lobby");
});

app.get("/multi/:roomname/waiting-room", (req, res) => {
    let roomname = req.params.roomname;
    res.render("waiting");
});


server.listen(3000, () => {
    console.log("Started");
});
