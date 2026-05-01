# Sign Language Translator - Deployment & Testing Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ installed
- Node.js & npm installed
- Webcam connected
- All models loaded in `backend/models/`
- All class files in `backend/classes/`

### Step 1: Backend Setup & Launch

```powershell
# Navigate to backend
cd c:\sign-language-translator\backend

# Install Python dependencies
pip install -r requirements.txt

# Or install manually:
pip install fastapi uvicorn tensorflow>=2.10 mediapipe opencv-python python-docx googletrans==4.0.47

# Start the server (runs on port 8000)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**✅ Success Indicator**: Console shows:
```
Loading Models...
Models Loaded Successfully
Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Frontend Setup & Launch

```powershell
# Navigate to frontend
cd c:\sign-language-translator\frontend\vite-project

# Install dependencies
npm install

# Start development server (runs on port 5173)
npm run dev
```

**✅ Success Indicator**: Console shows:
```
VITE v5.x.x  ready in xxx ms
Port: 5173
```

### Step 3: Open Application

- Open browser: **http://localhost:5173**
- Wait for "Connected" status badge to appear
- Camera feed should show mirrored video

---

## 🎯 Feature Overview

### Detection Modes
| Mode | Hands | Description | Models |
|------|-------|-------------|--------|
| **ASL** | 1 | American Sign Language letters/words | `asl_model.h5` |
| **Hindi** | 1 | Indian Sign Language (devanagari) | `hindimodal.h5` |
| **English Words** | 2 | English words (two-hand) | `acc.h5` |

### Translation Languages
- **Hindi** (🇮🇳) - Uses Google Translate (hi)
- **Tamil** (🇮🇳) - Uses Google Translate (ta)  
- **Malayalam** (🇮🇳) - Uses Google Translate (ml)

### Export
- Words automatically saved to `backend/output.docx`
- Click "Download" button to retrieve document

---

## 📝 Workflow Example

### Step-by-Step Usage

1. **Select Detection Mode**
   - Dropdown: "ASL" / "Hindi" / "English Words"

2. **Optionally Select Translation Language**
   - Dropdown: Leave blank for English, or select Hindi/Tamil/Malayalam

3. **Click "Start Camera"**
   - Video feed appears, mirrored
   - Status shows "Connected" ✓

4. **Perform Sign**
   - **For ASL/Hindi**: Show single hand
   - **For English Words**: Show BOTH hands side-by-side

5. **Hold for 2 Seconds**
   - Backend detects landmarks
   - Shows prediction in console with confidence
   - After 2 seconds: Word confirmed and added to sentence

6. **Repeat**
   - Continue for more words

7. **Export**
   - Click "Download" to get Word document
   - Or click "Restart" to clear sentence

8. **Optional: Translate**
   - If translation language selected, appears below detected sentence
   - Auto-updates as new words are added

---

## 🔧 Configuration & Debugging

### Backend Console Output Examples

**Successful Detection**:
```
[ASL] Predicted: Hello, Confidence: 0.92
⏱️  Holding: Hello (1.5s / 2s) | Confidence: 0.92
✓ CONFIRMED: Hello | Sentence: Hello 
```

**Waiting for Gesture**:
```
🔄 State Changed: (blank) → Waiting
[ASL] Predicted: (no valid prediction)
```

**Two-Hand Mode Waiting**:
```
[English Words] Waiting for 2 hands, detected: 1
```

### Adjust Confidence Threshold

Edit `backend/main.py`:
```python
CONFIDENCE_THRESHOLD = 0.5  # Currently 50%
# Lower value (e.g., 0.3) = More sensitive but more false positives
# Higher value (e.g., 0.7) = More strict but might miss valid signs
```

### Adjust Hand Detection Confidence

Edit `backend/main.py`:
```python
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,  # Lower = more sensitive to hand detection
    min_tracking_confidence=0.7    # Stability of detected hands
)
```

### Adjust Confirmation Time

Edit `backend/main.py`:
```python
if elapsed >= 2:  # Currently 2 seconds
```

---

## 🐛 Troubleshooting

### Issue: "Connecting..." (WebSocket never connects)
**Solution**:
- Verify backend is running on port 8000
- Check firewall allows local connections
- Browser console (F12) should show no errors
- Terminal test: `netstat -ano | findstr :8000`

### Issue: Camera feed shows but no predictions
**Solution**:
- Try moving hand closer to camera
- Check MediaPipe hand detection working
- Look at backend console - any logs appearing?
- Lower `min_detection_confidence` in main.py
- Try different background/lighting

