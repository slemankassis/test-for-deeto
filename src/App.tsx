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
    
    // Add viewport meta tag to ensure proper responsive design
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const newViewportMeta = document.createElement('meta');
      newViewportMeta.setAttribute('name', 'viewport');
      newViewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(newViewportMeta);
    }
    
    // Create a global accessibility announcement container
    const announcerElement = document.getElementById('accessibility-announcer');
    if (!announcerElement) {
      const announcer = document.createElement('div');
      announcer.id = 'accessibility-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }
  }, []);

  return (
    <div 
      className="app-container" 
      role="application"
      aria-label="Deeto Chatbot Application"
      aria-describedby="app-description"
    >
      {/* Main application content */}
      <ChatProvider>
        <ChatContainer />
      </ChatProvider>
      
      {/* Hidden description for screen readers */}
      <div id="app-description" className="sr-only">
        This is an interactive chatbot interface that allows you to communicate with an AI assistant. 
        The interface is fully accessible with keyboard navigation and screen reader support.
        Use Ctrl+/ to focus on the chat input at any time. Arrow keys can navigate between message options.
      </div>
      
      {/* Global keyboard shortcut instructions for screen readers */}
      <div className="sr-only" aria-live="off">
        <h2>Keyboard shortcuts</h2>
        <ul>
          <li>Press Ctrl+/ to focus on the chat input at any time</li>
          <li>Use Tab to navigate through interactive elements</li>
          <li>Press Enter or Space to activate buttons and links</li>
          <li>Use Arrow Up and Arrow Down to navigate between message options</li>
        </ul>
      </div>
    </div>
  );
};

export default App;
