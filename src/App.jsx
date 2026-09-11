import React, { useEffect, useMemo, useState } from 'react';
import LeadGate from './components/LeadGate.jsx';
import Buscador from './pages/Buscador.jsx';
import { isUnlocked } from './lib/leads.js';
import { trackEvent } from './lib/analytics.js';
import vagas from '../data/vagas.json';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    trackEvent('page_view', { page: 'buscador_residencia_medica' });
    setUnlocked(isUnlocked());
  }, []);

  const stats = useMemo(
    () => ({
      total: vagas.length,
      especialidades: new Set(vagas.map((v) => v.especialidade)).size,
      estados: new Set(vagas.map((v) => v.estado)).size,
    }),
    []
  );

  if (!unlocked) {
    return (
      <LeadGate
        stats={stats}
        onUnlock={() => {
          trackEvent('tool_access', {});
          setUnlocked(true);
        }}
      />
    );
  }

  return <Buscador />;
}
