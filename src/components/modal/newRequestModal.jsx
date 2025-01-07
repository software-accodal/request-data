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
      return {
        id: projectId,
        name: projectName,
        periodEnd: periodEnd,
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

    setClientEmail(selectedClientObj.email);
    console.log("Client Email:", selectedClientObj.email);
    setClientRecordID(selectedClientObj.clientRecordID);

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

    const toFields = clientEmail.map((email) => ({ address: email }));

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
        console.log("Records created successfully!");
      }

      missive.compose({
        deliver: true,
        mailto: {
          subject: "New Request",
          to_fields: toFields,
          body: JSON.stringify(updatedRecordArray, null, 2),
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
      setIsSubmitting(false); // Set loading state to false
    }
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
