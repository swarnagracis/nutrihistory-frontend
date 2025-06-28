/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all your component files
    "./src/components/**/*.{js,jsx,ts,tsx}", // Specifically includes your components
    "./src/App.js", // Include App if used
    "./src/index.js", // Include main entry if needed
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6", // Example blue primary
        secondary: "#f59e0b", // Example amber secondary
        accent: "#10b981", // Example green accent
        muted: "#f3f4f6", // Light gray backgrounds
        danger: "#ef4444", // Red for errors
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'], // Modern clean UI font
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Great for styling forms
    require('@tailwindcss/typography'), // Useful for summary/SGA-like text areas
    require('@tailwindcss/aspect-ratio'), // If using responsive media
  ],
};
