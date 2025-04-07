
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  return (
    <nav className="bg-green-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/chat" className="text-xl font-bold">تطبيق الدردشة</Link>
        
        <div className="flex space-x-4">
          <Link to="/chat" className="px-3 py-2 rounded hover:bg-green-700">الدردشات</Link>
          <Link to={`/profile/${auth.currentUser?.uid || 'user'}`} className="px-3 py-2 rounded hover:bg-green-700">الملف الشخصي</Link>
          <button 
            onClick={handleSignOut}
            className="px-3 py-2 rounded hover:bg-green-700"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
