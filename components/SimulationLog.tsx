import React, { useEffect, useRef } from 'react';

interface SimulationLogProps {
  log: string[];
}

export const SimulationLog: React.FC<SimulationLogProps> = ({ log }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-purple-700 mt-6 h-64 overflow-y-auto text-sm">
      <h3 className="text-xl font-semibold text-purple-400 mb-3">Simulation Log</h3>
      <div className="font-mono text-gray-300">
        {log.map((entry, index) => (
          <p key={index} className="mb-1">
            <span className="text-gray-500">{index + 1}. </span>{entry}
          </p>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
