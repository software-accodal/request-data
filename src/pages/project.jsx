import { useState, useEffect } from 'react';
import axios from 'axios';

function Projects({ email }) {
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
    const formula = `FIND('${email}', {Client Email} & "")`;

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
        setAirtableRecords(data);

        const grouped = data.reduce((acc, record) => {
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
        console.log(groupedContent)

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
  }, [email]);

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
    <div>
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading projects...</p>
      ) : airtableRecords.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', fontSize: '1em' }}>
          No projects associated with this email
        </p>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ textAlign: 'left', marginBottom: '20px' }}>Projects</h3>
          </div>
          {Object.keys(groupedContent).map((project) => (
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
                  {expandedProjects[project] ? '▲' : '▼'}
                </span>
                <p style={{ margin: 0, textAlign: 'left', flex: 1 }}>{project}</p>
                <span style={{ fontSize: '0.9em', color: '#555', marginLeft: '15px' }}>
                  {formatDate(groupedContent[project].created)}
                </span>
              </div>
              {expandedProjects[project] && (
                  <div style={{ padding: '15px', background: '#f9f9f9', display: 'flex', gap: '15px' }}>
                    {/* First Column */}
                    <div style={{ flex: '1', width: '50%', textAlign: 'left' }}>
                      <p style={{ marginBottom: '5px', fontWeight: 'normal' }}>RFI Status</p>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#e0f7fa',
                        color: '#00796b',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: 'normal',
                        marginBottom: '10px'
                      }}>
                        {groupedContent[project].statuses.join(', ') || 'N/A'}
                      </span>

                      <p style={{ marginBottom: '5px', fontWeight: 'normal' }}>1st Reviewer</p>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#e0f7fa',
                        color: '#00796b',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: 'normal',
                        marginBottom: '10px'
                      }}>
                        {groupedContent[project].reviewer1 || 'N/A'}
                      </span>

                      <p style={{ marginBottom: '5px', fontWeight: 'normal' }}>Principal</p>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#e0f7fa',
                        color: '#00796b',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: 'normal',
                        marginBottom: '10px'
                      }}>
                        {groupedContent[project].principal || 'N/A'}
                      </span>
                    </div>

                    {/* Second Column */}
                    <div style={{ flex: '1', width: '50%', textAlign: 'left' }}>
                      <p style={{ marginBottom: '5px', fontWeight: 'normal' }}>Preparer</p>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#e0f7fa',
                        color: '#00796b',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: 'normal',
                        marginBottom: '10px'
                      }}>
                        {groupedContent[project].preparer || 'N/A'}
                      </span>

                      <p style={{ marginBottom: '5px', fontWeight: 'normal' }}>2nd Reviewer</p>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#e0f7fa',
                        color: '#00796b',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: 'normal',
                        marginBottom: '10px'
                      }}>
                        {groupedContent[project].reviewer2 || 'N/A'}
                      </span>

                      <p style={{ marginBottom: '5px', fontWeight: 'normal' }}>RFI Closed Date</p>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#e0f7fa',
                        color: '#00796b',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: 'normal',
                        marginBottom: '10px'
                      }}>
                        {groupedContent[project].rficlosedate ? formatDate(groupedContent[project].rficlosedate) : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}


            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default Projects;
