import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase"; 
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import "./Marketplace.css";

// Import all images (make sure these files exist in your assets folder)
import tomatoImg from './assets/tomato.jpg';
import potatoImg from './assets/potato.jpg';
import leafyVegiImg from './assets/leafyvegi.jpg';
import tractorImg from './assets/tractor.jpg';
import harvesterImg from './assets/harvester.jpg';
import plowImg from './assets/plow.jpg';
import organicFertilizerImg from './assets/organic.jpg';
import inorganicFertilizerImg from './assets/inorganic.jpg';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [farmerNames, setFarmerNames] = useState({});
  const [selectedType, setSelectedType] = useState("All");
  const navigate = useNavigate();

  // Function to get appropriate image based on product type and category
  const getProductImage = (product) => {
    // For products
    if (product.type === 'product') {
      switch(product.name.toLowerCase()) {
        case 'tomato':
          return tomatoImg;
        case 'potato':
          return potatoImg;
        case 'leafy vegetable':
        case 'spinach':
        case 'kale':
          return leafyVegiImg;
        default:
          switch(product.category) {
            case 'vegetable':
              return tomatoImg;
            case 'fruit':
              return potatoImg;
            case 'grain':
              return leafyVegiImg;
            default:
              return tomatoImg;
          }
      }
    }
    // For tools
    else if (product.type === 'tool') {
      switch(product.category) {
        case 'tractor':
          return tractorImg;
        case 'harvester':
          return harvesterImg;
        case 'plow':
          return plowImg;
        default:
          return tractorImg;
      }
    }
    // For fertilizers
    else if (product.type === 'fertilizer') {
      switch(product.category) {
        case 'organic':
          return organicFertilizerImg;
        case 'chemical':
          return inorganicFertilizerImg;
        default:
          return organicFertilizerImg;
      }
    }
    return tomatoImg; // default image
  };

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productList = [];
        const farmerIds = new Set();

        productsSnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          productList.push(data);
          farmerIds.add(data.farmerId);
        });

        setProducts(productList);

        const farmerData = {};
        await Promise.all(
          Array.from(farmerIds).map(async (farmerId) => {
            const farmerRef = doc(db, "farmers", farmerId);
            const farmerSnap = await getDoc(farmerRef);

            if (farmerSnap.exists()) {
              const userId = farmerSnap.data().userId; 
              if (userId) {
                const userRef = doc(db, "users", userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  farmerData[farmerId] = userSnap.data().name; 
                }
              }
            }
          })
        );

        setFarmerNames(farmerData);
      } catch (error) {
        console.error("Error fetching marketplace data:", error);
      }
    };

    fetchMarketplaceData();
  }, []);

  const handleTypeSelection = (type) => {
    setSelectedType(type);
  };

  const productTypes = [...new Set(products.map((product) => product.type))];

  return (
    <div className="marketplace-container">
      <h2>Marketplace</h2>

      {/* Full-Width Filter Buttons */}
      <div className="filter-buttons">
        <button onClick={() => handleTypeSelection("All")} className={selectedType === "All" ? "active" : ""}>
          All
        </button>
        {productTypes.map((type) => (
          <button key={type} onClick={() => handleTypeSelection(type)} className={selectedType === type ? "active" : ""}>
            {type}
          </button>
        ))}
      </div>

      {/* Full Page Product Grid */}
      <div className="product-grid">
        {products.length > 0 ? (
          products
            .filter((product) => selectedType === "All" || product.type === selectedType)
            .map((product) => (
              <div key={product.id} className="product-card">
                {/* Product Image */}
                <div className="product-image-container">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="category">Category: {product.category}</p>
                  <p className="price">Price: ₹{product.price}</p>
                  <p>Quantity: {product.quantity}</p>
                  <p>Type: {product.type}</p>
                  <p>Description: {product.description}</p>
                  <p>Added on: {new Date(product.timestamp?.seconds * 1000).toLocaleString()}</p>

                  {/* {farmerNames[product.farmerId] ? (
                    <p className="farmer-info">Farmer: {farmerNames[product.farmerId]}</p>
                  ) : (
                    <p className="loading">Loading farmer details...</p>
                  )} */}

                  {/* Buy Now Button */}
                  <button className="buy-now-btn" onClick={() => navigate(`/buy-now/${product.id}`)}>
                    Buy Now
                  </button>
                </div>
              </div>
            ))
        ) : (
          <p className="loading">Loading products...</p>
        )}
      </div>
    </div>
  );
};

export default Marketplace;