
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import NavigationBar from '../components/NavigationBar';

interface UserProfile {
  id: string;
  name: string;
  status: string;
  avatar: string;
  phone: string;
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{userId: string}>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // حقول التحرير
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // التحقق مما إذا كان هذا هو الملف الشخصي للمستخدم الحالي
  const isCurrentUser = auth.currentUser?.uid === userId;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // استخدام معرف المستخدم الحالي إذا لم يتم تحديد معرف
        const targetUserId = userId || auth.currentUser?.uid;
        
        if (!targetUserId) {
          navigate('/');
          return;
        }
        
        const userDoc = await getDoc(doc(db, 'users', targetUserId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<UserProfile, 'id'>;
          setProfile({
            id: targetUserId,
            ...userData
          });
          
          // تعيين قيم النموذج
          setName(userData.name || '');
          setStatus(userData.status || '');
          setAvatarPreview(userData.avatar || '');
        } else {
          // إنشاء ملف شخصي وهمي للتطوير
          const mockProfile: UserProfile = {
            id: targetUserId,
            name: auth.currentUser?.displayName || 'مستخدم',
            status: 'متاح',
            avatar: auth.currentUser?.photoURL || 'https://via.placeholder.com/150',
            phone: auth.currentUser?.phoneNumber || '+970 59 123 4567'
          };
          
          setProfile(mockProfile);
          setName(mockProfile.name);
          setStatus(mockProfile.status);
          setAvatarPreview(mockProfile.avatar);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('حدث خطأ أثناء تحميل الملف الشخصي.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCurrentUser || !auth.currentUser) {
      return;
    }
    
    try {
      setLoading(true);
      
      let avatarUrl = profile?.avatar || '';
      
      // تحميل الصورة الجديدة إذا تم تحديدها
      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
        const snapshot = await uploadBytes(storageRef, avatarFile);
        avatarUrl = await getDownloadURL(snapshot.ref);
      }
      
      // تحديث الملف الشخصي في Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name,
        status,
        avatar: avatarUrl,
        updatedAt: new Date()
      });
      
      // تحديث ملف تعريف المصادقة
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: avatarUrl
      });
      
      // تحديث حالة المكون
      setProfile(prev => {
        if (prev) {
          return {
            ...prev,
            name,
            status,
            avatar: avatarUrl
          };
        }
        return prev;
      });
      
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('حدث خطأ أثناء تحديث الملف الشخصي.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavigationBar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <p>جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationBar />
      
      <div className="py-10 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center">
              {error}
            </div>
          )}
          
          <div className="bg-green-600 p-6 text-center">
            {editMode ? (
              <div className="relative w-24 h-24 mx-auto">
                <img 
                  src={avatarPreview} 
                  alt={profile?.name || 'صورة المستخدم'} 
                  className="w-24 h-24 mx-auto rounded-full border-4 border-white object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            ) : (
              <img 
                src={profile?.avatar || 'https://via.placeholder.com/150'} 
                alt={profile?.name || 'صورة المستخدم'} 
                className="w-24 h-24 mx-auto rounded-full border-4 border-white object-cover"
              />
            )}
            
            {editMode ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 text-2xl font-bold text-white bg-transparent border-b border-white focus:outline-none text-center w-full"
                placeholder="أدخل اسمك"
              />
            ) : (
              <h1 className="text-2xl font-bold text-white mt-2">{profile?.name || 'مستخدم'}</h1>
            )}
          </div>
          
          {editMode ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">الحالة</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="أدخل حالتك"
                />
              </div>
              
              <div className="border-b pb-4">
                <h2 className="text-sm text-gray-600 mb-1">رقم الهاتف</h2>
                <p className="text-gray-800 dir-ltr text-right">{profile?.phone || auth.currentUser?.phoneNumber || 'غير متوفر'}</p>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
                
                <button 
                  type="button" 
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300 disabled:bg-gray-400"
                  onClick={() => {
                    setEditMode(false);
                    setName(profile?.name || '');
                    setStatus(profile?.status || '');
                    setAvatarPreview(profile?.avatar || '');
                  }}
                  disabled={loading}
                >
                  إلغاء
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-4">
              <div className="border-b pb-4">
                <h2 className="text-sm text-gray-600 mb-1">الحالة</h2>
                <p className="text-gray-800">{profile?.status || 'غير متوفر'}</p>
              </div>
              
              <div className="border-b pb-4">
                <h2 className="text-sm text-gray-600 mb-1">رقم الهاتف</h2>
                <p className="text-gray-800 dir-ltr text-right">{profile?.phone || auth.currentUser?.phoneNumber || 'غير متوفر'}</p>
              </div>
              
              {isCurrentUser && (
                <button 
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
                  onClick={() => setEditMode(true)}
                >
                  تعديل الملف الشخصي
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
