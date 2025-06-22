
import React from 'react';
import { BrainCircuit } from 'lucide-react';

const ProductividadHeader: React.FC = () => (
  <header className="text-center mb-6"> {/* Added margin-bottom */}
    <h1 className="text-4xl sm:text-5xl font-bold flex items-center justify-center gap-3">
      <BrainCircuit className="w-10 h-10 text-cyan-400" />
      Focus Flow
    </h1>
  </header>
);

export default ProductividadHeader;