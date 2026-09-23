# Live Voice Stream & Gateway Fix Walkthrough

## Summary of Fixes

### 1. WebAudio Destination Connection (Mic Audio Capture Fix)
- **Root Cause**: Modern browser WebAudio engines (Chrome, Edge, Safari, Firefox) suppress `ScriptProcessorNode.onaudioprocess` if the node does not route to an `AudioDestinationNode`. Previously, `processor` was disconnected to avoid local mic echo, which caused browsers to stop calling `onaudioprocess` completely (zero voice packets were generated).
- **Fix**: Connected `processor` through a `GainNode` set to `gain.value = 0` into `audioCtx.destination`. This guarantees `onaudioprocess` fires continuously while keeping local mic playback silent.

### 2. AudioContext Autoplay Unlock
- **Root Cause**: `new AudioCtx()` created lazily inside a WebSocket event callback is flagged by Chrome/Safari as lacking user gesture context, locking the AudioContext in `suspended` state.
- **Fix**: Pre-instantiated `voiceAudioContextRef` on the first user gesture (`click`, `touchstart`, `keydown`) on the room page.

### 3. Socket Congestion & Gateway Disconnection Loop Fix
- **Root Cause**: The mic processor was emitting 45 unbuffered audio packets per second over Socket.io. The NestJS gateway was using `this.server.to('room:id')`, which echoed all 45 packets back down to the speaker's own socket line, overloading Socket.io's ping/pong transport and causing gateway disconnect loops.
- **Fix**: 
  - Buffered mic PCM into ~100ms chunks (~10 packets/sec instead of 45/sec, a 78% reduction in socket traffic).
  - Updated `listening-room.gateway.ts` to use `client.to('room:id')`, sending voice packets only to room listeners and omitting the speaker socket.

### 4. DataView Int16 PCM Decoding & Sample Rate Propagation
- **Root Cause**: `new Int16Array(bytes.buffer)` threw a `RangeError` if byte alignment or ArrayBuffer offset was not even.
- **Fix**: Replaced with `DataView.getInt16(i * 2, true)` for safe decoding, and transmitted `sampleRate` in `voice_stream` payloads to eliminate sample rate mismatch artifacts.

---

## Integration Test Results

Ran end-to-end WebSocket voice streaming test against live gateway:
```
--- TESTING VOICE SOCKET BROADCAST ON ROOM ID #1 ---
✅ Speaker socket connected: ID = MhGVB7EdVz9PGyr3AAAR
✅ Listener socket connected: ID = 1kMGQywcmbQCg5LIAAAQ
🎙️ Speaker sending test voice packet...
🔊 VOICE PACKET RECEIVED BY LISTENER! { senderUserId: 999991, sampleRate: 48000, payloadLength: 40 }
🎉 REAL-TIME VOICE STREAMING TEST PASSED SUCCESSFULLY!
```

---

## Deployment Status
- **Commit**: `ebeec57`
- **Branches Updated**: `dev`, `master`
- **GitHub Repository**: `https://github.com/Jahzeal/Groovely.git`
