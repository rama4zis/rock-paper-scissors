let userName = '';
let room = '';
let playerChoice = '';
const socket = io();
const form = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const message = chatInput.value.trim();
    const userNameInput = userName.trim();
    if (message) {
        // Emit the message to the server
        socket.emit('chat message', { userName: userNameInput, message });
        chatInput.value = '';
    }
    console.log('Message sent:', message);
});

// Listen for chat messages from the server
socket.on('chat message', function (data) {
    const chatMessages = document.getElementById('chat-messages');

    // Create a wrapper for the entire message (username + text)
    const messageEntryWrapper = document.createElement('div');
    messageEntryWrapper.classList.add('message-entry', 'mb-2');

    const userNameElement = document.createElement('strong');
    userNameElement.classList.add('text-gray-500', 'font-semibold', 'text-sm', 'mb-1', 'block');
    userNameElement.textContent = `${data.userName}:`;

    const messageBubble = document.createElement('div');
    // Base classes for the message bubble itself
    messageBubble.classList.add('message', 'border', 'border-gray-300', 'rounded-xl', 'p-2', 'inline-block');
    messageBubble.innerHTML = data.message;

    if (data.userName === userName) {
        messageEntryWrapper.classList.add('text-right');
        userNameElement.classList.add('text-right'); // Align text within the username element

        messageBubble.classList.add('text-right'); // Align text within the bubble
        messageBubble.style.backgroundColor = '#e0f7fa'; // Light blue background for own messages
        messageBubble.style.color = '#006064'; // Dark blue text for own messages
    } else {
        // Other's message: align content of wrapper to the left
        messageEntryWrapper.classList.add('text-left');
        userNameElement.classList.add('text-left'); // Align text within the username element

        // For other's messages, bubble text usually aligns left by default or inherits.
        messageBubble.style.backgroundColor = '#fff3e0'; // Light orange background for others' messages
        messageBubble.style.color = '#bf360c'; // Dark orange text for others' messages
    }
    messageEntryWrapper.appendChild(userNameElement);
    messageEntryWrapper.appendChild(messageBubble);
    chatMessages.appendChild(messageEntryWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
}
);


if (!userName) {
    // disable all input and button except the username input
    document.querySelectorAll('input, button').forEach(element => {
        element.disabled = true;
        // if click on the element, alert the user to set a username
        element.classList.add('bg-gray-200', 'text-gray-500');
    }
    );
    document.getElementById('username').disabled = false;
    document.getElementById('username').classList.remove('bg-gray-200', 'text-gray-500');

    document.getElementById('room').disabled = false;
    document.getElementById('room').classList.remove('bg-gray-200', 'text-gray-500');
    document.getElementById('set-username').disabled = false;
    document.getElementById('set-username').classList.remove('bg-gray-200', 'text-gray-500');

}

document.getElementById('set-username').addEventListener('click', function () {
    userName = document.getElementById('username').value;
    room = document.getElementById('room').value;
    if (userName && room) {
        // enable all input and button
        socket.emit('join room', { userName: userName, roomId: room });

        document.querySelectorAll('input, button').forEach(element => {
            element.disabled = false;
            element.classList.remove('bg-gray-200', 'text-gray-500');
            document.querySelectorAll('button').forEach(button => {
                button.classList.add('cursor-pointer');
            });
        });

        document.getElementById('username').disabled = true;
        document.getElementById('username').classList.add('bg-gray-200', 'text-gray-500');

        document.getElementById('room').disabled = true;
        document.getElementById('room').classList.add('bg-gray-200', 'text-gray-500');

        document.getElementById('set-username').disabled = true;
        document.getElementById('set-username').classList.add('bg-gray-200', 'text-gray-500');

        console.log('User Name:', userName);
        console.log('Room:', room);

    } else {
        alert('Please enter a valid username and room.');
    }
});

const playerSelection = document.querySelectorAll('.player-selection')
playerSelection.forEach(player => {
    player.addEventListener('click', function () {
        const selectedPlayer = this.dataset.value;
        console.log('Selected Player:', selectedPlayer);

        // change the background color of the selected player
        playerSelection.forEach(p => {
            p.classList.remove('bg-red-400', 'selected');
            p.classList.add('bg-gray-200');
        }
        );
        this.classList.add('bg-red-400', 'selected');
        this.classList.remove('bg-gray-200');
        playerChoice = selectedPlayer;
    });
}
);

document.getElementById('chat-input').addEventListener('keyup', function (e) {
    if (e.key != 'Enter') {
        socket.emit('typing', userName);
    } else {
        socket.emit('typing', { key: 'Enter' });
    }
});

socket.on('typing', function (data) {
    if (data.key == 'Enter') {
        if (document.getElementById('feedback')) {
            document.getElementById('feedback').remove();
        }
    } else {
        if (data != userName) {
            if (document.getElementById('feedback')) {
                document.getElementById('feedback').remove();
            }
            const typingElement = document.createElement('div')
            typingElement.setAttribute('id', 'feedback');
            typingElement.classList.add('border', 'border-gray-300', 'rounded-xl', 'p-2', 'mb-2', 'text-left', 'inline-block');
            typingElement.textContent = `${data} is typing...`;
            document.getElementById('chat-messages').appendChild(typingElement);
        }
    }
})

document.getElementById('chat-input').addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
        const typingElement = document.getElementById('feedback');
        if (typingElement) {
            typingElement.remove();
        }
    }
})

