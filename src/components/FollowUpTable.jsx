import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './FollowUpTable.css';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import axios from 'axios';
import { useMemo } from 'react';
import BASE_URL from '../config';

const FollowUpTable = () => {
  const location = useLocation();
  const incomingData = useMemo(() => location.state || {}, [location.state]);

  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');


  const [formData, setFormData] = useState({
    id: null,
    IPNo: incomingData.IPNo || '',
    name: incomingData.name || '',
    date: incomingData.date || '',
    diagnosis: incomingData.diagnosis || '',
    notes: '',
    actions: '',
    comments: '',
    attachment: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [searchIPNo, setSearchIPNo] = useState('');

  const fetchFollowUps = async (IPNo) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/follow-ups/patient/${IPNo}`);
      setFollowUps(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch follow-ups');
      console.error('Error fetching follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFollowUps = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${BASE_URL}/api/follow-ups`);
    setFollowUps(response.data.data);
    setError(null);
  } catch (err) {
    setError('Failed to fetch all follow-ups');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (incomingData.IPNo) {
      setFormData((prevData) => ({
        ...prevData,
        IPNo: incomingData.IPNo,
        name: incomingData.name,
        diagnosis: incomingData.diagnosis,
      }));
    }
  }, [incomingData]);
  useEffect(() => {
  const shouldFetchAll = selectedDate || !searchIPNo;

  if (shouldFetchAll) {
    fetchAllFollowUps();
  } else if (searchIPNo) {
    fetchFollowUps(searchIPNo);
  }
}, [searchIPNo, selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      IPNo: incomingData.IPNo || '',
      name: incomingData.name || '',
      date: incomingData.date || '',
      diagnosis: incomingData.diagnosis || '',
      notes: '',
      actions: '',
      comments: '',
      attachment: null
    });
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.IPNo || !formData.name || !formData.date) {
    setError('IPNo, name, and date are required fields');
    return;
  }

  try {
    setLoading(true);
    const formDataToSend = new FormData();
    
    // Append all fields to FormData
    formDataToSend.append('IPNo', formData.IPNo);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('date', formData.date);
    formDataToSend.append('diagnosis', formData.diagnosis || '');
    formDataToSend.append('notes', formData.notes || '');
    formDataToSend.append('actions', formData.actions || '');
    formDataToSend.append('comments', formData.comments || '');
    
    // Append the actual file object if exists
    if (formData.attachment instanceof File) {
      formDataToSend.append('attachment', formData.attachment);
    }

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true // if using cookies/sessions
    };

    let response;
    if (isEditing) {
      response = await axios.put(`${BASE_URL}/api/follow-ups/${formData.id}`, formDataToSend, config);
    } else {
      response = await axios.post(`${BASE_URL}/api/follow-ups`, formDataToSend, config);
    }

    if (response.data.success) {
      setSuccessMessage(`Follow-up ${isEditing ? 'updated' : 'added'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchFollowUps(formData.IPNo);
      resetForm();
    } else {
      throw new Error(response.data.error || 'Operation failed');
    }

  } catch (err) {
    console.error('API Error Details:', {
      message: err.message,
      response: err.response?.data,
      config: err.config
    });
    setError(err.response?.data?.error || 'Operation failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Update your handleFileChange to store the File object
const handleFileChange = (e) => {
  const file = e.target.files[0];
  setFormData(prev => ({ 
    ...prev, 
    attachment: file || null 
  }));
};

  const handleEdit = (followUp) => {
  const formatToInputDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // gives 'yyyy-mm-dd'
  };

  setFormData({
    ...followUp,
    date: followUp.date ? formatToInputDate(followUp.date) : ''
  });
  setIsEditing(true);
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

  const handleSearchChange = (e) => {
    setSearchIPNo(e.target.value);
  };

 const filteredFollowUps = followUps.filter(f => {
  const matchIP = searchIPNo ? f.IPNo.toLowerCase().includes(searchIPNo.toLowerCase()) : true;
  const matchDate = selectedDate ? formatDate(f.date) === selectedDate : true;
  return matchIP && matchDate;
});

  return (
    <div className="followup-page">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="content-container">
          <div className="form-section">
            <h2 className="section-heading">{isEditing ? 'Edit Follow-Up' : 'Add Follow-Up Details'}</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            <form className="follow-up-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="IPNo"
                placeholder="IP No"
                value={formData.IPNo}
                readOnly
              />
              <input
                type="text"
                name="name"
                placeholder="Patient Name"
                value={formData.name}
                readOnly
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
              <input
                type="text"
                name="diagnosis"
                placeholder="Diagnosis"
                value={formData.diagnosis}
                readOnly
              />
              <input
                type="text"
                name="notes"
                placeholder="Modification"
                value={formData.notes}
                onChange={handleChange}
              />
              
              <select
                name="actions"
                value={formData.actions}
                onChange={handleChange}
              >
                <option value="">Select Actions</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Pending">Pending</option>
              </select>
              
              <input
                type="text"
                name="comments"
                placeholder="Comments"
                value={formData.comments}
                onChange={handleChange}
              />
              <input
                type="file"
                name="attachment"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              
              <button type="submit">{isEditing ? 'Update Follow-Up' : 'Add Follow-Up'}</button>
            </form>
          </div>

          <div className="table-section">
            <h2 className="section-heading">Follow-Up Records</h2>
            <div className="search-bar">
              <input
                id="search"
                type="text"
                placeholder="Search by IP Number"
                value={searchIPNo}
                onChange={handleSearchChange}
              />
              <button onClick={() => fetchFollowUps(searchIPNo)} className="search-button">Search</button>

              <label htmlFor="dateFilter" style={{ marginLeft: '1rem' }}>Filter by Date</label>
              <input
                id="dateFilter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            {loading && followUps.length === 0 ? (
              <div className="loading">Loading...</div>
            ) : (

            <div className="table-wrapper">
              <table className="follow-up-table">
                <thead>
                  <tr>
                    <th>IP No</th>
                    <th>Patient Name</th>
                    <th>Follow-Up Date</th>
                    <th>Diagnosis</th>
                    <th>Notes</th>
                    <th>Actions</th>
                    <th>Comments</th>
                    <th>Report</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFollowUps.length > 0 ? (
                    filteredFollowUps.map((followUp) => (
                      <tr key={followUp.id}>
                        <td>{followUp.IPNo}</td>
                        <td>{followUp.name}</td>
                        <td>{formatDate(followUp.date)}</td>
                        <td>{followUp.diagnosis}</td>
                        <td>{followUp.notes}</td>
                        <td className={`status-${followUp.actions}`}>{followUp.actions}</td>
                        <td>{followUp.comments}</td>
                        <td>
                          {followUp.attachment ? (
                            <a
                              href={`${BASE_URL}/api/follow-ups/attachment/${followUp.attachment}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-link"
                            >
                              View
                            </a>
                          ) : '—'}
                        </td>
                        <td>
                          <button onClick={() => handleEdit(followUp)} className="edit-button">Edit</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center' }}>
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpTable;
