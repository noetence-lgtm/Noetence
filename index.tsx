/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Custom Types ---
interface GeminiBlob {
  data: string;
  mimeType: string;
}

// --- DOM elements ---
const callButton = document.getElementById('call-button') as HTMLButtonElement;
const muteButton = document.getElementById('mute-button') as HTMLButtonElement;
const cameraButton = document.getElementById(
  'camera-button',
) as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLParagraphElement;
const transcriptionDiv = document.getElementById(
  'transcription',
) as HTMLDivElement;
const visualizerCanvas = document.getElementById(
  'visualizer-canvas',
) as HTMLCanvasElement;
const videoPreview = document.getElementById(
  'video-preview',
) as HTMLVideoElement;
const visualizerCtx = visualizerCanvas.getContext('2d');
const textInputForm = document.getElementById(
  'text-input-form',
) as HTMLFormElement;
const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
const sendButton = document.getElementById('send-button') as HTMLButtonElement;

// --- SVG Icons ---
const startCallIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.21-3.73-6.56-6.56l1.97-1.57c.27-.27.35-.66.24-1.01-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.65.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>`;
const endCallIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 9c-1.6 0-3.15.25-4.62.72v3.1c0 .34-.23.64-.56.71A4.995 4.995 0 015.02 12C6.11 10.9 7.34 10.01 8.68 9.38c.35-.16.75-.07 1.01.2l1.52 1.52c.24.24.58.32.89.21 1.25-.43 2.45-.93 3.56-1.5l-1.01-1.01c-.31-.32-.31-.85 0-1.17l.71-.71c.18-.18.42-.28.67-.28s.49.1.67.28l2.83 2.83c.18.18.28.42.28.67s-.1.49-.28.67l-2.24 2.24c-.27.27-.68.35-1.02.21-1.23-.52-2.52-1-3.83-1.39-.28-.08-.52-.28-.65-.54l-1.23-2.6c-.24-.51-.81-.79-1.35-.72zM3 4.27l1.41 1.41C4.19 6.05 4 6.51 4 7c0 2.21.9 4.21 2.36 5.64L3 16.27V17h13.73l3 3L21 18.73 4.27 2 3 3.27z"/></svg>`;
const micOnIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>`;
const micOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.55-.9L19.73 21 21 19.73 4.27 3z"/></svg>`;
const cameraOnIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`;
const cameraOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2z"/></svg>`;

// --- State variables ---
let isSessionActive = false;
let isMuted = false;
let isCameraOn = false;
let socket: WebSocket | null = null;
let mediaStream: MediaStream | null = null;
let videoStream: MediaStream | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let animationFrameId: number | null = null;
let frameIntervalId: number | null = null;
let smoothedDataArray: Uint8Array | null = null;
let isModelSpeaking = false; // Track if model is currently speaking

// Canvas for video frame capture
const frameCanvas = document.createElement('canvas');
const frameCtx = frameCanvas.getContext('2d');

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

function createBlob(data: Float32Array): GeminiBlob {
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

// CRITICAL FIX: Better audio interruption handling
function stopAllAudio() {
  // Stop all currently playing audio sources
  for (const source of sources.values()) {
    try {
      source.stop();
    } catch (e) {
      // Source might already be stopped
    }
    sources.delete(source);
  }
  // Reset the timing completely
  nextStartTime = outputAudioContext.currentTime;
}

// --- Video functions ---
const FRAME_RATE = 5;

function sendVideoFrame() {
  if (
    !isCameraOn ||
    !videoPreview ||
    socket?.readyState !== WebSocket.OPEN ||
    !frameCtx
  ) {
    return;
  }

  frameCanvas.width = videoPreview.videoWidth;
  frameCanvas.height = videoPreview.videoHeight;

  frameCtx.drawImage(
    videoPreview,
    0,
    0,
    frameCanvas.width,
    frameCanvas.height,
  );

  const dataUrl = frameCanvas.toDataURL('image/jpeg', 0.8);
  const base64Data = dataUrl.split(',')[1];

  if (base64Data) {
    const videoFrameBlob: GeminiBlob = {
      data: base64Data,
      mimeType: 'image/jpeg',
    };
    socket.send(
      JSON.stringify({type: 'video-frame', payload: videoFrameBlob}),
    );
  }
}

async function startCamera() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({video: true});
    videoPreview.srcObject = videoStream;
    videoPreview.style.display = 'block';
    if (frameIntervalId) clearInterval(frameIntervalId);
    frameIntervalId = window.setInterval(sendVideoFrame, 1000 / FRAME_RATE);
  } catch (err) {
    console.error('Error accessing camera:', err);
    statusDiv.textContent = 'Could not access camera.';
    isCameraOn = false;
    cameraButton.classList.add('off');
    cameraButton.innerHTML = cameraOffIcon;
    cameraButton.setAttribute('aria-label', 'Turn on camera');
  }
}

