const { io } = require('socket.io-client');
const http = require('https');

const API_BASE = 'https://groovely-ttyi.onrender.com';
const GATEWAY_URL = 'https://groovely-ttyi.onrender.com/rooms';

console.log('--- FETCHING REAL ROOM FROM BACKEND API ---');

http.get(`${API_BASE}/api/rooms`, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      const rooms = data?.data?.rooms || data?.rooms || [];
      console.log(`Found ${rooms.length} rooms in database.`);
      let roomId = 1;
      if (rooms.length > 0) {
        roomId = rooms[0].id;
      }
      runSocketTest(roomId);
    } catch (e) {
      console.warn('Fallback to roomId = 1:', e.message);
      runSocketTest(1);
    }
  });
}).on('error', (err) => {
  console.warn('HTTP error, fallback to roomId = 1:', err.message);
  runSocketTest(1);
});

function runSocketTest(roomId) {
  console.log(`--- TESTING VOICE SOCKET BROADCAST ON ROOM ID #${roomId} ---`);

  const speakerSocket = io(GATEWAY_URL, {
    transports: ['websocket', 'polling'],
    reconnection: false,
  });

  const listenerSocket = io(GATEWAY_URL, {
    transports: ['websocket', 'polling'],
    reconnection: false,
  });

  let voicePacketReceived = false;

  listenerSocket.on('connect', () => {
    console.log('✅ Listener socket connected: ID =', listenerSocket.id);
    listenerSocket.emit('join_room', { roomId, userId: 999992, role: 'listener' });
  });

  speakerSocket.on('connect', () => {
    console.log('✅ Speaker socket connected: ID =', speakerSocket.id);
    speakerSocket.emit('join_room', { roomId, userId: 999991, role: 'host' });

    setTimeout(() => {
      console.log('🎙️ Speaker sending test voice packet...');
      const dummyAudio = 'AAAA/v8AAP7/AAD+/wAA/v8AAP7/AAD+/wAA/v8=';
      speakerSocket.emit('voice_stream', {
        roomId,
        userId: 999991,
        audioData: dummyAudio,
        sampleRate: 48000
      });
    }, 1500);
  });

  listenerSocket.on('voice_stream_received', (data) => {
    console.log('🔊 VOICE PACKET RECEIVED BY LISTENER!', {
      senderUserId: data.userId,
      sampleRate: data.sampleRate,
      payloadLength: data.audioData?.length
    });
    voicePacketReceived = true;
    finish(0);
  });

  function finish(code) {
    setTimeout(() => {
      speakerSocket.disconnect();
      listenerSocket.disconnect();
      if (voicePacketReceived) {
        console.log('🎉 REAL-TIME VOICE STREAMING TEST PASSED SUCCESSFULLY!');
      } else {
        console.error('❌ VOICE STREAM TEST FAILED.');
      }
      process.exit(code);
    }, 500);
  }

  setTimeout(() => {
    if (!voicePacketReceived) {
      console.error('⏱️ TIMEOUT: Gateway did not deliver voice stream packet within 10s.');
      finish(1);
    }
  }, 10000);
}
