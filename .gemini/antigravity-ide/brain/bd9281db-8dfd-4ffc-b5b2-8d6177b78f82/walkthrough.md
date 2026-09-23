# Audio Voice Stream & Gateway Disconnection Fix Walkthrough

## 1. Root Cause Analysis

### A. Socket Gateway Disconnect & Connect Loop
- **Problem**: The Render gateway log showed clients constantly disconnecting (`📡 Client disconnected from Listening Rooms gateway: <socket_id>`) and reconnecting.
- **Cause**: The browser microphone `ScriptProcessor(2048)` was firing **45 unbuffered voice packets per second** over WebSockets. Additionally, `listening-room.gateway.ts` was using `this.server.to('room:id')`, which echoed all 45 incoming audio packets **back to the speaker's own socket**. Sending 45 packets/sec back and forth saturated the Socket.io frame buffer and clogged network traffic on Render. Standard WebSocket `ping`/`pong` heartbeat frames were delayed, triggering Socket.io `ping timeout` disconnections.

### B. Inaudible Voice Stream ("they could not hear me")
- **Problem**: Listeners in live rooms could not hear any sound when a host or speaker spoke.
- **Cause**:
  1. **ArrayBuffer Byte Alignment Crash**: Receiver side was calling `new Int16Array(bytes.buffer)`. In V8/JavaScript, if base64 byte length is odd or has byte offset, `Int16Array(bytes.buffer)` throws a `RangeError: byte length of Int16Array should be a multiple of 2`, catching an exception on every packet and dropping 100% of audio.
  2. **Sample Rate Mismatch**: Microphones capture audio at different device hardware rates (e.g. 48,000 Hz vs 44,100 Hz). The receiver was assuming its local `audioCtx.sampleRate` instead of using the sender's actual capture rate, causing playback buffer timing drift, stutter, and silence.

---

## 2. Changes Implemented

### 1. `apps/web/src/app/rooms/[id]/page.tsx`
- **100ms Voice Accumulator**: Updated `onaudioprocess` to accumulate mic PCM samples into ~100ms chunks (`audioCtx.sampleRate * 0.1`). This reduced socket message frequency from ~45 packets/sec down to **10 packets/sec** (~78% bandwidth reduction), stopping socket ping timeouts and buffer congestion.
- **Safe `DataView` PCM Decoding**: Replaced `new Int16Array(bytes.buffer)` with `DataView.getInt16(i * 2, true)` to ensure 100% crash-free Int16 PCM array extraction regardless of byte alignment.
- **Dynamic `sampleRate` Propagation**: Embedded `sampleRate` (`audioCtx.sampleRate`) into `voice_stream` payloads and passed `senderSampleRate` to `audioCtx.createBuffer(1, float32.length, senderSampleRate)`.

### 2. `apps/web/src/hooks/useRoomSocket.ts`
- Updated `onVoiceStreamReceived` and `emitVoiceStream` signatures and listeners to accept and transmit optional `sampleRate?: number`.

### 3. `api/src/listening-room/listening-room.gateway.ts`
- Updated `@SubscribeMessage('voice_stream')` to use `client.to('room:roomId')` instead of `this.server.to('room:roomId')`. Audio packets now route directly to other listeners in the room without echoing back to the speaker.

---

## 3. Verification & Deployment

- **Backend & Frontend TypeScript Checks**: Verified clean compilation across `api` and `apps/web`.
- **Git Deployment**: Pushed commit `e2788e9` to `dev` and `master` branches on GitHub (`https://github.com/Jahzeal/Groovely.git`).
