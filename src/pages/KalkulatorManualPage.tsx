import React from 'react';
import { ManualKalkulator } from '../components/kalkulator/ManualKalkulator';

export const KalkulatorManualPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <ManualKalkulator />
    </div>
  );
};
