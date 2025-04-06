import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaSeedling, FaShoppingBasket, FaCalendarAlt } from 'react-icons/fa';
import './Dashboard.css';

function DashboardA() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="logo">Agri AI Farmer</div>
        <div className="nav-links">
          <button onClick={() => navigate('/plant-diseases')}>
            <FaLeaf style={{ marginRight: '10px' }} />
            Plant Diseases
          </button>
          <button onClick={() => navigate('/farmer-profile')}>
            <FaSeedling style={{ marginRight: '10px' }} />
            My Products
          </button>
          <button onClick={() => navigate('/marketplace')}>
            <FaShoppingBasket style={{ marginRight: '10px' }} />
            Marketplace
          </button>
          <button onClick={() => navigate('/crop-rotation')}>
            <FaCalendarAlt style={{ marginRight: '10px' }} />
            Crop Rotation
          </button>
        </div>
      </nav>
      
      <div className="dashboard-content">
        <div className="welcome-message">
          <h2>Welcome Farmer!</h2>
          <p>Manage your agricultural activities here</p>
        </div>
        
        <div className="quick-actions">
          <div className="action-card" onClick={() => navigate('/plant-diseases')}>
            <div className="action-icon">
              <FaLeaf />
            </div>
            <h3>Detect Plant Diseases</h3>
            <p>Upload images of your crops for analysis and get instant diagnosis with treatment recommendations.</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/farmer-profile')}>
            <div className="action-icon">
              <FaSeedling />
            </div>
            <h3>Manage My Products</h3>
            <p>Add, edit or remove your agricultural products available for sale in the marketplace.</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/marketplace')}>
            <div className="action-icon">
              <FaShoppingBasket />
            </div>
            <h3>Browse Marketplace</h3>
            <p>Purchase farming supplies or sell your fresh produce to customers.</p>
          </div>

          <div className="action-card" onClick={() => navigate('/crop-rotation')}>
            <div className="action-icon">
              <FaCalendarAlt />
            </div>
            <h3>Crop Rotation Planner</h3>
            <p>Plan optimal crop rotation cycles to maintain soil health and maximize yields.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardA;