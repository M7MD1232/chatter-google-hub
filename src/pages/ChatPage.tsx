
import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  // Mock data for chats
  const chats = [
    { id: '1', name: 'أحمد محمد', lastMessage: 'مرحبا، كيف حالك؟', time: '10:30', unread: 2 },
    { id: '2', name: 'فاطمة علي', lastMessage: 'هل أنت جاهز للاجتماع؟', time: '09:45', unread: 0 },
    { id: '3', name: 'محمد سعيد', lastMessage: 'أرسلت لك الملفات المطلوبة', time: 'أمس', unread: 1 },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat list sidebar */}
      <div className="w-1/3 border-r border-gray-300 bg-white">
        <ChatList 
          chats={chats} 
          selectedChatId={selectedChat} 
          onSelectChat={setSelectedChat} 
        />
      </div>
      
      {/* Chat window */}
      <div className="w-2/3">
        {selectedChat ? (
          <ChatWindow 
            chatId={selectedChat} 
            chatName={chats.find(chat => chat.id === selectedChat)?.name || ''} 
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <p className="text-gray-500 text-lg">اختر محادثة للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
