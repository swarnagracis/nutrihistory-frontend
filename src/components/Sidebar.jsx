import React from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom'; // import navigate

const Sidebar = ({ menuItems = {
  OPD: ['Register patients', 'Nutritional screening'],
  IP: ['Nutritional screening', 'Follow up']
} }) => {
  const navigate = useNavigate(); // initialize navigate

  const handleNavigation = (section, item) => {
    if (section === 'OPD' && item === 'Register patients') {
      navigate('/patient-registration');
    } else if (section === 'OPD' && item === 'Nutritional screening') {
      navigate('/nutritional-screening');
    } else if (section === 'IP' && item === 'Nutritional screening') {
      navigate('/ip-nutritional-screening');
    } else if (section === 'IP' && item === 'Follow up') {
      navigate('/follow-up-table');
    }
  };

  return (
    <nav className="sidebar">
      
      <h1 className="sidebar-title">Patient Manager</h1>
      <div className="divider"></div>

      {/* Sidebar Sections */}
      {Object.entries(menuItems).map(([section, items]) => (
        <div key={section} className="menu-section">
          <h2 className="section-title">{section}</h2>
          <ul className="menu-list">
            {items.map((item, index) => (
              <li key={index} className="menu-item">
                <button
                  className="menu-button"
                  onClick={() => handleNavigation(section, item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;