/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import {
  GoogleGenAI,
  Modality,
  LiveServerMessage,
} from '@google/genai';
import dotenv from 'dotenv';
import {
  getCurrentTime,
  getCurrentTimeFunctionDeclaration,
} from './tools.js';

// Load .env.local file from the project root
dotenv.config({ path: '.env.local' });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

// Check for GEMINI_API_KEY or API_KEY
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.error('---');
  console.error('ERROR: GEMINI_API_KEY is not set in your .env.local file.');
  console.error('Please make sure your .env.local file contains:');
  console.error('GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE');
  console.error('---');
  throw new Error(
    'GEMINI_API_KEY environment variable is not set in .env.local',
  );
}

console.log('✓ API key loaded successfully');

const ai = new GoogleGenAI({ httpOptions: {"apiVersion": "v1alpha"},apiKey: API_KEY });

interface SessionState {
  session: any; // The Gemini session object
  currentInputTranscription: string;
  currentOutputTranscription: string;
  wasInterrupted: boolean;
}

const sessions = new Map<WebSocket, SessionState>();

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
            enableAffectiveDialog: true,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            tools: [
              { googleSearch: {} },
              { functionDeclarations: [getCurrentTimeFunctionDeclaration] },
            ],
          },
          callbacks: {
            onopen: () => {
              console.log('Gemini session opened.');
              ws.send(JSON.stringify({ type: 'session-started' }));
            },
            onmessage: (response: LiveServerMessage) => {
              const sessionState = sessions.get(ws);
              if (!sessionState) return;

              // Handle tool calls from the model
              if (response.toolCall?.functionCalls) {
                for (const fc of response.toolCall.functionCalls) {
                  if (
                    fc.name === 'getCurrentTime' &&
                    fc.args &&
                    typeof fc.args.timezone === 'string'
                  ) {
                    const timezone = fc.args.timezone;
                    console.log(`Tool call: getCurrentTime for timezone "${timezone}"`);
                    const timeResult = getCurrentTime(timezone);

                    // Send result back to Gemini
                    sessionState.session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: timeResult },
                      },
                    });

                    // Notify the client for better UX
                    ws.send(
                      JSON.stringify({
                        type: 'tool-call',
                        toolName: fc.name,
                        toolArgs: fc.args,
                        toolResult: timeResult,
                      }),
                    );
                  }
                }
              }

              // Handle transcriptions and audio data
              const serverContent = response.serverContent;
              if (serverContent) {
                if (serverContent.inputTranscription) {
                  sessionState.currentInputTranscription +=
                    serverContent.inputTranscription.text;
                  ws.send(
                    JSON.stringify({
                      type: 'user-transcription',
                      text: sessionState.currentInputTranscription,
                    }),
                  );
                } else if (serverContent.outputTranscription) {
                  sessionState.currentOutputTranscription +=
                    serverContent.outputTranscription.text;
                  ws.send(
                    JSON.stringify({
                      type: 'gemini-transcription',
                      text: sessionState.currentOutputTranscription,
                    }),
                  );
                }

                // Log Google Search usage
                if (serverContent.modelTurn?.parts) {
                  for (const part of serverContent.modelTurn.parts) {
                    if (part.executableCode) {
                      console.log('🔍 Google Search used - executableCode: %s', part.executableCode.code);
                    }
                    if (part.codeExecutionResult) {
                      console.log('🔍 Google Search result - codeExecutionResult: %s', part.codeExecutionResult.output);
                    }
                  }
                }

                const audioData =
                  serverContent.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                  ws.send(JSON.stringify({ type: 'audio-data', data: audioData }));
                }

                if (serverContent.interrupted) {
                  console.log('Model was interrupted');
                  ws.send(JSON.stringify({ type: 'interrupted' }));
                  // Set flag to handle the following turnComplete message
                  sessionState.wasInterrupted = true;
                }

                if (serverContent.turnComplete) {
                  // If the turn completes after an interruption, the client has already
                  // handled the UI finalization. Sending this can cause blank entries.
                  if (!sessionState.wasInterrupted) {
                    ws.send(
                      JSON.stringify({
                        type: 'turn-complete',
                        finalUserText: sessionState.currentInputTranscription,
                        finalModelText: sessionState.currentOutputTranscription,
                      }),
                    );
                  }
                  // Reset state for the next turn.
                  sessionState.currentInputTranscription = '';
                  sessionState.currentOutputTranscription = '';
                  sessionState.wasInterrupted = false; // Reset the flag
                }
              }
            },
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
        sessions.set(ws, {
          session,
          currentInputTranscription: '',
          currentOutputTranscription: '',
          wasInterrupted: false,
        });
      } catch (error: any) {
        console.error('Failed to start session:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            message: error.message || 'Failed to start session.',
          }),
        );
      }
    } else if (data.type === 'audio-data') {
      const sessionState = sessions.get(ws);
      if (sessionState) {
        sessionState.session.sendRealtimeInput({ media: data.payload });
      }
    } else if (data.type === 'video-frame') {
      const sessionState = sessions.get(ws);
      if (sessionState) {
        sessionState.session.sendRealtimeInput({ media: data.payload });
      }
    } else if (data.type === 'text-input') {
      const sessionState = sessions.get(ws);
      if (sessionState) {
        console.log(`Received text input: "${data.payload}"`);
        sessionState.session.sendRealtimeInput({ text: data.payload });
      }
    } else if (data.type === 'stop-session') {
      console.log('Stopping session...');
      const sessionState = sessions.get(ws);
      if (sessionState) {
        sessionState.session.close();
        sessions.delete(ws);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    const sessionState = sessions.get(ws);
    if (sessionState) {
      sessionState.session.close();
      sessions.delete(ws);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    const sessionState = sessions.get(ws);
    if (sessionState) {
      sessionState.session.close();
      sessions.delete(ws);
    }
  });
});

server.listen(PORT, () => {
  console.log(`✓ Server listening on http://localhost:${PORT}`);
  console.log(`✓ WebSocket ready for connections`);
});
