import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function TypingIndicator() {
  return (
    <div className="message assistant">
      <div className="message-avatar">◈</div>
      <div className="message-bubble">
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

export default function Message({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`message ${role}`}>
      <div className="message-avatar">
        {isUser ? 'V' : '◈'}
      </div>
      <div className="message-bubble">
        {isUser ? (
          <p>{content}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
