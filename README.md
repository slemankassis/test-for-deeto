# Deeto Chatbot Test Project

A React-based chatbot application built as a test job for Deeto. This application implements a customizable chatbot interface that communicates with the Deeto API to provide interactive chat experiences with dynamic styling and configuration options.

## Features

- **Real-time Messaging**: Send and receive messages through the Deeto Chat API
- **Customizable UI**: Dynamic styling through configuration including colors, borders, and shadows
- **Context-based State Management**: Using React Context API for efficient state handling
- **Responsive Design**: Built with Tailwind CSS for a fully responsive layout
- **Error Handling**: Robust error handling with user-friendly error displays and recovery options
- **Caching Strategy**: Implementation of API response caching to improve performance
- **Dynamic Configuration**: Fetches and applies chatbot configuration from the server
- **Customizable Initial Messages**: Support for configurable welcome messages
- **Contact Integration**: Optional contact URL integration

## Technologies Used

- **React 18**: Modern React with functional components and hooks
- **TypeScript**: Type-safe code development
- **Vite**: Next-generation frontend tooling for faster development
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Axios**: Promise-based HTTP client for API communication
- **React Context API**: For global state management
- **Vitest**: Testing framework compatible with Vite
- **Testing Library**: For component testing
- **ESLint & Prettier**: Code quality and formatting tools

## Installation & Setup

### Prerequisites

- Node.js 18 (recommended to use nvm for version management)
- Yarn package manager

### Steps

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd test-for-deeto
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Copy the content from `.env.example` and update with your values
   - The required environment variable is:
     ```
     VITE_VENDOR_ID=your_vendor_id
     ```
   - Default vendor ID is used if not provided

## Usage

### Development Server

Start the development server with hot module replacement:

```bash
yarn dev
```

This will start the application at `http://localhost:3000`.

### Testing

Run tests in watch mode:

```bash
yarn test:watch
```

Run tests once with coverage report:

```bash
yarn test:coverage
```

Run the test script (which uses Node.js 18):

```bash
./run-tests.sh
```

### Preview Production Build

Preview the production build locally:

```bash
yarn preview
```

## Project Structure

```
src/
├── components/       # UI components
├── context/          # Context providers (ChatContext)
├── hooks/            # Custom React hooks
├── services/         # API services and utilities
│   └── chatService.ts  # Handles API communication with Deeto
├── test/             # Test utilities and mocks
├── types/            # TypeScript type definitions
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

### Key Components

- **ChatProvider**: Context provider that manages the chat state
- **ChatContainer**: Main container for the chat UI
- **ChatMessageList**: Displays the chat messages
- **ChatInput**: Handles user input and message sending

## Testing

The project uses Vitest as the test runner with React Testing Library for component testing. Tests are organized in the following way:

- Unit tests for individual components
- Integration tests for API services
- Tests for context providers and hooks

To run all tests:

```bash
yarn test
```

For continuous testing during development:

```bash
yarn test:watch
```

## Accessibility

This project prioritizes digital accessibility to ensure the chat interface is usable by people of all abilities. We've implemented numerous accessibility features following WCAG 2.1 AA standards to create an inclusive user experience.

### Accessibility Features

- **ARIA Attributes**: Comprehensive use of ARIA roles, states, and properties throughout the application to improve screen reader compatibility:

  - `aria-live` regions for dynamic content updates
  - `aria-label` and `aria-labelledby` for descriptive elements
  - `aria-busy` for loading states
  - Proper role attributes (`region`, `application`, `log`, etc.)

- **Keyboard Navigation**:

  - Full keyboard accessibility for all interactive elements
  - Arrow key navigation for message options
  - Tab order follows logical reading sequence
  - Focus indicators for all interactive elements
  - Skip navigation link to jump directly to chat input

- **Focus Management**:

  - Focus returns to input field after sending a message
  - Preserved focus state during updates
  - Visual focus indicators with high contrast
  - Proper focus trapping in modal contexts

- **Screen Reader Support**:

  - Descriptive announcements for status changes
  - Hidden context information for screen readers (using `sr-only`)
  - Semantic HTML structure
  - Proper heading hierarchy

- **Semantic HTML**:

  - Using appropriate elements (`article`, `section`, `header`, etc.)
  - Proper list structures for message sequences
  - Semantic forms with associated labels

- **Color and Contrast**:

  - UI design respects minimum contrast ratios
  - Information not conveyed by color alone
  - Focus states have sufficient contrast

- **Responsive Design**:
  - Accessible on various screen sizes and orientations
  - Text scales properly without breaking layouts

### Keyboard Shortcuts

The application includes keyboard shortcuts to improve efficiency:

- `Ctrl + /`: Focus on the chat input field
- `Tab`: Navigate through interactive elements
- `Enter` or `Space`: Activate buttons and links
- `Up/Down Arrows`: Navigate between message options

### Accessibility Standards

This project aims to conform to WCAG 2.1 AA standards. Key guidelines followed include:

- Perceivable: Content is presentable to users in ways they can perceive
- Operable: User interface components are operable by all users
- Understandable: Information and operation are understandable
- Robust: Content is compatible with current and future assistive technologies

### Future Accessibility Improvements

Planned accessibility enhancements include:

- Implementing full internationalization (i18n) support
- Enhancing high contrast mode
- Adding voice input capabilities
- Conducting formal accessibility audits
- Expanding keyboard shortcuts

## Build & Deployment

### Building for Production

Create a production build:

```bash
yarn build
```

This generates optimized assets in the `dist` directory.

### Deployment

The application can be deployed to any static hosting service:

1. Build the application using `yarn build`
2. Deploy the contents of the `dist` directory to your hosting service

Popular hosting options:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Environment Configuration for Production

Ensure your production environment has the required environment variables set:

- `VITE_VENDOR_ID`: Your Deeto vendor ID

---

This project connects to the Deeto API at `https://dev-api.deeto.ai/v2` for chatbot configuration and message handling.
