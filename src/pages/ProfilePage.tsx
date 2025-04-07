
import React from 'react';
import { useParams } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{userId: string}>();
  
  // Mock user data
  const user = {
    id: userId,
    name: 'أحمد محمد',
    status: 'متاح',
    avatar: 'https://via.placeholder.com/150',
    phone: '+970 59 123 4567'
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-600 p-4 text-center">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-24 h-24 mx-auto rounded-full border-4 border-white"
          />
          <h1 className="text-2xl font-bold text-white mt-2">{user.name}</h1>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-sm text-gray-600 mb-1">الحالة</h2>
            <p className="text-gray-800">{user.status}</p>
          </div>
          
          <div className="border-b pb-4">
            <h2 className="text-sm text-gray-600 mb-1">رقم الهاتف</h2>
            <p className="text-gray-800 dir-ltr text-right">{user.phone}</p>
          </div>
          
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
            تعديل الملف الشخصي
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
