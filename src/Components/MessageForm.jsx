import React, { useState } from 'react';

const MessageForm = ({ onSendMessage }) => {
  const [messageContent, setMessageContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageContent.trim() === '') return;
    onSendMessage(messageContent);
    setMessageContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-2 border-t border-gray-200">
      <input
        type="text"
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        placeholder="Type your message..."
        className="flex-grow p-3 border border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500 text-sm"
        // Style inspired by Menu.jsx inputs
      />
      <button
        type="submit"
        className="px-6 py-3 text-white font-semibold rounded-r-md shadow-md hover:shadow-lg transition-shadow text-sm"
        style={{ backgroundColor: 'var(--color-primary, #F97316)' }} // Using orange-500 as fallback
      >
        Send
      </button>
    </form>
  );
};

export default MessageForm;