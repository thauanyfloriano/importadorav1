
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
// import { Dashboard } from './pages/Dashboard';
import { Imports } from './pages/Imports';
import { Items } from './pages/Items';
import { BudgetPrefill } from './pages/BudgetPrefill';

function Settings() {
  return (
    <div className="flex items-center justify-center h-full">
      <h2 className="text-xl text-brand-text-muted">Settings Page Placeholde</h2>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/budget-prefill" replace />} />
          <Route path="imports" element={<Imports />} />
          <Route path="items" element={<Items />} />
          <Route path="budget-prefill" element={<BudgetPrefill />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
