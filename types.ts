export enum Basis {
  RECTILINEAR = 'Rectilinear (+)',
  DIAGONAL = 'Diagonal (x)',
}

export enum Bit {
  ZERO = 0,
  ONE = 1,
}

export interface Qubit {
  bit: Bit;
  basis: Basis;
}

export interface QBERResult {
  qber: number;
  errors: number;
  sampleSize: number;
}

export interface SimulationResult {
  initialQubits: number;
  siftedKeyLength: number;
  qberResult?: QBERResult;
  eveDetected: boolean;
  errorsCorrected: number;
  finalKeyAlice: string; // Hex representation
  finalKeyBob: string; // Hex representation
  log: string[];
}

export interface SimulationParameters {
  numQubits: number;
  qberSampleSize: number; // Percentage
  errorCorrectionBlockSize: number;
  privacyAmplificationLength: number;
  enableEve: boolean;
  enableSecureMode: boolean;
}

export interface QubitMeasurement {
  bit: Bit;
  basis: Basis;
}
