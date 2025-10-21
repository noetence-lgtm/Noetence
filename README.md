## Run Locally

# Gemini Live Audio Chat

A real-time voice conversation application powered by Google's Gemini AI with bidirectional audio streaming, video support, and function calling capabilities.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

### Required Software

1. **Node.js** (Version 18.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version
     # Should output: v18.0.0 or higher
     ```

2. **Package Manager**
   - **npm** (comes with Node.js):
     ```bash
     npm --version
     # Should output: 8.0.0 or higher
     ```
   - **OR pnpm** (recommended for faster installs):
     ```bash
     npm install -g pnpm
     pnpm --version
     ```

3. **Git** (for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation:
     ```bash
     git --version
     ```

### Required API Access

4. **Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/apikey)
   - Click "Get API Key" or "Create API Key"
   - Copy the generated key (starts with `AIza...`)
   - Keep this key secure and never commit it to version control

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+, or Safari 14+
- **Microphone**: Built-in or external microphone for voice input
- **Camera** (optional): For video features
- **Internet Connection**: Stable connection required for API calls

---

## 🚀 Complete Setup Guide

### Step 1: Clone the Repository

Open your terminal and run:

```bash
# Clone the repository
git clone https://github.com/noetence-lgtm/Noetence.git

# Navigate into the project directory
cd Noetence
```

**Alternative**: Download as ZIP
- Click "Code" → "Download ZIP" on GitHub
- Extract the ZIP file
- Open terminal in the extracted folder

---

### Step 2: Install Dependencies

Choose your preferred package manager:

#### Option A: Using npm (Default)

```bash
npm install
```

This will install all required dependencies:
- `@google/genai` - Google Gemini AI SDK
- `express` - Web server framework
- `ws` - WebSocket server
- `dotenv` - Environment variable management
- `vite` - Frontend build tool
- `typescript` - TypeScript compiler
- And all development dependencies

**Expected output:**
```
added 243 packages, and audited 244 packages in 45s
```

#### Option B: Using pnpm (Faster)

```bash
pnpm install
```

**Expected output:**
```
Packages: +243
+++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 243, reused 243, downloaded 0, added 243, done
```

#### Troubleshooting Installation

**If you encounter permission errors:**

On macOS/Linux:
```bash
sudo npm install
```

On Windows (run as Administrator):
```bash
npm install
```

**If installation is slow or fails:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

**If you get node-gyp errors:**
- Windows: Install [Windows Build Tools](https://github.com/nodejs/node-gyp#on-windows)
- macOS: Install Xcode Command Line Tools: `xcode-select --install`
- Linux: Install build essentials: `sudo apt-get install build-essential`

---

### Step 3: Configure Environment Variables

#### 3.1 Create the Environment File

In the **root directory** of your project (same level as `package.json`), create a file named `.env.local`:

**On macOS/Linux:**
```bash
touch .env.local
```

**On Windows (Command Prompt):**
```cmd
type nul > .env.local
```

**Or manually:**
- Right-click in the project folder
- New → Text Document
- Name it `.env.local` (remove the .txt extension)

#### 3.2 Add Your Configuration

Open `.env.local` in any text editor and add:

```env
# Required: Your Gemini API Key
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: Change the server port (default: 3001)
PORT=3001
```

**Replace** `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` with your actual API key from Google AI Studio.

#### 3.3 Verify Configuration

**Important Checklist:**
- ✅ File is named exactly `.env.local` (with the dot at the start)
- ✅ File is in the project root directory (next to `package.json`)
- ✅ No spaces around the `=` sign
- ✅ No quotes around the API key
- ✅ API key starts with `AIza`

#### 3.4 Add to .gitignore (Security)

Ensure `.env.local` is in your `.gitignore` file to prevent accidentally committing your API key:

```bash
# Check if it's already ignored
cat .gitignore | grep .env.local

# If not present, add it
echo ".env.local" >> .gitignore
```

---

### Step 4: Build the Project (TypeScript Compilation)

Compile the TypeScript code to JavaScript:

```bash
npm run build
```

**Expected output:**
```
> gemini-live-backend@1.0.0 build
> tsc

✓ TypeScript compilation successful
```

This creates a `dist/` folder with compiled JavaScript files.

**If build fails:**
- Check for TypeScript errors in your code
- Ensure all dependencies are installed
- Verify `tsconfig.json` exists and is valid

---

### Step 5: Run the Application

You have multiple options for running the application:

#### Option A: Development Mode (Recommended for Testing)

This runs both the frontend and backend with hot-reloading:

```bash
npm run dev:all
```

**What happens:**
- Backend starts on `http://localhost:3001`
- Frontend starts on `http://localhost:3000`
- Changes to code automatically trigger recompilation
- Console shows logs from both servers

**Expected output:**
```
[backend] ✓ API key loaded successfully
[backend] ✓ Server listening on http://localhost:3001
[backend] ✓ WebSocket ready for connections
[frontend] 
[frontend]   VITE v5.0.0  ready in 234 ms
[frontend] 
[frontend]   ➜  Local:   http://localhost:3000/
[frontend]   ➜  Network: use --host to expose
```

#### Option B: Run Frontend and Backend Separately

Useful if you need separate terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

#### Option C: Production Mode

For production deployment:

```bash
# 1. Build the project
npm run build

# 2. Start the production server
npm start
```

**Note:** In production mode, you'll need to serve the frontend static files separately or configure Express to serve them.

---

### Step 6: Access the Application

#### 6.1 Open Your Browser

Navigate to:
```
http://localhost:3000
```

#### 6.2 Grant Permissions

When you start a call, your browser will request:

1. **Microphone Permission**
   - Click "Allow" in the browser prompt
   - Required for voice input

2. **Camera Permission** (when you enable video)
   - Click "Allow" when prompted
   - Optional feature

**If permissions are blocked:**
- Chrome: Click the lock icon in the address bar → Site settings → Allow microphone/camera
- Firefox: Click the shield icon → Permissions → Allow microphone/camera
- Safari: Safari menu → Settings → Websites → Allow

#### 6.3 Verify Connection

You should see:
- ✅ Page loads with title "Gemini Live Audio Chat"
- ✅ Status shows "Click the phone icon to start the conversation"
- ✅ Green phone button is visible
- ✅ No errors in browser console (press F12 to check)

**Backend verification:**
Your terminal should show:
```
✓ API key loaded successfully
✓ Server listening on http://localhost:3001
✓ WebSocket ready for connections
```

---

### Step 7: First Test Run

#### 7.1 Start a Conversation

1. Click the **green phone icon**
2. Allow microphone access when prompted
3. Wait for status to change to "Listening..."
4. Say "Hello, can you hear me?"

#### 7.2 Expected Behavior

- ✅ Audio visualizer appears and animates with your voice
- ✅ Your speech appears in real-time under "You:"
- ✅ Gemini's response appears under "Gemini:"
- ✅ You hear Gemini's voice response
- ✅ Backend logs show: `Client connected` and `Starting session...`

#### 7.3 Test Features

**Test Interruption:**
1. Ask: "Can you count to 20 slowly?"
2. Start talking while Gemini is counting
3. Gemini should stop and listen to you

**Test Text Input:**
1. Type a message in the text box
2. Press Enter or click send
3. Gemini should respond

**Test Camera:**
1. Click the camera button
2. Allow camera access
3. Video preview appears (mirrored)
4. Ask Gemini to describe what it sees

**Test Function Calling:**
1. Ask: "What time is it in Tokyo?"
2. You should see a yellow tool call box appear
3. Gemini responds with the current time

---

## 🔍 Verify Installation

### Check File Structure

Your project should look like this:

```
gemini-live-audio-chat/
├── .env.local                 ✓ (you created this)
├── .gitignore
├── index.html
├── index.tsx
├── index.css
├── package.json
├── package-lock.json          ✓ (created by npm install)
├── tsconfig.json
├── vite.config.ts
├── metadata.json
├── node_modules/              ✓ (created by npm install)
│   ├── @google/
│   ├── express/
│   ├── ws/
│   └── ... (many more packages)
├── src/
│   ├── server.ts
│   └── tools.ts
└── dist/                      ✓ (created by npm run build)
    ├── server.js
    └── tools.js
```

### Check Running Processes

**Verify ports are not in use:**

On macOS/Linux:
```bash
# Check if port 3000 is free
lsof -i :3000

# Check if port 3001 is free
lsof -i :3001
```

On Windows:
```cmd
# Check if port 3000 is free
netstat -ano | findstr :3000

# Check if port 3001 is free
netstat -ano | findstr :3001
```

**If ports are in use:**
- Kill the processes using those ports
- Or change the PORT in `.env.local` and update `vite.config.ts`

---

## 🐛 Common Setup Issues

### Issue: "Cannot find module '@google/genai'"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "GEMINI_API_KEY is not set"

**Solution:**
1. Check `.env.local` exists in root directory
2. Verify file contains: `GEMINI_API_KEY=your_key`
3. Ensure no spaces: `GEMINI_API_KEY=AIza...` (not `GEMINI_API_KEY = AIza...`)
4. Restart the server after editing

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change PORT in .env.local
```

### Issue: "WebSocket connection failed"

**Solution:**
1. Ensure backend is running (`npm run dev:backend`)
2. Check firewall isn't blocking port 3001
3. Verify URL in browser is `http://localhost:3000` (not `https`)
4. Check browser console for detailed error messages

### Issue: TypeScript compilation errors

**Solution:**
```bash
# Clean build
rm -rf dist
npm run build

# Check TypeScript version
npx tsc --version

# Reinstall TypeScript
npm install -D typescript@latest
```

### Issue: Microphone not working

**Solution:**
1. Check browser permissions: `chrome://settings/content/microphone`
2. Test microphone in system settings
3. Close other apps using the microphone (Zoom, Skype, etc.)
4. Try a different browser
5. Check browser console for errors

### Issue: No audio output from Gemini

**Solution:**
1. Check system volume is not muted
2. Click anywhere on the page first (browser autoplay policy)
3. Check browser console for Web Audio API errors
4. Try refreshing the page
5. Verify your API key has access to audio features

---

## 🔄 Updating the Application

### Pull Latest Changes

```bash
# Get latest code
git pull origin main

# Reinstall dependencies (if package.json changed)
npm install

# Rebuild
npm run build

# Restart server
npm run dev:all
```

### Reset to Clean State

```bash
# Remove all dependencies and build files
rm -rf node_modules dist package-lock.json

# Reinstall everything
npm install
npm run build
npm run dev:all
```

---

## 📚 Next Steps

After successful setup:

1. **Explore Features**: Try all the buttons and features
2. **Check Logs**: Open browser console (F12) to see detailed logs
3. **Customize**: Modify `index.css` to change UI colors
4. **Add Tools**: Create custom functions in `src/tools.ts`
5. **Deploy**: Consider deploying to cloud platforms (Vercel, Railway, etc.)

---

## 🆘 Getting Help

If you're still having issues:

1. **Check Browser Console**: Press F12 and look for red errors
2. **Check Backend Logs**: Look at the terminal running the server
3. **Verify API Key**: Test it at [Google AI Studio](https://aistudio.google.com/)
4. **Review Documentation**: [Gemini API Docs](https://ai.google.dev/docs)
5. **Check System Requirements**: Ensure your setup meets all prerequisites

---

**You're all set! 🎉** Click the green phone button and start chatting with Gemini!
