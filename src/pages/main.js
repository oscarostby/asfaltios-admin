// main.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaEnvelope, FaGoogle } from 'react-icons/fa';
import loginVideo from '../video/bgtest.mp4';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  auth,
  provider,
  checkUserStatus,
} from './firebase';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const PageContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const VideoBackground = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  filter: brightness(0.6);
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 450px;
  height: 700px;
  padding: 50px 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-right: 20em;
  opacity: 0;
  animation: ${fadeIn} 2s ease-out 3s forwards;
  align-items: center; /* Center content horizontally */
`;

const Heading = styled.h1`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #000;
`;

const ToggleContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: 10px;
  background-color: ${(props) => (props.active ? '#000' : '#fff')};
  color: ${(props) => (props.active ? '#fff' : '#000')};
  border: 1px solid #000;
  cursor: pointer;
  outline: none;

  &:first-child {
    border-radius: 15px 0 0 15px;
  }

  &:last-child {
    border-radius: 0 15px 15px 0;
  }
`;

const Form = styled.form`
  width: 100%; /* Ensure form takes full width */
  display: flex;
  flex-direction: column;
  align-items: center; /* Center items horizontally */
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin-top: 20px;
  display: flex;
  align-items: center; /* Center icon and text vertically */
  justify-content: center; /* Center icon and text horizontally */

  &:hover {
    background-color: #333;
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    margin-right: 10px; /* Space between icon and text */
  }
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  width: 100%; /* Ensure inputs take full width */
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 10px;
  font-size: 16px;
  color: #000;
  border: 2px solid #000;
  border-radius: 10px;
  outline: none;
  background: transparent;
  transition: border-color 0.3s;

  &:focus {
    border-color: #555;
  }

  &:focus ~ label,
  &:valid ~ label {
    top: -10px;
    font-size: 14px;
    color: #555;
  }
`;

const InputLabel = styled.label`
  position: absolute;
  top: 15px;
  left: 15px;
  font-size: 16px;
  color: #999;
  pointer-events: none;
  transition: 0.3s;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 0 5px;
`;

const ErrorModal = styled.div`
  background-color: #000;
  color: #fff;
  padding: 15px;
  text-align: center;
  border-radius: 10px;
  margin-top: 20px;
`;

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Added email state
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    const handleCanPlayThrough = () => {
      setTimeout(() => {
        setIsLoading(false);
        videoElement.play().catch((error) =>
          console.error('Error playing video:', error)
        );
      }, 2000);
    };

    videoElement.addEventListener('canplaythrough', handleCanPlayThrough);
    videoElement.load();

    return () => {
      videoElement.removeEventListener(
        'canplaythrough',
        handleCanPlayThrough
      );
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userStatus = await checkUserStatus(result.user.uid);

      if (userStatus.isApproved) {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/panel');
      } else {
        setError(
          'Your account has not been approved yet. Please contact the administrator.'
        );
      }
    } catch (error) {
      setError('Google login failed. Please try again.');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userStatus = await checkUserStatus(result.user.uid);

      if (userStatus.isApproved) {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/panel');
      } else {
        setError(
          'Your account has not been approved yet. Please contact the administrator.'
        );
      }
    } catch (error) {
      setError('Invalid email or password.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Save additional user info like username to your database if needed
      // Example:
      // await saveUserData(result.user.uid, { username, email });

      setError('Your account has been created. Please wait for approval.');
    } catch (error) {
      setError('Sign up failed. Please try again.');
    }
  };

  return (
    <>
      <PageContainer>
        <VideoBackground
          ref={videoRef}
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={loginVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </VideoBackground>
        <ContentContainer>
          <Heading>Asfaltios</Heading>
          <ToggleContainer>
            <ToggleButton
              active={isLoginMode}
              onClick={() => setIsLoginMode(true)}
            >
              Login
            </ToggleButton>
            <ToggleButton
              active={!isLoginMode}
              onClick={() => setIsLoginMode(false)}
            >
              Sign Up
            </ToggleButton>
          </ToggleContainer>
          {isLoginMode ? (
            <Form onSubmit={handleEmailLogin}>
              <InputContainer>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <InputLabel>Email</InputLabel>
              </InputContainer>
              <InputContainer>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputLabel>Password</InputLabel>
              </InputContainer>
              <Button type="submit">
                <FaEnvelope />
                Login with Email
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleSignUp}>
              <InputContainer>
                <Input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <InputLabel>Username</InputLabel>
              </InputContainer>
              <InputContainer>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <InputLabel>Email</InputLabel>
              </InputContainer>
              <InputContainer>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputLabel>Password</InputLabel>
              </InputContainer>
              <Button type="submit">
                <FaEnvelope />
                Sign Up with Email
              </Button>
            </Form>
          )}
          <Button onClick={handleGoogleLogin}>
            <FaGoogle />
            {isLoginMode ? 'Login with Google' : 'Sign Up with Google'}
          </Button>
          {error && <ErrorModal>{error}</ErrorModal>}
        </ContentContainer>
      </PageContainer>
    </>
  );
};

export default App;
