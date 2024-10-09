import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiTrash2, FiMoon, FiSun, FiSettings, FiMessageSquare, FiLogOut, FiUser, FiSearch } from 'react-icons/fi';

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

const SearchBar = styled.div`
  padding: 1rem;
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.cardBg};
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
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

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background-color: ${({ theme }) => theme.cardBg};
  padding: 2rem;
  border-radius: 0.5rem;
  width: 300px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const SettingsOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StaffPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentTheme, setCurrentTheme] = useState(lightTheme);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const chatWindowRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedInStatus);

      if (!loggedInStatus) {
        navigate('/404');
      } else {
        fetchActiveChats();
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const fetchActiveChats = useCallback(async () => {
    try {
      const response = await axios.get('https://api.asfaltios.com/api/chat/active');
      setActiveChats(response.data);
    } catch (error) {
      console.error('Error fetching active chats:', error);
    }
  }, []);

  const selectChat = useCallback(async (userId) => {
    setSelectedChat(userId);
    try {
      const response = await axios.get(`https://api.asfaltios.com/api/chat/messages/${userId}`);
      setMessages(response.data);
      setNewMessage('');
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await axios.post('https://api.asfaltios.com/api/chat/send', {
        userId: selectedChat,
        text: newMessage,
        isStaff: true,
      });
      if (response.status === 200) {
        setMessages(prevMessages => [...prevMessages, { text: newMessage, isStaff: true }]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [newMessage, selectedChat]);

  const scrollToBottom = useCallback(() => {
    chatWindowRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme(prevTheme => prevTheme === lightTheme ? darkTheme : lightTheme);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('isLoggedIn');
    navigate('/');
  }, [navigate]);

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled(prev => !prev);
    // Here you would typically also update this setting on the server
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <Layout>
        <Sidebar>
          <SidebarIcon className="active"><FiMessageSquare /></SidebarIcon>
          <SidebarIcon onClick={() => setShowSettings(true)}><FiSettings /></SidebarIcon>
          <SidebarIcon onClick={handleLogout}><FiLogOut /></SidebarIcon>
        </Sidebar>
        <ChatList>
          <SearchBar>
            <SearchInput placeholder="Search chats..." />
          </SearchBar>
          <AnimatePresence>
            {activeChats.map((chat) => (
              <ChatItem
                key={chat._id}
                onClick={() => selectChat(chat._id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar>{chat.username ? chat.username[0].toUpperCase() : <FiUser />}</Avatar>
                <ChatInfo>
                  <ChatName>{chat.username || 'Anonymous User'}</ChatName>
                  <LastMessage>Last message preview...</LastMessage>
                </ChatInfo>
              </ChatItem>
            ))}
          </AnimatePresence>
        </ChatList>
        <MainContent>
          {selectedChat ? (
            <>
              <ChatHeader>
                <h2>{activeChats.find(chat => chat._id === selectedChat)?.username || 'Anonymous User'}</h2>
                <IconButton><FiTrash2 /></IconButton>
              </ChatHeader>
              <ChatWindow>
                <MessageList>
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <Message
                        key={index}
                        isStaff={message.isStaff}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {message.text}
                      </Message>
                    ))}
                  </AnimatePresence>
                  <div ref={chatWindowRef} />
                </MessageList>
              </ChatWindow>
              <InputArea>
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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
      <AnimatePresence>
        {showSettings && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <ModalContent
              onClick={e => e.stopPropagation()}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <h2>Settings</h2>
              <SettingsOption>
                <span>Dark Mode</span>
                <IconButton onClick={toggleTheme}>
                  {currentTheme === lightTheme ? <FiMoon /> : <FiSun />}
                </IconButton>
              </SettingsOption>
              <SettingsOption>
                <span>Notifications</span>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={toggleNotifications}
                />
              </SettingsOption>
              <SettingsOption>
                <span>Language</span>
                <select defaultValue="en">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </SettingsOption>
              <SettingsOption>
                <span>Font Size</span>
                <select defaultValue="medium">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </SettingsOption>
              <button onClick={() => setShowSettings(false)}>Close</button>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
};

export default StaffPage;