### Issue: Predictions show in console but not in frontend
**Solution**:
- Check frontend console (F12) for errors
- Verify WebSocket message sending/receiving
- Try refreshing browser page
- Check Firefox/Chrome compatibility

### Issue: Words not being added after 2 seconds
**Solution**:
- Hold pose steadier/longer (try 3 seconds)
- Lower `CONFIDENCE_THRESHOLD` in backend
- Increase prediction confidence of hand gesture
- Check console shows "✓ CONFIRMED"

### Issue: Wrong words being detected
**Solution**:
- Model may need retraining with your hand gestures
- Try exaggerating the hand pose
- Change detection mode to verify which model is active
- Check class files are loaded correctly (console shows model info)

### Issue: Download button doesn't work
**Solution**:
- Check backend is serving output.docx
- Verify backend hasn't crashed
- Try clicking "Restart" first, then "Download"
- Check browser downloads folder

---

## 📊 System Architecture

### Frontend → Backend Communication
```
WebSocket WebSocket: ws://localhost:8000/predict?mode=ASL
├─ Frame: 640×480 JPEG (10 FPS)
└─ Response: Sentence string
```

### Backend Processing Pipeline
```
Frame → MediaPipe (Hand Detect) 
→ Extract Landmarks (21 × 3)
→ Model Predict (TensorFlow)
→ Confidence Check
→ 2-Second Wait
→ Add to Sentence
→ Send to Frontend
└─ Save to DOCX
```

### Models & Classes
```
Backend/
├── models/
│   ├── asl_model.h5 (ASL single-hand)
│   ├── hindimodal.h5 (Hindi single-hand)
│   └── acc.h5 (English two-hand)
└── classes/
    ├── classes.npy (ASL class labels)
    ├── hindhiclasses.npy (Hindi class labels)
    └── acc.npy (English class labels)
```

---

## 📱 Frontend Architecture

### Key Components
- **Home.jsx**: Main layout, state management (mode, translation, camera)
- **WebcamFeed.jsx**: Video capture, WebSocket streaming
- **PreviewBox.jsx**: Display detected text, statistics
- **Controls.jsx**: Clear, Restart, Download buttons
- **Translator.jsx**: Display automatic translation

### State Flow
```
Home.jsx (State Manager)
├── detectionMode → WebcamFeed
├── translationLang → Translator
├── isCameraActive → WebcamFeed
└── text (set by WebcamFeed, used by PreviewBox/Translator)
```

---

## ⚡ Performance Optimization

### Current Settings
- **Video Resolution**: 640×480 (frontend) → 640×480 (backend)
- **Frame Rate**: 10 FPS (100ms interval)
- **Compression**: JPEG 90% quality
- **Latency**: ~500-1000ms total (detection + confirmation)

### If Too Slow
- Reduce frame rate: Change `interval: 100` to `200` (5 FPS)
- Reduce resolution: Change 640×480 to 320×240
- Reduce JPEG quality: Change `0.9` to `0.7`

### If Too Many False Positives
- Increase confidence threshold to 0.7
- Increase hand detection confidence to 0.85
- Increase confirmation time to 3 seconds

---

## 📋 Checklist Before Production

- [ ] Backend running, models loaded
- [ ] Frontend running, WebSocket connected
- [ ] Camera permission granted in browser
- [ ] All 3 detection modes tested
- [ ] Translation working (if selected)
- [ ] Download creates valid DOCX file
- [ ] Confidence values showing in console
- [ ] 2-second confirmation working
- [ ] Clear/Restart buttons functional
- [ ] No console errors in browser
- [ ] Tested with real hand gestures
- [ ] Tested all 3 language translations

---

## 🎓 Next Steps

### Improve Accuracy
- Retrain models with more samples
- Calibrate hand detection confidence values
- Implement hand tracking smoothing

### Add Features
- Save history of translations
- Real-time pose visualization (skeleton overlay)
- Undo/Redo functionality
- Multiple hands tracking

### Deploy
- Use production ASGI server (uvicorn, gunicorn)
- Set up HTTPS with SSL certificate
- Deploy to cloud (AWS, Azure, GCP)
- Build mobile app version

---

## 📞 Support

**Check Logs First**:
1. Browser Console (F12)
2. Backend Terminal Output
3. Network Tab (F12) for WebSocket messages

**Common Resources**:
- MediaPipe Docs: https://mediapipe.dev/
- FastAPI Docs: http://localhost:8000/docs (when running)
- TensorFlow Guide: https://www.tensorflow.org/
