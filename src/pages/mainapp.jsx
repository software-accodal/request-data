import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppContent from "./appcontent"; // Import the separated AppContent component

function MainApp({ missive }) {
  const [conversationIds, setConversationIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [allEmails, setAllEmails] = useState([]);
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };
  const registered = useRef(false);

  useEffect(() => {
    if (!missive || registered.current) return;

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
    <Router>
      <AppContent
        conversations={conversations}
        allEmails={allEmails}
        isToggled={isToggled}
        handleToggle={handleToggle}
      />
    </Router>
  );
}

export default MainApp;
