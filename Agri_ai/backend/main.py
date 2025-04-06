from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
import cv2
import io
from typing import Dict, Any

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load TensorFlow Model
model = hub.load("https://www.kaggle.com/models/rishitdagli/plant-disease/TensorFlow2/plant-disease/1")

# Complete Class Indices with Plant and Disease Separation
CLASS_INDICES: Dict[str, Dict[str, str]] = {
    "0": {"plant": "Apple", "disease": "Apple_scab"},
    "1": {"plant": "Apple", "disease": "Black_rot"},
    "2": {"plant": "Apple", "disease": "Cedar_apple_rust"},
    "3": {"plant": "Apple", "disease": "healthy"},
    "4": {"plant": "Blueberry", "disease": "healthy"},
    "5": {"plant": "Cherry", "disease": "Powdery_mildew"},
    "6": {"plant": "Cherry", "disease": "healthy"},
    "7": {"plant": "Corn", "disease": "Cercospora_leaf_spot"},
    "8": {"plant": "Corn", "disease": "Common_rust"},
    "9": {"plant": "Corn", "disease": "Northern_Leaf_Blight"},
    "10": {"plant": "Corn", "disease": "healthy"},
    "11": {"plant": "Grape", "disease": "Black_rot"},
    "12": {"plant": "Grape", "disease": "Esca"},
    "13": {"plant": "Grape", "disease": "Leaf_blight"},
    "14": {"plant": "Grape", "disease": "healthy"},
    "15": {"plant": "Orange", "disease": "Haunglongbing"},
    "16": {"plant": "Peach", "disease": "Bacterial_spot"},
    "17": {"plant": "Peach", "disease": "healthy"},
    "18": {"plant": "Pepper_bell", "disease": "Bacterial_spot"},
    "19": {"plant": "Pepper_bell", "disease": "healthy"},
    "20": {"plant": "Potato", "disease": "Early_blight"},
    "21": {"plant": "Potato", "disease": "Late_blight"},
    "22": {"plant": "Potato", "disease": "healthy"},
    "23": {"plant": "Raspberry", "disease": "healthy"},
    "24": {"plant": "Soybean", "disease": "healthy"},
    "25": {"plant": "Squash", "disease": "Powdery_mildew"},
    "26": {"plant": "Strawberry", "disease": "Leaf_scorch"},
    "27": {"plant": "Strawberry", "disease": "healthy"},
    "28": {"plant": "Tomato", "disease": "Bacterial_spot"},
    "29": {"plant": "Tomato", "disease": "Early_blight"},
    "30": {"plant": "Tomato", "disease": "Late_blight"},
    "31": {"plant": "Tomato", "disease": "Leaf_Mold"},
    "32": {"plant": "Tomato", "disease": "Septoria_leaf_spot"},
    "33": {"plant": "Tomato", "disease": "Spider_mites"},
    "34": {"plant": "Tomato", "disease": "Target_Spot"},
    "35": {"plant": "Tomato", "disease": "Yellow_Leaf_Curl_Virus"},
    "36": {"plant": "Tomato", "disease": "Mosaic_virus"},
    "37": {"plant": "Tomato", "disease": "healthy"}
}

# Comprehensive Disease Information Database
DISEASE_INFO: Dict[str, Dict[str, Dict[str, str]]] = {
    "Apple": {
        "Apple_scab": {
            "info": "Fungal disease causing olive-green to black spots on leaves and fruit. Spreads in cool, wet weather.",
            "remedy": "1. Apply fungicides (myclobutanil, sulfur)\n2. Remove fallen leaves\n3. Plant resistant varieties",
            "prevention": "Ensure proper air circulation and avoid overhead watering"
        },
        "Black_rot": {
            "info": "Causes brown spots that enlarge and turn black with concentric rings. Affects leaves, fruit, and branches.",
            "remedy": "1. Prune infected branches\n2. Apply copper fungicides\n3. Remove mummified fruit",
            "prevention": "Practice good sanitation and remove infected plant material"
        },
        "healthy": {
            "info": "Plant shows no signs of disease",
            "remedy": "Maintain current care regimen",
            "prevention": "Continue proper watering, fertilization, and monitoring"
        }
    },
    "Tomato": {
        "Bacterial_spot": {
            "info": "Small, dark, water-soaked spots on leaves that may have yellow halos. Can cause fruit spotting.",
            "remedy": "1. Copper-based bactericides\n2. Remove infected plants\n3. Avoid working with wet plants",
            "prevention": "Use disease-free seeds and rotate crops"
        },
        "Late_blight": {
            "info": "Destructive disease causing large, dark lesions on leaves and fruit with white fungal growth.",
            "remedy": "1. Apply chlorothalonil or mancozeb\n2. Remove infected plants immediately",
            "prevention": "Ensure proper spacing and avoid overhead irrigation"
        },
        "healthy": {
            "info": "Plant shows no signs of disease",
            "remedy": "Maintain current care regimen",
            "prevention": "Continue proper watering, fertilization, and monitoring"
        }
    },
    # Add more plants and diseases as needed...
}

