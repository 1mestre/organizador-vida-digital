
import React from 'react';
import ProductividadHeader from '../components/productividad/ProductividadHeader';
import PomodoroTimer from '../components/productividad/PomodoroTimer';
import TaskManager from '../components/productividad/TaskManager';
import AmbiancePlayer from '../components/productividad/AmbiancePlayer';

// Main App Component for Productividad Page
const ProductividadPage: React.FC = () => {
  return (
    <div className="min-h-screen text-white font-rubik p-0 sm:p-2 md:p-4"> {/* Adjusted padding for consistency */}
      <ProductividadHeader />
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <PomodoroTimer />
          <AmbiancePlayer />
        </div>
        <div className="lg:col-span-3">
          <TaskManager />
        </div>
      </main>
    </div>
  );
}

export default ProductividadPage;
