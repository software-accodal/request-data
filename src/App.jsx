import { useState, useEffect } from 'react';
import Requests from './components/request.jsx';
import './App.css';

function App() {
  const [missive, setMissive] = useState();
  const [conversationIds, setConversationIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [clientEmail, setClientEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState("");
  const [requestDetails, setRequestDetails] = useState("");
  const [hasRequests, setHasRequests] = useState(false);

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

  // useEffect(()=>{
  //   setClientEmail("isonaguilar16@gmail.com" || "Unknown Email Address");
  // })

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = () => {
    console.log("Submitted Request:", { projects, requestDetails });
    setProjects("");
    setRequestDetails("");
    closeModal();
  };

  return (
    <div className="App" style={{ width: '100%', margin: '0 auto', padding: '0', color: '#000000' }}>
      
      {conversations.length > 0 && (
        <div>
          {/* <h2 style={{ marginBottom: '10px' }}>Conversation</h2> */}
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
                  padding: '5px',
                  borderBottom: '1px solid #ddd',
                  textAlign: 'left'
                }}
              >
                {/* Display conversation subject */}
                {/* <h3 style={{ margin: '10px 0' }}>Subject:</h3> */}
                <p style={{ marginTop: '10px' }}>Subject:&nbsp;{conv.subject}</p>

                {/* Display sender of the oldest email */}
                <div style={{ marginTop: '10px' }}>
                  {/* <h3 style={{ margin: '10px 0' }}>Sender:</h3> */}
                  {oldestMessage ? (
                    <p style={{ margin: '5px 0', color: '#333' }}>Sender:&nbsp;{oldestMessage.from_field?.address || 'Unknown Email Address'}
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
      
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3 style={{ textAlign: 'left', marginBottom: '20px' }}>Requests</h3>
        <button
              style={{
                padding: "5px 10px",
                fontSize: "16px",
                cursor: "pointer",
                borderRadius: "5px",
                backgroundColor: "#007BFF",
                color: "#FFF",
                border: "none",
                outline: "none",
                boxShadow: "0 0 0 0px rgba(0, 0, 0, 0)",
                transition: "box-shadow 0.2s ease-in-out",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0 0 3px 2px rgba(0, 123, 255, 0.5)";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "0 0 0 0px rgba(0, 0, 0, 0)";
              }}
              title="Create Request"
              onClick={openModal}
          >
              +
          </button>
        </div>
      <Requests email={clientEmail} />
      {isModalOpen && (
        <div
          className='modal'
        >
          <h4 style={{ marginBottom: "15px" }}>Create Request</h4>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="projects" style={{ display: "block", marginBottom: "5px" }}>
              Projects
            </label>
            <select
              id="projects"
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="" disabled>
                Select a Project
              </option>
              <option value="Project1">Project1</option>
              <option value="Project2">Project2</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="requestDetails" style={{ display: "block", marginBottom: "5px" }}>
              Request Details
            </label>
            <textarea
              id="requestDetails"
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              style={{
                padding: "5px 10px",
                backgroundColor: "#6c757d",
                color: "#FFF",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              style={{
                padding: "5px 10px",
                backgroundColor: "#007BFF",
                color: "#FFF",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={closeModal}
        />
      )}
    </div>
  );
}

export default App;
