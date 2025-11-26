import { Basis, Bit, QBERResult, SimulationResult, SimulationParameters, QubitMeasurement } from '../types';
import { QBER_THRESHOLD } from '../constants';

const getRandomBit = (): Bit => (Math.random() < 0.5 ? Bit.ZERO : Bit.ONE);
const getRandomBasis = (): Basis => (Math.random() < 0.5 ? Basis.RECTILINEAR : Basis.DIAGONAL);

// Helper function to convert a bit array to a hexadecimal string
const bitsToHex = (bits: Bit[]): string => {
  let hexString = '';
  // Ensure the bit array length is a multiple of 4 for clean hex conversion
  const paddedBits = [...bits];
  while (paddedBits.length % 4 !== 0) {
    paddedBits.push(Bit.ZERO); // Pad with 0s if needed
  }

  for (let i = 0; i < paddedBits.length; i += 4) {
    const chunk = paddedBits.slice(i, i + 4);
    const decimal = parseInt(chunk.join(''), 2);
    hexString += decimal.toString(16);
  }
  return hexString;
};

// Simplified SHA-256 for browser environment
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hexHash;
}


export async function runBB84Simulation(params: SimulationParameters): Promise<SimulationResult> {
  const {
    numQubits,
    qberSampleSize,
    errorCorrectionBlockSize,
    privacyAmplificationLength,
    enableEve,
    enableSecureMode,
  } = params;

  const log: string[] = [];
  log.push('Starting BB84 Simulation...');
  log.push(`Parameters: ${JSON.stringify({ ...params, privacyAmplificationLength: `${privacyAmplificationLength} bits` })}`);

  // 1. Alice Prepares Qubits
  const aliceBits: Bit[] = Array.from({ length: numQubits }, getRandomBit);
  const aliceBases: Basis[] = Array.from({ length: numQubits }, getRandomBasis);
  log.push(`Alice prepared ${numQubits} qubits with random bits and bases.`);

  let transmittedBits: Bit[] = [...aliceBits];
  let transmittedBases: Basis[] = [...aliceBases];

  // Optional: Eve Intercept-Resend Attack
  if (enableEve) {
    log.push('Eve is enabled: Performing intercept-resend attack.');
    const eveBases: Basis[] = Array.from({ length: numQubits }, getRandomBasis);
    const eveMeasuredBits: Bit[] = [];

    for (let i = 0; i < numQubits; i++) {
      let eveBit: Bit;
      // Eve measures based on Alice's original qubit and her chosen basis
      if (aliceBases[i] === eveBases[i]) {
        eveBit = aliceBits[i]; // Eve measures correctly if bases match
      } else {
        eveBit = getRandomBit(); // Eve measures randomly if bases mismatch
      }
      eveMeasuredBits.push(eveBit);
    }
    // Eve re-sends her measured bits, effectively creating new qubits for Bob
    transmittedBits = eveMeasuredBits;
    // For simplicity in simulation, Eve's re-sent basis is considered to be her measurement basis.
    // In a real scenario, Eve would re-encode based on her measurement result into a random basis.
    // Here, we simplify: Bob effectively measures a qubit prepared with `eveMeasuredBits` and `eveBases`.
    transmittedBases = eveBases;
    log.push('Eve intercepted, measured, and re-sent qubits to Bob using her measurement bases.');
  }

  // 2. Bob Measures Qubits
  const bobBases: Basis[] = Array.from({ length: numQubits }, getRandomBasis);
  const bobMeasuredBits: Bit[] = [];

  for (let i = 0; i < numQubits; i++) {
    let bobBit: Bit;
    if (transmittedBases[i] === bobBases[i]) {
      bobBit = transmittedBits[i]; // Bob measures correctly if bases match what was *transmitted*
    } else {
      bobBit = getRandomBit(); // Bob measures randomly if bases mismatch
    }
    bobMeasuredBits.push(bobBit);
  }
  log.push(`Bob measured ${numQubits} qubits with random bases.`);

  // 3. Basis Sifting
  const siftedAliceKey: Bit[] = [];
  const siftedBobKey: Bit[] = [];
  
  // Track actual errors between Alice's original bit and Bob's *final* measured bit
  // but only for the positions where their bases matched
  let initialSiftedErrors = 0; 

  for (let i = 0; i < numQubits; i++) {
    if (aliceBases[i] === bobBases[i]) { // Alice and Bob's bases matched
      siftedAliceKey.push(aliceBits[i]);
      siftedBobKey.push(bobMeasuredBits[i]);
      if (aliceBits[i] !== bobMeasuredBits[i]) {
        initialSiftedErrors++;
      }
    }
  }
  const siftedKeyLength = siftedAliceKey.length;
  log.push(`Basis Sifting completed. Sifted key length: ${siftedKeyLength} bits.`);
  if (siftedKeyLength === 0) {
    log.push('No matching bases. Simulation cannot proceed with QBER, Error Correction, or Privacy Amplification.');
    return {
      initialQubits: numQubits,
      siftedKeyLength: 0,
      eveDetected: false,
      errorsCorrected: 0,
      finalKeyAlice: '',
      finalKeyBob: '',
      log,
    };
  }

  // 4. Parameter Estimation (QBER)
  const qberSampleCount = Math.ceil(siftedKeyLength * (qberSampleSize / 100));
  let qberErrors = 0;
  // Compare a subset of the sifted keys
  for (let i = 0; i < qberSampleCount; i++) {
    if (siftedAliceKey[i] !== siftedBobKey[i]) {
      qberErrors++;
    }
  }
  const qber = qberSampleCount > 0 ? qberErrors / qberSampleCount : 0;
  const qberResult: QBERResult = { qber, errors: qberErrors, sampleSize: qberSampleCount };
  log.push(`QBER Check: Sample size ${qberSampleCount} bits. Errors found: ${qberErrors}. QBER: ${(qber * 100).toFixed(2)}%.`);

  let eveDetected = false;
  if (enableSecureMode && qber > QBER_THRESHOLD) {
    eveDetected = true;
    log.push(`ALERT: QBER (${(qber * 100).toFixed(2)}%) exceeds threshold (${(QBER_THRESHOLD * 100).toFixed(2)}%). Eavesdropping detected! Key discarded.`);
    return {
      initialQubits: numQubits,
      siftedKeyLength,
      qberResult,
      eveDetected,
      errorsCorrected: 0,
      finalKeyAlice: '',
      finalKeyBob: '',
      log,
    };
  } else if (enableEve && qber > (QBER_THRESHOLD / 2) && !enableSecureMode) { // If Eve is on and QBER is noticeably high but not over threshold
      log.push(`Note: QBER (${(qber * 100).toFixed(2)}%) is higher than expected. Eve might be present, but secure mode is not enabled to enforce a strict threshold.`);
  } else if (!enableEve && qber > 0) {
    log.push(`Note: Minor QBER detected (${(qber * 100).toFixed(2)}%). Could be due to simulated noise or imperfections in quantum measurements.`);
  }

  // Remove the QBER sample from the keys to be corrected
  const keyForErrorCorrectionAlice = siftedAliceKey.slice(qberSampleCount);
  const keyForErrorCorrectionBob = siftedBobKey.slice(qberSampleCount);
  const preECKeyLength = keyForErrorCorrectionAlice.length;
  log.push(`Key for Error Correction: Remaining ${preECKeyLength} bits after QBER sampling.`);


  // 5. Error Correction (Simplified Parity Check + Binary Search)
  // This is a simplified simulation of error correction.
  // In a real BB84, this involves public discussions to identify and fix errors.
  let errorsCorrectedCount = 0;
  const sharedKeyAfterEC: Bit[] = [...keyForErrorCorrectionBob]; // Bob's key, will be corrected to match Alice's

  for (let i = 0; i < preECKeyLength; i += errorCorrectionBlockSize) {
    const aliceBlock = keyForErrorCorrectionAlice.slice(i, i + errorCorrectionBlockSize);
    const bobBlock = sharedKeyAfterEC.slice(i, i + errorCorrectionBlockSize);

    const currentBlockLength = Math.min(errorCorrectionBlockSize, aliceBlock.length);
    if (currentBlockLength === 0) continue;

    const aliceParity = aliceBlock.slice(0, currentBlockLength).reduce((acc, bit) => acc ^ bit, 0);
    const bobParity = bobBlock.slice(0, currentBlockLength).reduce((acc, bit) => acc ^ bit, 0);

    if (aliceParity !== bobParity) {
      // Simulate binary search for error by comparing bits directly
      // In a real scenario, this involves rounds of parity checks on sub-blocks
      for (let j = 0; j < currentBlockLength; j++) {
        if (aliceBlock[j] !== bobBlock[j]) {
          sharedKeyAfterEC[i + j] = aliceBlock[j]; // Correct Bob's bit
          errorsCorrectedCount++;
          break; // For simplicity, assume one error per block for correction simulation
        }
      }
    }
  }
  log.push(`Error Correction completed. ${errorsCorrectedCount} errors corrected in the remaining key.`);

  // Verify that keys are identical after error correction
  const keysMatch = keyForErrorCorrectionAlice.every((bit, index) => bit === sharedKeyAfterEC[index]);
  if (!keysMatch) {
    log.push('ERROR: Keys do not perfectly match after error correction! This indicates simulation imperfection or a severe error rate.');
    // In a real protocol, this would be a critical failure. For simulation, we proceed.
  } else {
    log.push('Keys successfully reconciled: Alice and Bob now share an identical key (after QBER sample removal and error correction).');
  }

  // 6. Privacy Amplification
  // The goal is to reduce any information Eve might have gained during error correction.
  // We hash the reconciled key and truncate it.
  const preAmplifiedKeyString = sharedKeyAfterEC.join('');
  if (preAmplifiedKeyString.length === 0) {
    log.push('Cannot perform Privacy Amplification: Pre-amplified key is empty.');
    return {
      initialQubits: numQubits,
      siftedKeyLength,
      qberResult,
      eveDetected,
      errorsCorrected: errorsCorrectedCount,
      finalKeyAlice: '',
      finalKeyBob: '',
      log,
    };
  }

  const hash = await sha256(preAmplifiedKeyString);
  // SHA-256 produces a 64-character hex string (256 bits).
  // We truncate this to the desired privacyAmplificationLength (in bits).
  // 1 hex character = 4 bits.
  const desiredHexLength = Math.ceil(privacyAmplificationLength / 4);
  const finalKeyAliceHex = hash.substring(0, desiredHexLength);
  const finalKeyBobHex = hash.substring(0, desiredHexLength);

  log.push(`Privacy Amplification completed (SHA-256 hashing and truncation). Desired final key length: ${privacyAmplificationLength} bits.`);
  log.push(`Final Shared Key (Alice - Hex): ${finalKeyAliceHex}`);
  log.push(`Final Shared Key (Bob - Hex): ${finalKeyBobHex}`);

  return {
    initialQubits: numQubits,
    siftedKeyLength: preECKeyLength, // Sifted key length *after* QBER sample removed
    qberResult,
    eveDetected,
    errorsCorrected: errorsCorrectedCount,
    finalKeyAlice: finalKeyAliceHex,
    finalKeyBob: finalKeyBobHex,
    log,
  };
}
