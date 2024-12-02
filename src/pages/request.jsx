import { useState, useEffect } from 'react';
import axios from 'axios';

function Requests({ email }) {
  const [airtableRecords, setAirtableRecords] = useState([]);
  const [groupedContent, setGroupedContent] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState("");
  const [requestDetails, setRequestDetails] = useState("");

  useEffect(() => {
    if (!email) return;

    setLoading(true); 
    const formula = `FIND('${email}', {Client Emails} & "")`;

    axios
      .post(
        `https://accodal-api-rc8y.onrender.com/api/airtable/get-by-formula`,
        {
          appId: 'app2MprPYlwfIdCCd',
          tableId: 'tblIbpqFg0KuNxOD4',
          formula,
        },
        {
          headers: {
            token: 's3cretKey',
          },
        }
      )
      .then((response) => {
        const data = response.data;
        setAirtableRecords(data);

        const grouped = data.reduce((acc, record) => {
          const project = record.fields['Project Name']?.[0] || 'Uncategorized';
          const finalReference = record.fields['Final Reference'];
          const question = record.fields['Question'];
          const status = record.fields['Status'];
          const created = record.fields['Created'] || '';

          if (!acc[project]) {
            acc[project] = { finalReferences: {}, created };
          }

          if (finalReference) {
            if (!acc[project].finalReferences[finalReference]) {
              acc[project].finalReferences[finalReference] = { questions: [], status };
            }
            if (question) {
              acc[project].finalReferences[finalReference].questions.push(question);
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
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false); 
      });


      

  }, [email]);

  const openModal = () => setIsModalOpen(true);
      const closeModal = () => setIsModalOpen(false);
    
      const handleSubmit = () => {
        console.log("Submitted Request:", { projects, requestDetails });
        setProjects("");
        setRequestDetails("");
        closeModal();
      };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const toggleProject = (project) => {
    setExpandedProjects((prevState) => ({
      ...prevState,
      [project]: { ...prevState[project], expanded: !prevState[project].expanded },
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
        <p style={{ textAlign: 'center' }}>Loading requests...</p>
      ) : airtableRecords.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', fontSize: '1em' }}>
          No requests associated to this email
        </p>
      ) : (
        <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ textAlign: 'left', marginBottom: '20px' }}>Requests</h3>
          <button
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
          </button>
        </div>
        {
        Object.keys(groupedContent).length > 0 &&
        Object.entries(groupedContent).map(([project, { finalReferences, created }]) => (
          <div
            key={project}
            style={{
              width: '100%',
              marginBottom: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: '5px',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            
            <div
              style={{
                cursor: 'pointer',
                background: '#ffffff',
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={() => toggleProject(project)}
            >
              <span style={{ fontSize: '1em', marginRight: '10px', flexShrink: 0 }}>
                {expandedProjects[project].expanded ? '▲' : '▼'}
              </span>
              <p style={{ margin: 0, textAlign: 'left', flex: 1 }}>{project}</p>
              <span style={{ fontSize: '0.9em', color: '#555', marginLeft: '15px' }}>
                {formatDate(created)}
              </span>
            </div>
            {expandedProjects[project].expanded && (
              <div style={{ padding: '10px', backgroundColor: '#fff' }}>
                {Object.entries(finalReferences).map(([reference, { questions, status }]) => (
                  <div key={reference} style={{ marginBottom: '5px' }}>
                    <div
                      style={{
                        cursor: 'pointer',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onClick={() => toggleReference(project, reference)}
                    >
                      <span style={{ fontSize: '0.9em', marginRight: '10px' }}>
                        {expandedProjects[project].references[reference] ? '▲' : '▼'}
                      </span>
                      <span style={{ textAlign: 'left' }}>{reference}</span>
                      <span style={{ fontSize: '0.9em', color: '#888', textAlign: 'right', marginLeft: 'auto' }}>
                        {status || 'Unknown Status'}
                      </span>
                    </div>
                    {expandedProjects[project].references[reference] && (
                      <div
                        style={{
                          paddingLeft: '15px',
                          paddingTop: '5px',
                          paddingBottom: '5px',
                          borderLeft: '2px solid #ddd',
                        }}
                      >
                        {questions.map((question, index) => (
                          <p key={index} style={{ margin: '5px 0' }}>
                            {question}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}
        </>
      )}
      {isModalOpen && (
        <div
          className='modal'
        >
          <h4 style={{ marginBottom: "15px" }}>Create Request</h4>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="projects" style={{ display: "block", marginBottom: "5px" }}>
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
            <label htmlFor="requestDetails" style={{ display: "block", marginBottom: "5px" }}>
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
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
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
