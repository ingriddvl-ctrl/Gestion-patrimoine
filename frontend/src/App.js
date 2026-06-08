import React, { useState, useRef, useEffect, useCallback } from 'react';
import Message, { TypingIndicator } from './components/Message';
import ProgressBar from './components/ProgressBar';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome">
      <div className="welcome-icon">◈</div>
      <h1>
        Votre conseiller<br />
        <span>patrimonial IA</span>
      </h1>
      <p>
        Analyse complète de votre situation patrimoniale et propositions de scénarios d'optimisation personnalisés — fiscalité, investissement, immobilier, transmission.
      </p>
      <div className="welcome-features">
        <span className="feature-tag">Bilan patrimonial</span>
        <span className="feature-tag">Optimisation fiscale</span>
        <span className="feature-tag">Immobilier & levier</span>
        <span className="feature-tag">Projections chiffrées</span>
        <span className="feature-tag">Stratégie retraite</span>
        <span className="feature-tag">Transmission</span>
      </div>
      <button className="welcome-start" onClick={onStart}>
        Commencer l'analyse →
      </button>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendMessage = useCallback(async (userContent) => {
    if (!userContent.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: userContent.trim() }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Erreur ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleStart = useCallback(async () => {
    setStarted(true);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Bonjour, je souhaite faire un bilan de mon patrimoine et obtenir des conseils d\'optimisation.' }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Erreur ${response.status}`);
      }

      const data = await response.json();
      setMessages([
        { role: 'user', content: 'Bonjour, je souhaite faire un bilan de mon patrimoine et obtenir des conseils d\'optimisation.' },
        { role: 'assistant', content: data.reply },
      ]);
    } catch (err) {
      setError(err.message || 'Impossible de contacter le serveur.');
      setStarted(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  const handleTextareaChange = useCallback((e) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  }, []);

  const handleReset = useCallback(() => {
    setMessages([]);
    setInput('');
    setError(null);
    setStarted(false);
  }, []);

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="header-logo">◈</div>
          <div>
            <div className="header-title">Conseiller Patrimonial</div>
            <div className="header-subtitle">Analyse & optimisation de patrimoine</div>
          </div>
        </div>
        {started && (
          <button className="header-reset" onClick={handleReset}>
            Nouvelle analyse
          </button>
        )}
      </header>

      {/* Progress bar */}
      {started && <ProgressBar messages={messages} />}

      {/* Error banner */}
      {error && (
        <div className="error-banner">
          ⚠ {error}
        </div>
      )}

      {/* Content */}
      {!started ? (
        <WelcomeScreen onStart={handleStart} />
      ) : (
        <>
          <div className="messages-container">
            {messages.map((msg, i) => (
              <Message key={i} role={msg.role} content={msg.content} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-zone">
            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                className="chat-input"
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Votre réponse..."
                rows={1}
                disabled={isLoading}
              />
              <button
                className="send-button"
                onClick={() => sendMessage(input)}
                disabled={!canSend}
                aria-label="Envoyer"
              >
                <SendIcon />
              </button>
            </div>
            <div className="input-hint">Entrée pour envoyer · Maj+Entrée pour sauter une ligne</div>
          </div>
        </>
      )}
    </div>
  );
}
