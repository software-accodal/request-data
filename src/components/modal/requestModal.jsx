import { useState, useEffect } from "react";

const RequestModal = ({ groupedContent, closeModal }) => {
  const [projects, setProjects] = useState("");
  const [requestDetails, setRequestDetails] = useState("");

  const handleSubmit = () => {
    console.log("Submitted Request:", { projects, requestDetails });
    setProjects("");
    setRequestDetails("");
    closeModal();
  };

  return (
    <>
      <div className="modal">
        <h4 style={{ marginBottom: "15px" }}>Create Request</h4>
        <div style={{ marginBottom: "10px" }}>
          <label
            htmlFor="projects"
            style={{ display: "block", marginBottom: "5px" }}
          >
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
            {Object.keys(groupedContent).map((projectKey) => (
              <option key={projectKey} value={projectKey}>
                {projectKey}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label
            htmlFor="requestDetails"
            style={{ display: "block", marginBottom: "5px" }}
          >
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
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
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
    </>
  );
};

export default RequestModal;
