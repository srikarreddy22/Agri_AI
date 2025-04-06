import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import "./FarmerProfile.css";

// Import all images
import tomatoImg from './assets/tomato.jpg';
import potatoImg from './assets/potato.jpg';
import leafyVegiImg from './assets/leafyvegi.jpg';
import tractorImg from './assets/tractor.jpg';
import harvesterImg from './assets/harvester.jpg';
import plowImg from './assets/plow.jpg';
import organicFertilizerImg from './assets/organic.jpg';
import inorganicFertilizerImg from './assets/inorganic.jpg';

function FarmerProfile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    type: 'product',
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    duration: ''
  });

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;
    const q = query(collection(db, "products"), where("farmerId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(fetchedItems);
  };

  const getItemImage = (item) => {
    // For products
    if (item.type === 'product') {
      switch(item.name.toLowerCase()) {
        case 'tomato':
          return tomatoImg;
        case 'potato':
          return potatoImg;
        case 'leafy vegetable':
        case 'spinach':
        case 'kale':
          return leafyVegiImg;
        default:
          switch(item.category) {
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
    else if (item.type === 'tool') {
      switch(item.category) {
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
    else if (item.type === 'fertilizer') {
      switch(item.category) {
        case 'organic':
          return organicFertilizerImg;
        case 'chemical':
          return inorganicFertilizerImg;
        default:
          return organicFertilizerImg;
      }
    }
    return tomatoImg;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.quantity || !user) return;

    const itemData = {
      farmerId: user.uid,
      ...newItem,
      timestamp: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, "products"), itemData);
      setItems([...items, { id: docRef.id, ...itemData }]);
      setNewItem({
        type: 'product',
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: '',
        duration: ''
      });
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  return (
    <div>
    <div className="back-button" onClick={() => navigate('/dashboardA')}>
    &larr; Back to Dashboard
  </div>
  <button 
          className="update-profile-button"
          onClick={() => navigate('/profile')}
        >
          Update Profile
        </button>
    <div className="farmer-profile-container">
     

      <h1>My Inventory</h1>
      <p className="subtitle">Manage your products, tools, and fertilizers</p>

      <div className="product-management">
        {/* Add Item Form */}
        <div className="add-product-form">
          <h2>Add New Item</h2>
          <div className="form-group">
            <label>Item Type</label>
            <select name="type" value={newItem.type} onChange={handleInputChange}>
              <option value="product">Product</option>
              <option value="tool">Tool</option>
              <option value="fertilizer">Fertilizer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Item Name</label>
            <input 
              type="text" 
              name="name" 
              value={newItem.name} 
              onChange={handleInputChange} 
              placeholder="Enter name..." 
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={newItem.category} onChange={handleInputChange}>
              {newItem.type === 'product' ? (
                <>
                  <option value="">Select a category</option>
                  <option value="vegetable">Vegetable</option>
                  <option value="fruit">Fruit</option>
                  <option value="grain">Grain</option>
                </>
              ) : newItem.type === 'tool' ? (
                <>
                  <option value="">Select a tool</option>
                  <option value="tractor">Tractor</option>
                  <option value="harvester">Harvester</option>
                  <option value="plow">Plow</option>
                </>
              ) : (
                <>
                  <option value="">Select fertilizer type</option>
                  <option value="organic">Organic Fertilizer</option>
                  <option value="chemical">Chemical Fertilizer</option>
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Price (₹)</label>
            <input 
              type="number" 
              name="price" 
              value={newItem.price} 
              onChange={handleInputChange} 
              placeholder="Enter price" 
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input 
              type="number" 
              name="quantity" 
              value={newItem.quantity} 
              onChange={handleInputChange} 
              placeholder="Enter quantity" 
            />
          </div>

          {newItem.type === 'tool' && (
            <div className="form-group">
              <label>Duration for Rent/Lease (Days)</label>
              <input 
                type="number" 
                name="duration" 
                value={newItem.duration} 
                onChange={handleInputChange} 
                placeholder="Enter duration" 
              />
            </div>
          )}

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={newItem.description} 
              onChange={handleInputChange} 
              placeholder="Enter details..." 
            />
          </div>

          <button className="add-button" onClick={handleAddItem}>Add Item</button>
        </div>

        {/* Display Items */}
        <div className="product-list">
          <h2>Inventory ({items.length})</h2>
          {items.length === 0 ? (
            <p className="no-products">No items added yet.</p>
          ) : (
            <div className="products-grid">
              {items.map(item => (
                <div className="product-card" key={item.id}>
                  <div className="product-image">
                    <img src={getItemImage(item)} alt={item.name} />
                  </div>
                  <div className="product-details">
                    <h3>{item.name}</h3>
                    <p className="category">{item.category} {item.type}</p>
                    <p className="price">₹{item.price}</p>
                    <p className="quantity">
                      {item.quantity} {item.type === 'product' ? "kg available" : "units available"}
                    </p>
                    {item.type === 'tool' && (
                      <p className="duration">Duration: {item.duration} days</p>
                    )}
                    <p className="description">{item.description}</p>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default FarmerProfile;