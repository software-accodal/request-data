import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Requests from "./request.jsx";
import Projects from "./project.jsx";
import Docs from "./docs.jsx";
import Switch from "react-switch";
import NewRequestModal from "../components/modal/newRequestModal.jsx";

function AppContent({ conversations, allEmails, isToggled, handleToggle }) {
  const location = useLocation();
  console.log("toggle", isToggled);

  if (isToggled) {
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
        {location.pathname === "/requests" && (
          <div
            id="switchToggle"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <label className="text-a">New conversation</label>
            <Switch
              onChange={(e) => handleToggle(e)}
              checked={isToggled}
              onColor={"#007BFF"}
              uncheckedIcon={false}
              checkedIcon={false}
              handleDiameter={20}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={15}
              width={40}
            />
          </div>
        )}
        <NewRequestModal />
      </div>
    );
  }

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
      {location.pathname === "/requests" && (
        <div
          id="switchToggle"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "10px",
          }}
        >
          <label className="text-a">New conversation</label>
          <Switch
            onChange={(e) => handleToggle(e)}
            checked={isToggled}
            onColor={"#007BFF"}
            uncheckedIcon={false}
            checkedIcon={false}
            handleDiameter={20}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={15}
            width={40}
          />
        </div>
      )}
      {conversations.length > 0 && (
        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <p
            className="text-normal text-a align-left"
            style={{
              marginTop: "10px",
            }}
          >
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

      <Routes>
        <Route
          path="/requests"
          element={
            <Requests
              emails={[...allEmails]}
              subject={conversations.length > 0 ? conversations[0].subject : ""}
            />
          }
        />
        <Route
          path="/projects"
          element={
            <Projects
              emails={[...allEmails]}
              subject={conversations.length > 0 ? conversations[0].subject : ""}
            />
          }
        />
        <Route path="/docs" element={<Docs />} />
      </Routes>
    </div>
  );
}

export default AppContent;
