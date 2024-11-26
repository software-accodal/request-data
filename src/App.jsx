import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [airtableRecords, setAirtableRecords] = useState([]);
  const [groupedContent, setGroupedContent] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [missive, setMissive] = useState();

  useEffect(()=>{
    if(!missive){
      setMissive(window.Missive)
    }
  })

  useEffect(()=>{
    if(!missive){
      return
    }

    missive.on("change:conversations",alert)
  },[missive])

  useEffect(() => {
    // Ensure root div is full width
    const root = document.getElementById('root');
    if (root) {
      root.style.width = '100%';
      root.style.margin = '0';
      root.style.boxSizing = 'border-box';
    }

    fetch('http://localhost:5000/api/airtable?baseId=app2MprPYlwfIdCCd&tableId=tblIbpqFg0KuNxOD4&viewId=viw4opnTUEdFPHIRz', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': 's3cretKey', // Injected token header
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        const records = data.rows || [];
        setAirtableRecords(records);

        // Group Final References and Questions by Project
        const grouped = records.reduce((acc, record) => {
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

        // Initialize all projects as collapsed
        const initialState = Object.keys(grouped).reduce((acc, project) => {
          acc[project] = { expanded: false, references: {} }; // Set all to collapsed
          Object.keys(grouped[project].finalReferences).forEach((ref) => {
            acc[project].references[ref] = false; // Collapsed for each reference
          });
          return acc;
        }, {});
        setExpandedProjects(initialState);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Toggle project expand/collapse
  const toggleProject = (project) => {
    setExpandedProjects((prevState) => ({
      ...prevState,
      [project]: { ...prevState[project], expanded: !prevState[project].expanded },
    }));
  };

  // Toggle final reference expand/collapse
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
    <div
      className="App"
      style={{
        width: '100%',
        margin: '0 auto',
        padding: '0',
      }}
    >
      <h1 style={{ textAlign: 'left', marginBottom: '20px' }}>Requests</h1>
      {Object.keys(groupedContent).length > 0 ? (
        Object.entries(groupedContent).map(([project, { finalReferences, created }]) => (
          <div
            key={project}
            className="project"
            style={{
              width: '100%',
              marginBottom: '10px',
              // border: '1px solid #ccc',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
              borderRadius: '5px',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <div
              className="project-header"
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
              <span
                style={{
                  fontSize: '1em',
                  marginRight: '10px',
                  flexShrink: 0,
                }}
              >
                {expandedProjects[project].expanded ? '▲' : '▼'}
              </span>
              <p style={{ margin: 0, textAlign: 'left', flex: 1 }}>{project}</p>
              <span style={{ fontSize: '0.9em', color: '#555', marginLeft: '15px' }}>
                {formatDate(created)}
              </span>
            </div>
            {expandedProjects[project].expanded && (
              <div
                className="project-content"
                style={{
                  padding: '10px',
                  backgroundColor: '#fff',
                }}
              >
                {Object.entries(finalReferences).map(([reference, { questions, status }]) => (
                  <div key={reference} className="final-reference">
                    <div
                      className="final-reference-header"
                      style={{
                        cursor: 'pointer',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        marginBottom: '5px',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                      onClick={() => toggleReference(project, reference)}
                    >
                      <span
                        style={{
                          fontSize: '0.9em',
                          marginRight: '10px',
                        }}
                      >
                        {expandedProjects[project].references[reference] ? '▲' : '▼'}
                      </span>
                      <span style={{ flex: 1 }}>{reference}</span>
                      <span style={{ fontSize: '0.9em', color: '#888', marginLeft: '10px' }}>
                        {status || 'Unknown Status'}
                      </span>
                    </div>
                    {expandedProjects[project].references[reference] && (
                      <div
                        className="questions"
                        style={{
                          paddingLeft: '15px',
                          paddingTop: '5px',
                          paddingBottom: '5px',
                          borderLeft: '2px solid #ddd',
                          textAlign: 'left'
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
        ))
      ) : (
        <p style={{ textAlign: 'center' }}>Loading requests...</p>
      )}
    </div>
  );
}

export default App;
