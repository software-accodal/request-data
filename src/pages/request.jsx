import { useState, useEffect } from "react";
import axios from "axios";

function Requests({ emails }) {
  const [airtableRecords, setAirtableRecords] = useState([]);
  const [groupedContent, setGroupedContent] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState("");
  const [requestDetails, setRequestDetails] = useState("");

  useEffect(() => {
    if (!emails || emails.length === 0) return;

    setLoading(true);

    const formula = `OR(${emails
      .map((email) => `FIND('${email}', {Client Emails} & "")`)
      .join(", ")})`;
    console.log("Searching for emails:", emails);
    axios
      .post(
        `https://accodal-api-rc8y.onrender.com/api/airtable/get-by-formula`,
        {
          appId: "app2MprPYlwfIdCCd",
          tableId: "tblIbpqFg0KuNxOD4",
          formula,
        },
        {
          headers: {
            token: "s3cretKey",
          },
        }
      )
      .then((response) => {
        const data = response.data;
        setAirtableRecords(data);

        const grouped = data.reduce((acc, record) => {
          const project = record.fields["Project Name"]?.[0] || "Uncategorized";
          const finalReference = record.fields["Final Reference"];
          const question = record.fields["Question"];
          const status = record.fields["Status"];
          const created = record.fields["Created"] || "";

          if (!acc[project]) {
            acc[project] = { finalReferences: {}, created };
          }

          if (finalReference) {
            if (!acc[project].finalReferences[finalReference]) {
              acc[project].finalReferences[finalReference] = {
                questions: [],
                status,
              };
            }
            if (question) {
              acc[project].finalReferences[finalReference].questions.push(
                question
              );
            }
          }

          return acc;
        }, {});

        setGroupedContent(grouped);

        const initialState = Object.keys(grouped).reduce((acc, project) => {
          acc[project] = { expanded: false, references: {} };
          Object.keys(grouped[project].finalReferences).forEach((ref) => {
            acc[project].references[ref] = false;
          });
          return acc;
        }, {});
        setExpandedProjects(initialState);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [emails]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = () => {
    console.log("Submitted Request:", { projects, requestDetails });
    setProjects("");
    setRequestDetails("");
    closeModal();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const toggleProject = (project) => {
    setExpandedProjects((prevState) => ({
      ...prevState,
      [project]: {
        ...prevState[project],
        expanded: !prevState[project].expanded,
      },
    }));
  };

  const toggleReference = (project, reference) => {
    setExpandedProjects((prevState) => ({
      ...prevState,
      [project]: {
        ...prevState[project],
        references: {
          ...prevState[project].references,
          [reference]: !prevState[project].references[reference],
        },
      },
    }));
  };

  return (
    <div>
      {loading ? (
        <p className="align-center text-a">Loading requests...</p>
      ) : airtableRecords.length === 0 ? (
        <p
          className="align-center text-b"
          style={{ color: "#888", fontSize: "1em" }}
        >
          No requests associated to this email
        </p>
      ) : (
        <>
          <div className="columns-justify" style={{ alignItems: "center" }}>
            <h3 className="text-c">Requests</h3>
            {/* <button
            style={{
              padding: "5px 10px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "5px",
              backgroundColor: "#007BFF",
              color: "#FFF",
              border: "none",
              outline: "none",
              boxShadow: "0 0 0 0px rgba(0, 0, 0, 0)",
              transition: "box-shadow 0.2s ease-in-out",
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = "0 0 3px 2px rgba(0, 123, 255, 0.5)";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "0 0 0 0px rgba(0, 0, 0, 0)";
            }}
            title="Create Request"
            onClick={openModal}
          >
            +
          </button> */}
          </div>
          {Object.keys(groupedContent).length > 0 &&
            Object.entries(groupedContent).map(
              ([project, { finalReferences, created }]) => (
                <div key={project} className={`align-left box box-collapsable`}>
                  <div
                    className="box-header columns-middle"
                    onClick={() => toggleProject(project)}
                    title={project}
                  >
                    <span className="text-d text-xlarge">
                      {expandedProjects[project].expanded ? "▾" : "▸"}
                    </span>
                    <p className="column-grow ellipsis text-a">{project}</p>
                    <span
                      className="text-c"
                      style={{
                        fontSize: "0.9em",
                        marginLeft: "15px",
                      }}
                    >
                      {formatDate(created)}
                    </span>
                  </div>
                  {expandedProjects[project].expanded && (
                    <div style={{ padding: "10px" }}>
                      {Object.entries(finalReferences).map(
                        ([reference, { questions, status }]) => (
                          <div
                            key={reference}
                            className={`align-left box box-collapsable`}
                            style={{ marginBottom: "5px" }}
                          >
                            <div
                              className="box-header columns-middle"
                              onClick={() =>
                                toggleReference(project, reference)
                              }
                              title={reference}
                            >
                              <span className="text-d text-xlarge">
                                {expandedProjects[project].references[reference]
                                  ? "▾"
                                  : "▸"}
                              </span>
                              <span className="column-grow ellipsis text-a">
                                {reference}
                              </span>
                              <span
                                className="text-c"
                                style={{
                                  fontSize: "0.9em",
                                  textAlign: "right",
                                  marginLeft: "auto",
                                }}
                              >
                                {status || "Unknown Status"}
                              </span>
                            </div>
                            {expandedProjects[project].references[
                              reference
                            ] && (
                              <div
                                style={{
                                  paddingLeft: "15px",
                                  paddingTop: "5px",
                                  paddingBottom: "5px",
                                }}
                              >
                                {questions.map((question, index) => (
                                  <p
                                    key={index}
                                    className="text-a"
                                    style={{ margin: "5px 0" }}
                                  >
                                    {question}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            )}
        </>
      )}
      {isModalOpen && (
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
              <option value="Project1">Project1</option>
              <option value="Project2">Project2</option>
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
      )}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={closeModal}
        />
      )}
    </div>
  );
}

export default Requests;
