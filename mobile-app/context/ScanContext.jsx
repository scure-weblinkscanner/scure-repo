import { createContext, useContext, useState } from 'react';

const ScanContext = createContext({ scanResult: null, setScanResult: () => {} });

export const ScanProvider = ({ children }) => {
  const [scanResult, setScanResult] = useState(null);
  return (
    <ScanContext.Provider value={{ scanResult, setScanResult }}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => useContext(ScanContext);