import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import cv2

# Load the model from TensorFlow Hub
model = hub.load("https://www.kaggle.com/models/rishitdagli/plant-disease/TensorFlow2/plant-disease/1")

# Define class indices manually
class_indices = {
    "0": "Apple___Apple_scab", "1": "Apple___Black_rot", "2": "Apple___Cedar_apple_rust", "3": "Apple___healthy",
    "4": "Blueberry___healthy", "5": "Cherry_(including_sour)___Powdery_mildew", "6": "Cherry_(including_sour)___healthy",
    "7": "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "8": "Corn_(maize)___Common_rust_", 
    "9": "Corn_(maize)___Northern_Leaf_Blight", "10": "Corn_(maize)___healthy", "11": "Grape___Black_rot",
    "12": "Grape___Esca_(Black_Measles)", "13": "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "14": "Grape___healthy",
    "15": "Orange___Haunglongbing_(Citrus_greening)", "16": "Peach___Bacterial_spot", "17": "Peach___healthy",
    "18": "Pepper_bell___Bacterial_spot", "19": "Pepper_bell___healthy", "20": "Potato___Early_blight",
    "21": "Potato___Late_blight", "22": "Potato___healthy", "23": "Raspberry___healthy", "24": "Soybean___healthy",
    "25": "Squash___Powdery_mildew", "26": "Strawberry___Leaf_scorch", "27": "Strawberry___healthy",
    "28": "Tomato___Bacterial_spot", "29": "Tomato___Early_blight", "30": "Tomato___Late_blight",
    "31": "Tomato___Leaf_Mold", "32": "Tomato___Septoria_leaf_spot",
    "33": "Tomato___Spider_mites Two-spotted_spider_mite", "34": "Tomato___Target_Spot",
    "35": "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "36": "Tomato___Tomato_mosaic_virus", "37": "Tomato___healthy"
}

# Function to preprocess the image
def preprocess_image(image_path):
    img = cv2.imread(image_path)  # Read image
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert to RGB
    img = cv2.resize(img, (224, 224))  # Resize to model input size
    img = img.astype(np.float32) / 255.0  # Normalize pixel values
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    return img

# Function to predict plant disease
def predict_disease(image_path):
    image = preprocess_image(image_path)  # Preprocess image
    predictions = model(image)  # Get predictions
    predicted_index = np.argmax(predictions)  # Get index of highest probability
    predicted_class = class_indices[str(predicted_index)]  # Map index to class label
    confidence = np.max(predictions)  # Get confidence score
    
    print(f"🌿 Predicted Class: {predicted_class}")
    print(f"✅ Confidence: {confidence:.2%}")
    return predicted_class, confidence

# Test the model
image_path = "D:/agri_ai/backend/models/New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)/test/PotatoEarlyBlight5.JPG"  # Change this to your test image path
predict_disease(image_path)
