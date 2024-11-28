import { useState, useEffect } from 'react';
import Requests from './components/request.jsx';
import './App.css';

function App() {
  const [missive, setMissive] = useState();
  const [conversationIds, setConversationIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [clientEmail, setClientEmail] = useState("");

  useEffect(() => {
    if (!missive) {
      setMissive(window.Missive);
    }
  }, []);

  useEffect(() => {
    if (!missive) return;

    missive.on(
      "change:conversations",
      (ids) => setConversationIds(ids || []),
      { retroactive: true }
    );
  }, [missive]);

  useEffect(() => {
    if (!missive || conversationIds.length === 0) return;

    missive
      .fetchConversations(conversationIds)
      .then((conversations) => setConversations(conversations))
      .catch((error) => console.error('Error fetching conversations:', error));
  }, [missive, conversationIds]);

  useEffect(() => {
    if (conversations.length > 0) {
      const oldestMessage = conversations
        .flatMap((conv) => conv.messages)
        .reduce(
          (oldest, current) =>
            !oldest || current.delivered_at < oldest.delivered_at ? current : oldest,
          null
        );

      if (oldestMessage) {
        setClientEmail(oldestMessage.from_field?.address || "Unknown Email Address");
      }
    }
  }, [conversations]);

  return (
    <div className="App" style={{ width: '100%', margin: '0 auto', padding: '0', color: '#000000' }}>
      <h1 style={{ textAlign: 'left', marginBottom: '20px' }}>Requests</h1>
      {conversations.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '10px' }}>Conversation</h2>
          {conversations.map((conv) => {
            const oldestMessage = conv.messages.reduce(
              (oldest, current) =>
                !oldest || current.delivered_at < oldest.delivered_at ? current : oldest,
              null
            );

            return (
              <div
                key={conv.id}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              >
                {/* Display conversation subject */}
                <h3 style={{ margin: '10px 0' }}>Subject:</h3>
                <p style={{ margin: 0 }}>{conv.subject}</p>

                {/* Display sender of the oldest email */}
                <div style={{ marginTop: '10px' }}>
                  <h3 style={{ margin: '10px 0' }}>Sender:</h3>
                  {oldestMessage ? (
                    <p style={{ margin: '5px 0', color: '#333' }}>
                      {oldestMessage.from_field?.address || 'Unknown Email Address'}
                    </p>
                  ) : (
                    <p style={{ margin: '5px 0', color: '#999' }}>
                      No messages available in this conversation.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Requests email={clientEmail} />
    </div>
  );
}

export default App;
