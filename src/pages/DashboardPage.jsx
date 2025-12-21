// src/pages/DashboardPage.jsx
import React from 'react';
import ExpenseForm from '../features/ExpenseForm';
import ExpenseHistory from '../features/ExpenseHistory';
import DashboardHeader from '../components/DashboardHeader';

const DashboardPage = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="main-layout">
        <div className="left-column">
          <div className="feature-card">
            <ExpenseForm />
          </div>
        </div>
        <div className="right-column">
          <div className="feature-card">
            <ExpenseHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
