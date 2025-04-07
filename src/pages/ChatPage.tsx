
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import NavigationBar from '../components/NavigationBar';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  participants: string[];
}

const ChatPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    
    if (!currentUser) return;

    setLoading(true);
    
    // استعلام للحصول على المحادثات التي يشارك فيها المستخدم الحالي
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      async (snapshot) => {
        try {
          const chatsData: Chat[] = [];
          
          for (const chatDoc of snapshot.docs) {
            const chatData = chatDoc.data();
            
            // البحث عن المستخدم الآخر في المحادثة
            const otherUserId = chatData.participants.find(
              (id: string) => id !== currentUser.uid
            );
            
            if (otherUserId) {
              // الحصول على معلومات المستخدم الآخر
              const userDoc = await getDoc(doc(db, 'users', otherUserId));
              const userData = userDoc.data();
              
              chatsData.push({
                id: chatDoc.id,
                name: userData?.name || 'مستخدم',
                lastMessage: chatData.lastMessage || 'لا توجد رسائل',
                time: formatTimestamp(chatData.updatedAt),
                unread: chatData.unreadCount?.[currentUser.uid] || 0,
                participants: chatData.participants,
              });
            }
          }
          
          setChats(chatsData);
          
          // اختيار أول محادثة افتراضيًا إذا لم يتم اختيار أي محادثة
          if (chatsData.length > 0 && !selectedChat) {
            setSelectedChat(chatsData[0].id);
          }
        } catch (err) {
          console.error('Error processing chats:', err);
          setError('حدث خطأ أثناء تحميل المحادثات.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching chats:', err);
        setError('حدث خطأ أثناء تحميل المحادثات.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // تنسيق الطابع الزمني
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      
      // اليوم
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // البارحة
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'البارحة';
      }
      
      // هذا الأسبوع
      const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dayDifference = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDifference < 7) {
        return daysOfWeek[date.getDay()];
      }
      
      // غير ذلك
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      return '';
    }
  };

  // Mock data for development
  const mockChats: Chat[] = [
    { id: '1', name: 'أحمد محمد', lastMessage: 'مرحبا، كيف حالك؟', time: '10:30', unread: 2, participants: ['user1', 'user2'] },
    { id: '2', name: 'فاطمة علي', lastMessage: 'هل أنت جاهز للاجتماع؟', time: '09:45', unread: 0, participants: ['user1', 'user3'] },
    { id: '3', name: 'محمد سعيد', lastMessage: 'أرسلت لك الملفات المطلوبة', time: 'أمس', unread: 1, participants: ['user1', 'user4'] },
  ];

  // استخدام البيانات الوهمية إذا لم تكن هناك بيانات فعلية
  const displayChats = chats.length > 0 ? chats : mockChats;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <NavigationBar />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center">
          {error}
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat list sidebar */}
        <div className="w-1/3 border-r border-gray-300 bg-white">
          <ChatList 
            chats={displayChats} 
            selectedChatId={selectedChat} 
            onSelectChat={setSelectedChat} 
          />
        </div>
        
        {/* Chat window */}
        <div className="w-2/3">
          {selectedChat ? (
            <ChatWindow 
              chatId={selectedChat} 
              chatName={displayChats.find(chat => chat.id === selectedChat)?.name || ''} 
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <p className="text-gray-500 text-lg">اختر محادثة للبدء</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
