// Initialize Socket.io connection
const socket = io();

// State management
let currentRoom = null;
let currentUser = null;
let currentRole = null;
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

// DOM Elements
const landingPage = document.getElementById('landing-page');
const debateRoom = document.getElementById('debate-room');
const joinRoomBtn = document.getElementById('join-room-btn');
const leaveRoomBtn = document.getElementById('leave-room-btn');
const roomIdInput = document.getElementById('room-id');
const userNameInput = document.getElementById('user-name');
const userRoleSelect = document.getElementById('user-role');

// Motion elements
const motionText = document.getElementById('motion-text');
const motionInput = document.getElementById('motion-input');
const setMotionBtn = document.getElementById('set-motion-btn');
const motionSetter = document.getElementById('motion-setter');

// Timer elements
const timerDisplay = document.getElementById('timer');
const currentSpeakerDisplay = document.getElementById('current-speaker');
const timerDurationInput = document.getElementById('timer-duration');
const startTimerBtn = document.getElementById('start-timer-btn');
const pauseTimerBtn = document.getElementById('pause-timer-btn');
const resetTimerBtn = document.getElementById('reset-timer-btn');

// Queue elements
const speakerQueue = document.getElementById('speaker-queue');
const speakerNameInput = document.getElementById('speaker-name-input');
const speakerTypeSelect = document.getElementById('speaker-type');
const addSpeakerBtn = document.getElementById('add-speaker-btn');

// Judge elements
const judgeSection = document.getElementById('judge-section');
const propScoreInput = document.getElementById('prop-score');
const oppScoreInput = document.getElementById('opp-score');
const judgeCommentsInput = document.getElementById('judge-comments');
const submitScoreBtn = document.getElementById('submit-score-btn');
const scoresList = document.getElementById('scores-list');

// Participants elements
const participantsList = document.getElementById('participants-list');
const roomTitle = document.getElementById('room-title');
const roomParticipants = document.getElementById('room-participants');

// Chat elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');

// Event Listeners - Landing Page
joinRoomBtn.addEventListener('click', joinRoom);
leaveRoomBtn.addEventListener('click', leaveRoom);

// Event Listeners - Motion
setMotionBtn.addEventListener('click', setMotion);

// Event Listeners - Timer
startTimerBtn.addEventListener('click', startTimer);
pauseTimerBtn.addEventListener('click', pauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);

// Event Listeners - Queue
addSpeakerBtn.addEventListener('click', addSpeaker);

// Event Listeners - Judge
submitScoreBtn.addEventListener('click', submitScore);

// Event Listeners - Chat
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Functions
function joinRoom() {
    const roomId = roomIdInput.value.trim();
    const userName = userNameInput.value.trim();
    const role = userRoleSelect.value;

    if (!roomId || !userName) {
        alert('Please enter both Room ID and your name');
        return;
    }

    currentRoom = roomId;
    currentUser = userName;
    currentRole = role;

    socket.emit('join-room', { roomId, userName, role });
}

