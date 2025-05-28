import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'; // Example using Heroicons

const MessageForm = ({ onSendMessage }) => {
  const [messageContent, setMessageContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageContent.trim() === '') return;
    onSendMessage(messageContent);
    setMessageContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-3 border-t border-gray-200 bg-gray-50">
      <input
        type="text"
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        placeholder="Type your message..."
        className="flex-grow p-3 border border-gray-300 rounded-l-full focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none text-sm transition-shadow duration-150 ease-in-out shadow-sm hover:shadow-md"
        // Removed focus:border-orange-500 as focus:ring is often preferred
      />
      <button
        type="submit"
        className="p-3 text-white font-medium rounded-r-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary, #F97316)' }}
        disabled={messageContent.trim() === ''} // Disable button if input is empty
      >
        <PaperAirplaneIcon className="h-5 w-5" />
        <span className="ml-2 hidden sm:inline">Send</span>
      </button>
    </form>
  );
};

export default MessageForm;