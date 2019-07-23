const users = [];

const addUser = ({ id, username, room }) => {
    //UNIFORM THE DATA
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //VALIDATE THE DATA
    if (!username || !room) {
        return {
            error: `Username and room are required.`
        }
    }

    //CHECK FOR EXISTING USER
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    })

    //VALIDATE USERNAME
    if (existingUser) {
        return {
            error: `Username is in use.`
        }
    }

    //STORE USER
    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => {
        return user.id === id;
    })
}

const getUsersInRoom = (room) => {
    return users.filter((user) => {
        return user.room === room;
    })
}

// addUser({
//     id: 224,
//     username: `Cara`,
//     room: `Lounge`
// })

// addUser({
//     id: 244,
//     username: `Pheobe`,
//     room: `Lounge`
// })

// addUser({
//     id: 224,
//     username: `JP`,
//     room: `Bar`
// })

// console.log(users);

// const res = addUser({
//     id: 242,
//     username: ``,
//     room: ``
// })

// console.log(res);

// const removedUser = removeUser(224);

// console.log(removedUser);
// console.log(users);

// console.log(getUser(224));

// console.log(getUsersInRoom(`lounge`));

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}