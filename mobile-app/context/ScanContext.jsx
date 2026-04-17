import { createContext, useContext, useState } from 'react';

const ScanContext = createContext({
  scanResult: null,
  setScanResult: () => {},
  selectedHistoryItem: null,
  setSelectedHistoryItem: () => {},
  factCheckResult: null,
  setFactCheckResult: () => {},
});

export const ScanProvider = ({ children }) => {
  const [scanResult, setScanResult] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [factCheckResult, setFactCheckResult] = useState(null);
  const [scanDuration, setScanDuration] = useState(null);

  return (
    <ScanContext.Provider value={{
      scanResult, setScanResult,
      selectedHistoryItem, setSelectedHistoryItem,
      factCheckResult, setFactCheckResult,
      scanDuration, setScanDuration,
    }}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => useContext(ScanContext);