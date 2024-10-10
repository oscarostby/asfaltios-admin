import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import loginVideo from '../video/bgtest.mp4';
import { QRCodeSVG } from 'qrcode.react';
import * as OTPAuth from 'otpauth';
  
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const QRCodeContainer = styled.div`
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;

const QRCodeInstructions = styled.p`
  text-align: center;
  margin-bottom: 10px;
`;

const slideInFade = keyframes`
  0% { opacity: 0; transform: translateX(50px); }
  100% { opacity: 1; transform: translateX(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const PageContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Satoshi', sans-serif;
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
  padding: 40px; /* Ensure you have enough padding at the top */
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-right: 20em;
  opacity: 0;
  animation: ${fadeIn} 2s ease-out 3s forwards, ${slideInFade} 2s ease-out 3s forwards;

  @media (max-width: 768px) {
    width: 90%;
    margin-right: 5%;
    padding: 30px; /* Adjust for mobile as well */
    height: 100%;
    border-radius: inherit;
    box-shadow: none;
  }
`;





const Logo = styled.h1`
  font-size: 48px;
  font-weight: 550;
  letter-spacing: 5px;
  color: #000;
  margin-bottom: 60px;
  text-align: center;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 30px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 0;
  font-size: 16px;
  color: #000;
  border: none;
  border-bottom: 2px solid #ddd;
  outline: none;
  background: transparent;
  transition: border-color 0.3s;

  &:focus {
    border-color: #000;
  }

  &:focus ~ label, &:valid ~ label {
    top: -20px;
    font-size: 12px;
    color: #000;
  }
`;

const InputLabel = styled.label`
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 0;
  font-size: 16px;
  color: #999;
  pointer-events: none;
  transition: 0.3s;
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const Label = styled.label`
  color: #333;
  font-size: 14px;
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  border: 2px solid black;

  &:hover {
    background-color: #333;
    background-color: transparent;
    color: black;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const LinkContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 18em; /* Pushes the links to the bottom */
`;

const Link = styled.a`
  position: relative;
  color: #000;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -3px;
    width: 100%;
    height: 2px;
    background: #333;
    transform: scaleX(0);
    transform-origin: bottom right;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #333;

    &::after {
      transform: scaleX(1);
      transform-origin: bottom left;
    }
  }
`;

const LoadingScreen = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: opacity 1s ease-out;
  opacity: ${props => props.isLoading ? 1 : 0};
  pointer-events: ${props => props.isLoading ? 'all' : 'none'};
`;

const LoadingCircle = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #333;
  border-top: 5px solid #fff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.div`
  color: white;
  font-size: 18px;
  text-align: center;
`;

const ErrorModal = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background-color: white;
  color: #333;
  padding: 25px 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  min-width: 300px;

  @media (max-width: 768px) {
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 0;
    width: 100%;
  }
`;

const ErrorMessage = styled.span`
  margin-right: 15px;
  font-size: 16px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #333;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 40px;
  height: 40px;
`;

const CountdownCircle = styled.svg`
  width: 40px;
  height: 40px;
  transform: rotate(-90deg);
  position: absolute;
`;

const CountdownCirclePath = styled.circle`
  fill: none;
  stroke: #333;
  stroke-width: 2;
  stroke-dasharray: 100;
  stroke-dashoffset: ${props => 100 - (props.progress / 100) * 100};
  transition: stroke-dashoffset 0.1s linear;
`;

const CloseX = styled.span`
  position: absolute;
  font-size: 20px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;




const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showAuthenticator, setShowAuthenticator] = useState(false);
    const [authenticatorCode, setAuthenticatorCode] = useState('');
    const [otpAuth, setOtpAuth] = useState(null);
    const videoRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const videoElement = videoRef.current;

        const handleCanPlayThrough = () => {
            setTimeout(() => {
                setIsLoading(false);
                videoElement.play().catch(error => console.error('Error playing video:', error));
            }, 2000);
        };

        videoElement.addEventListener('canplaythrough', handleCanPlayThrough);
        videoElement.load();

        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            navigate('/panel');
        }

        return () => {
            videoElement.removeEventListener('canplaythrough', handleCanPlayThrough);
        };
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            const secret = OTPAuth.Secret.fromBase32('JBSWY3DPEHPK3PXP'); // Use a predefined base32 secret
            const totp = new OTPAuth.TOTP({
                issuer: 'ASFALTIOS',
                label: 'security ',
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: secret,
            });
            setOtpAuth(totp);
            setShowAuthenticator(true);
        } else {
            setShowError(true);
        }
    };

    const handleAuthenticatorSubmit = (e) => {
        e.preventDefault();
        const isValid = otpAuth.validate({ token: authenticatorCode }) !== null;
        if (isValid) {
            if (rememberMe) {
                localStorage.setItem('isLoggedIn', 'true');
            } else {
                sessionStorage.setItem('isLoggedIn', 'true');
            }
            navigate('/panel');
        } else {
            setShowError(true);
        }
    };

    return (
        <>
            <LoadingScreen isLoading={isLoading}>
                <LoadingCircle />
                <LoadingText>Velkommen til fremtiden...</LoadingText>
            </LoadingScreen>
            <PageContainer>
                <VideoBackground ref={videoRef} loop muted playsInline preload="auto">
                    <source src={loginVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </VideoBackground>
                <ContentContainer>
                    <Logo>[bas]</Logo>
                    {!showAuthenticator ? (
                        <form onSubmit={handleLogin}>
                            <InputContainer>
                                <Input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <InputLabel>Brukernavn</InputLabel>
                            </InputContainer>
                            <InputContainer>
                                <Input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <InputLabel>Passord</InputLabel>
                            </InputContainer>
                            <RememberMeContainer>
                                <Checkbox
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <Label htmlFor="rememberMe">Husk meg</Label>
                            </RememberMeContainer>
                            <Button type="submit">Logg inn</Button>
                            <LinkContainer>
                                <Link href="#">Glemt passord?</Link>
                                <Link href="#">Ny bruker</Link>
                            </LinkContainer>
                        </form>
                    ) : (
                        <form onSubmit={handleAuthenticatorSubmit}>
                            <InputContainer>
                                <Input
                                    type="text"
                                    required
                                    value={authenticatorCode}
                                    onChange={(e) => setAuthenticatorCode(e.target.value)}
                                />
                                <InputLabel>Enter Authentication Code</InputLabel>
                            </InputContainer>
                            <Button type="submit">Verify</Button>
                        </form>
                    )}
                </ContentContainer>
            </PageContainer>

            {showError && (
                <ErrorModal>
                    <ErrorMessage>Feil brukernavn, passord eller kode</ErrorMessage>
                    <CloseButton onClick={() => setShowError(false)}>
                        <CountdownCircle viewBox="0 0 32 32">
                            <CountdownCirclePath cx="16" cy="16" r="15" progress={100} />
                        </CountdownCircle>
                        <CloseX>×</CloseX>
                    </CloseButton>
                </ErrorModal>
            )}
        </>
    );
};

export default App;