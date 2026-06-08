import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function formatEuros(n) {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${color || ''}`}>{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function ScenarioCard({ scenario, index }) {
  const [expanded, setExpanded] = useState(false);

  const badgeClass = {
    'fiscal': 'badge-fiscal',
    'immobilier': 'badge-immo',
    'marché': 'badge-marche',
    'marche': 'badge-marche',
    'retraite': 'badge-retraite',
    'transmission': 'badge-transmission',
  };

  const getBadge = (title) => {
    const t = title.toLowerCase();
    if (t.includes('fiscal')) return { cls: 'badge-fiscal', label: 'Fiscalité' };
    if (t.includes('immo')) return { cls: 'badge-immo', label: 'Immobilier' };
    if (t.includes('retraite')) return { cls: 'badge-retraite', label: 'Retraite' };
    if (t.includes('transmission') || t.includes('succession')) return { cls: 'badge-transmission', label: 'Transmission' };
    return { cls: 'badge-marche', label: 'Marchés financiers' };
  };

  const badge = getBadge(scenario.title || '');

  return (
    <div
      className={`scenario-card ${expanded ? 'expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="scenario-card-top">
        <span className={`scenario-badge ${badge.cls}`}>{badge.label}</span>
      </div>
      <div className="scenario-title">{scenario.title}</div>
      <div className="scenario-objective">{scenario.objective}</div>

      {scenario.projections && (
        <div className="scenario-projections">
          {scenario.projections.map((p, i) => (
            <div className="proj-item" key={i}>
              <div className="proj-horizon">{p.horizon}</div>
              <div className="proj-value">{p.value}</div>
              <div className="proj-sub">{p.sub}</div>
            </div>
          ))}
        </div>
      )}

      <div className="scenario-expand-hint">
        {expanded ? '▲ Réduire' : '▼ Voir le détail'}
      </div>

      <div className="scenario-detail">
        <div className="scenario-detail-grid">
          {scenario.actions && (
            <div className="detail-block">
              <h4>Actions recommandées</h4>
              <ul>
                {scenario.actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          {scenario.risks && (
            <div className="detail-block">
              <h4>Risques identifiés</h4>
              <div>
                {scenario.risks.map((r, i) => (
                  <span key={i} className="risk-pill">⚠ {r}</span>
                ))}
              </div>
            </div>
          )}
          {scenario.fiscal_impact && (
            <div className="detail-block">
              <h4>Impact fiscal estimé</h4>
              <ul><li>{scenario.fiscal_impact}</li></ul>
            </div>
          )}
          {scenario.effort && (
            <div className="detail-block">
              <h4>Effort requis</h4>
              <ul>
                <li>Complexité : {scenario.effort}</li>
                {scenario.liquidity && <li>Liquidité : {scenario.liquidity}</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function parseAnalysis(rawText) {
  // Tente d'extraire des scénarios structurés du texte brut IA
  // Si le texte est en markdown, on le parse pour extraire les infos clés
  const scenarios = [];
  const lines = rawText.split('\n');
  
  let currentScenario = null;
  let inActions = false;
  let inRisks = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Détection d'un nouveau scénario (ligne avec ** et majuscule)
    if ((line.startsWith('**') || line.startsWith('## ') || line.startsWith('### ')) &&
        (line.toLowerCase().includes('scénario') || line.toLowerCase().includes('scenario') ||
         line.toLowerCase().includes('optimisation') || line.toLowerCase().includes('stratégie') ||
         line.toLowerCase().includes('retraite') || line.toLowerCase().includes('transmission') ||
         line.toLowerCase().includes('immobilier') || line.toLowerCase().includes('fiscal'))) {
      
      if (currentScenario) scenarios.push(currentScenario);
      currentScenario = {
        title: line.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim(),
        objective: '',
        actions: [],
        risks: [],
        projections: [],
        fiscal_impact: '',
        effort: '',
      };
      inActions = false;
      inRisks = false;
    } else if (currentScenario) {
      const lower = line.toLowerCase();
      
      if (lower.includes('objectif') || lower.includes('logique')) {
        inActions = false; inRisks = false;
      } else if (lower.includes('action') || lower.includes('recommand')) {
        inActions = true; inRisks = false;
      } else if (lower.includes('risque')) {
        inActions = false; inRisks = true;
      } else if (lower.includes('fiscal') && lower.includes('impact')) {
        inActions = false; inRisks = false;
      }

      if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
        const content = line.replace(/^[-•\d.]\s*/, '').trim();
        if (content) {
          if (inActions) currentScenario.actions.push(content);
          else if (inRisks) currentScenario.risks.push(content);
        }
      }

      if (!currentScenario.objective && line.length > 20 && !line.startsWith('#') && !line.startsWith('*') && !line.startsWith('-')) {
        currentScenario.objective = line.replace(/\*\*/g, '').trim();
      }

      // Projections
      const projMatch = line.match(/(\d+)\s*ans?\s*[:\-–]\s*([\d\s€kKmM,.]+)/i);
      if (projMatch && currentScenario.projections.length < 3) {
        currentScenario.projections.push({
          horizon: projMatch[1] + ' ans',
          value: projMatch[2].trim(),
          sub: '',
        });
      }
    }
  }

  if (currentScenario) scenarios.push(currentScenario);
  return scenarios.filter(s => s.title.length > 3);
}

export default function Dashboard({ formData, analysisText, onReset }) {
  const scenarios = parseAnalysis(analysisText);
  const profil = formData?.profil || {};
  const patrimoine = formData?.patrimoine || {};
  const fiscalite = formData?.fiscalite || {};
  const investisseur = formData?.investisseur || {};

  // Calculs bilan
  const actifFinancier =
    (parseFloat(patrimoine.comptes_courants) || 0) +
    (parseFloat(patrimoine.livrets) || 0) +
    (parseFloat(patrimoine.av_total) || 0) +
    (parseFloat(patrimoine.per) || 0) +
    (parseFloat(patrimoine.pea) || 0) +
    (parseFloat(patrimoine.cto) || 0) +
    (parseFloat(patrimoine.scpi) || 0) +
    (parseFloat(patrimoine.crypto) || 0) +
    (parseFloat(patrimoine.epargne_salariale) || 0);

  const actifImmo = (patrimoine.biens_immo || []).reduce((sum, b) => sum + (parseFloat(b.valeur) || 0), 0);
  const passifImmo = (patrimoine.biens_immo || []).reduce((sum, b) => sum + (parseFloat(b.crd) || 0), 0);
  const autresPassifs = (parseFloat(patrimoine.credits_conso) || 0) + (parseFloat(patrimoine.autres_dettes) || 0);
  const totalActifs = actifFinancier + actifImmo;
  const totalPassifs = passifImmo + autresPassifs;
  const patrimoineNet = totalActifs - totalPassifs;

  const bars = [
    { label: 'Immobilier brut', val: actifImmo, color: '#c17f3e' },
    { label: 'Actifs financiers', val: actifFinancier, color: '#1c2b4a' },
    { label: 'Dettes totales', val: totalPassifs, color: '#c0392b' },
  ].filter(b => b.val > 0);

  const maxVal = Math.max(...bars.map(b => b.val), 1);

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-client">
            Analyse patrimoniale — {profil.prenom || 'Client'}
          </div>
          <div className="dashboard-date">Généré le {today} · TMI {fiscalite.tmi || '—'} % · Profil {investisseur.profil || '—'}</div>
        </div>
        <button className="btn-secondary" onClick={onReset}>
          Nouveau dossier
        </button>
      </div>

      {/* Métriques clés */}
      <div className="metrics-grid">
        <MetricCard
          label="Patrimoine net"
          value={formatEuros(patrimoineNet)}
          sub="Actifs bruts − dettes"
          color={patrimoineNet > 0 ? 'green' : 'red'}
        />
        <MetricCard
          label="Actifs bruts totaux"
          value={formatEuros(totalActifs)}
          sub={`Immo ${Math.round(actifImmo / totalActifs * 100) || 0}% · Financier ${Math.round(actifFinancier / totalActifs * 100) || 0}%`}
        />
        <MetricCard
          label="Revenus annuels nets"
          value={formatEuros(parseFloat(profil.revenus) || 0)}
          sub={`Épargne ~${formatEuros((parseFloat(profil.epargne_mensuelle) || 0) * 12)}/an`}
        />
        <MetricCard
          label="Endettement"
          value={formatEuros(totalPassifs)}
          sub={`Taux ${investisseur.taux_endettement || '—'} %`}
          color={totalPassifs > 0 ? 'accent' : ''}
        />
      </div>

      {/* Répartition */}
      {bars.length > 0 && (
        <div className="bilan-section">
          <div className="bilan-section-title">Répartition du patrimoine</div>
          <div className="bilan-bars">
            {bars.map((b, i) => (
              <div className="bilan-bar-row" key={i}>
                <div className="bilan-bar-label">{b.label}</div>
                <div className="bilan-bar-track">
                  <div
                    className="bilan-bar-fill"
                    style={{ width: `${(b.val / maxVal) * 100}%`, background: b.color }}
                  />
                </div>
                <div className="bilan-bar-pct">{Math.round(b.val / totalActifs * 100) || 0}%</div>
                <div className="bilan-bar-val">{formatEuros(b.val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyse narrative complète */}
      <div className="bilan-section">
        <div className="bilan-section-title">Analyse complète</div>
        <div style={{ fontSize: '13.5px', color: 'var(--text-mid)', lineHeight: '1.7' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {analysisText}
          </ReactMarkdown>
        </div>
      </div>

      {/* Scénarios extraits */}
      {scenarios.length > 0 && (
        <>
          <div className="scenarios-title">Scénarios d'optimisation</div>
          <div className="scenarios-grid">
            {scenarios.map((s, i) => (
              <ScenarioCard key={i} scenario={s} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
