
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface ChatWindowProps {
  chatId: string;
  chatName: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  isMe?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, chatName }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // التمرير إلى آخر رسالة عند إضافة رسائل جديدة
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // تحميل الرسائل من Firestore
  useEffect(() => {
    if (!chatId) return;
    
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setLoading(true);
    
    // إعادة تعيين عدد الرسائل غير المقروءة
    const resetUnreadCount = async () => {
      try {
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
          [`unreadCount.${currentUser.uid}`]: 0
        });
      } catch (err) {
        console.error('Error resetting unread count:', err);
      }
    };
    
    resetUnreadCount();
    
    // استعلام للحصول على الرسائل
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        try {
          const messagesData: Message[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              text: data.text,
              senderId: data.senderId,
              timestamp: data.timestamp,
              isMe: data.senderId === currentUser.uid
            };
          });
          
          setMessages(messagesData);
          setLoading(false);
        } catch (err) {
          console.error('Error processing messages:', err);
          setError('حدث خطأ أثناء تحميل الرسائل.');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching messages:', err);
        setError('حدث خطأ أثناء تحميل الرسائل.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatId) return;
    
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
      // إضافة الرسالة إلى مجموعة الرسائل
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp()
      });
      
      // تحديث آخر رسالة ووقت التحديث في المحادثة
      const chatRef = doc(db, 'chats', chatId);
      
      // الحصول على معرفات المشاركين الآخرين
      const otherParticipants = messages
        .map(msg => msg.senderId)
        .filter(id => id !== currentUser.uid && id);
      
      // إنشاء كائن unreadCount للتحديث
      const unreadUpdate: Record<string, number> = {};
      otherParticipants.forEach(id => {
        if (id) {
          unreadUpdate[id] = 1; // يمكن زيادته إذا كان هناك قيمة موجودة
        }
      });
      
      await updateDoc(chatRef, {
        lastMessage: newMessage,
        updatedAt: serverTimestamp(),
        ...(Object.keys(unreadUpdate).length > 0 ? { unreadCount: unreadUpdate } : {})
      });
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('حدث خطأ أثناء إرسال الرسالة.');
    }
  };
  
  // Mock messages for development
  const mockMessages: Message[] = [
    { id: '1', text: 'مرحبا، كيف حالك؟', senderId: 'other', timestamp: new Date(Date.now() - 300000), isMe: false },
    { id: '2', text: 'أهلا! أنا بخير، شكرا لك. وأنت؟', senderId: 'current', timestamp: new Date(Date.now() - 240000), isMe: true },
    { id: '3', text: 'أنا بخير أيضا. هل انتهيت من المشروع؟', senderId: 'other', timestamp: new Date(Date.now() - 180000), isMe: false },
    { id: '4', text: 'نعم، أرسلت لك الملفات بالبريد الإلكتروني', senderId: 'current', timestamp: new Date(Date.now() - 120000), isMe: true },
  ];

  // استخدام البيانات الوهمية إذا لم تكن هناك بيانات فعلية
  const displayMessages = messages.length > 0 ? messages : mockMessages;

  // تنسيق الطابع الزمني
  const formatMessageTime = (timestamp: any): string => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      console.error('Error formatting message time:', err);
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-green-600 text-white p-4 flex items-center">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 text-lg font-bold ml-3">
          {chatName.charAt(0)}
        </div>
        <h2 className="text-xl font-semibold">{chatName}</h2>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center">
          {error}
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#e5ded8]">
        {loading ? (
          <div className="flex justify-center p-4">
            <p>جاري تحميل الرسائل...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.isMe ? 'bg-green-100' : 'bg-white'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="text-right text-xs text-gray-500 mt-1">
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-300 p-3 bg-white flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالة..."
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded-r-md hover:bg-green-700"
        >
          إرسال
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
