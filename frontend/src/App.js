import React, { useState } from 'react';
import PhaseForm, { PHASES } from './components/PhaseForm';
import Dashboard from './components/Dashboard';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function buildPrompt(formData) {
  const p = formData.profil;
  const pat = formData.patrimoine;
  const fis = formData.fiscalite;
  const inv = formData.investisseur;

  const biens = (pat.biens_immo || []).filter(b => b.valeur).map((b, i) =>
    `Bien ${i + 1} : ${b.nature || 'nd'} à ${b.localisation || 'nd'}, valeur ${b.valeur}€, CRD ${b.crd || 0}€${b.loyers ? `, loyers bruts ${b.loyers}€/an, régime ${b.regime}` : ''}`
  ).join('\n');

  return `Voici les données d'un client à analyser :

PROFIL PERSONNEL
- Prénom : ${p.prenom || 'nd'}, ${p.age} ans
- Situation : ${p.situation}, ${p.enfants} enfant(s)
- Résidence : ${p.ville}, fiscalité ${p.residence_fiscale}
- Statut pro : ${p.statut} — ${p.secteur}
- Revenus nets foyer : ${p.revenus}€/an
- Revenus exceptionnels : ${p.revenus_excep}€
- Horizon : ${p.horizon}
- Projets : ${p.projets}
- Capacité d'épargne : ${p.epargne_mensuelle}€/mois

PATRIMOINE FINANCIER
- Comptes courants : ${pat.comptes_courants}€
- Livrets (A/LDDS/LEP) : ${pat.livrets}€
- Assurance-vie : ${pat.av_total}€ (dont fonds euro ${pat.av_euro}€, ancienneté ${pat.av_anciennete} ans)
- PER : ${pat.per}€
- PEA : ${pat.pea}€ (ancienneté ${pat.pea_anciennete} ans)
- CTO : ${pat.cto}€
- SCPI en direct : ${pat.scpi}€
- Crypto : ${pat.crypto}€
- Épargne salariale : ${pat.epargne_salariale}€

PATRIMOINE IMMOBILIER
${biens || 'Aucun bien renseigné'}

PASSIFS
- Crédits conso : ${pat.credits_conso}€
- Autres dettes : ${pat.autres_dettes}€

SITUATION FISCALE
- TMI : ${fis.tmi}%
- RFR : ${fis.rfr}€
- Parts fiscales : ${fis.parts}
- Option capital : ${fis.option_capital}
- IFI : ${fis.ifi}${fis.ifi === 'oui' ? ` (base ${fis.ifi_base}€)` : ''}
- Plafond PER disponible : ${fis.plafond_per}€
- PV latentes : ${fis.pv_latentes}€
- Niches utilisées : ${(fis.niches || []).join(', ') || 'aucune'}

PROFIL INVESTISSEUR
- Réaction perte -15% : ${inv.reaction_perte}
- Profil déclaratif : ${inv.profil}
- Rendement cible : ${inv.rendement_cible}%
- Priorité : ${inv.priorite}
- Liquidité : ${inv.liquidite}
- Expérience : ${inv.experience}
- Rapport à la dette : ${inv.rapport_dette}
- Taux d'endettement actuel : ${inv.taux_endettement}%
- Capacité d'emprunt résiduelle : ${inv.capacite_emprunt}€/mois

Produis une analyse patrimoniale complète et structurée avec :
1. Un bilan synthétique (actifs, passifs, patrimoine net, déséquilibres identifiés)
2. 3 à 5 scénarios d'optimisation détaillés avec projections chiffrées à 5, 10 et 20 ans, impact fiscal annuel estimé, actions concrètes ordonnées et risques

Utilise les hypothèses de marché 2025 : Livret A 3%, fonds euro 2.5-3.5%, ETF monde 6-8%/an, taux crédit immo 3.3-3.8%, SCPI 4.5-5.5%, private equity 8-12%.
Distingue toujours rendement brut / net de frais / net de fiscalité.`;
}

