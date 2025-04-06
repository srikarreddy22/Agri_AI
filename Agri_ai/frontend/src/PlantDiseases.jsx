import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import "./PlantDiseases.css";
// Import images
import sample1 from './images/sample1.jpg';
import sample2 from './images/sample2.jpg';
import sample3 from './images/sample3.jpg';
import sample4 from './images/sample4.jpg';
import organicFertilizerImg from './assets/organic.jpg';
import inorganicFertilizerImg from './assets/inorganic.jpg';

function PlantDiseases() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fertilizers, setFertilizers] = useState([]);
  const [isFetchingFertilizers, setIsFetchingFertilizers] = useState(false);

  const sampleImages = [
    { src: sample1, label: "Tomato Leaf" },
    { src: sample2, label: "Corn Plant" },
    { src: sample3, label: "Potato Leaf" },
    { src: sample4, label: "Potato Leaf" },
  ];

  // Function to get fertilizer image based on category
  const getFertilizerImage = (category) => {
    switch(category) {
      case 'organic':
        return organicFertilizerImg;
      case 'chemical':
        return inorganicFertilizerImg;
      default:
        return organicFertilizerImg;
    }
  };

  // Fetch fertilizers from Firebase
  const fetchFertilizers = async (plantType = null) => {
    setIsFetchingFertilizers(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const fertilizersList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'fertilizer') {
          // If plantType is specified, only include fertilizers for that plant
          if (!plantType || (data.suitableFor && data.suitableFor.includes(plantType))) {
            fertilizersList.push({
              id: doc.id,
              ...data
            });
          }
        }
      });
      
      setFertilizers(fertilizersList);
    } catch (error) {
      console.error("Error fetching fertilizers:", error);
    } finally {
      setIsFetchingFertilizers(false);
    }
  };

  useEffect(() => {
    // Load all fertilizers initially
    fetchFertilizers();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setPrediction(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setPrediction(null);
  };

  const handleDetectDisease = async () => {
    if (!selectedImage) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", dataURItoBlob(selectedImage));

      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setPrediction(data);
      
      // Fetch fertilizers specific to the detected plant
      if (data.plant) {
        fetchFertilizers(data.plant.toLowerCase());
      }
    } catch (error) {
      setPrediction({
        error: "Error analyzing image. Please try again."
      });
    }

    setIsLoading(false);
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleChangeImage = () => {
    setSelectedImage(null);
    setPrediction(null);
  };

  return (
    <div className="plant-diseases-container">
      <div className="header-section">
        <button className="back-button" onClick={() => navigate("/dashboardA")}>
          <span>&larr;</span> Back to Dashboard
        </button>
        
        <div className="title-section">
          <h1>Plant Disease Detection</h1>
          <p className="subtitle">Upload an image of your plant to detect potential diseases</p>
        </div>
        
        <div style={{ width: "100px" }}></div>
      </div>

      <div className="content-grid">
        <div className="upload-section">
          <h2 className="section-title">Upload Plant Image</h2>
          
          {selectedImage ? (
            <div className="image-preview">
              <img src={selectedImage} alt="Uploaded plant" />
              <button className="change-image" onClick={handleChangeImage}>
                Change Image
              </button>
            </div>
          ) : (
            <label className="upload-box">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: "none" }} 
              />
              <div className="upload-content">
                <span className="upload-icon">+</span>
                <p>Click to upload plant image</p>
                <p className="hint">(JPG, PNG, max 5MB)</p>
              </div>
            </label>
          )}
          
          <div className="sample-images-section">
            <h3 className="section-title">Sample Images</h3>
            <p className="text-center">Upload in this format</p>
            <div className="sample-cards">
              {sampleImages.map((image, index) => (
                <div 
                  key={index} 
                  className="sample-card"
                  onClick={() => handleSampleImageClick(image.src)}
                >
                  <img src={image.src} alt={image.label} />
                  <div className="sample-card-label">{image.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="results-section">
          <div className="results-header">
            <h2 className="section-title">Detection Results</h2>
            <button 
              className="detect-button" 
              onClick={handleDetectDisease}
              disabled={!selectedImage || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyzing...
                </>
              ) : (
                "Detect Disease"
              )}
            </button>
          </div>

          {prediction && (
            <div className="prediction-result">
              {prediction.error ? (
                <div className="error-message">{prediction.error}</div>
              ) : (
                <>
                  <h3>Analysis Result:</h3>
                  <div className={`result-box ${prediction.is_healthy ? "healthy" : "diseased"}`}>
                    <h4>{prediction.plant} ({prediction.scientific_name})</h4>
                    <p><strong>Condition:</strong> {prediction.disease}</p>
                    <p><strong>Confidence:</strong> {prediction.confidence}%</p>
                  </div>

                  <div className="disease-details">
                    <h4>Disease Information</h4>
                    <p>{prediction.disease_info}</p>
                    
                    <h4>Recommended Treatment</h4>
                    <div className="remedy-list">
                      {prediction.treatment.split('\n').map((item, i) => (
                        <p key={i}>{item}</p>
                      ))}
                    </div>
                    
                    <h4>Prevention Tips</h4>
                    <p>{prediction.prevention}</p>
                  </div>

                  {/* Recommended Fertilizers Section */}
                  <div className="fertilizers-section">
                    <h3>Recommended Fertilizers</h3>
                    
                    {isFetchingFertilizers ? (
                      <p className="loading">Loading fertilizers...</p>
                    ) : fertilizers.length > 0 ? (
                      <div className="fertilizers-grid">
                        {fertilizers.map((fertilizer) => (
                          <div key={fertilizer.id} className="fertilizer-card">
                            <div className="fertilizer-image-container">
                              <img 
                                src={getFertilizerImage(fertilizer.category)} 
                                alt={fertilizer.name}
                                className="fertilizer-image"
                              />
                            </div>
                            <div className="fertilizer-details">
                              <h4>{fertilizer.name}</h4>
                              <p className="category">Type: {fertilizer.category}</p>
                              <p className="price">Price: ₹{fertilizer.price}</p>
                              <p>Quantity: {fertilizer.quantity}</p>
                              {fertilizer.suitableFor && (
                                <p>Suitable for: {fertilizer.suitableFor.join(', ')}</p>
                              )}
                              <p>Description: {fertilizer.description}</p>
                              <button 
                                className="buy-now-btn"
                                onClick={() => navigate(`/buy-now/${fertilizer.id}`)}
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-fertilizers">No fertilizers found for this plant type.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlantDiseases;