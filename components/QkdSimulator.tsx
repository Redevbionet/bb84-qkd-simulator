import React, { useState, useCallback } from 'react';
import { runBB84Simulation } from '../services/qkdService';
import { SimulationResult, SimulationParameters, QBERResult } from '../types';
import { DEFAULT_SIMULATION_PARAMETERS } from '../constants';
import { Loader } from './Loader';
import { QiskitDemo } from './QiskitDemo';
import { SimulationLog } from './SimulationLog';

const QkdSimulator: React.FC = () => {
  const [params, setParams] = useState<SimulationParameters>(DEFAULT_SIMULATION_PARAMETERS);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setParams((prevParams) => ({
      ...prevParams,
      [name]: type === 'checkbox' ? checked : parseInt(value, 10),
    }));
  };

  const handleRunSimulation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSimulationResult(null); // Clear previous results
    try {
      const result = await runBB84Simulation(params);
      setSimulationResult(result);
    } catch (err: any) {
      console.error("Simulation failed:", err);
      setError(`Simulation failed: ${err.message || 'An unknown error occurred.'}`);
    } finally {
      setIsLoading(false);
    }
  }, [params]); // Depend on params to re-create if params change

  // Fix: Changed `JSX.Element` to `React.ReactNode` for broader compatibility with React element types.
  const renderResultCard = (title: string, value: string | number | boolean | React.ReactNode, color: string = 'cyan') => (
    <div className={`bg-gray-800 p-4 rounded-lg border border-${color}-700 shadow-md`}>
      <h3 className={`text-md font-semibold text-${color}-400 mb-2`}>{title}</h3>
      <p className="text-xl font-bold text-gray-100">{value}</p>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-full p-4 md:p-8 rounded-lg shadow-xl border border-gray-700">
      <h2 className="text-4xl font-extrabold text-purple-400 mb-8 text-center">
        BB84 QKD Simulation
      </h2>

      <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto text-center">
        Explore the foundational quantum key distribution protocol, demonstrating qubit
        preparation, measurement, basis sifting, QBER detection, error correction, and
        privacy amplification.
      </p>

      {/* Simulation Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 p-6 bg-gray-800 rounded-lg shadow-inner border border-purple-600">
        <h3 className="col-span-full text-2xl font-bold text-cyan-400 mb-4">Simulation Parameters</h3>

        {/* Number of Qubits */}
        <div className="flex flex-col">
          <label htmlFor="numQubits" className="text-gray-300 text-sm font-medium mb-1">
            Number of Qubits (n)
          </label>
          <input
            type="number"
            id="numQubits"
            name="numQubits"
            value={params.numQubits}
            onChange={handleParamChange}
            min="100"
            max="5000"
            className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Total qubits sent by Alice.</p>
        </div>

        {/* QBER Sample Size */}
        <div className="flex flex-col">
          <label htmlFor="qberSampleSize" className="text-gray-300 text-sm font-medium mb-1">
            QBER Sample Size (%)
          </label>
          <input
            type="number"
            id="qberSampleSize"
            name="qberSampleSize"
            value={params.qberSampleSize}
            onChange={handleParamChange}
            min="5"
            max="100"
            className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Percentage of sifted bits for QBER check.</p>
        </div>

        {/* Error Correction Block Size */}
        <div className="flex flex-col">
          <label htmlFor="errorCorrectionBlockSize" className="text-gray-300 text-sm font-medium mb-1">
            Error Correction Block Size
          </label>
          <input
            type="number"
            id="errorCorrectionBlockSize"
            name="errorCorrectionBlockSize"
            value={params.errorCorrectionBlockSize}
            onChange={handleParamChange}
            min="4"
            max="256"
            className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Bits per block for error correction.</p>
        </div>

        {/* Privacy Amplification Length */}
        <div className="flex flex-col">
          <label htmlFor="privacyAmplificationLength" className="text-gray-300 text-sm font-medium mb-1">
            Privacy Amplification Length (bits)
          </label>
          <input
            type="number"
            id="privacyAmplificationLength"
            name="privacyAmplificationLength"
            value={params.privacyAmplificationLength}
            onChange={handleParamChange}
            min="16"
            max="256"
            step="4"
            className="p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Final key length after privacy amplification (in bits, will be converted to hex chars).</p>
        </div>

        {/* Enable Eve */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableEve"
            name="enableEve"
            checked={params.enableEve}
            onChange={handleParamChange}
            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="enableEve" className="ml-2 text-gray-300 font-medium">
            Enable Eve (Intercept-Resend Attack)
          </label>
        </div>

        {/* Enable Secure Mode */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableSecureMode"
            name="enableSecureMode"
            checked={params.enableSecureMode}
            onChange={handleParamChange}
            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="enableSecureMode" className="ml-2 text-gray-300 font-medium">
            Enable Secure Mode (strict QBER)
          </label>
        </div>
      </div>

      {/* Run Simulation Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleRunSimulation}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Run BB84 Simulation
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 p-4 rounded-md mt-6 text-center shadow-md">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <p>Please check your parameters and try again.</p>
        </div>
      )}

      {isLoading && <Loader message="Running simulation, please wait..." />}

      {/* Simulation Results */}
      {simulationResult && !isLoading && (
        <div className="mt-10 p-6 bg-gray-800 rounded-lg shadow-xl border border-purple-700">
          <h3 className="text-3xl font-bold text-purple-400 mb-6 text-center">Simulation Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {renderResultCard('Initial Qubits Sent', simulationResult.initialQubits)}
            {renderResultCard('Sifted Key Length (After QBER Sample)', simulationResult.siftedKeyLength)}
            {simulationResult.qberResult && renderResultCard(
              'QBER Detected',
              `${(simulationResult.qberResult.qber * 100).toFixed(2)}% (${simulationResult.qberResult.errors} errors in ${simulationResult.qberResult.sampleSize} samples)`,
              simulationResult.eveDetected ? 'red' : 'green'
            )}
            {renderResultCard(
              'Eve Detected (Secure Mode)',
              simulationResult.eveDetected ? <span className="text-red-400 font-bold">YES</span> : <span className="text-green-400 font-bold">NO</span>,
              simulationResult.eveDetected ? 'red' : 'green'
            )}
            {renderResultCard('Errors Corrected', simulationResult.errorsCorrected, 'yellow')}
            {renderResultCard(
              'Final Shared Key (Alice)',
              <span className="break-all text-sm lg:text-base">{simulationResult.finalKeyAlice || 'N/A'}</span>,
              'lime'
            )}
            {renderResultCard(
              'Final Shared Key (Bob)',
              <span className="break-all text-sm lg:text-base">{simulationResult.finalKeyBob || 'N/A'}</span>,
              'lime'
            )}
          </div>

          <SimulationLog log={simulationResult.log} />
        </div>
      )}

      <QiskitDemo />
    </div>
  );
};

export { QkdSimulator };