//SETUP EXPRESS
const express = require(`express`);
const app = express();
const port = process.env.PORT || 3000;
const path = require(`path`);
const publicDirPath = path.join(__dirname, `../public`);

//SETUP FOR SOCKET.IO
const http = require(`http`);
const server = http.createServer(app);
const socketio = require(`socket.io`);
const io = socketio(server);

const Filter = require(`bad-words`);
const { generateMessage, generateLocationMessage } = require(`./utils/messages`);
const { addUser, removeUser, getUser, getUsersInRoom } = require(`./utils/users`);

app.use(express.static(publicDirPath));

// let count = 0;

//SETUP EVENT FOR CONNECTION
io.on(`connection`, (socket) => {
    console.log(`new websocket connection`);
    //SETUP CHAT CONNECTION COUNT
    //countUpdated = SERVER(EMIT) => CLIENT(RECEIVE)
    //increment = CLIENT(EMIT) => SERVER(RECEIVE)
    // socket.emit(`countUpdated`, count);
    // socket.on(`increment`, () => {
    //     count++;
    //     // socket.emit(`countUpdated`, count); //EMITS ONLY TO PRESENT CLIENT
    //     io.emit(`countUpdated`, count); //EMIT TO ALL CONNECTIONS
    // })
    socket.on(`join`, ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        //EMIT TO A PARTICULAR CONNECTION
        socket.emit(`message`, generateMessage(`Mod Almighty`, `Chat is coming...`));
        // socket.on(`welcome`, () => {
        //     //EMIT TO EVERYONE
        //     io.emit(`intro`);
        // })
        //EMIT TO EVERYBODY BUT YOU
        socket.broadcast.to(user.room).emit(`message`, generateMessage(`Mod Almighty`, `${user.username.charAt(0).toUpperCase() + user.username.slice(1)} has joined. Wow.`));
        io.to(user.room).emit(`roomData`, {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });
    //LISTEN FOR CLIENT
    socket.on(`send`, (message, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback(`profanity is not allowed`);
        }
        io.to(user.room).emit(`message`, generateMessage(user.username, message));
        callback();
    })
    socket.on(`sendLocation`, (coords, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit(`locationMessage`, generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })
    socket.on(`disconnect`, () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(`message`, generateMessage(`Mod Almighty`, `${user.username.charAt(0).toUpperCase() + user.username.slice(1)} has left.`));
            io.to(user.room).emit(`roomData`, {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`server is up on port ${port}`);
})