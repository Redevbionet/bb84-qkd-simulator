import React from 'react';
import { QkdSimulator } from './components/QkdSimulator';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-purple-400 py-4 px-6 shadow-lg">
        <h1 className="text-3xl font-extrabold text-center md:text-left">
          <span className="text-cyan-400">REDEVCYBER</span> BB84 QKD Simulator
        </h1>
        <p className="text-center md:text-left mt-1 text-sm text-gray-400">
          Simulating the foundational quantum key distribution protocol.
        </p>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <QkdSimulator />
      </main>

      <footer className="bg-gray-800 text-gray-400 py-4 px-6 text-center text-sm shadow-inner mt-8">
        © {new Date().getFullYear()} REDEVCYBER. All rights reserved. Built with Quantum Spirit.
      </footer>
    </div>
  );
};

export default App;