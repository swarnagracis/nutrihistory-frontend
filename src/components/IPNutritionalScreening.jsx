import React, { useState } from "react";
import "./IPNutritionalScreening.css";
import Header from './Header';
import Sidebar from './Sidebar';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import BASE_URL from '../config';

const IPNutritionalScreening = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    IPNo: "",
    HospNo: "",
    name: "",
    ward: "",
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
    therapeuticDiet: {  // camelCase in React component
      normal: false,
      soft: false,
      liquidClear: false,
      liquidFull: false,
      bland: false,
      diabetic: false,
      renal: false,
      cardiac: false,
      lowSalt: false,
      npo: false,
      enteral: false,
      tpn: false,
      others: false,

    },
    other_diet_note: "",
    feed_rate: '',
    nutrient_requirements: '',
    attachment_path: null,
    dietitian_name: ""
  });

  const [bmiRange, setBmiRange] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState(""); 
  const [customFields, setCustomFields] = useState([]); 
  const [searchValue, setSearchValue] = useState("");   

  const therapeuticDietOptions = [
  { key: 'normal', label: 'Normal' },
  { key: 'soft', label: 'Soft' },
  { key: 'liquidClear', label: 'Liquid Clear' },
  { key: 'liquidFull', label: 'Liquid Full' },
  { key: 'bland', label: 'Bland' },
  { key: 'diabetic', label: 'Diabetic' },
  { key: 'renal', label: 'Renal' },
  { key: 'cardiac', label: 'Cardiac' },
  { key: 'lowSalt', label: 'Low Salt' },
  { key: 'npo', label: 'NPO' },
  { key: 'enteral', label: 'Enteral' },
  { key: 'tpn', label: 'TPN' },
  { key: 'others', label: 'Others' },
];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevState) => {
      const updatedForm = {
        ...prevState,
        [name]: value,
      };

      if ((name === 'height' || name === 'weight') && updatedForm.height && updatedForm.weight) {
        const heightInMeters = updatedForm.height / 100;
        const bmiValue = updatedForm.weight / (heightInMeters * heightInMeters);
        if (!isNaN(bmiValue)) {
          updatedForm.bmi = bmiValue.toFixed(2);
          
          // BMI Range logic
          if (bmiValue < 18.5) setBmiRange("Underweight");
          else if (bmiValue < 24.9) setBmiRange("Normal");
          else if (bmiValue < 29.9) setBmiRange("Overweight");
          else setBmiRange("Obese");
        }
      }

      return updatedForm;
    });
  };

const getBmiRange = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (isNaN(bmiValue)) return '';
    if (bmiValue < 18.5) return 'Underweight';
    else if (bmiValue < 24.9) return 'Normal';
    else if (bmiValue < 29.9) return 'Overweight';
    else return 'Obese';
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
    const response = await axios.get(`${BASE_URL}/api/ipnutritional-screening/${searchValue}`);
    const { screening, customFields } = response.data;

    const formattedDate = screening.date ? formatDateForInput(screening.date) : '';

    const heightMeters = parseFloat(screening.height) / 100;
    const bmi = screening.height && screening.weight
      ? (parseFloat(screening.weight) / (heightMeters * heightMeters)).toFixed(2)
      : "";

    const normalizeDietBooleans = (dietObj) => {
  const result = {};
  for (const key in dietObj) {
    result[key] = Boolean(Number(dietObj[key]));  // Ensures 0/1 → false/true
  }
  return result;
};

