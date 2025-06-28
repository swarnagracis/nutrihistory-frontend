import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Summary.css";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const summaryRef = useRef();

  const [formData, setFormData] = useState(null);
  const [bmiRange, setBmiRange] = useState("");

  useEffect(() => {
    // Retrieve data from location.state only if present
    if (location.state && location.state.formData) {
      setFormData(location.state.formData);
      setBmiRange(location.state.bmiRange || "");
    } else {
      // Redirect to screening if data is missing
      navigate("/nutritional-screening");
    }
  }, [location, navigate]);

  // Show nothing while loading or redirecting
  if (!formData) return null;

  const handleEdit = () => {
    navigate("/nutritional-screening", { state: { formData, bmiRange } });
  };

  const handleBack = () => {
    navigate("/patient-registration");
  };

  const handleDownloadPDF = async () => {
    const element = summaryRef.current;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Patient_Summary_${formData.name || "Unknown"}.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);
    }
  };

  return (
    <div className="summary-page">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="summary-container">
          <div className="summary-card" ref={summaryRef}>
            <h2 className="summary-title">Patient Nutritional Summary</h2>
            <div className="summary-content">
              {/* Render all form fields except BMI and dietitian_name */}
              {Object.entries(formData)
                .filter(([key]) => key !== "bmi" && key !== "dietitian_name")
                .map(([key, value]) => (
                  <div className="summary-row" key={key}>
                    <span className="summary-label">{key.replace(/_/g, " ")}</span>
                    <span className="summary-value">{value || "Not Provided"}</span>
                  </div>
                ))}

              {/* Show BMI */}
              {formData.bmi && (
                <div className="summary-row">
                  <span className="summary-label">BMI</span>
                  <span className="summary-value">{formData.bmi}</span>
                </div>
              )}

              {/* Show BMI Category */}
              {bmiRange && (
                <div className="summary-row bmi">
                  <span className="summary-label">BMI Category</span>
                  <span
                    className="summary-value"
                    style={{
                      color:
                        bmiRange === "Underweight"
                          ? "orange"
                          : bmiRange === "Normal"
                          ? "green"
                          : bmiRange === "Overweight"
                          ? "goldenrod"
                          : "red",
                    }}
                  >
                     {bmiRange}
                  </span>
                </div>
              )}

              {/* Show Dietitian Name */}
              {formData.dietitian_name && (
                <div className="summary-row">
                  <span className="summary-label">Dietitian Name</span>
                  <span className="summary-value">{formData.dietitian_name}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="summary-buttons-container">
              <button onClick={handleEdit} className="edit-button">Edit</button>
              <button onClick={handleBack} className="back-button">Back to Registration</button>
              <button onClick={handleDownloadPDF} className="download-button">Download PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
