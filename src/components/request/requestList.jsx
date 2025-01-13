import { useState, useEffect } from "react";
import RequestModal from "../modal/requestModal";

const RequestList = ({
  isFetchingSubject,
  isFetchingEmail,
  airtableRecords,
  groupedContent,
  expandedProjects,
  toggleProject,
  toggleReference,
  loading,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const resetModalState = () => {
    // This function will be called inside the RequestModal to reset its state
    console.log("Resetting modal state...");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (airtableRecords.length === 0) {
    if (loading) return null;
    return (
      <p
        className="align-center text-b"
        style={{ color: "#888", fontSize: "1em" }}
      >
        No projects associated with this email
      </p>
    );
  }

  return (
    <>
      <div className="columns-justify" style={{ alignItems: "center" }}>
        <h3 className="text-c">Requests</h3>
        <button
          style={{
            cursor: "pointer",
            borderRadius: "10px",
            backgroundColor: "#007BFF",
            color: "#FFF",
            border: "2px solid #007BFF",
            outline: "none",
            marginTop: "15px",
            marginBottom: "15px",
            padding: "5px 10px",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#007BFF";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#007BFF";
            e.target.style.color = "#FFF";
          }}
          title="Create Requests"
          onClick={openModal}
        >
          +
        </button>
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
                          onClick={() => toggleReference(project, reference)}
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
                        {expandedProjects[project].references[reference] && (
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
      {isModalOpen && (
        <RequestModal
          isModalOpen={isModalOpen}
          closeModal={() => {
            closeModal();
            resetModalState();
          }}
          groupedContent={groupedContent}
          airtableRecords={airtableRecords}
        />
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
    </>
  );
};

export default RequestList;