const updatedForm = {
  ...screening,
  date: formattedDate,
  bmi: bmi,
  therapeuticDiet: normalizeDietBooleans(screening.therapeuticDiet || {})
};


    // Add custom fields to formData
    customFields.forEach(({ field_name, field_value }) => {
      updatedForm[field_name] = field_value;
    });

    setFormData(updatedForm);
    setCustomFields(customFields.map(f => f.field_name));
    if (bmi) setBmiRange(getBmiRange(bmi));
  } catch (error) {
    console.error("Error fetching IP screening data:", error);
    alert("Error fetching patient data");
  }
};
  
  const handleFollowUp = () => {
    const followUpData = {
      IPNo: formData.IPNo,
      name: formData.name,
      diagnosis: formData.diagnosis, 
    };
    navigate("/follow-up-table", {state: followUpData});
  };

  const handleCheckboxChange = (diet) => {
    setFormData(prev => ({
      ...prev,
      therapeuticDiet: {
        ...prev.therapeuticDiet,
        [diet]: !prev.therapeuticDiet[diet]
      }
    }));
  };

  const handleCustomFieldAdd = () => {
    if (newFieldLabel.trim() !== "" && !formData.hasOwnProperty(newFieldLabel)) {
      setCustomFields(prev => [...prev, newFieldLabel]);
      setFormData(prev => ({
        ...prev,
        [newFieldLabel]: ""
      }));
      setNewFieldLabel("");  // Clear the input after adding
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const submissionData = new FormData();

    const therapeutic_diet = {
    diet_normal: formData.therapeuticDiet.normal,
    diet_soft: formData.therapeuticDiet.soft,
    diet_liquid_clear: formData.therapeuticDiet.liquidClear,
    diet_liquid_full: formData.therapeuticDiet.liquidFull,
    diet_bland: formData.therapeuticDiet.bland,
    diet_diabetic: formData.therapeuticDiet.diabetic,
    diet_renal: formData.therapeuticDiet.renal,
    diet_cardiac: formData.therapeuticDiet.cardiac,
    diet_low_salt: formData.therapeuticDiet.lowSalt,
    diet_npo: formData.therapeuticDiet.npo,
    diet_enteral: formData.therapeuticDiet.enteral,
    diet_tpn: formData.therapeuticDiet.tpn,
    diet_others: formData.therapeuticDiet.others
  };

  submissionData.append('therapeutic_diet', JSON.stringify(therapeutic_diet));


    // 1. Append all regular fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === "attachment_path" && value) {
          submissionData.append(key, value);
        } else if (key !== "therapeuticDiet") {
          submissionData.append(key, value);
        }
      }
    });

    // 2. Append custom fields
      const standardFields = [
      'IPNo', 'HospNo', 'name', 'ward', 'date', 'age', 'gender', 'blood_group',
      'height', 'weight', 'bmi', 'diagnosis', 'food_allergies', 'dietary_advice',
      'feed_rate', 'nutrient_requirements', 'attachment_path', 'dietitian_name',
      'other_diet_note', 'therapeuticDiet'
    ];

    const validCustomFields = customFields.filter(field => !standardFields.includes(field));

    const customFieldsPayload = validCustomFields.map(field => ({
      field_name: field,
      field_value: formData[field] || ""
    }));

    submissionData.append("customFields", JSON.stringify(customFieldsPayload));

    // 3. Make the request with proper headers
    const response = await axios.post(
      `${BASE_URL}/api/ipnutritional-screening/ip-nutritional-screening`,
      submissionData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // 4. Handle successful response
    if (response.data.success) {
      alert("Form submitted successfully!");
    } else {
      throw new Error(response.data.message || "Submission failed");
    }
  } catch (error) {
    console.error("Submission error details:", {
      error: error.message,
      response: error.response?.data,
    });
    alert(`Submission failed: ${error.response?.data?.message || error.message}`);
  }
};

