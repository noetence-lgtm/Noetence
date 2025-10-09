/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI, Modality, LiveServerMessage, Blob} from '@google/genai';

// --- DOM elements ---
const callButton = document.getElementById('call-button') as HTMLButtonElement;
const muteButton = document.getElementById('mute-button') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLParagraphElement;
const transcriptionDiv = document.getElementById(
  'transcription',
) as HTMLDivElement;
const visualizerCanvas = document.getElementById(
  'visualizer-canvas',
) as HTMLCanvasElement;
const visualizerCtx = visualizerCanvas.getContext('2d');

// --- SVG Icons ---
const startCallIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.21-3.73-6.56-6.56l1.97-1.57c.27-.27.35-.66.24-1.01-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.65.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>`;
const endCallIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 9c-1.6 0-3.15.25-4.62.72v3.1c0 .34-.23.64-.56.71A4.995 4.995 0 015.02 12C6.11 10.9 7.34 10.01 8.68 9.38c.35-.16.75-.07 1.01.2l1.52 1.52c.24.24.58.32.89.21 1.25-.43 2.45-.93 3.56-1.5l-1.01-1.01c-.31-.32-.31-.85 0-1.17l.71-.71c.18-.18.42-.28.67-.28s.49.1.67.28l2.83 2.83c.18.18.28.42.28.67s-.1.49-.28.67l-2.24 2.24c-.27.27-.68.35-1.02.21-1.23-.52-2.52-1-3.83-1.39-.28-.08-.52-.28-.65-.54l-1.23-2.6c-.24-.51-.81-.79-1.35-.72zM3 4.27l1.41 1.41C4.19 6.05 4 6.51 4 7c0 2.21.9 4.21 2.36 5.64L3 16.27V17h13.73l3 3L21 18.73 4.27 2 3 3.27z"/></svg>`;
const micOnIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>`;
const micOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.55-.9L19.73 21 21 19.73 4.27 3z"/></svg>`;

// --- State variables ---
let isSessionActive = false;
let isMuted = false;
let sessionPromise: Promise<any> | null = null;
let mediaStream: MediaStream | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let animationFrameId: number | null = null;

// --- Audio contexts and helpers ---
let nextStartTime = 0;
const inputAudioContext = new (window.AudioContext ||
  (window as any).webkitAudioContext)({sampleRate: 16000});
const outputAudioContext = new (window.AudioContext ||
  (window as any).webkitAudioContext)({sampleRate: 24000});
const outputNode = outputAudioContext.createGain();
outputNode.connect(outputAudioContext.destination);
const sources = new Set<AudioBufferSourceNode>();

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Audio Visualizer ---
function drawVisualizer() {
  if (!analyser || !visualizerCtx || !isSessionActive || isMuted) {
    return;
  }

  animationFrameId = requestAnimationFrame(drawVisualizer);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

  const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  visualizerCtx.fillStyle = '#1877f2';

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] / 2.8; // Scale it down
    visualizerCtx.fillRect(
      x,
      visualizerCanvas.height - barHeight,
      barWidth,
      barHeight,
    );
    x += barWidth + 1; // Add 1 for spacing
  }
}

// --- Transcription display ---
let currentInputTranscription = '';
let currentOutputTranscription = '';
let currentInputParagraph: HTMLParagraphElement | null = null;
let currentOutputParagraph: HTMLParagraphElement | null = null;

function appendTranscription(text: string, isUser: boolean, isFinal: boolean) {
  if (isUser) {
    if (!currentInputParagraph) {
      currentInputParagraph = document.createElement('p');
      currentInputParagraph.className = 'user';
      currentInputParagraph.innerHTML = '<strong>You:</strong> ';
      transcriptionDiv.appendChild(currentInputParagraph);
    }
    currentInputParagraph.innerHTML = `<strong>You:</strong> ${text}`;
    if (isFinal) {
      currentInputParagraph = null;
    }
  } else {
    if (!currentOutputParagraph) {
      currentOutputParagraph = document.createElement('p');
      currentOutputParagraph.className = 'model';
      currentOutputParagraph.innerHTML = '<strong>Gemini:</strong> ';
      transcriptionDiv.appendChild(currentOutputParagraph);
    }
    currentOutputParagraph.innerHTML = `<strong>Gemini:</strong> ${text}`;
    if (isFinal) {
      currentOutputParagraph = null;
    }
  }
  transcriptionDiv.scrollTop = transcriptionDiv.scrollHeight;
}

// --- Main application logic ---
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

