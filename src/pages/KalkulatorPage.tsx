import React from 'react';
import { InteractiveKalkulator } from '../components/kalkulator/InteractiveKalkulator';

export const KalkulatorPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <InteractiveKalkulator />
    </div>
  );
};
