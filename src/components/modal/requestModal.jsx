import { useState } from "react";

const RequestModal = ({ groupedContent, closeModal }) => {
  const clientNames = Array.from(
    new Set(
      Object.values(groupedContent).flatMap((item) => item?.clientName || [])
    )
  );

  const [projects, setProjects] = useState("");
  const [client, setClient] = useState(clientNames[0] || "");
  const [requestDetails, setRequestDetails] = useState("");

  const handleSubmit = () => {
    console.log("Submitted Request:", { projects, client, requestDetails });
    setProjects("");
    setClient("");
    setRequestDetails("");
    closeModal();
  };

  return (
    <>
      <div
        className="modal"
        style={{
          textAlign: "left",
          height: "70%",
        }}
      >
        <h2 className="text-large" style={{ marginBottom: "15px" }}>
          Create New Request
        </h2>
        <hr></hr>
        {/* Client Dropdown */}
        <div style={{ marginBottom: "10px", marginTop: "10px" }}>
          <label
            className="text-b"
            htmlFor="client"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Client <span style={{ color: "red" }}>*</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Pill-Style Selection */}
            {client && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 10px",
                  backgroundColor: "#007BFF",
                  color: "#FFF",
                  borderRadius: "20px",
                  fontSize: "14px",
                }}
              >
                {client}
              </div>
            )}
            {!client && (
              <input
                list="clientNames"
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Start typing to search clients..."
                style={{
                  flexGrow: 1,
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            )}
          </div>
          <datalist id="clientNames">
            {clientNames.map((clientName, index) => (
              <option key={index} value={clientName} />
            ))}
          </datalist>
        </div>
        {/* Projects Dropdown */}
        <div style={{ marginBottom: "10px" }}>
          <label
            className="text-b"
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
              outline: "none",
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
        {/* Request Details Textarea */}
        <div style={{ marginBottom: "10px" }}>
          <label
            className="text-b"
            htmlFor="requestDetails"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Request Details <span style={{ color: "red" }}>*</span>
          </label>
          <textarea
            id="requestDetails"
            value={requestDetails}
            onChange={(e) => setRequestDetails(e.target.value)}
            style={{
              width: "100%",
              height: "200px",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        {/* Action Buttons */}
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