function leaveRoom() {
    landingPage.style.display = 'block';
    debateRoom.style.display = 'none';
    currentRoom = null;
    currentUser = null;
    currentRole = null;
    
    // Reset inputs
    roomIdInput.value = '';
    userNameInput.value = '';
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function setMotion() {
    const motion = motionInput.value.trim();
    if (!motion) {
        alert('Please enter a motion');
        return;
    }

    socket.emit('set-motion', { roomId: currentRoom, motion });
    motionInput.value = '';
}

function startTimer() {
    const duration = parseInt(timerDurationInput.value);
    const speakerName = speakerNameInput.value.trim() || 'Current Speaker';
    
    if (!duration || duration < 1) {
        alert('Please enter a valid duration');
        return;
    }

    timerSeconds = duration * 60;
    timerRunning = true;
    socket.emit('start-timer', { roomId: currentRoom, duration, speakerName });
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
    timerRunning = false;
    socket.emit('pause-timer', { roomId: currentRoom });
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    timerRunning = false;
    timerSeconds = 0;
    socket.emit('reset-timer', { roomId: currentRoom });
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    updateTimerDisplay();
    currentSpeakerDisplay.textContent = 'No speaker active';
}

function updateTimer() {
    if (timerRunning && timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds === 0) {
            timerRunning = false;
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            alert('Time is up!');
        }
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function addSpeaker() {
    const speakerName = speakerNameInput.value.trim();
    const speakerType = speakerTypeSelect.value;

    if (!speakerName) {
        alert('Please enter speaker name');
        return;
    }

    socket.emit('add-speaker', { roomId: currentRoom, speakerName, speakerType });
    speakerNameInput.value = '';
}

function removeSpeaker(index) {
    socket.emit('remove-speaker', { roomId: currentRoom, index });
}

function submitScore() {
    const propScore = parseInt(propScoreInput.value);
    const oppScore = parseInt(oppScoreInput.value);
    const comments = judgeCommentsInput.value.trim();

    if (isNaN(propScore) || isNaN(oppScore)) {
        alert('Please enter valid scores');
        return;
    }

    const scores = {
        proposition: propScore,
        opposition: oppScore,
        comments: comments
    };

    socket.emit('submit-score', { roomId: currentRoom, judgeName: currentUser, scores });
    
    // Clear form
    propScoreInput.value = '';
    oppScoreInput.value = '';
    judgeCommentsInput.value = '';
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit('send-message', { roomId: currentRoom, userName: currentUser, message });
    messageInput.value = '';
}

function updateParticipantsList(participants) {
    participantsList.innerHTML = '';
    participants.forEach(participant => {
        const div = document.createElement('div');
        div.className = 'participant-item';
        div.innerHTML = `
            <span class="participant-name">${participant.name}</span>
            <span class="participant-role">${participant.role}</span>
        `;
        participantsList.appendChild(div);
    });
    roomParticipants.textContent = `Participants: ${participants.length}`;
}

function updateSpeakerQueue(queue) {
    speakerQueue.innerHTML = '';
    
    if (queue.length === 0) {
        speakerQueue.innerHTML = '<p class="empty-message">No speakers in queue</p>';
        return;
    }

    queue.forEach((speaker, index) => {
        const div = document.createElement('div');
        div.className = 'speaker-item';
        
        const speakerInfo = document.createElement('div');
        speakerInfo.className = 'speaker-info';
        speakerInfo.innerHTML = `
            <div class="speaker-name">${speaker.name}</div>
            <div class="speaker-type ${speaker.type}">${speaker.type}</div>
        `;
        div.appendChild(speakerInfo);
        
        if (currentRole === 'moderator') {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-danger btn-small';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => removeSpeaker(index));
            div.appendChild(removeBtn);
        }
        
        speakerQueue.appendChild(div);
    });
}

function addChatMessage(userName, message, timestamp) {
    const div = document.createElement('div');
    div.className = 'chat-message';
    const time = new Date(timestamp).toLocaleTimeString();
    div.innerHTML = `
        <div class="chat-message-header">
            ${userName}
            <span class="chat-message-time">${time}</span>
        </div>
        <div class="chat-message-body">${message}</div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateScoresDisplay(scores) {
    scoresList.innerHTML = '';
    
    Object.entries(scores).forEach(([judgeName, score]) => {
        const div = document.createElement('div');
        div.className = 'score-entry';
        div.innerHTML = `
            <strong>${judgeName}:</strong><br>
            Proposition: ${score.proposition} | Opposition: ${score.opposition}<br>
            ${score.comments ? `<em>${score.comments}</em>` : ''}
        `;
        scoresList.appendChild(div);
    });
}

// Socket.io event handlers
socket.on('room-joined', (data) => {
    landingPage.style.display = 'none';
    debateRoom.style.display = 'block';
    roomTitle.textContent = `Debate Room: ${data.roomId}`;
    
    // Show motion setter only for moderators
    if (currentRole === 'moderator') {
        motionSetter.style.display = 'flex';
    } else {
        motionSetter.style.display = 'none';
    }
    
    // Show judge section only for judges
    if (currentRole === 'judge') {
        judgeSection.style.display = 'block';
    } else {
        judgeSection.style.display = 'none';
    }
    
    // Update motion if already set
    if (data.room.motion) {
        motionText.textContent = data.room.motion;
    }
    
    // Update participants
    updateParticipantsList(data.room.participants);
    
    // Update queue
    if (data.room.speakerQueue) {
        updateSpeakerQueue(data.room.speakerQueue);
    }
});

socket.on('participant-joined', (data) => {
    updateParticipantsList(data.participants);
    addChatMessage('System', `${data.name} joined as ${data.role}`, new Date());
});

socket.on('participant-left', (data) => {
    updateParticipantsList(data.participants);
    addChatMessage('System', `${data.name} left the room`, new Date());
});

socket.on('motion-updated', (data) => {
    motionText.textContent = data.motion;
});

socket.on('timer-started', (data) => {
    timerSeconds = data.duration * 60;
    timerRunning = true;
    currentSpeakerDisplay.textContent = `Current Speaker: ${data.speakerName}`;
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(updateTimer, 1000);
});

socket.on('timer-paused', () => {
    timerRunning = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
});

socket.on('timer-reset', () => {
    timerRunning = false;
    timerSeconds = 0;
    updateTimerDisplay();
    currentSpeakerDisplay.textContent = 'No speaker active';
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
});

socket.on('queue-updated', (data) => {
    updateSpeakerQueue(data.queue);
});

socket.on('scores-updated', (data) => {
    updateScoresDisplay(data.scores);
});

socket.on('new-message', (data) => {
    addChatMessage(data.userName, data.message, data.timestamp);
});