document.getElementById('play-button').addEventListener('click', function () {
    // console.log(playerChoice)
    if (playerChoice) {
        socket.emit('play', { playerChoice: playerChoice })
    }
});

socket.on('play', function (data) {
    console.log(data)
});

socket.on('result', function (data) {
    console.log(data)
    if (data.winner.userName === userName) {
        document.getElementById('modal-title').textContent = 'You Win!';
    } else if (data === 'draw') {
        document.getElementById('modal-title').textContent = 'Draw!';
    } else {
        document.getElementById('modal-title').textContent = 'You Lose!';
    }
    document.getElementById('winner-info').textContent = `Winner: ${data.winner.userName}`;
    document.getElementById('loser-info').textContent = `Loser: ${data.loser.userName}`;
    document.getElementById('winner-choice').textContent = `Winner's choice: ${data.winner.choice}`;
    document.getElementById('loser-choice').textContent = `Loser's choice: ${data.loser.choice}`;
    document.getElementById('result-modal').classList.remove('hidden');
});

document.getElementById('close-modal').addEventListener('click', function () {
    document.getElementById('result-modal').classList.add('hidden');
    // Reset the game state if needed
    playerChoice = '';
    playerSelection.forEach(p => {
        p.classList.remove('bg-red-400', 'selected');
        p.classList.add('bg-gray-200');
    });
});

socket.on('room full', function () {
    alert('The room is full. Please try another room.');
    userName = '';
    room = '';
    document.querySelectorAll('input, button').forEach(element => {
        element.disabled = true;
        element.classList.add('bg-gray-200', 'text-gray-500');
    });
    document.getElementById('username').disabled = false;
    document.getElementById('username').classList.remove('bg-gray-200', 'text-gray-500');
    document.getElementById('room').disabled = false;
    document.getElementById('room').classList.remove('bg-gray-200', 'text-gray-500');
    document.getElementById('set-username').disabled = false;
    document.getElementById('set-username').classList.remove('bg-gray-200', 'text-gray-500');
    document.getElementById('set-room').disabled = false;
    document.getElementById('set-room').classList.remove('bg-gray-200', 'text-gray-500');
});

socket.on('choice', function (data) {
    console.log(data);
    document.getElementById('chat-messages').innerHTML += `
        <div class="message-entry mb-2 text-center">
            <div class="message p-2 inline-block text-green-600">
                ${data.userName} has made their choice.
            </div>
        </div>
    `
});
socket.on('player joined', function (data) {
    console.log(data);
    document.getElementById('chat-messages').innerHTML += `
        <div class="message-entry mb-2 text-center">
            <div class="message p-2 inline-block text-blue-600">
                ${data.userName} has joined the room.
            </div>
        </div>
    `
});