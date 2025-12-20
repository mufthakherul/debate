# RPI Debating Club - Virtual Debate Platform

A web-based virtual debate platform for the RPI Debating Club to conduct debates remotely with real-time features.

## Features

- 🎤 **Real-time Debate Rooms**: Create or join debate rooms with unique IDs
- ⏱️ **Speaker Timer**: Dedicated timer for tracking speaker time
- 👥 **Role Management**: Support for Moderators, Speakers, Judges, and Observers
- 📋 **Speaker Queue**: Manage speaking order for proposition and opposition teams
- ⚖️ **Judge Scoring**: Real-time scoring system for judges
- 💬 **Live Chat**: Discussion and feedback during debates
- 📊 **Participant Tracking**: See who's in the room and their roles

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mufthakherul/debate.git
   cd debate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### Creating/Joining a Debate Room

1. Enter a **Room ID** (e.g., "debate-001")
2. Enter your **Name**
3. Select your **Role**:
   - **Moderator**: Controls motion, timer, and speaker queue
   - **Speaker**: Participates in the debate
   - **Judge**: Scores the debate
   - **Observer**: Watches the debate
4. Click **Join/Create Room**

### For Moderators

- **Set Motion**: Enter the debate topic/motion for discussion
- **Control Timer**: Start, pause, and reset the speaker timer
- **Manage Queue**: Add or remove speakers from the queue
- **Organize Debate**: Keep the debate structured and on track

### For Speakers

- **Add to Queue**: Add yourself to the speaker queue with your side (Proposition/Opposition)
- **Monitor Timer**: Keep track of your speaking time
- **Participate**: Engage in the chat for points of information

### For Judges

- **Score Teams**: Enter scores for both Proposition and Opposition teams (0-100)
- **Add Feedback**: Provide comments and feedback
- **Submit Scores**: Submit your evaluation in real-time
- **View Other Scores**: See scores from other judges

### For Observers

- **Watch Debate**: Follow along with the debate motion and speaker queue
- **Join Discussion**: Participate in the chat
- **Learn**: Observe debate structure and scoring

## Technical Details

### Technology Stack

- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.io
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Architecture**: WebSocket-based real-time updates

### Port Configuration

The default port is `3000`. To change it, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Project Structure

```
debate/
├── server.js           # Express server and Socket.io logic
├── package.json        # Project dependencies
├── README.md          # Documentation
└── public/            # Static files
    ├── index.html     # Main HTML interface
    ├── styles.css     # Styling
    └── app.js         # Client-side JavaScript
```

## Development

To run in development mode:

```bash
npm run dev
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, either:
1. Stop the other application using that port
2. Change the port: `PORT=8080 npm start`

### Connection Issues
- Ensure your firewall allows connections on the specified port
- Check that Node.js and npm are properly installed
- Verify all dependencies are installed with `npm install`

## Future Enhancements

- User authentication
- Persistent room history
- Recording and playback features
- Advanced scoring rubrics
- Mobile app version
- Video/audio integration
- Debate templates and formats

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

ISC 
