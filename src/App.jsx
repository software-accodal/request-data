import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [airtableRecords, setAirtableRecords] = useState([]);
  const [groupedContent, setGroupedContent] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [missive, setMissive] = useState();
  const [conversationIds, setConversationIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!missive) {
      setMissive(window.Missive);
    }
  }, []);

  useEffect(() => {
    if (!missive) return;

    // Listen for conversation changes
    missive.on(
      "change:conversations",
      (ids) => setConversationIds(ids || []),
      { retroactive: true }
    );
  }, [missive]);

  useEffect(() => {
    if (!missive || conversationIds.length === 0) return;

    // Fetch conversation details when conversationIds change
    missive
      .fetchConversations(conversationIds)
      .then((conversations) => setConversations(conversations))
      .catch((error) => console.error('Error fetching conversations:', error));
  }, [missive, conversationIds]);

  useEffect(() => {
    if (!missive || !selectedConversationId) return;

    // Fetch messages for the selected conversation
    missive
      .fetchMessages([selectedConversationId])
      .then((messages) => setMessages(messages))
      .catch((error) => console.error('Error fetching messages:', error));
  }, [missive, selectedConversationId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="App" style={{ width: '100%', margin: '0 auto', padding: '0', color: '#000000' }}>
      <h1 style={{ textAlign: 'left', marginBottom: '20px' }}>Requests ({conversationIds.length})</h1>
      
      {/* Conversations List */}
      {conversations.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '10px' }}>Conversations</h2>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversationId(conv.id)}
              style={{
                marginBottom: '10px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer',
                backgroundColor: selectedConversationId === conv.id ? '#f0f0f0' : '#ffffff',
              }}
            >
              <h3 style={{ margin: 0 }}>{conv.subject}</h3>
              <p style={{ margin: '5px 0', color: '#555' }}>{conv.users}</p>
            </div>
          ))}
        </div>
      )}

      {/* Messages for Selected Conversation */}
      {selectedConversationId && (
        <div>
          <h2 style={{ marginTop: '20px' }}>Messages</h2>
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              >
                <p style={{ margin: 0, fontWeight: 'bold' }}>{message.senderName || 'Unknown Sender'}</p>
                <p style={{ margin: '5px 0', color: '#555' }}>{message.content || 'No Content'}</p>
                <p style={{ margin: 0, fontSize: '0.8em', color: '#888' }}>{formatDate(message.createdAt)}</p>
              </div>
            ))
          ) : (
            <p>No messages found for this conversation.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
