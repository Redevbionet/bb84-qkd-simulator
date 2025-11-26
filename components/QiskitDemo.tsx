import React, { useState } from 'react';
import { QISKIT_DEMO_CODE } from '../constants';

export const QiskitDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4 mt-6 border border-cyan-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-semibold text-cyan-400 focus:outline-none py-2"
      >
        <span>Qiskit Integration (Conceptual)</span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? 'rotate-90' : ''
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4">
          <p className="text-gray-300 mb-4 text-sm">
            While this simulation runs purely in your browser, Quantum Key Distribution protocols like BB84 are implemented using actual quantum hardware or simulators like Qiskit.
            Below is a conceptual demonstration of how Qiskit code would define and simulate a basic quantum circuit, illustrating the foundational steps for qubit preparation and measurement.
          </p>
          <pre className="bg-gray-900 text-green-300 p-4 rounded-md overflow-x-auto text-sm">
            <code>{QISKIT_DEMO_CODE}</code>
          </pre>
        </div>
      )}
    </div>
  );
};