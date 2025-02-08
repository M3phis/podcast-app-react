import React, { useState, useEffect } from 'react';
import { getAllRecordings, deleteRecording } from '../utils/mediaUtils';
import './Dashboard.css';

const Dashboard = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const data = await getAllRecordings();
        setRecordings(data);
      } catch (err) {
        setError('Failed to load recordings');
        console.error('Error loading recordings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  if (loading) return <div className="loading">Loading recordings...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Your Recordings</h1>
      
      {recordings.length === 0 ? (
        <p className="no-recordings">No recordings found. Start recording to see them here!</p>
      ) : (
        <div className="recordings-grid">
          {recordings.map((recording) => (
            <div 
              key={recording.id}
              className="recording-card"
            >
              <div className="recording-header">
                <h2 className="recording-title">{recording.filename}</h2>
                <span className="recording-date">
                  {new Date(recording.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              <div className="recording-details">
                <p>Type: {recording.type}</p>
                <p>Size: {(recording.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              
              <div className="recording-actions">
                <button
                  onClick={() => {
                    const url = URL.createObjectURL(recording.blob);
                    window.open(url);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                  }}
                  className="btn btn-play"
                >
                  Play
                </button>
                <button
                  onClick={() => {
                    const url = URL.createObjectURL(recording.blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = recording.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="btn btn-download"
                >
                  Download
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this recording?')) {
                      try {
                        await deleteRecording(recording.id);
                        setRecordings(recordings.filter(r => r.id !== recording.id));
                      } catch (err) {
                        console.error('Error deleting recording:', err);
                        alert('Failed to delete recording');
                      }
                    }
                  }}
                  className="btn btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
