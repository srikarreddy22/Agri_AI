import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AiOutlineMail, AiOutlinePhone, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiLockAlt } from "react-icons/bi";
import { FcGoogle } from "react-icons/fc";
import './Login.css';

function Login() {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('farmer');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  // 🔹 Handle Login with Email & Password
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", userCredential.user.uid);

      // Update last login time
      await updateDoc(userRef, { lastLogin: new Date() });

      // Get user type
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Navigate based on userType
      navigate(userData?.userType === 'farmer' ? '/dashboardA' : '/dashboardB');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle OTP Sending for Phone Login
  const sendOtp = async () => {
    setError('');
    if (phone.length < 10) {
      setError("Enter a valid phone number!");
      return;
    }

    try {
      const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: "invisible",
        callback: () => sendOtp()
      });

      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptcha);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔹 Handle OTP Verification for Phone Login
  const verifyOtp = async () => {
    setError('');
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      const result = await window.confirmationResult.confirm(otp);
      const userRef = doc(db, "users", result.user.uid);

      // Update last login time
      await updateDoc(userRef, { lastLogin: new Date() });

      // Get user type
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Navigate based on userType
      navigate(userData?.userType === 'farmer' ? '/dashboardA' : '/dashboardB');
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
  };

  // 🔹 Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, "users", result.user.uid);

      // Update last login time
      await updateDoc(userRef, { lastLogin: new Date() });

      // Get user type
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Navigate based on userType
      navigate(userData?.userType === 'farmer' ? '/dashboardA' : '/dashboardB');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="logo">Agri AI</h1>

        {/* User Type Selection */}
        <div className="user-type-toggle">
          <button className={userType === 'farmer' ? 'active' : ''} onClick={() => setUserType('farmer')}>Farmer</button>
          <button className={userType === 'customer' ? 'active' : ''} onClick={() => setUserType('customer')}>Customer</button>
        </div>

        <h2>Welcome Back, {userType === 'farmer' ? 'Farmer' : 'Customer'}</h2>
        <p>Login to continue your journey</p>

        {/* 🔹 Login Method Toggle */}
        <div className="user-type-toggle">
          <button className={loginMethod === 'email' ? 'active' : ''} onClick={() => setLoginMethod('email')}>Login with Email</button>
          <button className={loginMethod === 'phone' ? 'active' : ''} onClick={() => setLoginMethod('phone')}>Login with Phone</button>
        </div>

        {/* 🔹 Login with Email */}
        {loginMethod === 'email' && (
          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <input type="email" placeholder="Email Address" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group password-wrapper">
              <input type={showPassword ? "text" : "password"} placeholder="Password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>
            <button type="submit" className="login-button" disabled={loading}>{loading ? 'Logging In...' : 'Login'}</button>
          </form>
        )}

        {/* 🔹 Login with Phone */}
        {loginMethod === 'phone' && (
          <div>
            <input type="text" placeholder="Phone Number" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {!otpSent ? (
              <button className="login-button" onClick={sendOtp}>Send OTP</button>
            ) : (
              <>
                <input type="text" placeholder="Enter OTP" className="input-field" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <button className="login-button" onClick={verifyOtp}>Verify OTP</button>
              </>
            )}
          </div>
        )}

        {/* 🔹 Google Login */}
        <div className="auth-divider">OR</div>
        <button className="google-signin-button" onClick={handleGoogleLogin}><FcGoogle className="google-icon" /> Sign in with Google</button>

        {/* 🔹 Signup Navigation */}
        <p className="signup-text">Don't have an account? <a href="/signup">Sign up</a></p>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default Login;
