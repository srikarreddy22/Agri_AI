import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import './login.css';

function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      setLoading(false);
      return;
    }

    // Basic phone number validation
    if (phone && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone)) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: fullName,
        photoURL: userType
      });

      // Create user document with phone number
      await setDoc(doc(db, "users", userCredential.user.uid), {
        userId: userCredential.user.uid,
        email: email,
        name: fullName,
        phone: phone, // Store phone number
        userType: userType,
        createdAt: new Date(),
        lastLogin: new Date(),
        profileComplete: false
      });

      if (userType === 'farmer') {
        await setDoc(doc(db, "farmers", userCredential.user.uid), {
          userId: userCredential.user.uid,
          products: [],
          createdAt: new Date()
        });
      } else {
        await setDoc(doc(db, "customers", userCredential.user.uid), {
          userId: userCredential.user.uid,
          orders: [],
          createdAt: new Date()
        });
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setError(error.message);
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          userId: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || "New User",
          phone: "", // Empty phone for Google signup
          userType: 'customer',
          createdAt: new Date(),
          lastLogin: new Date(),
          isGoogleUser: true,
          profileComplete: false
        });

        await setDoc(doc(db, "customers", result.user.uid), {
          userId: result.user.uid,
          orders: [],
          createdAt: new Date()
        });
      }

      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="signup-card">
        <h1 className="logo">Agri AI</h1>
        
        {success ? (
          <div className="success-message">
            <h2>Welcome to AgriConnect!</h2>
            <p>Your {userType} account has been created successfully.</p>
            <p>Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <h2>Create Account</h2>
            <p>Join our agricultural community</p>

            <div className="user-type-toggle">
              <button
                className={userType === 'customer' ? 'active' : ''}
                onClick={() => setUserType('customer')}
              >
                Customer
              </button>
              <button
                className={userType === 'farmer' ? 'active' : ''}
                onClick={() => setUserType('farmer')}
              >
                Farmer
              </button>
            </div>

            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Phone Number "
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="[0-9]{10}"
                  title="10-digit phone number"
                  required
                />
              </div>

              <div className="form-group password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="form-group password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>

              {error && <p className="error-text">{error}</p>}
            </form>

            <div className="auth-divider">OR</div>

            <button className="google-signin-button" onClick={handleGoogleSignIn}>
              <FcGoogle className="google-icon" /> Sign up with Google
            </button>

            <p className="signup-text">
              Already have an account? <a href="/">Log in</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default SignUp;