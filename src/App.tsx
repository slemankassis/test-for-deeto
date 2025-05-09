import React, { useEffect } from "react";
import { ChatProvider } from "./context/ChatContext";
import ChatContainer from "./components/ChatContainer";

const App: React.FC = () => {
  // Set document language and title for accessibility
  useEffect(() => {
    // Set the document language
    document.documentElement.lang = 'en';
    
    // Update the page title for better screen reader context
    document.title = "Deeto Chatbot Interface";
    
    // Add a description meta tag for screen readers
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'An accessible chatbot interface powered by Deeto AI');
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.setAttribute('name', 'description');
      newMetaDescription.setAttribute('content', 'An accessible chatbot interface powered by Deeto AI');
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <div 
      className="app-container" 
      role="application"
      aria-label="Deeto Chatbot Application"
    >
      {/* Main application content */}
      <ChatProvider>
        <ChatContainer />
      </ChatProvider>
      
      {/* Hidden description for screen readers */}
      <div className="sr-only">
        This is an interactive chatbot interface that allows you to communicate with an AI assistant. 
        The interface is fully accessible with keyboard navigation and screen reader support.
      </div>
    </div>
  );
};

export default App;
