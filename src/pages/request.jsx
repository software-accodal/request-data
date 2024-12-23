import { useState, useEffect } from "react";
import axios from "axios";
import RequestLoading from "../components/request/requestLoading";
import RequestList from "../components/request/requestList";

function Requests({ emails }) {
  const [airtableRecords, setAirtableRecords] = useState([]);
  const [groupedContent, setGroupedContent] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [loading, setLoading] = useState(false);

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
        console.log(data);
        const grouped = data.reduce((acc, record) => {
          const project = record.fields["Project Name"]?.[0] || "Uncategorized";
          const finalReference = record.fields["Final Reference"];
          const clientName = record.fields["Client Name"];
          const question = record.fields["Question"];
          const status = record.fields["Status"];
          const created = record.fields["Created"] || "";

          if (!acc[project]) {
            acc[project] = { finalReferences: {}, created, clientName };
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
      {loading && <RequestLoading />}{" "}
      <RequestList
        airtableRecords={airtableRecords}
        groupedContent={groupedContent}
        expandedProjects={expandedProjects}
        toggleProject={toggleProject}
        toggleReference={toggleReference}
        loading={loading}
      />
    </div>
  );
}

export default Requests;
