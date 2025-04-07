
import React from 'react';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onSelectChat }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <h1 className="text-xl font-bold">الدردشات</h1>
      </div>
      
      {/* Search */}
      <div className="p-3 bg-gray-100">
        <input
          type="text"
          placeholder="البحث عن محادثة..."
          className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
              selectedChatId === chat.id ? 'bg-gray-200' : ''
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            {/* Avatar */}
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3">
              {chat.name.charAt(0)}
            </div>
            
            {/* Chat info */}
            <div className="flex-1">
              <div className="flex justify-between">
                <h2 className="font-semibold">{chat.name}</h2>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-sm text-gray-600 truncate max-w-[180px]">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
