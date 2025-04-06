import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase"; 
import { doc, getDoc } from "firebase/firestore";
import "./BuyNow.css";

// Import default images
import tomatoImg from './assets/tomato.jpg';
import potatoImg from './assets/potato.jpg';
import leafyVegiImg from './assets/leafyvegi.jpg';
import tractorImg from './assets/tractor.jpg';
import harvesterImg from './assets/harvester.jpg';
import plowImg from './assets/plow.jpg';
import organicFertilizerImg from './assets/organic.jpg';
import inorganicFertilizerImg from './assets/inorganic.jpg';

const BuyNow = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [landArea, setLandArea] = useState(1); // Default 1 acre
  const [calculatedQuantity, setCalculatedQuantity] = useState(0);

  // Function to get appropriate image
  const getProductImage = (product) => {
    if (!product) return tomatoImg;
    
    if (product.type === 'product') {
      switch(product.name.toLowerCase()) {
        case 'tomato': return tomatoImg;
        case 'potato': return potatoImg;
        case 'leafy vegetable':
        case 'spinach':
        case 'kale': return leafyVegiImg;
        default:
          switch(product.category) {
            case 'vegetable': return tomatoImg;
            case 'fruit': return potatoImg;
            case 'grain': return leafyVegiImg;
            default: return tomatoImg;
          }
      }
    }
    else if (product.type === 'tool') {
      switch(product.category) {
        case 'tractor': return tractorImg;
        case 'harvester': return harvesterImg;
        case 'plow': return plowImg;
        default: return tractorImg;
      }
    }
    else if (product.type === 'fertilizer') {
      switch(product.category) {
        case 'organic': return organicFertilizerImg;
        case 'chemical': return inorganicFertilizerImg;
        default: return organicFertilizerImg;
      }
    }
    return tomatoImg;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = { id: productSnap.id, ...productSnap.data() };
          setProduct(productData);
          
          // If it's a fertilizer, set default calculated quantity
          if (productData.type === 'fertilizer') {
            calculateFertilizerQuantity(1, productData);
          }
        } else {
          console.log("No such product!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  // Calculate fertilizer quantity based on land area
  const calculateFertilizerQuantity = (area, fertilizerProduct) => {
    // Standard application rate: 100kg per acre (adjust as needed)
    const applicationRate = 10; // kg per acre
    const requiredQuantity = area * applicationRate;
    setCalculatedQuantity(requiredQuantity);
    setLandArea(area);
  };

  const handlePayment = async () => {
    if (!product) return;

    // For fertilizers, use the calculated quantity instead of product quantity
    const quantityToUse = product.type === 'fertilizer' ? calculatedQuantity : 1;
    const totalAmount = product.price * quantityToUse;

    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      return;
    }

    const options = {
      key: "rzp_test_qjMK536l0t4o3Y", // Razorpay Test Key
      amount: totalAmount * 100, // Convert ₹ to paise
      currency: "INR",
      name: "Farm Marketplace",
      description: `Payment for ${quantityToUse} ${product.type === 'product' ? 'kg' : 'units'} of ${product.name}`,
      image: "https://yourwebsite.com/logo.png", // Replace with your logo
      handler: function (response) {
        alert(`✅ Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: "Vishal Kongari",
        email: "vishal@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#28a745",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  if (loading) {
    return <div className="loading-container">Loading product details...</div>;
  }

  return (
    <div className="buy-now-page">
      <h1 className="page-title">Complete Your Purchase</h1>

      {product ? (
        <div className="product-container">
          {/* Product Image Section */}
          <div className="product-image-section">
            <img 
              src={getProductImage(product)} 
              alt={product.name}
              className="product-image"
            />
          </div>

          {/* Product Details Section */}
          <div className="product-details-section">
            <h2 className="product-name">{product.name}</h2>
            <div className="detail-row">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{product.category}</span>
            </div>
            <div className="detail-row price-row">
              <span className="detail-label">Price:</span>
              <span className="detail-value price">₹{product.price}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Available Quantity:</span>
              <span className="detail-value">{product.quantity} {product.type === 'product' ? 'kg' : 'units'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{product.type}</span>
            </div>

            {/* Land Area Input for Fertilizers */}
            {product.type === 'fertilizer' && (
              <div className="land-area-section">
                <h3 className="section-title">Land Information</h3>
                <div className="input-group">
                  <label htmlFor="landArea">Land Area (acres):</label>
                  <input
                    type="number"
                    id="landArea"
                    min="1"
                    value={landArea}
                    onChange={(e) => calculateFertilizerQuantity(parseFloat(e.target.value), product)}
                    className="land-input"
                  />
                </div>
                <div className="calculation-result">
                  <p>You'll need approximately:</p>
                  <p className="quantity-result">
                    {calculatedQuantity} kg ({calculatedQuantity / 50} bags)
                  </p>
                  <p className="total-cost">
                    Total Cost: ₹{(product.price * calculatedQuantity).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {product.type === 'tool' && product.duration && (
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{product.duration} days</span>
              </div>
            )}

            <div className="description-section">
              <h3 className="description-title">Description</h3>
              <p className="description-text">{product.description}</p>
            </div>

            <div className="detail-row">
              <span className="detail-label">Listed on:</span>
              <span className="detail-value">
                {new Date(product.timestamp?.seconds * 1000).toLocaleString()}
              </span>
            </div>

            {/* Payment Button */}
            <button className="checkout-btn" onClick={handlePayment}>
              {product.type === 'fertilizer' ? (
                `Pay ₹${(product.price * calculatedQuantity).toFixed(2)}`
              ) : (
                `Proceed to Payment (₹${product.price})`
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="not-found-container">
          <p>Product not found.</p>
        </div>
      )}
    </div>
  );
};

export default BuyNow;