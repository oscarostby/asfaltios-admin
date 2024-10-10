// App.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/main';
import Panel from './pages/panel';
import NotFound from './pages/404';
import Chatbot from './components/Chatbot'; // Import the Chatbot component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/panel" element={<Panel />} />
        {/* 404 route, always placed at the end */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Chatbot /> {/* Include the Chatbot component */}
    </BrowserRouter>
  );
}

export default App;
