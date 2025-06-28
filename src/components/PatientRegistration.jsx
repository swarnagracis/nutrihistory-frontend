import React, { useState, useEffect } from 'react';
import './PatientRegistration.css';
import Header from './Header';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../config';


const PatientRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    HospNo: '',
    name: '',
    date: '',
    age: '',
    gender: '',
    blood_group: '',
    height: '',
    weight: '',
    bmi: '',
    department: '',
    phone: '',
    address: ''
  });

  const [bmiRange, setBmiRange] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const getBmiRange = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (isNaN(bmiValue)) return '';
    if (bmiValue < 18.5) return 'Underweight';
    else if (bmiValue < 24.9) return 'Normal';
    else if (bmiValue < 29.9) return 'Overweight';
    else return 'Obese';
  };

  const getBmiCategoryColor = (category) => {
    switch (category) {
      case 'Underweight': return 'bmi-underweight';
      case 'Normal': return 'bmi-normal';
      case 'Overweight': return 'bmi-overweight';
      case 'Obese': return 'bmi-obese';
      default: return '';
    }
  };

  const { height, weight } = formData;

  useEffect(() => {
    if (height && weight) {
      const heightMeters = parseFloat(height) / 100;
      const bmi = (parseFloat(weight) / (heightMeters * heightMeters)).toFixed(2);
      if (!isNaN(bmi)) {
        setFormData(prev => ({ ...prev, bmi }));
        setBmiRange(getBmiRange(bmi));
      }
    }
  }, [height, weight]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData,};
      delete payload.bmi;

      await axios.post(`${BASE_URL}/api/op-patients/patient-registration`, payload);
      navigate('/nutritional-screening', {
        state: {
          HospNo: formData.HospNo,
          name: formData.name,
          date: formData.date,
          age: formData.age,
          gender: formData.gender,
          blood_group: formData.blood_group,
          height: formData.height,
          weight: formData.weight,
          bmi: formData.bmi,
          bmiRange: bmiRange
        }
      });
    } catch (err) {
      alert('Error submitting form: ' + err.response?.data?.error || err.message);
    }
  };

  const handleSearch = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/op-patients/${searchValue.trim()}`
    );
    // Make sure to use the correct format for HTML input
    const formatDateForInput = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date)) return '';
      // pad zero for single digits
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    if (response.data.success) {
      const patient = response.data.patient;
      setFormData({
        HospNo: patient.HospNo,
        name: patient.name,
        date: formatDateForInput(patient.date),
        age: patient.age,
        gender: patient.gender,
        blood_group: patient.blood_group,
        height: patient.height,
        weight: patient.weight,
        department: patient.department,
        phone: patient.phone,
        address: patient.address
      });

      // Calculate BMI if height/weight exists
      if (patient.height && patient.weight) {
        const heightMeters = patient.height / 100;
        const bmi = (patient.weight / (heightMeters * heightMeters)).toFixed(2);
        setFormData(prev => ({ ...prev, bmi }));
        setBmiRange(getBmiRange(bmi));
      }
    } else {
      alert(response.data.error || 'Patient not found');
    }
  } catch (error) {
    console.error('Search error:', {
      message: error.message,
      response: error.response?.data
    });
    alert(error.response?.data?.error || 'Failed to fetch patient');
  }
};

  const clearForm = () => {
    setFormData({
      HospNo: '',
      name: '',
      date: '',
      age: '',
      gender: '',
      blood_group: '',
      height: '',
      weight: '',
      bmi: '',
      department: '',
      phone: '',
      address: ''
    });
    setBmiRange('');
    setSearchValue('');
  };

  return (
    <div className="nutritional-screening-page">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="form-container">
          <div className="form-title-container">
            <h2 className="form-title">OP - Register a Patient</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by Hospital No"
                className="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button onClick={handleSearch} className="search-button">Search</button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* HospNo */}
            <div className="form-group">
              <label>Hospital Number</label>
              <input type="text" name="HospNo" value={formData.HospNo} onChange={handleChange} />
            </div>

            {/* Name */}
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>

            {/* Date */}
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} />
            </div>

            {/* Age */}
            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label>Gender</label>
              <div className="radio-group">
                {['Male', 'Female', 'Other'].map(g => (
                  <label key={g}>
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                    /> {g}
                  </label>
                ))}
              </div>
            </div>

            {/* Blood Group */}
            <div className="form-group">
              <label>Blood Group</label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Height */}
            <div className="form-group">
              <label>Height (cm)</label>
              <input type="text" name="height" value={formData.height} onChange={handleChange} />
            </div>

            {/* Weight */}
            <div className="form-group">
              <label>Weight (kg)</label>
              <input type="text" name="weight" value={formData.weight} onChange={handleChange} />
            </div>

            {/* BMI (read-only) */}
            <div className="form-group">
              <label>BMI</label>
              <input type="text" name="bmi" value={formData.bmi} readOnly />
              {bmiRange && (
                <small className={`bmi-range ${getBmiCategoryColor(bmiRange)}`}>
                  Category: {bmiRange}
                </small>
              )}
            </div>

            {/* Department */}
            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            </div>

            {/* Address */}
            <div className="form-group">
              <label>House Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </div>

            <div className="button-container">
              <button type="button" className="clear-button" onClick={clearForm}>Clear Form</button>
              <button type="submit" className="register-button">Register</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default PatientRegistration;
