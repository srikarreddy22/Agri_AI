import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
const resources = {
  en: {
    translation: {
      welcome: "Welcome to ",
      agri: "Agri AI",
      exploreNow: "Explore Now",
      featuresTitle: "Why Choose Agri AI?",
      contact: "Contact Us",
      signIn: "Sign In",
      home: "Home",
      features: "Features",
      visitPlatform: "Visit the Platform",
      createAccount: "Create Your Account",
      aiDiagnosis: "AI-Powered Crop Diagnosis",
      buySell: "Buy & Sell Farm Produce",
      smartRecommendation: "Smart Recommendations",
      secureTransactions: "Secure Transactions",
      communitySupport: "Community Support",
      sustainableAgriculture: "Sustainable Agriculture",
      email: "Email: support@agriai.com",
      phone: "Phone: +91 9876543210",
      copyright: "© 2025 Agri AI. All rights reserved.",
    }
  },
  hi: {
    translation: {
      welcome: "स्वागत है ",
      agri: "एग्री एआई",
      exploreNow: "अभी एक्सप्लोर करें",
      featuresTitle: "एग्री एआई क्यों चुनें?",
      contact: "हमसे संपर्क करें",
      signIn: "साइन इन करें",
      home: "होम",
      features: "विशेषताएँ",
      visitPlatform: "प्लेटफार्म पर जाएं",
      createAccount: "अपना खाता बनाएं",
      aiDiagnosis: "एआई-समर्थित फसल निदान",
      buySell: "कृषि उत्पाद खरीदें और बेचें",
      smartRecommendation: "स्मार्ट सिफारिशें",
      secureTransactions: "सुरक्षित लेन-देन",
      communitySupport: "सामुदायिक समर्थन",
      sustainableAgriculture: "सतत कृषि",
      email: "ईमेल: support@agriai.com",
      phone: "फोन: +91 9876543210",
      copyright: "© 2025 एग्री एआई. सभी अधिकार सुरक्षित।",
    }
  },
  te: {
    translation: {
      welcome: "స్వాగతం ",
      agri: "అగ్రి ఏఐ",
      exploreNow: "ఇప్పుడే అన్వేషించండి",
      featuresTitle: "ఎందుకు అగ్రి ఏఐ?",
      contact: "మాతో సంప్రదించండి",
      signIn: "సైన్ ఇన్",
      home: "హోమ్",
      features: "ఫీచర్లు",
      visitPlatform: "ప్లాట్ఫార్మ్ సందర్శించండి",
      createAccount: "మీ ఖాతాను సృష్టించండి",
      aiDiagnosis: "ఏఐ ఆధారిత పంట నిర్ధారణ",
      buySell: "రైతులు ఉత్పత్తులు అమ్మి కొనండి",
      smartRecommendation: "స్మార్ట్ సిఫార్సులు",
      secureTransactions: "సురక్షిత లావాదేవీలు",
      communitySupport: "సంఘం మద్దతు",
      sustainableAgriculture: "సుస్థిర వ్యవసాయం",
      email: "ఇమెయిల్: support@agriai.com",
      phone: "ఫోన్: +91 9876543210",
      copyright: "© 2025 అగ్రి ఏఐ. అన్ని హక్కులు రిజర్వ్.",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
