
import React, { useState } from 'react';

interface ChatWindowProps {
  chatId: string;
  chatName: string;
}

interface Message {
  id: string;
  text: string;
  isMe: boolean;
  timestamp: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, chatName }) => {
  const [newMessage, setNewMessage] = useState('');
  
  // Mock messages
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'مرحبا، كيف حالك؟', isMe: false, timestamp: '10:30' },
    { id: '2', text: 'أهلا! أنا بخير، شكرا لك. وأنت؟', isMe: true, timestamp: '10:31' },
    { id: '3', text: 'أنا بخير أيضا. هل انتهيت من المشروع؟', isMe: false, timestamp: '10:32' },
    { id: '4', text: 'نعم، أرسلت لك الملفات بالبريد الإلكتروني', isMe: true, timestamp: '10:33' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now().toString(),
        text: newMessage,
        isMe: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
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
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#e5ded8]">
        <div className="space-y-3">
          {messages.map((message) => (
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
                <p className="text-right text-xs text-gray-500 mt-1">{message.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
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
