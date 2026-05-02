# ✋ AI Sign Language Translator

A modern, full-stack web application that uses AI and machine learning to recognize sign language in real-time and convert it to text, with instant translation capabilities.

## 🎯 Features

- **Real-time Sign Language Detection**
  - ASL (American Sign Language) Support
  - Hindi Sign Language Support
  - English Word Recognition (Two-Hand Detection)
  
- **Intelligent Confirmation**
  - 2-second hold requirement for accurate detection
  - Visual real-time feedback
  - Confidence indicators
  
- **Multi-Language Translation**
  - English → Hindi
  - English → Tamil
  - English → Malayalam
  
- **Document Export**
  - Auto-save to Word documents (.docx)
  - Download functionality
  - Professional formatting

- **Modern UI/UX**
  - Responsive design
  - Real-time preview
  - Status indicators
  - Animated controls
  - Statistics dashboard (word count, character count)

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **TensorFlow** - Deep learning models for sign recognition
- **MediaPipe** - Hand detection and landmark extraction
- **OpenCV** - Video processing
- **python-docx** - Word document generation
- **googletrans** - Translation API

### Frontend
- **React 19** - UI library
- **Vite** - Module bundler
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- Webcam/Camera device
- 2GB RAM minimum
- GPU recommended for faster TensorFlow inference

## 🚀 Installation & Setup

### 1. Backend Setup

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Note:** First run will take time as TensorFlow downloads pre-trained models.

### 2. Frontend Setup

```bash
cd frontend/vite-project

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Run the Application

#### Terminal 1 - Backend Server
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`

#### Terminal 2 - Frontend Development Server
```bash
cd frontend/vite-project
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## 📖 Usage Guide

### Starting Detection
1. Open the frontend application in your browser
2. Allow camera access when prompted
3. Select detection mode (ASL, Hindi, or English Words)
4. Position your hands clearly in the camera frame

### Confirming Signs
- **Hold the sign for 2 seconds** for accurate detection
- Use the preview box to see detected text in real-time
- Watch for the green highlight indicating confirmation

### Text Management
- **Clear Last**: Remove the last detected word (backspace function)
- **Restart**: Clear all detected text and start fresh
- **Download**: Export all detected text as a Word document

### Translation
1. Use detected English text as the source
2. Click on desired translation button (Hindi/Tamil/Malayalam)
3. Translated text appears in the bottom panel
4. Translations are included in the exported document

## 📁 Project Structure

```
sign-language-translator/
├── backend/
│   ├── main.py                 # FastAPI application & WebSocket
│   ├── translator.py           # Translation engine
│   ├── docx_manager.py        # Word document handling
│   ├── models/                 # Pre-trained ML models
│   │   ├── asl_model.h5       # ASL recognition model
│   │   ├── hindimodal.h5      # Hindi sign language model
│   │   └── acc.h5             # English words detection model
│   ├── classes/               # Model labels/classes
│   │   ├── classes.npy        # ASL class labels
│   │   ├── hindhiclasses.npy # Hindi class labels
│   │   └── acc.npy            # English words labels
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   └── vite-project/
│       ├── src/
│       │   ├── components/
│       │   │   ├── WebcamFeed.jsx      # Camera capture & detection
│       │   │   ├── PreviewBox.jsx      # Text preview & stats
│       │   │   ├── Controls.jsx        # Main control buttons
│       │   │   └── Translator.jsx      # Translation interface
│       │   ├── pages/
│       │   │   └── Home.jsx            # Main page layout
│       │   ├── App.jsx                 # Root component
│       │   ├── main.jsx                # Entry point
│       │   ├── App.css                 # Global styles
│       │   ├── index.css               # Tailwind setup
│       │   └── assets/                 # Static assets
│       ├── index.html                  # HTML template
│       ├── tailwind.config.js          # Tailwind CSS config
│       ├── vite.config.js              # Vite configuration
│       ├── package.json                # NPM dependencies
│       └── eslint.config.js            # ESLint configuration
│
└── README.md                   # This file
```

## 🔌 API Endpoints

### WebSocket
- **`ws://localhost:8000/predict`**
  - Real-time sign detection
  - Receives video frames as binary data
  - Sends detected text updates

### HTTP Endpoints

#### Text Management
- **`GET /clear`** - Remove last detected word
  - Response: `{"text": "current sentence"}`

- **`GET /restart`** - Reset all detected text
  - Response: `{"text": ""}`

#### Document Export
- **`GET /output.docx`** - Download the document
  - Response: Binary DOCX file

#### Translation
- **`GET /translate?lang={language}&text={text}`**
  - Parameters:
    - `lang`: Language code (hi=Hindi, ta=Tamil, ml=Malayalam)
    - `text`: Text to translate
  - Response: `{"translated": "translated text"}`

## ⚙️ Configuration

### Model Selection
Models are automatically selected based on hand count:
- **1 Hand**: ASL or Hindi model (based on settings)
- **2 Hands**: English words model

### Confidence Threshold
Modify in `main.py`:
```python
hands = mp_hands.Hands(
    min_detection_confidence=0.7,  # Increase for stricter detection
    min_tracking_confidence=0.7
)
```

### Confirmation Time
Edit in `main.py`:
```python
if time.time() - start_time >= 2:  # Change 2 to desired seconds
```

## 🐛 Troubleshooting

### Camera Not Working
- Check browser permissions for camera access
- Try a different browser
- Restart the development server

### Slow Detection
- Ensure good lighting conditions
- Reduce camera resolution if needed
- GPU acceleration for TensorFlow:
  ```bash
  pip install tensorflow[and-cuda]
  ```

### Translation Errors
- Check internet connection (Google Translate API)
- Verify API keys if using paid service
- Try simpler text first

### Model Loading Errors
- Ensure TensorFlow is properly installed
- Check model files exist in `backend/models/`
- Verify model file paths in `main.py`

## 📊 Performance Tips

1. **GPU Acceleration**: Install CUDA-enabled TensorFlow
2. **Model Optimization**: Use quantized models for faster inference
3. **Browser Caching**: Clear cache if experiencing issues
4. **WebSocket Optimization**: Reduce frame sending frequency if needed

## 🔒 Security Notes

- Currently allows all CORS origins - restrict in production
- Implement authentication for production deployment
- Use environment variables for sensitive configuration
- Validate all user inputs

## 🎓 Model Information

### ASL Model (asl_model.h5)
- Trained on single-hand ASL gestures
- Covers 26 alphabets + special characters
- Input: Hand landmarks from MediaPipe

### Hindi Model (hindimodal.h5)
- Trained on Hindi sign language gestures
- Single-hand recognition
- Input: Hand landmarks

### English Words Model (acc.h5)
- Two-hand English word recognition
- Trained on common English words
- Requires both hands visible

## 📝 License

This project is open source. See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues or questions:
- Open an GitHub issue
- Check existing documentation
- Review troubleshooting section

## 🚀 Future Enhancements

- [ ] Real-time video recording
- [ ] Multi-language model support expansion
- [ ] Performance optimizations
- [ ] Mobile app version
- [ ] Cloud deployment
- [ ] Advanced gesture recognition
- [ ] User authentication & profiles
- [ ] Batch processing
- [ ] Custom model training interface
- [ ] API rate limiting

## 📚 References

- [MediaPipe Hands](https://mediapipe.dev/solutions/hands)
- [TensorFlow](https://www.tensorflow.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---


