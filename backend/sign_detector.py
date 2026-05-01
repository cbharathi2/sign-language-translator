import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
import os

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

class SignDetector:
    def __init__(self):
        self.hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.4,
            min_tracking_confidence=0.4
        )
        
        # Get the backend directory path
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(backend_dir, "models")
        classes_dir = os.path.join(backend_dir, "classes")
        
        # Load ASL model (alphabet - one hand)
        try:
            asl_model_path = os.path.join(models_dir, "asl_model.h5")
            self.asl_model = tf.keras.models.load_model(asl_model_path)
            asl_classes_path = os.path.join(classes_dir, "classes.npy")
            self.asl_classes = np.load(asl_classes_path, allow_pickle=True)
            print("[OK] ASL Model loaded successfully")
        except Exception as e:
            print(f"[ERR] Failed to load ASL model: {e}")
            self.asl_model = None
            self.asl_classes = None
        
        # Load Hindi model (hindi letters - one hand)
        try:
            hindi_model_path = os.path.join(models_dir, "hindimodal.h5")
            self.hindi_model = tf.keras.models.load_model(hindi_model_path)
            hindi_classes_path = os.path.join(classes_dir, "hindhiclasses.npy")
            self.hindi_classes = np.load(hindi_classes_path, allow_pickle=True)
            print("[OK] Hindi Model loaded successfully")
        except Exception as e:
            print(f"[ERR] Failed to load Hindi model: {e}")
            self.hindi_model = None
            self.hindi_classes = None
        
        # Load Word model (english words - two hands)
        try:
            word_model_path = os.path.join(models_dir, "acc.h5")
            self.word_model = tf.keras.models.load_model(word_model_path)
            word_classes_path = os.path.join(classes_dir, "acc.npy")
            self.word_classes = np.load(word_classes_path, allow_pickle=True)
            print("[OK] Word Model loaded successfully")
        except Exception as e:
            print(f"[ERR] Failed to load Word model: {e}")
            self.word_model = None
            self.word_classes = None
        
        self._letter = ""
        self._confidence = 0.0
    
    def _extract_landmarks_features(self, hand_landmarks):
        """Extract 21 landmarks (x, y, z) as a 63-dim feature vector."""
        features = []
        for landmark in hand_landmarks.landmark:
            features.extend([landmark.x, landmark.y, landmark.z])
        return np.array(features, dtype=np.float32).reshape(1, -1)
    
    def _classify_with_model(self, features, model, classes):
        """Use a trained model to predict the sign."""
        if model is None or classes is None:
            return "", 0.0
        
        try:
            prediction = model.predict(features, verbose=0)
            confidence = np.max(prediction)
            # if confidence < 0.3:  # Minimum confidence threshold
            #     return "", 0.0
            pred_class_idx = np.argmax(prediction)
            pred_class = str(classes[pred_class_idx])
            return pred_class, float(confidence)
        except Exception as e:
            print(f"Prediction error: {e}")
            return "", 0.0
    
    def detect(self, frame, mode="asl"):
        print(f"Detecting with mode: {mode}")
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb)

        if not results.multi_hand_landmarks:
            print("No hands detected")
            return {"letter": "", "confidence": 0, "landmarks": []}

        print(f"Hands detected: {len(results.multi_hand_landmarks)}")

        # Get landmarks from first hand
        hand_lm = results.multi_hand_landmarks[0]
        landmarks_out = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand_lm.landmark]

        # Single hand detection (ASL, Hindi)
        if mode in ("asl", "hindi"):
            if len(results.multi_hand_landmarks) < 1:
                return {"letter": "", "confidence": 0, "landmarks": landmarks_out}
            
            features = self._extract_landmarks_features(hand_lm)
            
            if mode == "asl" and self.asl_model:
                letter, confidence = self._classify_with_model(features, self.asl_model, self.asl_classes)
            elif mode == "hindi" and self.hindi_model:
                letter, confidence = self._classify_with_model(features, self.hindi_model, self.hindi_classes)
            else:
                return {"letter": "", "confidence": 0, "landmarks": landmarks_out}
            
            return {
                "letter": letter,
                "confidence": round(confidence * 100),
                "landmarks": landmarks_out
            }
        
        # Two hand detection (Words)
        elif mode == "words":
            if len(results.multi_hand_landmarks) < 2:
                return {"letter": "", "confidence": 0, "landmarks": landmarks_out}

            # Ensure consistent hand ordering (left/right) for word model inputs
            hands = sorted(
                results.multi_hand_landmarks,
                key=lambda hand: np.mean([lm.x for lm in hand.landmark])
            )
            hand1_lm, hand2_lm = hands[0], hands[1]

            features1 = self._extract_landmarks_features(hand1_lm)
            features2 = self._extract_landmarks_features(hand2_lm)
            combined_features = np.hstack([features1, features2])

            landmarks_out = [
                {"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand1_lm.landmark
            ] + [
                {"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand2_lm.landmark
            ]

            if self.word_model:
                try:
                    prediction = self.word_model.predict(combined_features, verbose=0)
                    confidence = np.max(prediction)

                    # Lower threshold for word detection (0.2 = 20%)
                    if confidence < 0.2:
                        return {"letter": "", "confidence": 0, "landmarks": landmarks_out}

                    pred_class_idx = np.argmax(prediction)
                    letter = str(self.word_classes[pred_class_idx]) if self.word_classes is not None else ""
                except Exception as e:
                    print(f"Word model prediction error: {e}")
                    return {"letter": "", "confidence": 0, "landmarks": landmarks_out}
            else:
                return {"letter": "", "confidence": 0, "landmarks": landmarks_out}

            return {
                "letter": letter,
                "confidence": round(confidence * 100),
                "landmarks": landmarks_out
            }
        
        return {"letter": "", "confidence": 0, "landmarks": []}
