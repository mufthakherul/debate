# Streaming Functionality

This document provides a comprehensive guide to the streaming functionality of the Virtual Debating Club platform.

## Table of Contents

1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [API Endpoints](#api-endpoints)
4. [Platform Integration](#platform-integration)
5. [Frontend Controls](#frontend-controls)
6. [Engagement Metrics](#engagement-metrics)
7. [Troubleshooting](#troubleshooting)

## Overview

The Virtual Debating Club platform supports live streaming to multiple platforms simultaneously, including:

- **YouTube Live** - Stream to YouTube with real-time viewer engagement
- **Facebook Live** - Broadcast to Facebook with comments and reactions
- **Twitch** - Stream to Twitch with interactive chat
- **Custom RTMP** - Connect to any RTMP-compatible streaming service

### Key Features

- ✅ Multi-platform streaming (stream to all platforms at once)
- ✅ Real-time engagement statistics (viewers, comments, likes)
- ✅ Stream key validation and security
- ✅ Platform-specific status monitoring
- ✅ Easy-to-use controls for moderators
- ✅ Automatic error handling and recovery

## Backend Architecture

### Database Schema

The streaming functionality uses three main database models:

#### StreamSession
Represents an active or past streaming session for a debate.

```typescript
{
  id: string              // Unique session ID
  status: StreamStatus    // IDLE, STARTING, LIVE, STOPPING, STOPPED, ERROR
  startedAt: DateTime?    // When the stream started
  stoppedAt: DateTime?    // When the stream stopped
  debateId: string        // Associated debate ID (unique)
  platforms: StreamPlatform[]  // Connected platforms
  stats: StreamStats[]    // Historical statistics
}
```

#### StreamPlatform
Represents a streaming platform connection within a session.

```typescript
{
  id: string
  platform: StreamPlatformType  // YOUTUBE, FACEBOOK, TWITCH, CUSTOM_RTMP
  streamKey: string?            // Encrypted stream key
  streamUrl: string?            // RTMP URL (for custom RTMP)
  isActive: boolean             // Currently streaming
  status: StreamStatus          // Platform-specific status
  lastError: string?            // Last error message
  sessionId: string             // Parent session ID
}
```

#### StreamStats
Captures engagement metrics at regular intervals.

```typescript
{
  id: string
  viewerCount: number      // Current viewers
  peakViewers: number      // Peak concurrent viewers
  totalComments: number    // Total comments received
  totalLikes: number       // Total likes/reactions
  recordedAt: DateTime     // When these stats were captured
  sessionId: string        // Parent session ID
}
```

### Middleware

#### Stream Validation Middleware
Located in `api/src/middleware/streamValidation.ts`:

- **validateStreamKey**: Validates stream key format (min 10 alphanumeric characters)
- **validatePlatform**: Ensures platform is one of the supported types
- **validateRtmpUrl**: Validates RTMP URL format (rtmp:// or rtmps://)

## API Endpoints

### Base URL
```
/api/streaming
```

### Get Streaming Status

**Endpoint:** `GET /api/streaming/status/:debateId`

**Authentication:** Required (JWT token)

**Description:** Retrieves the current streaming status for a debate.

**Response:**
```json
{
  "debateId": "debate-123",
  "sessionId": "session-456",
  "status": "LIVE",
  "startedAt": "2025-01-15T14:30:00Z",
  "platforms": [
    {
      "platform": "YOUTUBE",
      "isActive": true,
      "status": "LIVE",
      "lastError": null
    },
    {
      "platform": "TWITCH",
      "isActive": true,
      "status": "LIVE",
      "lastError": null
    }
  ]
}
```

### Get Streaming Statistics

**Endpoint:** `GET /api/streaming/stats/:debateId`

**Authentication:** Required (JWT token)

**Description:** Gets live engagement statistics for the stream.

**Response:**
```json
{
  "viewerCount": 127,
  "peakViewers": 250,
  "totalComments": 45,
  "totalLikes": 23,
  "recordedAt": "2025-01-15T14:35:00Z"
}
```

### Start Streaming

**Endpoint:** `POST /api/streaming/start`

**Authentication:** Required (Admin or Moderator role)

**Description:** Starts streaming to one or multiple platforms.

**Request Body:**
```json
{
  "debateId": "debate-123",
  "platforms": [
    {
      "platform": "YOUTUBE",
      "streamKey": "your-youtube-stream-key"
    },
    {
      "platform": "CUSTOM_RTMP",
      "streamUrl": "rtmp://custom-server.com/live",
      "streamKey": "custom-stream-key"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Stream started successfully",
  "session": {
    "id": "session-456",
    "status": "LIVE",
    "startedAt": "2025-01-15T14:30:00Z",
    "platforms": [...]
  }
}
```

**Validations:**
- Debate must exist and be in `IN_PROGRESS` status
- At least one platform must be specified
- Stream keys must be at least 10 characters
- RTMP URLs must start with `rtmp://` or `rtmps://`

### Stop Streaming

**Endpoint:** `POST /api/streaming/stop`

**Authentication:** Required (Admin or Moderator role)

**Description:** Stops streaming to specific platforms or all platforms.

**Request Body:**
```json
{
  "debateId": "debate-123",
  "platforms": ["YOUTUBE", "TWITCH"]  // Optional: omit to stop all
}
```

**Response:**
```json
{
  "message": "Stream stopped successfully",
  "session": {
    "id": "session-456",
    "status": "STOPPED",
    "stoppedAt": "2025-01-15T15:00:00Z",
    "platforms": [...]
  }
}
```

### Update Statistics (Internal)

**Endpoint:** `POST /api/streaming/stats`

**Authentication:** Required (Admin or Moderator role)

**Description:** Updates streaming statistics (typically called by background jobs or webhooks).

**Request Body:**
```json
{
  "debateId": "debate-123",
  "viewerCount": 150,
  "peakViewers": 250,
  "totalComments": 50,
  "totalLikes": 25
}
```

## Platform Integration

### YouTube Live

**Setup:**
1. Enable YouTube Live on your YouTube channel
2. Go to YouTube Studio → Go Live → Stream
3. Copy your Stream Key and Stream URL
4. In the debate platform, paste the Stream Key when starting the stream

**Platform:** `YOUTUBE`

**Notes:**
- YouTube may have a delay of 10-30 seconds
- Requires channel to be verified and eligible for live streaming

### Facebook Live

**Setup:**
1. Go to your Facebook Page or Profile
2. Navigate to Publishing Tools → Video Library → Live
3. Create a new live video and copy the Stream Key
4. Use the Stream Key in the platform

**Platform:** `FACEBOOK`

**Notes:**
- Facebook live streams are typically public
- Can configure privacy settings before going live

### Twitch

**Setup:**
1. Log into Twitch and go to Creator Dashboard
2. Navigate to Settings → Stream
3. Copy your Primary Stream Key
4. Use in the platform when starting stream

**Platform:** `TWITCH`

**Notes:**
- Twitch has sophisticated chat integration
- Requires Twitch account in good standing

### Custom RTMP

**Setup:**
1. Obtain RTMP URL and Stream Key from your streaming provider
2. Enter both the RTMP URL and Stream Key when configuring

**Platform:** `CUSTOM_RTMP`

**Example RTMP URLs:**
- Generic: `rtmp://streaming-server.com/live`
- OBS Compatible: `rtmp://live.myserver.com:1935/app`

**Notes:**
- Ensure firewall allows RTMP traffic (port 1935)
- Test with OBS Studio before production use

## Frontend Controls

### StreamingControlPanel Component

Located in `web/src/components/StreamingControlPanel.tsx`

**Features:**
- Start/Stop streaming buttons with visual feedback
- Platform selection checkboxes
- Stream key/URL input fields (masked for security)
- Real-time platform status indicators
- Color-coded status badges (green=live, red=error, gray=idle)

**Usage Example:**
```tsx
<StreamingControlPanel
  debateId="debate-123"
  onStartStream={handleStartStream}
  onStopStream={handleStopStream}
  platforms={streamingPlatforms}
  isStreaming={isStreaming}
/>
```

**Status Indicators:**
- 🟢 **LIVE** - Platform is actively streaming
- 🟡 **STARTING** - Connection in progress
- 🔴 **ERROR** - Stream failed
- ⚪ **IDLE** - Not streaming
- ⚫ **STOPPED** - Stream ended

### StreamingStats Component

Located in `web/src/components/StreamingStats.tsx`

**Features:**
- Real-time viewer count with animated updates
- Peak viewer tracking
- Comment and like counters
- Auto-refresh every 5 seconds (configurable)
- Responsive grid layout

**Usage Example:**
```tsx
<StreamingStats 
  debateId="debate-123"
  refreshInterval={5000}  // 5 seconds
/>
```

## Engagement Metrics

### Viewer Count
- **Current Viewers**: Live concurrent viewer count across all platforms
- **Peak Viewers**: Maximum concurrent viewers during the stream
- Updates every 5 seconds during active streaming

### Comments Feed
- Aggregated from all platforms
- Displayed in real-time
- Can be filtered by platform

### Reactions/Likes
- Total engagement across platforms
- Platform-specific breakdowns available

## Troubleshooting

### Stream Won't Start

**Possible Causes:**
1. **Invalid Stream Key**
   - Solution: Double-check the stream key from the platform
   - Ensure key has no extra spaces or characters

2. **Debate Not In Progress**
   - Solution: Debate must have status `IN_PROGRESS`
   - Start the debate before streaming

3. **Permission Denied**
   - Solution: User must have ADMIN or MODERATOR role
   - Check user permissions

### Stream Shows Error Status

**Possible Causes:**
1. **Network Connection Issues**
   - Solution: Check server internet connectivity
   - Verify firewall settings allow RTMP traffic

2. **Platform Server Issues**
   - Solution: Check platform status pages
   - Try reconnecting after a few minutes

3. **Invalid RTMP URL**
   - Solution: Verify RTMP URL format
   - Test with OBS Studio first

### Low Viewer Count Not Updating

**Possible Causes:**
1. **API Rate Limiting**
   - Solution: Stats update every 5 seconds by default
   - Don't decrease refresh interval too much

2. **Background Job Not Running**
   - Solution: Ensure stats update endpoint is being called
   - Check server logs for errors

### Stream Key Validation Fails

**Possible Causes:**
1. **Key Too Short**
   - Solution: Stream keys must be at least 10 characters
   - Contact platform support if key is shorter

2. **Invalid Characters**
   - Solution: Only alphanumeric, dash, and underscore allowed
   - Copy key carefully to avoid special characters

## Best Practices

### Security
- ✅ Never commit stream keys to version control
- ✅ Use environment variables for sensitive configuration
- ✅ Rotate stream keys regularly
- ✅ Limit streaming permissions to trusted moderators

### Performance
- ✅ Test stream setup before live debates
- ✅ Monitor bandwidth usage
- ✅ Use CDN for static assets
- ✅ Consider regional server placement

### User Experience
- ✅ Provide clear status indicators
- ✅ Show helpful error messages
- ✅ Allow easy platform selection
- ✅ Display engagement metrics prominently

## Future Enhancements

Planned improvements to streaming functionality:

- [ ] Multi-bitrate adaptive streaming
- [ ] Automatic stream health monitoring
- [ ] DVR/replay functionality
- [ ] Chat moderation tools
- [ ] Advanced analytics dashboard
- [ ] Webhook notifications for stream events
- [ ] Integration with additional platforms (LinkedIn Live, Instagram Live)

## Support

For issues or questions about streaming functionality:

1. Check this documentation first
2. Review API endpoint responses for error details
3. Check server logs for detailed error information
4. Open an issue on the GitHub repository

---

**Last Updated:** December 2025
**Version:** 1.0.0
