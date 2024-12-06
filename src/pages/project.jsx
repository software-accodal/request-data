import { useState, useEffect } from 'react';
import axios from 'axios';

function Projects({ emails }) {
  const [airtableRecords, setAirtableRecords] = useState([]);
  const [groupedContent, setGroupedContent] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalClosed, setModalClosed] = useState(false); 

  useEffect(() => {
    if (!emails || emails.length === 0) return;

    setLoading(true);
    const formula = `OR(${emails.map((email) => `FIND('${email}', {Client Email} & "")`).join(', ')})`;
    console.log("Searching for emails:", emails);
    axios
      .post(
        `https://accodal-api-rc8y.onrender.com/api/airtable/get-by-formula`,
        {
          appId: 'app2MprPYlwfIdCCd',
          tableId: 'tblA1DUSjEa3OD517',
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
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.fields['Created']);
          const dateB = new Date(b.fields['Created']);
          return dateB - dateA; 
        });
    
        setAirtableRecords(sortedData);

        const grouped = sortedData.reduce((acc, record) => {
          const project = record.fields['Project Name'] || 'Uncategorized';
          const rfistatus = record.fields['RFI Status'];
          const preparer = record.fields['Preparer Name'];
          const reviewer1 = record.fields['1st Reviewer Name'];
          const reviewer2 = record.fields['2nd Reviewer Name'];
          const principal = record.fields['Principal Name'];
          const rficlosedate = record.fields['RFI Closed Date'];
          const created = record.fields['Created'] || '';

          if (!acc[project]) {
            acc[project] = { statuses: [], created, preparer, reviewer1, reviewer2, principal, rficlosedate };
          }

          if (rfistatus) {
            acc[project].statuses.push(rfistatus);
          }

          return acc;
        }, {});

        setGroupedContent(grouped);

        const initialState = Object.keys(grouped).reduce((acc, project) => {
          acc[project] = false;
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
  }, [emails, modalClosed]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalClosed((prev) => !prev);
  };

  const handleSubmit = () => {
    console.log("Submitted Project:", { projects, requestDetails });
    setProjects("");
    setRequestDetails("");
    closeModal();
  };

  const toggleProject = (project) => {
    setExpandedProjects((prevState) => ({
      ...prevState,
      [project]: !prevState[project],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className='columns-vertical'>
      {loading ? (
        <p className='align-center text-a'>Loading projects...</p>
      ) : airtableRecords.length === 0 ? (
        <p className='align-center text-b' style={{ color: '#888', fontSize: '1em' }}>
          No projects associated with this email
        </p>
      ) : (
        <>
          <div className='columns-justify' style={{ alignItems: 'center' }}>
            <h3 className='text-c'>Projects</h3>
            <button
            className='button'
                 style={{
                  cursor: "pointer",
                  borderRadius: "10px",
                  backgroundColor: "#007BFF", 
                  color: "#FFF", 
                  border: "2px solid #007BFF", 
                  outline: "none", 
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
              <div key={project} className={`align-left box box-collapsable ${expandedProjects[project] ? 'box-collapsable--opened' : ''}`}>
               <div className="box-header columns-middle"
               onClick={() => toggleProject(project)}>
                <span className="text-d text-xlarge">
                  {expandedProjects[project] ? '▾' : '▸'}
                </span>
                <span className="column-grow ellipsis text-a">{project}</span>
                <span className="text-c" style={{ fontSize: '0.9em', marginLeft: '15px' }}>
                  {formatDate(groupedContent[project].created)}
                </span>
              </div>
              <div className="box-content">
                <div>Content</div>
              </div>
            </div>
          ))}
        </>
      )}
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
          <iframe
            src="https://form.fillout.com/t/tFGjkW6DQYus"
            title="Create Project Form"
            style={{
              width: "100%",
              height: "90%", 
              border: "none",
            }}
          ></iframe>
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
