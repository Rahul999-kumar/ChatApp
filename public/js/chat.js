const socket = io();

//Elements
// This is the code that gets the elements from the DOM. The code uses querySelector to get the form and input elements.
const $messageForm = document.querySelector('#chat-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
// This is the code that gets the templates from the DOM. The code uses querySelector to get the template elements.
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


//Options
// This is the code that gets the username and room from the URL. The code uses the Qs library to parse the query string.
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

//AutoScroll
// This is the code that scrolls the chat window to the bottom when a new message is received. The code uses the scrollHeight property to get the height of the chat window and the scrollTop property to get the current scroll position.
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
    //window.scrollTo(0, document.body.scrollHeight);
};


socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
    //window.scrollTo(0, document.body.scrollHeight);
});

socket.on('locationMessage', (url) => {
    console.log(url);
    const html = Mustache
        .render(locationMessageTemplate, { 
            username: url.username,
            url: url.url, 
            createdAt: moment(url.createdAt).format('h:mm a')
         });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
    //window.scrollTo(0, document.body.scrollHeight);
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

//Send Message to the User
// This is the code that sends the message to the user. The code listens for the form submission event and emits the message to the server. The server then sends the message to all the connected clients.
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!');
    });
    e.target.elements.message.value = '';
});


//Send Location to the User
// This is the code that sends the location to the user. The code uses the geolocation API to get the user's location and sends it to the server. The server then sends the location to all the connected clients.
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location Shared!');
            $sendLocationButton.removeAttribute('disabled');
        });
    });
});

//Join Room
// This is the code that sends the username and room to the server. The server then adds the user to the room and sends a welcome message to the user.
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});