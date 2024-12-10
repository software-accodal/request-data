import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Requests from "./request.jsx";
import Projects from "./project.jsx";
import Docs from "./docs.jsx";

function MainApp({ missive }) {
  const [conversationIds, setConversationIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [clientEmail, setClientEmail] = useState("");
  const [allEmails, setAllEmails] = useState(new Set());

  useEffect(() => {
    if (!missive) return;

    console.log("missive");
    missive.on("change:conversations", (ids) => setConversationIds(ids || []), {
      retroactive: true,
    });
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
            if (
              message.from_field?.address &&
              !message.from_field.address.includes("@altiuscpa.com")
            ) {
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
      .catch((error) => console.error("Error fetching conversations:", error));
  }, [missive, conversationIds]);

  useEffect(() => {
    if (conversations.length > 0) {
      const oldestMessage = conversations
        .flatMap((conv) => conv.messages)
        .reduce(
          (oldest, current) =>
            !oldest || current.delivered_at < oldest.delivered_at
              ? current
              : oldest,
          null
        );

      if (oldestMessage) {
        setClientEmail(
          oldestMessage.from_field?.address || "Unknown Email Address"
        );
      }
    }
  }, [conversations]);

  useEffect(() => {
    setAllEmails("i" || "Unknown Email Address");
  });

  return (
    <div
      className="App"
      style={{
        width: "100%",
        margin: "0 auto",
        padding: "0",
        color: "#000000",
      }}
    >
      {conversations.length > 0 && (
        <div>
          <p className="text-normal text-a align-left">
            All Emails in Conversations:
          </p>
          <ul>
            {[...allEmails].map((email, index) => (
              <li key={index} className="list-title text-a align-left">
                {email}
              </li>
            ))}
          </ul>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              style={{
                marginBottom: "10px",
                padding: "5px",
                borderBottom: "1px solid #ddd",
                textAlign: "left",
              }}
            >
              <p className="text-normal text-a">Subject: {conv.subject}</p>
            </div>
          ))}
        </div>
      )}

      <Router>
        <Routes>
          <Route
            path="/requests"
            element={<Requests emails={[...allEmails]} />}
          />

          <Route
            path="/projects"
            element={<Projects emails={[...allEmails]} />}
          />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </Router>
    </div>
  );
}

export default MainApp;