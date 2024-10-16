import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiTrash2, FiMoon, FiSun, FiSettings, FiMessageSquare, FiLogOut, FiUser } from 'react-icons/fi';

const API_URL = 'https://api2.asfaltios.com';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.textColor};
    transition: all 0.3s ease;
  }
`;

const lightTheme = {
  background: '#f8fafc',
  textColor: '#334155',
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#f59e0b',
  cardBg: '#ffffff',
  inputBg: '#f1f5f9',
  border: '#e2e8f0',
};

const darkTheme = {
  background: '#0f172a',
  textColor: '#e2e8f0',
  primary: '#60a5fa',
  secondary: '#94a3b8',
  accent: '#fbbf24',
  cardBg: '#1e293b',
  inputBg: '#334155',
  border: '#475569',
};

const Layout = styled.div`
  display: grid;
  grid-template-columns: 80px 300px minmax(0, 1fr);
  height: 100vh;
`;

const Sidebar = styled.aside`
  background-color: ${({ theme }) => theme.cardBg};
  border-right: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
`;

const SidebarIcon = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.secondary};
  font-size: 1.5rem;
  margin-bottom: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover, &.active {
    color: ${({ theme }) => theme.primary};
    transform: scale(1.1);
  }
`;

const ChatList = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  border-right: 1px solid ${({ theme }) => theme.border};
  overflow-y: auto;
`;

const ChatItem = styled(motion.div)`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.inputBg};
    transform: translateX(5px);
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.accent};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1rem;
  font-weight: bold;
  color: ${({ theme }) => theme.cardBg};
`;

const ChatInfo = styled.div`
  flex: 1;
`;

const ChatName = styled.h3`
  margin: 0;
  font-size: 1rem;
`;

const LastMessage = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.secondary};
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const ChatHeader = styled.header`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatWindow = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
`;

const Message = styled(motion.div)`
  background-color: ${({ theme, isStaff }) => isStaff ? theme.primary : theme.inputBg};
  color: ${({ theme, isStaff }) => isStaff ? '#ffffff' : theme.textColor};
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  margin-bottom: 0.5rem;
  max-width: 70%;
  align-self: ${({ isStaff }) => isStaff ? 'flex-end' : 'flex-start'};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const InputArea = styled.div`
  display: flex;
  padding: 1rem;
  background-color: ${({ theme }) => theme.cardBg};
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.textColor};

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary};
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primary};
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

function Staff() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentTheme, setCurrentTheme] = useState(lightTheme);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatList();
    const chatListInterval = setInterval(loadChatList, 5000);
    return () => clearInterval(chatListInterval);
  }, []);

  useEffect(() => {
    if (currentChatId) {
      loadMessages();
      const messagesInterval = setInterval(loadMessages, 3000);
      return () => clearInterval(messagesInterval);
    }
  }, [currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatList = async () => {
    try {
      const response = await fetch(`${API_URL}/api2/chats`);
      const data = await response.json();
      setChats(prevChats => {
        const newChats = data.filter(chatId => !prevChats.includes(chatId));
        if (newChats.length > 0) {
          console.log('New chats detected:', newChats);
        }
        return data;
      });
    } catch (error) {
      console.error('Error loading chat list:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api2/messages/${currentChatId}`);
      const data = await response.json();
      setMessages(prevMessages => {
        if (data.length !== prevMessages.length) {
          console.log('New messages detected');
          return data;
        }
        return prevMessages;
      });
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentChatId || !inputMessage.trim()) return;

    try {
      await fetch(`${API_URL}/api2/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: currentChatId, sender: 'Staff', content: inputMessage }),
      });

      setInputMessage('');
      loadMessages(); // Immediately load messages after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme(prevTheme => prevTheme === lightTheme ? darkTheme : lightTheme);
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <Layout>
        <Sidebar>
          <SidebarIcon className="active"><FiMessageSquare /></SidebarIcon>
          <SidebarIcon onClick={toggleTheme}>
            {currentTheme === lightTheme ? <FiMoon /> : <FiSun />}
          </SidebarIcon>
          <SidebarIcon><FiSettings /></SidebarIcon>
          <SidebarIcon><FiLogOut /></SidebarIcon>
        </Sidebar>
        <ChatList>
          <AnimatePresence>
            {chats.map((chatId) => (
              <ChatItem
                key={chatId}
                onClick={() => setCurrentChatId(chatId)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar><FiUser /></Avatar>
                <ChatInfo>
                  <ChatName>Chat {chatId.substr(-4)}</ChatName>
                  <LastMessage>Click to view messages</LastMessage>
                </ChatInfo>
              </ChatItem>
            ))}
          </AnimatePresence>
        </ChatList>
        <MainContent>
          {currentChatId ? (
            <>
              <ChatHeader>
                <h2>Chat {currentChatId.substr(-4)}</h2>
                <IconButton><FiTrash2 /></IconButton>
              </ChatHeader>
              <ChatWindow>
                <MessageList>
                  <AnimatePresence>
                    {messages.map((msg, index) => (
                      <Message
                        key={index}
                        isStaff={msg.sender === 'Staff'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <strong>{msg.sender}:</strong> {msg.content}
                      </Message>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </MessageList>
              </ChatWindow>
              <InputArea>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                />
                <IconButton onClick={sendMessage}><FiSend /></IconButton>
              </InputArea>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <h2>Select a chat to start messaging</h2>
            </div>
          )}
        </MainContent>
      </Layout>
    </ThemeProvider>
  );
}

export default Staff;