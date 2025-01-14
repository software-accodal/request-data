import { useState } from "react";

const NewRequestModal = ({ clientRecords, isLoading, missive }) => {
  const [projects, setProjects] = useState("");
  const [client, setClient] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientRecordID, setClientRecordID] = useState("");
  const [textInputs, setTextInputs] = useState([]);
  const [periodEnd, setPeriodEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const periodEnd = data.fields?.["Period End"] || "Untitled Project";
      const status = data.fields?.["Status"] || "Unknown"; // Ensure 'Status' field is retrieved
      return {
        id: projectId,
        name: projectName,
        periodEnd: periodEnd,
        status: status, // Include status in the project object
      };
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      return { id: projectId, name: "Error Loading", status: "Error" };
    }
  };

  const handleClientChange = async (e) => {
    const selectedClientName = e.target.value;
    setClient(selectedClientName);

    // Reset related state
    setClientProjects([]);
    setProjects("");
    setClientEmail("");

    const selectedClientObj = clientRecords.find(
      (record) => record.name === selectedClientName
    );
    console.log("Selected Client:", selectedClientObj);

    if (!selectedClientObj) {
      return;
    }

    setClientEmail(selectedClientObj.email);
    console.log("Client Email:", selectedClientObj.email);
    setClientRecordID(selectedClientObj.clientRecordID);

    if (selectedClientObj.project_ids?.length > 0) {
      try {
        setIsProjectsLoading(true);

        // Fetch project details and filter by status
        const projectDetails = await Promise.all(
          selectedClientObj.project_ids.map((id) => fetchProjectById(id))
        );

        // Filter out projects with status "Void"
        const filteredProjects = projectDetails.filter(
          (project) => project.status !== "Void"
        );

        setClientProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsProjectsLoading(false);
      }
    }
  };

  const handleProjectChange = (e) => {
    const selectedProjectId = e.target.value;
    setProjects(selectedProjectId);

    const selectedProject = clientProjects.find(
      (project) => project.id === selectedProjectId
    );
    if (selectedProject) {
      setPeriodEnd(selectedProject.periodEnd);
    } else {
      setPeriodEnd("");
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

  const handleSubmit = async () => {
    if (!client || !clientEmail) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedRecordArray = await Promise.all(
        textInputs.map(async (textInput) => {
          const formattedPeriodEnd = periodEnd.includes("-")
            ? periodEnd.split("-").slice(0, 2).reverse().join(" - ")
            : "";

          const requestBody = {
            request: textInput,
            periodEnd: formattedPeriodEnd,
          };

          let customReference = "N/A";
          try {
            const response = await fetch(
              "https://accodal-api-rc8y.onrender.com/api/openai/generate-reference",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  token: "s3cretKey",
                },
                body: JSON.stringify(requestBody),
              }
            );

            if (response.ok) {
              const data = await response.json();
              customReference = periodEnd ? data?.trim() : data.split(" - ")[0];
            } else {
              console.error(
                "Error generating reference:",
                await response.text()
              );
            }
          } catch (error) {
            console.error("Error generating reference:", error);
          }

          return {
            fields: {
              Question: textInput,
              "Clients (Entity & Individual)": [clientRecordID],
              Project: [projects],
              Status: "Outstanding",
              "Custom Reference": customReference,
            },
          };
        })
      );

      console.log("Updated Record Array:", updatedRecordArray);

      const response = await fetch(
        "https://accodal-api-rc8y.onrender.com/api/airtable/create/app2MprPYlwfIdCCd/tblIbpqFg0KuNxOD4",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: "s3cretKey",
          },
          body: JSON.stringify(updatedRecordArray),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Error creating records:", error);
      } else {
        console.log("Records created successfully!", response);
      }

      const toFields = clientEmail.map((email) => ({ address: email }));
      missive.createConversation({ select: true });
      missive.addLabels(["ed15b444-2425-4c65-9a72-cf9a31ea3f0a"]);
      missive.composeInConversation({
        deliver: true,
        mailto: {
          subject: "New Request",
          to_fields: toFields,
          body: "TEST",
        },
      });

      setClient("");
      setProjects("");
      setClientRecordID("");
      setClientEmail("");
      setTextInputs([]);
      setClientProjects([]);
    } catch (error) {
      console.error("Error processing request details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: "left" }}>
        <h2 className="text-large" style={{ marginTop: "10px" }}>
          Create New Request
        </h2>
        <p className="text-d text-small" style={{ marginBottom: "10px" }}>
          <i>New conversation will be created...</i>
        </p>
        <hr />

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
              <option key={index} value={clientObj.name} />
            ))}
          </datalist>
        </div>

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
            onChange={handleProjectChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              outline: "none",
            }}
            disabled={isProjectsLoading || clientProjects.length === 0}
          >
            <option value="" disabled style={{ color: "#ccc" }}>
              {isProjectsLoading ? "Loading projects..." : "Select a project"}
            </option>

            {clientProjects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>

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
              backgroundColor: isSubmitting ? "#ccc" : "#007BFF",
              color: isSubmitting ? "#666" : "#FFF",
              border: "none",
              borderRadius: "4px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              marginTop: "10px",
              marginBottom: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export default NewRequestModal;