async function startSession() {
  statusDiv.textContent = 'Connecting...';
  sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
    callbacks: {
      onopen: async () => {
        statusDiv.textContent = 'Listening...';
        mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
        mediaStreamSource =
          inputAudioContext.createMediaStreamSource(mediaStream);
        scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        analyser = inputAudioContext.createAnalyser();
        analyser.fftSize = 256;

        mediaStreamSource.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);

        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          if (isMuted) return;
          const inputData =
            audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise?.then((session) => {
            session.sendRealtimeInput({media: pcmBlob});
          });
        };
        drawVisualizer();
      },
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
          const text = message.serverContent.inputTranscription.text;
          currentInputTranscription += text;
          appendTranscription(currentInputTranscription, true, false);
        } else if (message.serverContent?.outputTranscription) {
          const text = message.serverContent.outputTranscription.text;
          statusDiv.textContent = 'Thinking...';
          currentOutputTranscription += text;
          appendTranscription(currentOutputTranscription, false, false);
        }

        if (message.serverContent?.turnComplete) {
          appendTranscription(currentInputTranscription, true, true);
          appendTranscription(currentOutputTranscription, false, true);
          currentInputTranscription = '';
          currentOutputTranscription = '';
          if (!isMuted) statusDiv.textContent = 'Listening...';
        }

        const base64EncodedAudioString =
          message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (base64EncodedAudioString) {
          nextStartTime = Math.max(
            nextStartTime,
            outputAudioContext.currentTime,
          );
          const audioBuffer = await decodeAudioData(
            decode(base64EncodedAudioString),
            outputAudioContext,
            24000,
            1,
          );
          const source = outputAudioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputNode);
          source.addEventListener('ended', () => {
            sources.delete(source);
          });

          source.start(nextStartTime);
          nextStartTime = nextStartTime + audioBuffer.duration;
          sources.add(source);
        }

        const interrupted = message.serverContent?.interrupted;
        if (interrupted) {
          for (const source of sources.values()) {
            source.stop();
            sources.delete(source);
          }
          nextStartTime = 0;
        }
      },
      onerror: (e: ErrorEvent) => {
        console.error('Error:', e);
        statusDiv.textContent = `Error: ${e.message}. Please try again.`;
        stopSession();
      },
      onclose: () => {
        console.log('Session closed.');
      },
    },
  });
}

function stopSession() {
  isSessionActive = false;
  isMuted = false;
  callButton.classList.remove('end-call');
  callButton.innerHTML = startCallIcon;
  callButton.setAttribute('aria-label', 'Start call');
  muteButton.style.display = 'none';
  statusDiv.textContent = 'Click the phone icon to start the conversation';

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  visualizerCtx?.clearRect(
    0,
    0,
    visualizerCanvas.width,
    visualizerCanvas.height,
  );
  visualizerCanvas.style.display = 'none';

  scriptProcessor?.disconnect();
  scriptProcessor = null;
  analyser?.disconnect();
  analyser = null;
  mediaStreamSource?.disconnect();
  mediaStreamSource = null;
  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = null;

  sessionPromise?.then((session) => {
    session.close();
    sessionPromise = null;
  });

  currentInputTranscription = '';
  currentOutputTranscription = '';
  currentInputParagraph = null;
  currentOutputParagraph = null;
}

callButton.addEventListener('click', async () => {
  if (isSessionActive) {
    stopSession();
  } else {
    if (inputAudioContext.state === 'suspended') {
      await inputAudioContext.resume();
    }
    if (outputAudioContext.state === 'suspended') {
      await outputAudioContext.resume();
    }
    isSessionActive = true;
    callButton.classList.add('end-call');
    callButton.innerHTML = endCallIcon;
    callButton.setAttribute('aria-label', 'End call');

    muteButton.style.display = 'inline-flex';
    muteButton.classList.remove('muted');
    muteButton.innerHTML = micOnIcon;
    muteButton.setAttribute('aria-label', 'Mute microphone');

    transcriptionDiv.innerHTML = '';
    visualizerCanvas.style.display = 'block';
    await startSession();
  }
});

muteButton.addEventListener('click', () => {
  isMuted = !isMuted;
  if (isMuted) {
    muteButton.classList.add('muted');
    muteButton.innerHTML = micOffIcon;
    muteButton.setAttribute('aria-label', 'Unmute microphone');
    statusDiv.textContent = 'Muted';
    visualizerCtx?.clearRect(
      0,
      0,
      visualizerCanvas.width,
      visualizerCanvas.height,
    );
  } else {
    muteButton.classList.remove('muted');
    muteButton.innerHTML = micOnIcon;
    muteButton.setAttribute('aria-label', 'Mute microphone');
    statusDiv.textContent = 'Listening...';
    drawVisualizer();
  }
});