function stopCamera() {
  if (frameIntervalId) {
    clearInterval(frameIntervalId);
    frameIntervalId = null;
  }
  videoStream?.getTracks().forEach((track) => track.stop());
  videoStream = null;
  videoPreview.srcObject = null;
  videoPreview.style.display = 'none';
}

// --- Audio Visualizer ---
const SMOOTHING_FACTOR = 0.8;

function drawVisualizer() {
  if (!analyser || !visualizerCtx || !isSessionActive || isMuted) {
    return;
  }

  animationFrameId = requestAnimationFrame(drawVisualizer);

  const bufferLength = analyser.frequencyBinCount;
  if (!smoothedDataArray) {
    smoothedDataArray = new Uint8Array(bufferLength).fill(0);
  }
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  visualizerCtx.clearRect(
    0,
    0,
    visualizerCanvas.width,
    visualizerCanvas.height,
  );

  const gradient = visualizerCtx.createLinearGradient(
    0,
    visualizerCanvas.height,
    0,
    0,
  );
  gradient.addColorStop(0, '#32e0c4');
  gradient.addColorStop(0.5, '#2575fc');
  gradient.addColorStop(1, '#6a11cb');
  visualizerCtx.fillStyle = gradient;

  const barWidth = 4;
  const spacing = 2;
  const centerX = visualizerCanvas.width / 2;
  const numBarsToDisplay = 64;

  for (let i = 0; i < numBarsToDisplay; i++) {
    smoothedDataArray[i] =
      smoothedDataArray[i] * SMOOTHING_FACTOR +
      dataArray[i] * (1 - SMOOTHING_FACTOR);
    const barHeight =
      Math.pow(smoothedDataArray[i] / 255, 2) * visualizerCanvas.height;
    if (barHeight > 1) {
      visualizerCtx.fillRect(
        centerX + i * (barWidth + spacing),
        visualizerCanvas.height - barHeight,
        barWidth,
        barHeight,
      );
      visualizerCtx.fillRect(
        centerX - (i + 1) * (barWidth + spacing),
        visualizerCanvas.height - barHeight,
        barWidth,
        barHeight,
      );
    }
  }
}

// --- Transcription display ---
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

function appendToolCall(
  toolName: string,
  toolArgs: object,
  toolResult: string,
) {
  const toolCallParagraph = document.createElement('p');
  toolCallParagraph.className = 'tool-call';
  const argsString = JSON.stringify(toolArgs, null, 2);
  toolCallParagraph.innerHTML = `
    <strong>🔧 Tool Executed</strong>
    <div><pre><strong>Name:</strong> ${toolName}\n<strong>Arguments:</strong> ${argsString}\n<strong>Result:</strong> ${toolResult}</pre></div>
  `;
  transcriptionDiv.appendChild(toolCallParagraph);
  transcriptionDiv.scrollTop = transcriptionDiv.scrollHeight;
}

// --- Main application logic ---

function startSession() {
  statusDiv.textContent = 'Connecting...';
  const wsUrl = `ws://${window.location.hostname}:3001`;
  socket = new WebSocket(wsUrl);

  socket.onopen = async () => {
    console.log('WebSocket connected. Starting session...');
    socket?.send(JSON.stringify({type: 'start-session'}));
  };

  socket.onmessage = async (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case 'session-started':
        statusDiv.textContent = 'Listening...';
        mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
        mediaStreamSource =
          inputAudioContext.createMediaStreamSource(mediaStream);
        scriptProcessor = inputAudioContext.createScriptProcessor(2048, 1, 1);
        analyser = inputAudioContext.createAnalyser();
        analyser.fftSize = 256;

        mediaStreamSource.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);

        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          if (isMuted || socket?.readyState !== WebSocket.OPEN) return;
          const inputData =
            audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          // --- Requested change: log when sending audio chunks ---
          console.log(`[Audio] Sending chunk — ${inputData.length} samples`);
          socket.send(JSON.stringify({type: 'audio-data', payload: pcmBlob}));
        };
        drawVisualizer();
        break;

      case 'user-transcription':
        appendTranscription(message.text, true, false);
        break;

      case 'gemini-transcription':
        isModelSpeaking = true;
        statusDiv.textContent = 'Gemini is speaking...';
        appendTranscription(message.text, false, false);
        break;

      case 'turn-complete':
        isModelSpeaking = false;
        appendTranscription(message.finalUserText, true, true);
        appendTranscription(message.finalModelText, false, true);
        if (!isMuted) statusDiv.textContent = 'Listening...';
        break;

      case 'tool-call':
        appendToolCall(message.toolName, message.toolArgs, message.toolResult);
        break;

      case 'audio-data':
        const base64EncodedAudioString = message.data;
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
            // Check if all audio finished playing
            if (sources.size === 0 && isModelSpeaking) {
              isModelSpeaking = false;
              if (!isMuted) statusDiv.textContent = 'Listening...';
            }
          });
          source.start(nextStartTime);
          nextStartTime = nextStartTime + audioBuffer.duration;
          sources.add(source);
        }
        break;

      case 'interrupted':
        // CRITICAL FIX: Properly handle interruption
        console.log('Model was interrupted, stopping audio playback');
        isModelSpeaking = false;
        stopAllAudio();
        // Clear the incomplete model transcription
        if (currentOutputParagraph) {
          currentOutputParagraph.remove();
          currentOutputParagraph = null;
        }
        if (!isMuted) statusDiv.textContent = 'Listening...';
        break;

      case 'error':
        console.error('Error from server:', message.message);
        statusDiv.textContent = `Error: ${message.message}. Please try again.`;
        stopSession();
        break;
      case 'session-closed':
        console.log('Session closed by server.');
        stopSession();
        break;
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket Error:', error);
    statusDiv.textContent = 'Connection error. Please try again.';
    stopSession();
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected.');
    if (isSessionActive) {
      stopSession();
    }
  };
}

