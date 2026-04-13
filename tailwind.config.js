/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-base': '#0b0f19',    // Very dark background
        'brand-panel': '#121827',   // Panels background
        'brand-panel-hover': '#1e293b', // Hover effect
        'brand-accent': '#3b82f6',  // Blue accent
        'brand-success': '#10b981', // Green validation
        'brand-error': '#ef4444',   // Red error
        'brand-text': '#e2e8f0',
        'brand-text-muted': '#94a3b8'
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
