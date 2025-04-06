import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase"; 
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import "./Marketplace.css";

// Import product images
import tomatoImg from './assets/tomato.jpg';
import potatoImg from './assets/potato.jpg';
import leafyVegiImg from './assets/leafyvegi.jpg';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [farmerNames, setFarmerNames] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  // Function to get appropriate image based on product category
  const getProductImage = (product) => {
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
  };

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productList = [];
        const farmerIds = new Set();

        productsSnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          // Only include products (exclude tools and fertilizers)
          if (data.type === 'product') {
            productList.push(data);
            farmerIds.add(data.farmerId);
          }
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

  const handleCategorySelection = (category) => {
    setSelectedCategory(category);
  };

  // Get unique product categories
  const productCategories = [...new Set(products.map((product) => product.category))];

  return (
    <div className="marketplace-container">
      <h2>Agricultural Products Marketplace</h2>

      {/* Category Filter Buttons */}
      <div className="filter-buttons">
        <button 
          onClick={() => handleCategorySelection("All")} 
          className={selectedCategory === "All" ? "active" : ""}
        >
          All Products
        </button>
        {productCategories.map((category) => (
          <button 
            key={category} 
            onClick={() => handleCategorySelection(category)} 
            className={selectedCategory === category ? "active" : ""}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {products.length > 0 ? (
          products
            .filter((product) => 
              selectedCategory === "All" || product.category === selectedCategory
            )
            .map((product) => (
              <div key={product.id} className="product-card">
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
                  <p>Description: {product.description}</p>
                  <p>Added on: {new Date(product.timestamp?.seconds * 1000).toLocaleString()}</p>

                  {farmerNames[product.farmerId] ? (
                    <p className="farmer-info">Farmer: {farmerNames[product.farmerId]}</p>
                  ) : (
                    <p className="loading">Loading farmer details...</p>
                  )}

                  <button 
                    className="buy-now-btn" 
                    onClick={() => navigate(`/buy-now/${product.id}`)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))
        ) : (
          <p className="loading">Loading agricultural products...</p>
        )}
      </div>
    </div>
  );
};

export default Marketplace;