import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Requests from './pages/request.jsx';
import Projects from './pages/project.jsx';
import './App.css';

function App() {
  const [missive, setMissive] = useState();
  const [conversationIds, setConversationIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [clientEmail, setClientEmail] = useState("");
  const [allEmails, setAllEmails] = useState(new Set());

  const registered = useRef(false)

  useEffect(() => {
    if (missive || registered.current) {
    return
    }
    console.log("initialRun")
    registered.current = true
  setMissive(window.Missive);
}, []);

  useEffect(() => {
    if (!missive) return;

    console.log("missive")
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
      .then((fetchedConversations) => {
        setConversations(fetchedConversations);

        const emailSet = new Set();
        fetchedConversations.forEach((conv) => {
          conv.messages.forEach((message) => {
            if (message.from_field?.address && !message.from_field.address.includes("@altiuscpa.com")) {
              emailSet.add(message.from_field.address);
            }

            if (message.to_fields) {
              message.to_fields.forEach((to) => {
                if (to.address && !to.address.includes("@altiuscpa.com")) {
                  emailSet.add(to.address);
                }
              });
            }

            if (message.cc_fields) {
              message.cc_fields.forEach((cc) => {
                if (cc.address && !cc.address.includes("@altiuscpa.com")) {
                  emailSet.add(cc.address);
                }
              });
            }
          });
        });
        setAllEmails(emailSet);
      })
      .catch((error) => console.error('Error fetching conversations:', error));
  }, [missive, conversationIds]);

  // const handleRequestData = (hasData) => {
  //   setHasRequests(hasData);
  // };

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

  useEffect(()=>{
    setAllEmails("i" || "Unknown Email Address");
  })



  return (
    <div className="App" style={{ width: '100%', margin: '0 auto', padding: '0', color: '#000000' }}>
      {conversations.length > 0 && (
        <div>
          <p className='text-normal text-a align-left'>All Emails in Conversations:</p>
          <ul>
            {[...allEmails].map((email, index) => (
              <li key={index} className='list-title text-a'>{email}</li>
            ))}
          </ul>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              style={{
                marginBottom: '10px',
                padding: '5px',
                borderBottom: '1px solid #ddd',
                textAlign: 'left',
              }}
            >
              <p className='text-normal text-a'>Subject: {conv.subject}</p>
            </div>
          ))}
        </div>
      )}
      
       
      <Router>
            <Routes>
                <Route path="/requests" element={<Requests emails={[...allEmails]} />} />

                <Route path="/projects" element={<Projects emails={[...allEmails]} />} />
            </Routes>
        </Router>
      
    </div>
  );
}

export default App;