export default function App() {
  const [view, setView] = useState('welcome'); // welcome | form | loading | results
  const [currentPhase, setCurrentPhase] = useState(1);
  const [formData, setFormData] = useState(null);
  const [analysisText, setAnalysisText] = useState('');
  const [error, setError] = useState(null);

  const handleStartNew = () => {
    setView('form');
    setCurrentPhase(1);
    setError(null);
  };

  const handleSubmit = async (data) => {
    setFormData(data);
    setView('loading');
    setError(null);

    const prompt = buildPrompt(data);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Erreur ${response.status}`);
      }

      const result = await response.json();
      setAnalysisText(result.reply);
      setView('results');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'analyse. Veuillez réessayer.');
      setView('form');
    }
  };

  const handleReset = () => {
    setView('welcome');
    setFormData(null);
    setAnalysisText('');
    setError(null);
    setCurrentPhase(1);
  };

  return (
    <div className="app">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-mark">P</div>
          <span className="topbar-name">PatriConseil</span>
        </div>
        <div className="topbar-sep" />
        <span className="topbar-sub">Outil d'analyse patrimoniale</span>
        <div className="topbar-spacer" />
        {(view === 'form' || view === 'results') && (
          <button className="topbar-btn" onClick={handleReset}>
            Nouveau dossier
          </button>
        )}
      </div>

      <div className="main-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Saisie client</div>
            {PHASES.map(ph => (
              <button
                key={ph.id}
                className={`sidebar-item ${view === 'form' && currentPhase === ph.id ? 'active' : ''} ${view === 'results' || (view === 'form' && currentPhase > ph.id) ? 'done' : ''}`}
                onClick={() => { if (view === 'form') setCurrentPhase(ph.id); }}
              >
                <div className="sidebar-item-num">
                  {(view === 'results' || (view === 'form' && currentPhase > ph.id)) ? '✓' : ph.id}
                </div>
                {ph.label}
              </button>
            ))}
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <div className="sidebar-label">Résultats</div>
            <button
              className={`sidebar-item ${view === 'results' ? 'active' : ''}`}
              onClick={() => { if (view === 'results') {} }}
            >
              <div className="sidebar-item-num">{view === 'results' ? '✓' : '5'}</div>
              Analyse & scénarios
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {error && (
            <div className="error-bar">
              ⚠ {error}
            </div>
          )}

          {view === 'welcome' && (
            <div className="welcome fade-in">
              <div className="welcome-badge">
                ◈ Outil professionnel CGP
              </div>
              <h1>Analyse patrimoniale<br />personnalisée</h1>
              <p>
                Saisissez le profil complet de votre client en 4 étapes et obtenez une analyse patrimoniale détaillée avec scénarios d'optimisation chiffrés.
              </p>
              <div className="welcome-grid">
                <div className="welcome-card">
                  <div className="welcome-card-icon">📋</div>
                  <h3>Bilan complet</h3>
                  <p>Actifs, passifs, répartition et déséquilibres identifiés automatiquement</p>
                </div>
                <div className="welcome-card">
                  <div className="welcome-card-icon">📊</div>
                  <h3>Scénarios chiffrés</h3>
                  <p>3 à 5 stratégies avec projections à 5, 10 et 20 ans et impact fiscal</p>
                </div>
                <div className="welcome-card">
                  <div className="welcome-card-icon">⚡</div>
                  <h3>Analyse IA</h3>
                  <p>Recommandations calibrées sur les conditions de marché 2025</p>
                </div>
              </div>
              <button className="btn-primary" onClick={handleStartNew}>
                Nouveau dossier client →
              </button>
            </div>
          )}

          {view === 'form' && (
            <PhaseForm
              onSubmit={handleSubmit}
              isLoading={false}
            />
          )}

          {view === 'loading' && (
            <div className="loading-overlay fade-in">
              <div className="loading-spinner" />
              <div className="loading-title">Analyse en cours...</div>
              <div className="loading-sub">
                Le conseiller IA analyse le profil patrimonial et génère les scénarios.<br />
                Cela peut prendre 20 à 40 secondes.
              </div>
            </div>
          )}

          {view === 'results' && (
            <Dashboard
              formData={formData}
              analysisText={analysisText}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
