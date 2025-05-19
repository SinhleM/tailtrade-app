import React from 'react';

const MessageList = ({ messages, currentUserId }) => {
  if (!messages || messages.length === 0) {
    return <p className="text-center text-gray-500 py-4">No messages yet. Start the conversation!</p>;
  }

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg mb-4 h-96">
      {messages.map((msg) => {
        const isSender = msg.sender_id === currentUserId;
        const messageDate = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
          <div
            key={msg.id}
            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow ${
                isSender
                  ? 'bg-orange-500 text-white' // var(--color-primary) equivalent
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              <p className="text-sm">{msg.message_content}</p>
              <p className={`text-xs mt-1 ${isSender ? 'text-orange-200' : 'text-gray-400'} text-right`}>
                {messageDate}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;