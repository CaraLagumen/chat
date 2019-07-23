//CALL IO TO CONNECT TO SERVER
const socket = io();

//ELEMENTS
const $messageForm = document.querySelector(`#chat`);
const $messageFormInput = $messageForm.querySelector(`input`);
const $messageFormButton = $messageForm.querySelector(`button`);
const $locationForm = document.querySelector(`#send-location`);
const $messages = document.querySelector(`#messages`);

//TEMPLATES
const chatTemplate = document.querySelector(`#chat-template`).innerHTML;
const locationMessageTemplate = document.querySelector(`#location-template`).innerHTML;
const sidebarTemplate = document.querySelector(`#sidebar-template`).innerHTML;

//OPTIONS
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //GET NEW MESSAGE ELEMENT
    const $newMessage = $messages.lastElementChild;
    //GET HEIGHT OF LAST MESSAGE
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    //VISIBLE HEIGHT
    const visibleHeight = $messages.offsetHeight;
    //HEIGHT OF MESSAGES CONTAINER
    const containerHeight = $messages.scrollHeight;
    //HOW FAR WE'VE SCROLLED
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
    // console.log(newMessageMargin);
}

//SERVER(EMIT) => CLIENT(RECEIVE) => ACKNOWLEDGEMENT => SERVER
//CLIENT(EMIT) => SERVER(RECEIVE) => ACKNOWLEDGEMENT => CLIENT

// socket.on(`countUpdated`, (count) => {
//     console.log(`count updated`, count);
// })

// document.querySelector(`#increment`).addEventListener(`click`, () => {
//     console.log(`clicked`);
//     socket.emit(`increment`);
// })

// socket.on(`intro`, () => {
//     console.log(`intro sent`);
// })

// document.querySelector(`#welcome`).addEventListener(`open`, () => {
//     console.log(`opened`);
//     socket.emit(`welcome`);
// })

//LISTEN FOR SERVER
socket.on(`message`, (message) => {
    console.log(message);
    const html = Mustache.render(chatTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format(`HH:mm`)
    });
    $messages.insertAdjacentHTML(`beforeend`, html);
    autoscroll();
})

socket.on(`locationMessage`, (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format(`HH:mm`)
    });
    $messages.insertAdjacentHTML(`beforeend`, html);
    autoscroll();
})

socket.on(`roomData`, ({ room, users }) => {
    // console.log(room, users);
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector(`#sidebar`).innerHTML = html;
})

//TARGET FORM
document.querySelector(`#chat`).addEventListener(`submit`, (e) => {
    e.preventDefault();
    //DISABLE FORM
    $messageFormButton.setAttribute(`disabled`, `disabled`);
    //GRAB VALUE OF INPUT
    const message = e.target.elements.message.value; //document.querySelector(`input`).value;
    socket.emit(`send`, message, (error) => {
        // console.log(`message delivered`, clarify)
        //REENABLE FORM
        $messageFormButton.removeAttribute(`disabled`);
        //CLEAR FORM
        $messageFormInput.value = ``;
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log(`message delivered`);
    });
})

document.querySelector(`#send-location`).addEventListener(`click`, () => {
    if (!navigator.geolocation) {
        return alert(`Geolocation is not supported by your browser.`)
    }

    $locationForm.setAttribute(`disabled`, `disabled`);

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit(`sendLocation`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationForm.removeAttribute(`disabled`);
            console.log(`location shared`);  
        });     
    });
})

socket.emit(`join`, { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = `/`; //REDIRECT TO HOME
    }
});