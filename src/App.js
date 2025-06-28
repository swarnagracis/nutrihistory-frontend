import React from "react";
import LoginPage from "./components/LoginPage";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from "./components/Signup";
import PatientRegistration from "./components/PatientRegistration";
import NutritionalScreening from "./components/NutritionalScreening";
import FollowUpTable from "./components/FollowUpTable";
import IPNutritionalScreening from "./components/IPNutritionalScreening";
import Summary from "./components/Summary";



function App() {
  return (
    <div className="min-h-screen bg-[#F9FBF8] text-gray-800">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/patient-registration" element={<PatientRegistration />} />
        <Route path="/nutritional-screening" element={<NutritionalScreening />} />
        <Route path="/follow-up-table" element={<FollowUpTable />} />
        <Route path="/ip-nutritional-screening" element={<IPNutritionalScreening />} />
        <Route path="/summary" element={<Summary />} />

      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
