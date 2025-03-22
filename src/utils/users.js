const users = [];

// Add user
export function addUser({ id, username, room }) {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        };
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        };
    }

    // Store user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

// Get user
export function getUser(id) {
    return users.find((user) => user.id === id);
}

// Get users in room
export function getUsersInRoom(room) {
    return users.filter((user) => user.room === room);
}

// Remove user
export function removeUser(id) {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Join user to chat
export function userJoin(id, username, room) {
    const user = { id, username, room };

    users.push(user);

    return user;
}