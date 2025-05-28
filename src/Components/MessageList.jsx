import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll to bottom whenever messages change

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <p className="text-center text-gray-500 py-4">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50 rounded-lg mb-0 h-full"> {/* Adjusted h-full, removed mb-4 */}
      {messages.map((msg, index) => {
        const isSender = msg.sender_id === currentUserId;
        // Handle potential invalid date string for created_at if it's temporary
        let messageDate = 'Sending...';
        if (msg.created_at && !String(msg.id).startsWith('temp-')) {
            try {
                messageDate = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                console.warn("Invalid date for message:", msg);
                messageDate = "Invalid time";
            }
        } else if (String(msg.id).startsWith('temp-')) {
            messageDate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Show current time for optimistic
        }


        // Determine if the previous message was from the same sender to group messages
        const prevMessage = messages[index - 1];
        const isSameSenderAsPrevious = prevMessage && prevMessage.sender_id === msg.sender_id;

        return (
          <div
            key={msg.id || `msg-${index}`} // Use index as fallback if id is not present (e.g., optimistic update)
            className={`flex ${isSender ? 'justify-end' : 'justify-start'} ${isSameSenderAsPrevious ? 'mt-1' : 'mt-3'}`} // Add less margin if same sender
          >
            <div
              className={`max-w-sm md:max-w-md lg:max-w-lg px-3.5 py-2.5 rounded-xl shadow-md break-words ${
                isSender
                  ? 'bg-orange-500 text-white rounded-br-none' // Tail for sender
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none' // Tail for receiver
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.message_content}</p>
              <p className={`text-xs mt-1.5 ${isSender ? 'text-orange-100' : 'text-gray-400'} text-right`}>
                {messageDate}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} /> {/* Element to scroll to */}
    </div>
  );
};

export default MessageList;