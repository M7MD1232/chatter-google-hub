
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../lib/firebase';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: any;
  }
}

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          setError('انتهت صلاحية reCAPTCHA. يرجى المحاولة مرة أخرى.');
        }
      });
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phoneNumber) {
      return setError('يرجى إدخال رقم الهاتف');
    }

    try {
      setLoading(true);
      setupRecaptcha();
      
      // تنسيق رقم الهاتف (يجب أن يبدأ بـ +)
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+${phoneNumber}`;
      
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhoneNumber, 
        window.recaptchaVerifier
      );
      
      window.confirmationResult = confirmationResult;
      setShowVerification(true);
    } catch (err: any) {
      console.error('Error sending verification code:', err);
      setError(err.message || 'حدث خطأ أثناء إرسال رمز التحقق');
      
      // إعادة تعيين reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined as any;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!verificationCode) {
      return setError('يرجى إدخال رمز التحقق');
    }

    try {
      setLoading(true);
      await window.confirmationResult.confirm(verificationCode);
      navigate('/chat');
    } catch (err: any) {
      console.error('Error confirming code:', err);
      setError(err.message || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-6">مرحبًا بك في تطبيق الدردشة</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {!showVerification ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input
                type="tel"
                id="phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="أدخل رقم هاتفك مع رمز البلد مثل +970591234567"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">أدخل رقم هاتفك مع رمز البلد (مثال: +970591234567)</p>
            </div>
            
            <div id="recaptcha-container"></div>
            
            <button 
              type="submit" 
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">رمز التحقق</label>
              <input
                type="text"
                id="code"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="أدخل رمز التحقق"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
            </button>
            
            <button 
              type="button"
              onClick={() => setShowVerification(false)}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300 disabled:bg-gray-400"
              disabled={loading}
            >
              العودة
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