def preprocess_image(image: bytes) -> np.ndarray:
    """Process uploaded image for model prediction"""
    try:
        img = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_COLOR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (224, 224))
        img = img.astype(np.float32) / 255.0
        return np.expand_dims(img, axis=0)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

def get_disease_info(plant: str, disease: str) -> Dict[str, str]:
    """Retrieve disease information from database"""
    default_info = {
        "info": "No detailed information available for this condition",
        "remedy": "Consult with local agricultural extension for specific recommendations",
        "prevention": "Practice good crop management and monitor plants regularly"
    }
    
    plant_diseases = DISEASE_INFO.get(plant, {})
    return plant_diseases.get(disease, default_info)

@app.post("/predict/")
async def predict_disease(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Endpoint for plant disease prediction"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        image = await file.read()
        processed_image = preprocess_image(image)
        
        predictions = model(processed_image)
        predicted_index = str(np.argmax(predictions))
        confidence = round(float(np.max(predictions)) * 100, 2)
        
        if predicted_index not in CLASS_INDICES:
            raise HTTPException(status_code=500, detail="Model prediction out of range")
        
        prediction = CLASS_INDICES[predicted_index]
        disease_data = get_disease_info(prediction["plant"], prediction["disease"])
        
        return {
            "plant": prediction["plant"],
            "disease": prediction["disease"],
            "confidence": confidence,
            "is_healthy": prediction["disease"] == "healthy",
            "disease_info": disease_data["info"],
            "treatment": disease_data["remedy"],
            "prevention": disease_data["prevention"],
            "scientific_name": get_scientific_name(prediction["plant"])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

def get_scientific_name(plant: str) -> str:
    """Get scientific name for common plant names"""
    scientific_names = {
        "Apple": "Malus domestica",
        "Blueberry": "Vaccinium sect. Cyanococcus",
        "Cherry": "Prunus avium",
        "Corn": "Zea mays",
        "Grape": "Vitis vinifera",
        "Orange": "Citrus × sinensis",
        "Peach": "Prunus persica",
        "Pepper_bell": "Capsicum annuum",
        "Potato": "Solanum tuberosum",
        "Raspberry": "Rubus idaeus",
        "Soybean": "Glycine max",
        "Squash": "Cucurbita pepo",
        "Strawberry": "Fragaria × ananassa",
        "Tomato": "Solanum lycopersicum",
        "Cucumber": "Cucumis sativus",
        "Eggplant": "Solanum melongena",
        "Lettuce": "Lactuca sativa",
        "Onion": "Allium cepa",
        "Pea": "Pisum sativum",
        "Pumpkin": "Cucurbita maxima",
        "Spinach": "Spinacia oleracea",
        "Sweet_potato": "Ipomoea batatas",
        "Watermelon": "Citrullus lanatus",
        "Wheat": "Triticum aestivum",
        "Rice": "Oryza sativa",
        "Barley": "Hordeum vulgare",
        "Oats": "Avena sativa",
        "Rye": "Secale cereale",
        "Cotton": "Gossypium hirsutum",
        "Coffee": "Coffea arabica",
        "Tea": "Camellia sinensis",
        "Banana": "Musa acuminata",
        "Mango": "Mangifera indica",
        "Pineapple": "Ananas comosus",
        "Papaya": "Carica papaya",
        "Avocado": "Persea americana",
        "Coconut": "Cocos nucifera",
        "Almond": "Prunus dulcis",
        "Walnut": "Juglans regia",
        "Pecan": "Carya illinoinensis",
        "Cashew": "Anacardium occidentale",
        "Pistachio": "Pistacia vera",
        "Hazelnut": "Corylus avellana",
        "Peanut": "Arachis hypogaea",
        "Sunflower": "Helianthus annuus",
        "Canola": "Brassica napus",
        "Sugarcane": "Saccharum officinarum",
        "Sugar_beet": "Beta vulgaris",
        "Cassava": "Manihot esculenta",
        "Yam": "Dioscorea alata",
        "Taro": "Colocasia esculenta",
        "Okra": "Abelmoschus esculentus",
        "Artichoke": "Cynara cardunculus var. scolymus",
        "Asparagus": "Asparagus officinalis",
        "Broccoli": "Brassica oleracea var. italica",
        "Brussels_sprouts": "Brassica oleracea var. gemmifera",
        "Cabbage": "Brassica oleracea var. capitata",
        "Carrot": "Daucus carota",
        "Cauliflower": "Brassica oleracea var. botrytis",
        "Celery": "Apium graveolens",
        "Garlic": "Allium sativum",
        "Ginger": "Zingiber officinale",
        "Kale": "Brassica oleracea var. sabellica",
        "Leek": "Allium ampeloprasum",
        "Parsnip": "Pastinaca sativa",
        "Radish": "Raphanus sativus",
        "Turnip": "Brassica rapa subsp. rapa",
        "Zucchini": "Cucurbita pepo var. cylindrica",
        "Chili_pepper": "Capsicum annuum",
        "Jalapeno": "Capsicum annuum 'Jalapeño'",
        "Habanero": "Capsicum chinense",
        "Bell_pepper": "Capsicum annuum",
        "Pomegranate": "Punica granatum",
        "Fig": "Ficus carica",
        "Date": "Phoenix dactylifera",
        "Olive": "Olea europaea",
        "Kiwi": "Actinidia deliciosa",
        "Passion_fruit": "Passiflora edulis",
        "Dragon_fruit": "Hylocereus undatus",
        "Guava": "Psidium guajava",
        "Lychee": "Litchi chinensis",
        "Persimmon": "Diospyros kaki",
        "Jackfruit": "Artocarpus heterophyllus",
        "Breadfruit": "Artocarpus altilis",
        "Starfruit": "Averrhoa carambola",
        "Tamarind": "Tamarindus indica",
        "Mulberry": "Morus spp.",
        "Gooseberry": "Ribes uva-crispa",
        "Currant": "Ribes spp.",
        "Elderberry": "Sambucus nigra",
        "Blackberry": "Rubus fruticosus",
        "Boysenberry": "Rubus ursinus × Rubus idaeus",
        "Loganberry": "Rubus × loganobaccus",
        "Cranberry": "Vaccinium macrocarpon",
        "Bilberry": "Vaccinium myrtillus",
        "Huckleberry": "Vaccinium spp.",
        "Cloudberry": "Rubus chamaemorus",
        "Aronia": "Aronia melanocarpa",
        "Quince": "Cydonia oblonga",
        "Loquat": "Eriobotrya japonica",
        "Nectarine": "Prunus persica var. nucipersica",
        "Apricot": "Prunus armeniaca",
        "Plum": "Prunus domestica",
        "Prune": "Prunus domestica",
        "Damson": "Prunus domestica subsp. insititia",
        "Greengage": "Prunus domestica subsp. italica",
        "Mirabelle": "Prunus domestica subsp. syriaca",
        "Sloe": "Prunus spinosa",
        "Crabapple": "Malus sylvestris",
        "Medlar": "Mespilus germanica",
        "Serviceberry": "Amelanchier spp.",
        "Juneberry": "Amelanchier spp.",
        "Chokeberry": "Aronia spp.",
        "Hawthorn": "Crataegus spp.",
        "Rose_hip": "Rosa canina",
        "Sea_buckthorn": "Hippophae rhamnoides",
        "Buffaloberry": "Shepherdia argentea",
        "Lingonberry": "Vaccinium vitis-idaea",
        "Bearberry": "Arctostaphylos uva-ursi",
        "Salmonberry": "Rubus spectabilis",
        "Thimbleberry": "Rubus parviflorus"
    }
    return scientific_names.get(plant, "Unknown")

