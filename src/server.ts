/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable is not set.');
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const sessions = new Map<WebSocket, any>();

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === 'start-session') {
      console.log('Starting session...');
      try {
        const session = await ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              console.log('Gemini session opened.');
              ws.send(JSON.stringify({ type: 'session-started' }));
            },
            onmessage: (response: LiveServerMessage) => {
              ws.send(JSON.stringify({ type: 'gemini-response', payload: response }));
            },
            // FIX: The onerror callback expects an ErrorEvent, not an Error.
            onerror: (e: ErrorEvent) => {
              console.error('Gemini error:', e);
              ws.send(JSON.stringify({ type: 'error', message: e.message }));
            },
            onclose: () => {
              console.log('Gemini session closed.');
              ws.send(JSON.stringify({ type: 'session-closed' }));
              sessions.delete(ws);
            },
          },
        });
        sessions.set(ws, session);
      } catch (error: any) {
        console.error('Failed to start session:', error);
        ws.send(JSON.stringify({ type: 'error', message: error.message || 'Failed to start session.' }));
      }
    } else if (data.type === 'audio-data') {
      const session = sessions.get(ws);
      if (session) {
        session.sendRealtimeInput({ media: data.payload });
      }
    } else if (data.type === 'stop-session') {
      console.log('Stopping session...');
      const session = sessions.get(ws);
      if (session) {
        session.close();
        sessions.delete(ws);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    const session = sessions.get(ws);
    if (session) {
      session.close();
      sessions.delete(ws);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    const session = sessions.get(ws);
    if (session) {
      session.close();
      sessions.delete(ws);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
