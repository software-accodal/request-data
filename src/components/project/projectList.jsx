import React from "react";
import ProjectLoading from "./projectLoading";

const ProjectList = ({
  isFetchingSubject,
  isFetchingEmail,
  airtableRecords,
  groupedContent,
  openModal,
  expandedProjects,
  toggleProject,
}) => {
  console.log("airtableRecords>>", airtableRecords);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };
  if (airtableRecords.length === 0) {
    if (isFetchingSubject || isFetchingEmail) return null;
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
        <h3 className="text-c">Projects</h3>
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
          title="Create Project"
          onClick={openModal}
        >
          +
        </button>
      </div>
      {Object.keys(groupedContent).map((project) => (
        <div
          key={project}
          className={`align-left box box-collapsable ${
            expandedProjects[project] ? "box-collapsable--opened" : ""
          }`}
        >
          <div
            className="box-header columns-middle"
            onClick={() => toggleProject(project)}
            title={project}
          >
            <span className="text-d text-xlarge">
              {expandedProjects[project] ? "▾" : "▸"}
            </span>
            <span className="column-grow ellipsis text-a">{project}</span>
            <span
              className="text-c"
              style={{ fontSize: "0.9em", marginLeft: "15px" }}
            >
              {formatDate(groupedContent[project].created)}
            </span>
          </div>
          <div className="box-content">
            <div style={{ padding: "15px", display: "flex", gap: "15px" }}>
              {/* First Column */}
              <div style={{ flex: "1", width: "50%", textAlign: "left" }}>
                <p
                  className="text-a"
                  style={{ marginBottom: "5px", fontWeight: "normal" }}
                >
                  RFI Status
                </p>
                <span
                  className="text-a"
                  style={{
                    display: "inline-block",
                    backgroundColor: "#e0f7fa",
                    color: "#00796b",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "0.85em",
                    fontWeight: "normal",
                    marginBottom: "10px",
                  }}
                >
                  {groupedContent[project].statuses.join(", ") || "N/A"}
                </span>

                <p
                  className="text-a"
                  style={{ marginBottom: "5px", fontWeight: "normal" }}
                >
                  1st Reviewer
                </p>
                <span
                  className="text-a"
                  style={{
                    display: "inline-block",
                    backgroundColor: "#e0f7fa",
                    color: "#00796b",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "0.85em",
                    fontWeight: "normal",
                    marginBottom: "10px",
                  }}
                >
                  {groupedContent[project].reviewer1 || "N/A"}
                </span>

                <p
                  className="text-a"
                  style={{ marginBottom: "5px", fontWeight: "normal" }}
                >
                  Principal
                </p>
                <span
                  className="text-a"
                  style={{
                    display: "inline-block",
                    backgroundColor: "#e0f7fa",
                    color: "#00796b",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "0.85em",
                    fontWeight: "normal",
                    marginBottom: "10px",
                  }}
                >
                  {groupedContent[project].principal || "N/A"}
                </span>
              </div>

              {/* Second Column */}
              <div style={{ flex: "1", width: "50%", textAlign: "left" }}>
                <p
                  className="text-a"
                  style={{ marginBottom: "5px", fontWeight: "normal" }}
                >
                  Preparer
                </p>
                <span
                  className="text-a"
                  style={{
                    display: "inline-block",
                    backgroundColor: "#e0f7fa",
                    color: "#00796b",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "0.85em",
                    fontWeight: "normal",
                    marginBottom: "10px",
                  }}
                >
                  {groupedContent[project].preparer || "N/A"}
                </span>

                <p
                  className="text-a"
                  style={{ marginBottom: "5px", fontWeight: "normal" }}
                >
                  2nd Reviewer
                </p>
                <span
                  className="text-a"
                  style={{
                    display: "inline-block",
                    backgroundColor: "#e0f7fa",
                    color: "#00796b",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "0.85em",
                    fontWeight: "normal",
                    marginBottom: "10px",
                  }}
                >
                  {groupedContent[project].reviewer2 || "N/A"}
                </span>

                <p
                  className="text-a"
                  style={{ marginBottom: "5px", fontWeight: "normal" }}
                >
                  RFI Closed Date
                </p>
                <span
                  className="text-a"
                  style={{
                    display: "inline-block",
                    backgroundColor: "#e0f7fa",
                    color: "#00796b",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "0.85em",
                    fontWeight: "normal",
                    marginBottom: "10px",
                  }}
                >
                  {groupedContent[project].rficlosedate
                    ? formatDate(groupedContent[project].rficlosedate)
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProjectList;
