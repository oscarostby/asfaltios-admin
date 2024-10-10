import React, { useState, useRef, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FiSend, FiMessageCircle, FiX, FiUser, FiSmartphone } from 'react-icons/fi';
import axios from 'axios';

// Animation for the chat button to pulse
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Animation for chat window opening
const slideIn = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

// Animation for chat window closing
const slideOut = keyframes`
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
`;

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  transition: all 0.3s ease-in-out;
`;

const ChatButton = styled.button`
  background: linear-gradient(135deg, #0078ff, #00c6ff);
  color: #fff;
  border: none;
  border-radius: 50%;
  padding: 20px;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s;
  animation: ${pulse} 2s infinite;

  &:hover {
    transform: scale(1.15);
  }
`;

const ChatWindow = styled.div`
  width: 450px;
  max-height: 650px;
  background-color: #ffffff;
  border: 1px solid #e6e9ef;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: ${({ isOpen }) => (isOpen ? slideIn : slideOut)} 0.5s ease forwards;
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #0078ff, #00c6ff);
  color: #fff;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const ChatTitle = styled.h4`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9fafc;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageBubble = styled.div`
  display: flex;
  align-items: flex-end;
  max-width: 80%;
  ${({ isUser }) => (isUser ? 'align-self: flex-end;' : 'align-self: flex-start;')}
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ isUser }) => (isUser ? '#0078ff' : '#00c6ff')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  margin-right: ${({ isUser }) => (isUser ? '0' : '10px')};
  margin-left: ${({ isUser }) => (isUser ? '10px' : '0')};
`;

const Bubble = styled.div`
  background-color: ${({ isUser }) => (isUser ? '#0078ff' : '#e6e9ef')};
  color: ${({ isUser }) => (isUser ? '#fff' : '#333')};
  padding: 14px 18px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 15px;
`;

const ChatInputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #e6e9ef;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 14px;
  border: 1px solid #e6e9ef;
  border-radius: 30px;
  outline: none;
  background-color: #f9fafc;
  font-size: 15px;
  margin-right: 10px;
`;

const SendButton = styled.button`
  background: #0078ff;
  border: none;
  color: #fff;
  font-size: 22px;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #005bb5;
  }
`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: 'Hello! How can I assist you today?', isUser: false }]);
  const [newMessage, setNewMessage] = useState('');
  const messageEndRef = useRef(null);
  const [chatId] = useState(Date.now().toString());  // Genererer unik ID for hver chat

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = { text: newMessage, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    // Scroll to the bottom after sending a message
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const context = `
        About Asfaltios:

        Asfaltios is a Minecraft security company that develops advanced plugins aimed at both improving server security and enhancing player experience. We work to provide plugins that protect Minecraft servers while also offering tools for server administrators to improve gameplay and server management.
      `;

      // Send the user's message and context to the backend server
      const response = await axios.post('http://localhost:5000/api/chatbot/send', {
        message: newMessage,
        context,
      });

      const botMessage = { text: response.data.reply, isUser: false };
      setMessages((prev) => [...prev, botMessage]);

      // Scroll to the bottom after receiving a response
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Store chat on the server for staff to view in the panel
      await axios.post('http://localhost:5000/api/chat/store', {
        chatId,
        messages: [...messages, userMessage, botMessage]
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: 'Sorry, there was an error processing your request.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ChatbotContainer>
      {isOpen && (
        <ChatWindow isOpen={isOpen}>
          <ChatHeader>
            <ChatTitle>Asfaltios Chatbot</ChatTitle>
            <CloseButton onClick={handleToggleChat}>
              <FiX />
            </CloseButton>
          </ChatHeader>
          <ChatBody>
            <MessageContainer>
              {messages.map((msg, index) => (
                <MessageBubble key={index} isUser={msg.isUser}>
                  {!msg.isUser && (
                    <Avatar isUser={msg.isUser}>
                      <FiSmartphone />
                    </Avatar>
                  )}
                  <Bubble isUser={msg.isUser}>{msg.text}</Bubble>
                  {msg.isUser && (
                    <Avatar isUser={msg.isUser}>
                      <FiUser />
                    </Avatar>
                  )}
                </MessageBubble>
              ))}
              <div ref={messageEndRef} />
            </MessageContainer>
          </ChatBody>
          <ChatInputContainer>
            <ChatInput
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <SendButton onClick={handleSendMessage}>
              <FiSend />
            </SendButton>
          </ChatInputContainer>
        </ChatWindow>
      )}
      {!isOpen && (
        <ChatButton onClick={handleToggleChat}>
          <FiMessageCircle />
        </ChatButton>
      )}
    </ChatbotContainer>
  );
};

export default Chatbot;
