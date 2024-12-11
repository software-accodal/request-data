import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import ProjectLoading from "../components/project/projectLoading";
import ProjectList from "../components/project/projectList";

const APP_ID = "app2MprPYlwfIdCCd";
const TABLE_ID = "tblA1DUSjEa3OD517";

function Projects({ emails }) {
  const [expandedProjects, setExpandedProjects] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalClosed, setModalClosed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef(null);
  const formula = useMemo(() => {
    if (!emails || emails?.length === 0) return undefined;

    return `OR(${emails
      .map((email) => `FIND('${email}', {Client Email} & "")`)
      .join(", ")})`;
  }, [emails]);
  console.log("emails>> ", emails);
  const {
    data: airtableData,
    isFetching,
    refetch,
  } = useQuery({
    enabled: !!formula,
    queryKey: ["project_emails", formula, APP_ID, TABLE_ID],
    queryFn: async () => {
      const res = await axios.post(
        `https://accodal-api-rc8y.onrender.com/api/airtable/get-by-formula`,
        {
          appId: APP_ID,
          tableId: TABLE_ID,
          formula,
        },
        {
          headers: {
            token: "s3cretKey",
          },
        }
      );
      const data = res.data;
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.fields["Created"]);
        const dateB = new Date(b.fields["Created"]);
        return dateB - dateA;
      });

      console.log("data", data);
      const grouped = sortedData.reduce((acc, record) => {
        const project = record.fields["Project Name"] || "Uncategorized";
        const rfistatus = record.fields["RFI Status"];
        const preparer = record.fields["Preparer Name"];
        const reviewer1 = record.fields["1st Reviewer Name"];
        const reviewer2 = record.fields["2nd Reviewer Name"];
        const principal = record.fields["Principal Name"];
        const rficlosedate = record.fields["RFI Closed Date"];
        const created = record.fields["Created"] || "";

        if (!acc[project]) {
          acc[project] = {
            statuses: [],
            created,
            preparer,
            reviewer1,
            reviewer2,
            principal,
            rficlosedate,
          };
        }

        if (rfistatus) {
          acc[project].statuses.push(rfistatus);
        }

        return acc;
      }, {});

      const initialState = Object.keys(grouped).reduce((acc, project) => {
        acc[project] = false;
        return acc;
      }, {});

      setExpandedProjects(initialState);
      console.log({ sortedData, grouped });
      return { sortedData, grouped };
    },
  });
  const { sortedData: airtableRecords = [], grouped: groupedContent = {} } =
    airtableData ?? {};

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsSaving(true);
    setIsModalOpen(false);
    setModalClosed((prev) => !prev);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      refetch();
      setIsSaving(false);
      timeoutRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const toggleProject = (project) => {
    setExpandedProjects((prevState) => ({
      ...prevState,
      [project]: !prevState[project],
    }));
  };

  console.log("airtableRecords>>", airtableRecords);

  return (
    <div className="columns-vertical">
      {isFetching && <ProjectLoading />} {isSaving && <ProjectLoading />}
      <ProjectList
        airtableRecords={airtableRecords}
        groupedContent={groupedContent}
        isFetching={isFetching}
        expandedProjects={expandedProjects}
        openModal={openModal}
        toggleProject={toggleProject}
      />
      {isModalOpen && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "600px",
            height: "90%",
            overflow: "hidden",
            backgroundColor: "#FFF",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
          }}
        >
          <button
            onClick={closeModal}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              cursor: "pointer",
              outline: "none",
            }}
            title="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              fill="none"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: "stroke 0.3s ease",
              }}
              onMouseOver={(e) => (e.target.style.stroke = "red")}
              onMouseOut={(e) => (e.target.style.stroke = "#333")}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <p
            style={{
              color: "#555555",
              textAlign: "left",
              fontSize: "150%",
              fontWeight: "bold",
            }}
          >
            Create New Project
          </p>
          <hr />
          <div
            title="Create Project Form"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          >
            {/* <FilloutStandardEmbed filloutId="tFGjkW6DQYus" /> */}
            <iframe
              src="https://form.fillout.com/t/tFGjkW6DQYus"
              title="Create Project Form"
              style={{
                width: "100%",
                height: "95%",
                border: "none",
              }}
            ></iframe>
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

export default Projects;
