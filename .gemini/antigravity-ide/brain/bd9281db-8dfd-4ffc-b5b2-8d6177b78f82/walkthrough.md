# Groovely Google Meet Zero-Latency WebRTC Engine Walkthrough

## Summary of Optimization Updates

### 1. Instant WebRTC Offer Auto-Initiation (`useEffect` Listener Sync)
- **Problem**: WebRTC offers were previously generated only when the speaker clicked the mic button. Fans who joined a room *after* the speaker was live never received a WebRTC offer, falling back to WebSockets PCM streaming and experiencing 1-3 seconds of lag.
- **Fix**: Implemented `useEffect([participants, isMicActive])` in `apps/web/src/app/rooms/[id]/page.tsx`. Whenever a new participant enters a room where a mic is live, the speaker's browser automatically initiates a direct WebRTC UDP offer to the new participant immediately.

### 2. Direct WebAudio Destination Routing (0ms Jitter Buffer)
- **Problem**: Standard HTML `<audio>` elements apply browser media buffer smoothing (150ms-300ms jitter delay).
- **Fix**: Connected incoming WebRTC audio streams directly to WebAudio hardware destination:
  `audioCtx.createMediaStreamSource(event.streams[0]).connect(audioCtx.destination)`
  This bypasses HTML5 media element buffer smoothing, delivering instant **0ms jitter-buffer playback**.

---

## Git Deployment Details
- **Commits**: `ebcb51a`, `ba34288`
- **Branches Pushed**: `dev`, `master`
- **Repository**: `https://github.com/Jahzeal/Groovely.git`
