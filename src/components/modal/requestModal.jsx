import { useState, useEffect } from "react";
import axios from "axios";

const RequestModal = ({ groupedContent, closeModal }) => {
  const clientNames = Array.from(
    new Set(
      Object.values(groupedContent).flatMap((item) => item?.clientName || [])
    )
  );

  const [projects, setProjects] = useState("");
  const [client, setClient] = useState(clientNames[0] || "");
  const [clientRecordID, setClientRecordID] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientProjects, setClientProjects] = useState([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [periodEnd, setPeriodEnd] = useState(true);
  const [textInputs, setTextInputs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      setProjects("");
      setClient("");
      setClientProjects([]);
      setIsProjectsLoading(true);
    };
  }, []);

  const handleClose = () => {
    closeModal();
  };

  // console.log("groupedContent>> ", groupedContent);

  useEffect(() => {
    const matchedClient = Object.values(groupedContent).find(
      (item) => item.clientName && item.clientName.includes(client)
    );

    setClientRecordID(matchedClient?.clientRecordID?.[0] || "");
    const clientRecordID = matchedClient?.clientRecordID?.[0] || "";

    console.log("clientID", clientRecordID);

    setClientEmail(matchedClient?.clientEmail?.[0] || "");
    console.log("matchedClient>> ", clientEmail);
    if (!clientRecordID) {
      setClientProjects([]);
      setIsProjectsLoading(false);
      return;
    }

    setIsProjectsLoading(true);
    const formula = `AND(
      NOT({Status} = "Void"), FIND('${clientRecordID}', {Clients (Entity & Individual) Record ID} & ""))`;

    axios
      .post(
        `https://accodal-api-rc8y.onrender.com/api/airtable/get-by-formula`,
        {
          appId: "app2MprPYlwfIdCCd",
          tableId: "tblA1DUSjEa3OD517",
          formula,
        },
        {
          headers: {
            token: "s3cretKey",
          },
        }
      )
      .then((response) => {
        const projectList = response.data;

        const formattedProjects = projectList.map((project) => ({
          id: project.id,
          name: project.fields["Project Name"],
          periodEnd: project.fields["Period End"] || "Untitled Project",
        }));

        setClientProjects(formattedProjects);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsProjectsLoading(false);
      });
  }, [client, groupedContent]);

  console.log("clientProjects>> ", clientProjects);

  const handleProjectChange = (e) => {
    const selectedProjectId = e.target.value;
    setProjects(selectedProjectId);

    const selectedProject = clientProjects.find(
      (project) => project.id === selectedProjectId
    );
    if (selectedProject) {
      setPeriodEnd(selectedProject.periodEnd);
      console.log("selectedProjectId>> ", selectedProjectId);
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

  console.log("textInputs>> ", textInputs);

  const handleSubmit = async () => {
    console.log("Submitting request details...", client, clientEmail);
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

      setClient("");
      setProjects("");
      setClientRecordID("");
      setClientEmail("");
      setTextInputs([]);
      setClientProjects([]);
      closeModal();
    } catch (error) {
      console.error("Error processing request details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="modal"
        style={{
          textAlign: "left",
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
        {/* Request Details Textarea */}
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
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          {/* <button
            style={{
              padding: "5px 10px",
              backgroundColor: "#6c757d",
              color: "#FFF",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={handleClose}
          >
            Cancel
          </button> */}
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

export default RequestModal;
