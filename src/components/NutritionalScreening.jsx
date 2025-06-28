import React, { useState, useEffect } from "react";
import "./NutritionalScreening.css";
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NutritionalScreening = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    HospNo: "",
    name: "",
    date: "",
    age: "",
    gender: "",
    blood_group: "",
    height: "",
    weight: "",
    bmi: "",
    diagnosis: "",
    food_allergies: "",
    dietary_advice: "",
    dietitian_name: ""
  });

  const [bmiRange, setBmiRange] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const getBmiRange = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (isNaN(bmiValue)) return '';
    if (bmiValue < 18.5) return 'Underweight';
    else if (bmiValue < 24.9) return 'Normal';
    else if (bmiValue < 29.9) return 'Overweight';
    else return 'Obese';
  };

  useEffect(() => {
    if (location.state) {
      const { bmi, bmiRange, ...rest } = location.state;
      setFormData(prev => ({
        ...prev,
        ...rest,
        bmi: bmi || ""
      }));
   if (bmiRange) setBmiRange(bmiRange);
  }
  }, [location]);

  useEffect(() => {
  const { height, weight } = formData;

  if (height && weight) {
    const heightMeters = parseFloat(height) / 100;
    const bmi = (parseFloat(weight) / (heightMeters * heightMeters)).toFixed(2);

    if (!isNaN(bmi)) {
      // ✅ Only update if BMI changed
      if (formData.bmi !== bmi) {
        setFormData(prev => ({
          ...prev,
          bmi,
        }));
        setBmiRange(getBmiRange(bmi));
      }
    }
  }
  // eslint-disable-next-line
}, [formData.height, formData.weight]); // ✅ ONLY re-run if height/weight changes


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomFieldAdd = () => {
    if (newFieldLabel.trim() !== "" && !formData.hasOwnProperty(newFieldLabel)) {
      setCustomFields(prev => [...prev, newFieldLabel]);
      setFormData(prev => ({
        ...prev,
        [newFieldLabel]: ""
      }));
      setNewFieldLabel("");
    }
  };

  const getBmiColor = () => {
    switch (bmiRange) {
      case "Underweight": return "orange";
      case "Normal": return "green";
      case "Overweight": return "goldenrod";
      case "Obese": return "red";
      default: return "";
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const form = new FormData();

  form.append("HospNo", formData.HospNo);
  form.append("name", formData.name);
  form.append("date", formData.date);
  form.append("age", formData.age);
  form.append("gender", formData.gender);
  form.append("blood_group", formData.blood_group);
  form.append("height", formData.height);
  form.append("weight", formData.weight);
  form.append("bmi", formData.bmi);
  form.append("diagnosis", formData.diagnosis);
  form.append("food_allergies", formData.food_allergies);
  form.append("dietary_advice", formData.dietary_advice);
  form.append("dietitian_name", formData.dietitian_name);

  // Attach uploaded file if any
  const fileInput = document.getElementById("reportUpload");
  if (fileInput && fileInput.files[0]) {
    form.append("report", fileInput.files[0]);
  }

  // Add custom fields as a JSON string
  const customFieldsPayload = customFields.map(field => ({
    fieldName: field,
    fieldValue: formData[field] || ""
  }));

  form.append("customFields", JSON.stringify(customFieldsPayload));

  try {
    await axios.post("http://localhost:5000/api/op-screening/nutritional-screening", form);
    alert("Data saved successfully!");
    navigate("/summary", { state: { formData, bmiRange } });
  } catch (error) {
    console.error("Error saving screening data:", error);
    alert("Error saving data");
  }
};

const formatDateForInput = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const handleSearch = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/op-screening/${searchValue}`);
    const { screening, customFields } = response.data;

    const formattedDate = screening.date ? formatDateForInput(screening.date) : '';
    
    const heightMeters = parseFloat(screening.height) / 100;
    const bmi = screening.height && screening.weight
      ? (parseFloat(screening.weight) / (heightMeters * heightMeters)).toFixed(2)
      : "";

    const updatedForm = {
      ...screening, 
      date: formattedDate,
      report_path: screening.report_filename,
      bmi,};

    customFields.forEach(({ field_name, field_value }) => {
      updatedForm[field_name] = field_value;
    });

    setFormData(updatedForm);
    setCustomFields(customFields.map(field => field.field_name));
    if (bmi) setBmiRange(getBmiRange(bmi));
  } catch (error) {
    console.error("Error fetching patient screening data:", error);
    alert("Error fetching patient data");
  }
};

  const handleClearForm = () => {
    setFormData({
      HospNo: "",
      name: "",
      date: "",
      age: "",
      gender: "",
      blood_group: "",
      height: "",
      weight: "",
      bmi: "",
      diagnosis: "",
      food_allergies: "",
      dietary_advice: "",
      dietitian_name: ""
    });
    setBmiRange("");
    setSearchValue('');
    setCustomFields([]);
    setNewFieldLabel("");
  };

  return (
    <div className="nutritional-screening-page">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="form-container">
          <div className="form-title-container">
            <h2 className="form-title">OP - Nutritional Screening</h2>
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
              {/* Standard Fields */}
              <div className="form-group">
                <label htmlFor="HospNo">Hospital Number</label>
                <input
                  type="text"
                  name="HospNo"
                  id="HospNo"
                  value={formData.HospNo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Patient Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <div className="radio-group">
                  {["Male", "Female", "Other"].map((gender) => (
                    <label key={gender}>
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleChange}
                      />
                      {gender}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="blood_group">Blood Group</label>
              <select
                name="blood_group"
                id="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              </div>

              <div className="form-group">
                <label htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  id="height"
                  value={formData.height}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  id="weight"
                  value={formData.weight}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bmi">BMI</label>
                <input
                  type="number"
                  name="bmi"
                  id="bmi"
                  value={formData.bmi}
                  onChange={handleChange}
                  readOnly
                />
                {bmiRange && (
                  <small className="bmi-range" style={{ color: getBmiColor() }}>
                    Category: {bmiRange}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="diagnosis">Diagnosis</label>
                <input
                  type="text"
                  name="diagnosis"
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="food_allergies">Food Allergies</label>
                <input
                  type="text"
                  name="food_allergies"
                  id="food_allergies"
                  value={formData.food_allergies}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dietary_advice">Dietary Advice</label>
                <input
                  type="text"
                  name="dietary_advice"
                  id="dietary_advice"
                  value={formData.dietary_advice}
                  onChange={handleChange}
                />
              </div>

              {/* Custom Fields */}
              {customFields.map((field, index) => (
                <div className="form-group" key={`custom-${index}`}>
                  <label>{field}</label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleChange}
                  />
                </div>
              ))}

              <div className="form-group">
                <label htmlFor="reportUpload">Attach Report (PDF/Word)</label>
                <input
                  type="file"
                  id="reportUpload"
                  name="report"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      alert(`Attached: ${file.name}`);
                    }
                  }}
                />
              </div>
              {formData.report_path && (
              <div className="form-group">
                <label>Attached Report:</label>
                <a
                  href={`http://localhost:5000/uploads/op_reports/${formData.report_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-link"
                >
                  View/Download Report
                </a>
              </div>
            )}

              {/* Add Custom Field Input */}
              <div className="form-group add-field-section">
                <label>Add Extra Field</label>
                <input
                  type="text"
                  placeholder="Enter field name"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                />
                <button type="button" onClick={handleCustomFieldAdd}>
                  Add Field
                </button>
              </div>

              <div className="form-group">
              <label htmlFor="dietitian_name">Dietitian Name</label>
              <input
                type="text"
                name="dietitian_name"
                id="dietitian_name"
                value={formData.dietitian_name}
                onChange={handleChange}
              />
            </div>

            <div className="button-container">
              <button type="button" className="clear-button" onClick={handleClearForm}>Clear Form</button>
              <button type="submit" className="submit-button">Submit</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default NutritionalScreening;