function stopSession() {
  if (!isSessionActive) return;

  isSessionActive = false;
  isMuted = false;

  if (isCameraOn) {
    isCameraOn = false;
    stopCamera();
  }

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({type: 'stop-session'}));
    socket.close();
  }
  socket = null;

  callButton.classList.remove('end-call');
  callButton.innerHTML = startCallIcon;
  callButton.setAttribute('aria-label', 'Start call');

  muteButton.style.display = 'none';
  cameraButton.style.display = 'none';
  textInputForm.style.display = 'none';

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
  videoPreview.style.display = 'none';

  scriptProcessor?.disconnect();
  scriptProcessor = null;
  analyser?.disconnect();
  analyser = null;
  mediaStreamSource?.disconnect();
  mediaStreamSource = null;
  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = null;
  smoothedDataArray = null;

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
    // interruptionCounter = 0; // Reset on new call
    callButton.classList.add('end-call');
    callButton.innerHTML = endCallIcon;
    callButton.setAttribute('aria-label', 'End call');

    muteButton.style.display = 'inline-flex';
    muteButton.classList.remove('muted');
    muteButton.innerHTML = micOnIcon;
    muteButton.setAttribute('aria-label', 'Mute microphone');

    cameraButton.style.display = 'inline-flex';
    cameraButton.classList.add('off');
    cameraButton.innerHTML = cameraOffIcon;
    cameraButton.setAttribute('aria-label', 'Turn on camera');
    isCameraOn = false;

    textInputForm.style.display = 'flex';
    textInput.value = '';

    transcriptionDiv.innerHTML = '';
    visualizerCanvas.style.display = 'block';
    startSession();
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

cameraButton.addEventListener('click', () => {
  if (!isSessionActive) return;
  isCameraOn = !isCameraOn;
  if (isCameraOn) {
    cameraButton.classList.remove('off');
    cameraButton.innerHTML = cameraOnIcon;
    cameraButton.setAttribute('aria-label', 'Turn off camera');
    startCamera();
  } else {
    cameraButton.classList.add('off');
    cameraButton.innerHTML = cameraOffIcon;
    cameraButton.setAttribute('aria-label', 'Turn on camera');
    stopCamera();
  }
});

// --- Text input handling ---

// Auto-resize textarea
textInput.addEventListener('input', () => {
  textInput.style.height = 'auto';
  textInput.style.height = `${textInput.scrollHeight}px`;
});

// Handle text input submission
async function handleTextSubmit() {
  const text = textInput.value.trim();
  if (!text || !socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  // Display user's text immediately in the transcript
  const p = document.createElement('p');
  p.className = 'user';
  p.innerHTML = `<strong>You:</strong> ${text}`;
  transcriptionDiv.appendChild(p);
  transcriptionDiv.scrollTop = transcriptionDiv.scrollHeight;

  // Send to server
  socket.send(JSON.stringify({type: 'text-input', payload: text}));

  // Clear input
  textInput.value = '';
  textInput.style.height = 'auto'; // Reset height
  textInput.focus();
}

textInputForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleTextSubmit();
});

textInput.addEventListener('keydown', (e) => {
  // Submit on Enter, new line on Shift+Enter
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleTextSubmit();
  }
});
