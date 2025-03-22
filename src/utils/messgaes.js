export function generateMessage(username, text) {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

export function generateLocationMessage(username, url) {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}
