import { useState } from "react";

const NewRequestModal = ({ clientRecords, isLoading, missive }) => {
  const [projects, setProjects] = useState("");
  const [client, setClient] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [requestDetails, setRequestDetails] = useState("");
  const [textInputs, setTextInputs] = useState([]);

  const [clientProjects, setClientProjects] = useState([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);

  const fetchProjectById = async (projectId) => {
    try {
      const response = await fetch(
        `https://accodal-api-rc8y.onrender.com/api/airtable/get-by-id/app2MprPYlwfIdCCd/tblA1DUSjEa3OD517/${projectId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: "s3cretKey",
          },
        }
      );
      const data = await response.json();
      const projectName = data.fields?.["Project Name"] || "Untitled Project";
      return {
        id: projectId,
        name: projectName,
      };
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      return { id: projectId, name: "Error Loading" };
    }
  };

  const handleClientChange = async (e) => {
    const selectedClientName = e.target.value;
    setClient(selectedClientName);

    setClientProjects([]);
    setProjects("");
    setClientEmail("");

    const selectedClientObj = clientRecords.find(
      (record) => record.name === selectedClientName
    );

    if (!selectedClientObj) {
      return;
    }

    setClientEmail(selectedClientObj.email[0]);

    if (selectedClientObj.project_ids?.length > 0) {
      try {
        setIsProjectsLoading(true);
        const projectDetails = await Promise.all(
          selectedClientObj.project_ids.map((id) => fetchProjectById(id))
        );
        setClientProjects(projectDetails);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsProjectsLoading(false);
      }
    }
  };

  const handleAddTextInput = () => {
    setTextInputs((prevInputs) => [...prevInputs, ""]);
  };

  const handleTextInputChange = (index, value) => {
    const updatedInputs = [...textInputs];
    updatedInputs[index] = value;
    setTextInputs(updatedInputs);
  };

  const handleDeleteTextInput = (index) => {
    setTextInputs((prevInputs) => prevInputs.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = () => {
    if (!client || !clientEmail) {
      return;
    }

    // missive.createConversation({ select: true });
    missive.compose({
      deliver: false,
      mailto: {
        subject: "New Request",
        to_fields: [{ address: "isonaguilar16@gmail.com" }],
        body: textInputs.join("\n"),
      },
    });
    // .then((response) => {
    //   console.log("Conversation created successfully:", response);

    //   setClient("");
    //   setClientEmail("");
    //   setProjects("");
    //   setTextInputs([]);
    //   setClientProjects([]);
    // })
    // .catch((error) => {
    //   console.error("Error creating conversation:", error);
    //   alert("Failed to create conversation. Please try again.");
    // });

    console.log("createConvo", missive.createConversation({ select: true }));
  };

  return (
    <>
      <div style={{ textAlign: "left" }}>
        <h2
          className="text-large"
          style={{ marginBottom: "15px", marginTop: "10px" }}
        >
          Create New Request
        </h2>
        <hr />

        {/* Client Input (Normal) */}
        <div style={{ marginBottom: "10px", marginTop: "10px" }}>
          <label
            htmlFor="client"
            className="text-b"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Client <span style={{ color: "red" }}>*</span>
          </label>
          <input
            list="clientNames"
            id="client"
            value={client}
            onChange={handleClientChange}
            placeholder={
              isLoading
                ? "Loading client list..."
                : "Start typing to search clients..."
            }
            style={{
              width: "100%",
              outline: "none",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <datalist id="clientNames">
            {clientRecords.map((clientObj, index) => (
              <option key={index} value={clientObj.name}>
                {/* Could show the email or other fields in the option label */}
                {/* {`${clientObj.name} (${clientObj.email})`} */}
              </option>
            ))}
          </datalist>
        </div>

        {/* Projects Dropdown: Show projects for the selected client */}
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
            disabled={isProjectsLoading || clientProjects.length === 0}
          >
            {/* If user hasn't selected a client or if the fetch is ongoing */}
            <option value="" disabled style={{ color: "#ccc" }}>
              {isProjectsLoading ? "Loading projects..." : "Select a project"}
            </option>

            {/* Render fetched projects */}
            {clientProjects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Request Details */}
        <div style={{ marginBottom: "10px", marginTop: "20px" }}>
          <button
            onClick={handleAddTextInput}
            style={{
              padding: "5px 10px",
              color: "#007BFF",
              border: "1px solid #007BFF",
              borderRadius: "16px",
              cursor: "pointer",
              marginBottom: "10px",
              outline: "none",
            }}
          >
            + Add Request Details
          </button>
          {textInputs.map((inputValue, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <textarea
                value={inputValue}
                onChange={(e) => handleTextInputChange(index, e.target.value)}
                style={{
                  flexGrow: 1,
                  minHeight: "60px",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  outline: "none",
                }}
              />
              <button
                onClick={() => handleDeleteTextInput(index)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#dc3545",
                  fontWeight: "bold",
                  fontSize: "18px",
                  outline: "none",
                }}
                title="Delete this request detail"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            style={{
              width: "100px",
              height: "35px",
              backgroundColor: "#007BFF",
              color: "#FFF",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "10px",
              marginBottom: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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

export default NewRequestModal;
