import React from 'react';

const PHASES = [
  { id: 1, label: 'Profil' },
  { id: 2, label: 'Patrimoine' },
  { id: 3, label: 'Fiscalité' },
  { id: 4, label: 'Investisseur' },
  { id: 5, label: 'Bilan' },
  { id: 6, label: 'Scénarios' },
];

function detectPhase(messages) {
  if (!messages || messages.length === 0) return 0;
  const allText = messages.map(m => m.content.toLowerCase()).join(' ');

  if (allText.includes('scénario') || allText.includes('scenario') || allText.includes('optimisation')) return 6;
  if (allText.includes('bilan patrimonial') || allText.includes('patrimoine net')) return 5;
  if (allText.includes('tolérance au risque') || allText.includes('profil investisseur') || allText.includes('rendement cible')) return 4;
  if (allText.includes('tranche marginale') || allText.includes('tmi') || allText.includes('fiscale') || allText.includes('imposition')) return 3;
  if (allText.includes('livret a') || allText.includes('assurance-vie') || allText.includes('per ') || allText.includes('immobilier') || allText.includes('patrimoine')) return 2;
  if (allText.includes('situation') || allText.includes('profession') || allText.includes('revenu') || allText.includes('âge') || allText.includes('bonjour')) return 1;
  return 1;
}

export default function ProgressBar({ messages }) {
  const currentPhase = detectPhase(messages);

  if (currentPhase === 0) return null;

  return (
    <div className="progress-bar-container">
      <div className="progress-phases">
        {PHASES.map((phase, index) => {
          const isDone = phase.id < currentPhase;
          const isActive = phase.id === currentPhase;
          return (
            <React.Fragment key={phase.id}>
              <div className="phase-step">
                <div className={`phase-dot ${isActive ? 'active' : isDone ? 'done' : ''}`} />
                <span className={`phase-label ${isActive ? 'active' : isDone ? 'done' : ''}`}>
                  {phase.label}
                </span>
              </div>
              {index < PHASES.length - 1 && (
                <div className={`phase-line ${isDone ? 'done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
