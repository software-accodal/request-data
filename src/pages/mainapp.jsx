import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Requests from "./request.jsx";
import Projects from "./project.jsx";
import Docs from "./docs.jsx";
import Switch from "react-switch";

function MainApp({ missive }) {
  const [conversationIds, setConversationIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [allEmails, setAllEmails] = useState([]);
  const [isToggled, setIsToggled] = useState(true);

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  const registered = useRef(false);

  useEffect(() => {
    if (!missive || registered.current) return;

    console.log("missive");
    registered.current = true;
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
        console.log(process.env.NODE_ENV);
        setAllEmails(emailSet);
      })
      .catch((error) => console.error("Error fetching conversations:", error));
  }, [missive, conversationIds]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setAllEmails("i");
    }
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
        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <span
            className="text-normal text-a align-left"
            style={{
              marginTop: "20px",
            }}
          >
            All Emails in Conversations:
          </span>
          <div style={{ textAlign: "right" }}>
            <Switch
              onChange={(e) => {
                console.log(isToggled);
                handleToggle(e);
              }}
              checked={!isToggled}
              onColor={"#007BFF"}
              uncheckedIcon={false}
              checkedIcon={false}
              handleDiameter={25}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={20}
              width={48}
            />
          </div>
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
                paddingTop: "10px",
                paddingBottom: "10px",
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
            element={
              <Projects
                emails={[...allEmails]}
                subject={
                  conversations.length > 0 ? conversations[0].subject : ""
                }
              />
            }
          />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </Router>
    </div>
  );
}

export default MainApp;