// Helper function to reset form
const handleClearForm = () => {
  setFormData({
    IPNo: "",
    HospNo: "",
    name: "",
    ward: "",
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
    therapeuticDiet: {
      normal: false,
      soft: false,
      liquidClear: false,
      liquidFull: false,
      bland: false,
      diabetic: false,
      renal: false,
      cardiac: false,
      lowSalt: false,
      npo: false,
      enteral: false,
      tpn: false,
      others: false,
    },
    other_diet_note: "",
    feed_rate: "",
    nutrient_requirements: "",
    attachment_path: null,
    dietitian_name: "",
  });
  setBmiRange("");
  setCustomFields([]);
  setNewFieldLabel("");
};

  const getBmiColor = () => {
    switch (bmiRange) {
      case "Underweight":
        return "orange";
      case "Normal":
        return "green";
      case "Overweight":
        return "goldenrod";
      case "Obese":
        return "red";
      default:
        return "";
    }
  };

  return (
    <div className="ipnutritional-screening-page">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="form-container">
            <div className="form-header">
              <h2 className="form-title">IP - Nutritional Screening</h2>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by IP No"
                  className="search-input"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button onClick={handleSearch} className="search-button">Search</button>
              </div>
            </div>

          <div className="form-content-section">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>IP No</label>
                <input
                  type="text"
                  name="IPNo"
                  value={formData.IPNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Hospital No</label>
                <input
                  type="text"
                  name="HospNo"
                  value={formData.HospNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
              <label>Ward</label>
              <select
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                required
              >
                <option value="">Select Ward</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="ICU 1">ICU 1</option>
                <option value="ICU 2">ICU 2</option>
                <option value="ICU 3">ICU 3</option>
                <option value="ICU 4">ICU 4</option>
                <option value="Casuality ICU">Casuality ICU</option>
                <option value="CTI ICU">CTI ICU</option>
                <option value="D2 HDU">D2 HDU</option>
                <option value="D3">D3</option>
                <option value="D4">D4</option>
                <option value="D5">D5</option>
                <option value="DV1 HDU">DV1 HDU</option>
                <option value="DV1">DV1</option>
                <option value="DV2">DV2</option>
                <option value="DV3 ICU">DV3 ICU</option>
                <option value="DVM">DVM</option>
                <option value="E3">E3</option>
                <option value="ISO - ICU">ISO - ICU</option>
                <option value="JICU">JICU</option>
                <option value="KHSB-PR-3F-STA A">KHSB-PR-3F-STA A</option>
                <option value="KHSB-PR-3F-STA B">KHSB-PR-3F-STA B</option>
                <option value="KHSB-PR-4F-STA A">KHSB-PR-4F-STA A</option>
                <option value="KHSB-PR-4F-STA B">KHSB-PR-4F-STA B</option>
                <option value="KHSB-PR-5F-STA A">KHSB-PR-5F-STA A</option>
                <option value="KHSB-PR-5F-STA B">KHSB-PR-5F-STA B</option>
                <option value="KHSB-PR-6F-STA A">KHSB-PR-6F-STA A</option>
                <option value="KHSB-PR-6F-STA B">KHSB-PR-6F-STA B</option>
                <option value="KHSB HDU">KHSB HDU</option>
                <option value="L1 HDU">L1 HDU</option>
                <option value="MF1">MF1</option>
                <option value="MF2">MF2</option>
                <option value="MF3 HDU">MF3 HDU</option>
                <option value="MFI ICU">MFI ICU</option>
                <option value="MM">MM</option>
                <option value="MM2">MM2</option>
                <option value="MM3">MM3</option>
                <option value="MM4">MM4</option>
                <option value="MM5">MM5</option>
                <option value="MM6">MM6</option>
                <option value="MM8">MM8</option>
                <option value="N2">N2</option>
                <option value="N3">N3</option>
                <option value="N4">N4</option>
                <option value="N5">N5</option>
                <option value="O3">O3</option>
                <option value="OF1">OF1</option>
                <option value="OF2">OF2</option>
                <option value="OM">OM</option>
                <option value="OM1">OM1</option>
                <option value="OM2">OM2</option>
                <option value="P Ward">P Ward</option>
                <option value="Premier Suite">Premier Suite</option>
                <option value="R7">R7</option>
                <option value="R9">R9</option>
                <option value="S1">S1</option>
                <option value="S1 MICU">S1 MICU</option>
                <option value="S4">S4</option>
                <option value="SF1">SF1</option>
                <option value="SF2">SF2</option>
                <option value="SF3">SF3</option>
                <option value="SF4">SF4</option>
                <option value="SF5">SF5</option>
                <option value="SM">SM</option>
                <option value="SM1">SM1</option>
                <option value="SM2">SM2</option>
                <option value="SM3">SM3</option>
                <option value="SM4">SM4</option>
                <option value="SM5">SM5</option>
                <option value="SM5 ICU">SM5 ICU</option>
                <option value="SM7">SM7</option>
                <option value="SM8">SM8</option>
                <option value="SSR">SSR</option>
                <option value="U3">U3</option>
                <option value="WH1">WH1</option>
                <option value="WH2">WH2</option>
                <option value="WH3">WH3</option>
                <option value="WH4">WH4</option>
                <option value="WH5">WH5</option>
              </select>
            </div>


              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
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
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>BMI</label>
                <input
                  type="text"
                  name="bmi"
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
                <label>Diagnosis</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Food Allergies</label>
                <input
                  type="text"
                  name="food_allergies"
                  value={formData.food_allergies}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Dietary Advice</label>
                <input
                  type="text"
                  name="dietary_advice"
                  value={formData.dietary_advice}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Therapeutic Diet</label>
                <div className="checkbox-group">
                  {therapeuticDietOptions.map(({ key, label }) => (
                    <label key={key} style={{ display: "block", marginBottom: "4px" }}>
                      <input
                        type="checkbox"
                        checked={formData.therapeuticDiet[key] || false}
                        onChange={() => handleCheckboxChange(key)}
                      />
                      {label}
                    </label>
                  ))}

                  {/* Show Other Diet Note field only when 'others' is checked */}
                  {formData.therapeuticDiet.others && (
                    <div className="form-group" style={{ marginTop: "10px" }}>
                      <label>Other Diet Note</label>
                      <input
                        type="text"
                        className="form-control"
                        name="other_diet_note"
                        value={formData.other_diet_note || ""}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
              </div>



              <div className="form-group">
                <label>Feed Rate</label>
                <input
                  type="text"
                  name="feed_rate"
                  value={formData.feed_rate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Nutrient Requirements</label>
                <input
                  type="text"
                  name="nutrient_requirements"
                  value={formData.nutrient_requirements}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Attach Report (PDF/Word)</label>
                <input
                  type="file"
                  name="attachment"
                  accept=".pdf,.doc,.docx"
                  className="file-input"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      attachment: e.target.files[0],
                    }))
                  }
                />

                {formData.attachment_path && typeof formData.attachment_path === 'string' && (
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={`${BASE_URL}/${formData.attachment_path.replace(/\\/g, '/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-link"
                    >
                      View Report
                    </a>
                  </div>
                )}
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
                <button type="submit" className="next-button">Submit</button>
                <button type="button" onClick={handleFollowUp} className="follow-up-button">Go to Follow Up</button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IPNutritionalScreening;

