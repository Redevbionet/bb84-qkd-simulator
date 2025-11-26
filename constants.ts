import { SimulationParameters } from './types';

export const DEFAULT_SIMULATION_PARAMETERS: SimulationParameters = {
  numQubits: 800,
  qberSampleSize: 20, // Percentage
  errorCorrectionBlockSize: 32,
  privacyAmplificationLength: 128,
  enableEve: false,
  enableSecureMode: false,
};

export const QBER_THRESHOLD = 0.11; // 11%

export const QISKIT_DEMO_CODE = `
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

# Create a quantum circuit with 1 qubit and 1 classical bit
qc = QuantumCircuit(1, 1)

# Alice prepares a qubit in a random basis (e.g., |+> for diagonal)
# To simulate a '0' in diagonal basis (+45), we apply a Hadamard gate
# qc.h(0) # This would be for |+> or |-> states

# For BB84, Alice chooses a random bit and basis.
# Let's say Alice wants to send a '0' in Rectilinear Basis (Horizontal)
# No gate needed for |0>

# Or Alice wants to send a '1' in Diagonal Basis (-45 or 135)
# qc.x(0) # Flips |0> to |1>
# qc.h(0) # Transforms |1> to |-> (which is -45 degrees)

# Bob measures in a random basis (e.g., Diagonal)
# If Bob measures in Diagonal basis, apply Hadamard before measurement
# qc.h(0)

# Measure the qubit
qc.measure(0, 0)

# Select the AerSimulator
simulator = AerSimulator()

# Compile the circuit for the simulator
compiled_circuit = transpile(qc, simulator)

# Run the circuit on the simulator
job = simulator.run(compiled_circuit, shots=1024)

# Grab results from the job
result = job.result()

# Returns counts, the number of times each result (e.g., '0' or '1') occurred
counts = result.get_counts(qc)
print("Measurement counts:", counts)
`;
