import React, { useState } from 'react';

// ─── Composants de base ───

function Field({ label, hint, children }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', prefix }) {
  if (prefix) {
    return (
      <div className="form-input-prefix" data-prefix={prefix}>
        <input
          type={type}
          className="form-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }
  return (
    <input
      type={type}
      className="form-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select className="form-input" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">— Sélectionner</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function RadioGroup({ value, onChange, options }) {
  return (
    <div className="form-radio-group">
      {options.map(o => (
        <div
          key={o.value}
          className={`form-radio ${value === o.value ? 'selected' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </div>
      ))}
    </div>
  );
}

// ─── Bloc immobilier répétable ───

function ImmoBlock({ bien, index, onChange, onRemove }) {
  const set = (key, val) => onChange(index, { ...bien, [key]: val });

  return (
    <div className="immo-block">
      <div className="immo-block-header">
        <span className="immo-block-title">Bien immobilier #{index + 1}</span>
        {index > 0 && (
          <button className="btn-remove" onClick={() => onRemove(index)}>×</button>
        )}
      </div>
      <div className="form-grid">
        <Field label="Nature">
          <Select
            value={bien.nature}
            onChange={v => set('nature', v)}
            options={[
              { value: 'residence_principale', label: 'Résidence principale' },
              { value: 'residence_secondaire', label: 'Résidence secondaire' },
              { value: 'locatif', label: 'Investissement locatif' },
            ]}
          />
        </Field>
        <Field label="Localisation">
          <Input value={bien.localisation} onChange={v => set('localisation', v)} placeholder="Paris 16e, Lyon..." />
        </Field>
        <Field label="Valeur de marché estimée">
          <Input value={bien.valeur} onChange={v => set('valeur', v)} placeholder="350 000" prefix="€" type="number" />
        </Field>
        <Field label="Capital restant dû">
          <Input value={bien.crd} onChange={v => set('crd', v)} placeholder="0" prefix="€" type="number" />
        </Field>
        {bien.nature === 'locatif' && (
          <>
            <Field label="Loyers bruts annuels">
              <Input value={bien.loyers} onChange={v => set('loyers', v)} placeholder="14 400" prefix="€" type="number" />
            </Field>
            <Field label="Régime fiscal">
              <Select
                value={bien.regime}
                onChange={v => set('regime', v)}
                options={[
                  { value: 'nu_micro', label: 'Nu — micro-foncier' },
                  { value: 'nu_reel', label: 'Nu — régime réel' },
                  { value: 'lmnp_micro', label: 'LMNP — micro-BIC' },
                  { value: 'lmnp_reel', label: 'LMNP — régime réel' },
                  { value: 'sci_ir', label: 'SCI à l\'IR' },
                  { value: 'sci_is', label: 'SCI à l\'IS' },
                ]}
              />
            </Field>
          </>
        )}
        {bien.crd > 0 && (
          <>
            <Field label="Taux du crédit">
              <Input value={bien.taux} onChange={v => set('taux', v)} placeholder="3.5" prefix="%" type="number" />
            </Field>
            <Field label="Durée résiduelle (années)">
              <Input value={bien.duree} onChange={v => set('duree', v)} placeholder="18" type="number" />
            </Field>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PHASE 1 — Profil personnel ───

function Phase1({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div>
      <div className="form-section">
        <div className="form-section-title">Identité & situation</div>
        <div className="form-grid">
          <Field label="Prénom du client">
            <Input value={data.prenom} onChange={v => set('prenom', v)} placeholder="Marie" />
          </Field>
          <Field label="Âge">
            <Input value={data.age} onChange={v => set('age', v)} placeholder="42" type="number" />
          </Field>
          <Field label="Situation familiale">
            <Select
              value={data.situation}
              onChange={v => set('situation', v)}
              options={[
                { value: 'celibataire', label: 'Célibataire' },
                { value: 'marie', label: 'Marié(e)' },
                { value: 'pacse', label: 'Pacsé(e)' },
                { value: 'concubinage', label: 'Concubinage' },
                { value: 'divorce', label: 'Divorcé(e)' },
                { value: 'veuf', label: 'Veuf/Veuve' },
              ]}
            />
          </Field>
          <Field label="Nombre d'enfants à charge">
            <Input value={data.enfants} onChange={v => set('enfants', v)} placeholder="2" type="number" />
          </Field>
          <Field label="Ville / Département">
            <Input value={data.ville} onChange={v => set('ville', v)} placeholder="Paris (75)" />
          </Field>
          <Field label="Résidence fiscale">
            <Select
              value={data.residence_fiscale}
              onChange={v => set('residence_fiscale', v)}
              options={[
                { value: 'france', label: 'France' },
                { value: 'etranger', label: 'Expatrié' },
              ]}
            />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Situation professionnelle</div>
        <div className="form-grid">
          <Field label="Statut">
            <Select
              value={data.statut}
              onChange={v => set('statut', v)}
              options={[
                { value: 'salarie_cadre', label: 'Salarié cadre' },
                { value: 'salarie_nc', label: 'Salarié non-cadre' },
                { value: 'fonctionnaire', label: 'Fonctionnaire' },
                { value: 'independant', label: 'Indépendant / Freelance' },
                { value: 'dirigeant', label: 'Chef d\'entreprise / Dirigeant' },
                { value: 'liberal', label: 'Profession libérale' },
                { value: 'retraite', label: 'Retraité(e)' },
                { value: 'sans', label: 'Sans activité' },
              ]}
            />
          </Field>
          <Field label="Secteur d'activité">
            <Input value={data.secteur} onChange={v => set('secteur', v)} placeholder="Finance, santé, tech..." />
          </Field>
          <Field label="Revenus nets annuels du foyer" hint="Après impôts, hors revenus du capital">
            <Input value={data.revenus} onChange={v => set('revenus', v)} placeholder="85 000" prefix="€" type="number" />
          </Field>
          <Field label="Revenus exceptionnels attendus" hint="Bonus, cession, héritage...">
            <Input value={data.revenus_excep} onChange={v => set('revenus_excep', v)} placeholder="0" prefix="€" type="number" />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Projets & horizon</div>
        <div className="form-grid">
          <Field label="Horizon d'investissement principal">
            <RadioGroup
              value={data.horizon}
              onChange={v => set('horizon', v)}
              options={[
                { value: 'court', label: '< 3 ans' },
                { value: 'moyen', label: '3–10 ans' },
                { value: 'long', label: '> 10 ans' },
              ]}
            />
          </Field>
          <Field label="Projets identifiés">
            <Input value={data.projets} onChange={v => set('projets', v)} placeholder="Retraite, achat RP, études enfants..." />
          </Field>
          <Field label="Capacité d'épargne mensuelle">
            <Input value={data.epargne_mensuelle} onChange={v => set('epargne_mensuelle', v)} placeholder="2 000" prefix="€" type="number" />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── PHASE 2 — Patrimoine ───

function Phase2({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  const addBien = () => {
    const biens = [...(data.biens_immo || []), {
      nature: '', localisation: '', valeur: '', crd: '', loyers: '', regime: '', taux: '', duree: ''
    }];
    set('biens_immo', biens);
  };

  const updateBien = (index, bien) => {
    const biens = [...(data.biens_immo || [])];
    biens[index] = bien;
    set('biens_immo', biens);
  };

  const removeBien = (index) => {
    const biens = (data.biens_immo || []).filter((_, i) => i !== index);
    set('biens_immo', biens);
  };

  return (
    <div>
      <div className="form-section">
        <div className="form-section-title">Épargne courante</div>
        <div className="form-grid">
          <Field label="Comptes courants">
            <Input value={data.comptes_courants} onChange={v => set('comptes_courants', v)} placeholder="8 000" prefix="€" type="number" />
          </Field>
          <Field label="Livret A + LDDS + LEP">
            <Input value={data.livrets} onChange={v => set('livrets', v)} placeholder="22 950" prefix="€" type="number" />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Épargne long terme</div>
        <div className="form-grid">
          <Field label="Assurance-vie — valeur totale">
            <Input value={data.av_total} onChange={v => set('av_total', v)} placeholder="120 000" prefix="€" type="number" />
          </Field>
          <Field label="Assurance-vie — dont fonds euro">
            <Input value={data.av_euro} onChange={v => set('av_euro', v)} placeholder="80 000" prefix="€" type="number" />
          </Field>
          <Field label="Ancienneté contrat AV (années)">
            <Input value={data.av_anciennete} onChange={v => set('av_anciennete', v)} placeholder="8" type="number" />
          </Field>
          <Field label="PER — encours">
            <Input value={data.per} onChange={v => set('per', v)} placeholder="35 000" prefix="€" type="number" />
          </Field>
          <Field label="PEA — encours" hint="Plafond versements 150 000 €">
            <Input value={data.pea} onChange={v => set('pea', v)} placeholder="50 000" prefix="€" type="number" />
          </Field>
          <Field label="PEA — ancienneté (années)">
            <Input value={data.pea_anciennete} onChange={v => set('pea_anciennete', v)} placeholder="5" type="number" />
          </Field>
          <Field label="Compte-titres ordinaire (CTO)">
            <Input value={data.cto} onChange={v => set('cto', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="SCPI en direct — valeur">
            <Input value={data.scpi} onChange={v => set('scpi', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Crypto-actifs">
            <Input value={data.crypto} onChange={v => set('crypto', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Épargne salariale (PEE/PERCOL)">
            <Input value={data.epargne_salariale} onChange={v => set('epargne_salariale', v)} placeholder="0" prefix="€" type="number" />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Patrimoine immobilier</div>
        {(data.biens_immo || []).map((bien, i) => (
          <ImmoBlock key={i} bien={bien} index={i} onChange={updateBien} onRemove={removeBien} />
        ))}
        <button className="btn-add" onClick={addBien}>
          + Ajouter un bien immobilier
        </button>
      </div>

      <div className="form-section">
        <div className="form-section-title">Autres dettes</div>
        <div className="form-grid">
          <Field label="Crédits à la consommation">
            <Input value={data.credits_conso} onChange={v => set('credits_conso', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Autres dettes">
            <Input value={data.autres_dettes} onChange={v => set('autres_dettes', v)} placeholder="0" prefix="€" type="number" />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── PHASE 3 — Fiscalité ───

function Phase3({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div>
      <div className="form-section">
        <div className="form-section-title">Imposition sur le revenu</div>
        <div className="form-grid">
          <Field label="Tranche Marginale d'Imposition (TMI)">
            <RadioGroup
              value={data.tmi}
              onChange={v => set('tmi', v)}
              options={[
                { value: '0', label: '0 %' },
                { value: '11', label: '11 %' },
                { value: '30', label: '30 %' },
                { value: '41', label: '41 %' },
                { value: '45', label: '45 %' },
              ]}
            />
          </Field>
          <Field label="Revenu fiscal de référence (RFR)">
            <Input value={data.rfr} onChange={v => set('rfr', v)} placeholder="75 000" prefix="€" type="number" />
          </Field>
          <Field label="Nombre de parts fiscales">
            <Input value={data.parts} onChange={v => set('parts', v)} placeholder="2.5" type="number" />
          </Field>
          <Field label="Option pour revenus du capital">
            <RadioGroup
              value={data.option_capital}
              onChange={v => set('option_capital', v)}
              options={[
                { value: 'pfu', label: 'Flat tax 30 %' },
                { value: 'bareme', label: 'Barème IR' },
              ]}
            />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">IFI & situations spéciales</div>
        <div className="form-grid">
          <Field label="Assujetti à l'IFI ?">
            <RadioGroup
              value={data.ifi}
              onChange={v => set('ifi', v)}
              options={[
                { value: 'non', label: 'Non' },
                { value: 'oui', label: 'Oui' },
              ]}
            />
          </Field>
          {data.ifi === 'oui' && (
            <Field label="Base IFI approximative">
              <Input value={data.ifi_base} onChange={v => set('ifi_base', v)} placeholder="1 500 000" prefix="€" type="number" />
            </Field>
          )}
          <Field label="Plafond épargne retraite disponible" hint="Visible sur avis d'imposition">
            <Input value={data.plafond_per} onChange={v => set('plafond_per', v)} placeholder="12 000" prefix="€" type="number" />
          </Field>
          <Field label="Plus-values latentes (actions/CTO)">
            <Input value={data.pv_latentes} onChange={v => set('pv_latentes', v)} placeholder="0" prefix="€" type="number" />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Niches fiscales déjà utilisées</div>
        <Field label="Dispositifs en cours">
          <div className="form-radio-group" style={{ flexWrap: 'wrap' }}>
            {[
              { value: 'deficit_foncier', label: 'Déficit foncier' },
              { value: 'scpi_fiscales', label: 'SCPI fiscales' },
              { value: 'fcpi_fip', label: 'FCPI / FIP' },
              { value: 'dons', label: 'Dons associations' },
              { value: 'per_deductible', label: 'PER déductible' },
              { value: 'pinel', label: 'Pinel' },
              { value: 'malraux', label: 'Malraux' },
              { value: 'aucun', label: 'Aucun' },
            ].map(o => {
              const selected = (data.niches || []).includes(o.value);
              return (
                <div
                  key={o.value}
                  className={`form-radio ${selected ? 'selected' : ''}`}
                  onClick={() => {
                    const current = data.niches || [];
                    const next = selected
                      ? current.filter(v => v !== o.value)
                      : [...current, o.value];
                    set('niches', next);
                  }}
                >
                  {o.label}
                </div>
              );
            })}
          </div>
        </Field>
      </div>
    </div>
  );
}

// ─── PHASE 4 — Profil investisseur ───

function Phase4({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div>
      <div className="form-section">
        <div className="form-section-title">Tolérance au risque</div>
        <div className="form-grid">
          <Field label="Réaction à une perte de 15 % en 6 mois" hint="">
            <RadioGroup
              value={data.reaction_perte}
              onChange={v => set('reaction_perte', v)}
              options={[
                { value: 'vendre', label: 'Je vends tout' },
                { value: 'attendre', label: 'J\'attends' },
                { value: 'investir', label: 'J\'en profite pour investir' },
              ]}
            />
          </Field>
          <Field label="Profil déclaratif">
            <RadioGroup
              value={data.profil}
              onChange={v => set('profil', v)}
              options={[
                { value: 'defensif', label: 'Défensif' },
                { value: 'equilibre', label: 'Équilibré' },
                { value: 'dynamique', label: 'Dynamique' },
                { value: 'offensif', label: 'Offensif' },
              ]}
            />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Objectifs de rendement</div>
        <div className="form-grid">
          <Field label="Rendement cible annuel net">
            <RadioGroup
              value={data.rendement_cible}
              onChange={v => set('rendement_cible', v)}
              options={[
                { value: '<2', label: '< 2 %' },
                { value: '2-4', label: '2–4 %' },
                { value: '4-7', label: '4–7 %' },
                { value: '>7', label: '> 7 %' },
              ]}
            />
          </Field>
          <Field label="Priorité">
            <RadioGroup
              value={data.priorite}
              onChange={v => set('priorite', v)}
              options={[
                { value: 'revenus', label: 'Revenus réguliers' },
                { value: 'capitalisation', label: 'Capitalisation long terme' },
                { value: 'mixte', label: 'Mixte' },
              ]}
            />
          </Field>
          <Field label="Besoin de liquidité">
            <RadioGroup
              value={data.liquidite}
              onChange={v => set('liquidite', v)}
              options={[
                { value: 'totale', label: 'Totale' },
                { value: 'partielle', label: 'Partielle' },
                { value: 'bloquee', label: 'Horizon bloqué OK' },
              ]}
            />
          </Field>
          <Field label="Expérience investisseur">
            <RadioGroup
              value={data.experience}
              onChange={v => set('experience', v)}
              options={[
                { value: 'debutant', label: 'Débutant' },
                { value: 'intermediaire', label: 'Intermédiaire' },
                { value: 'experimente', label: 'Expérimenté' },
              ]}
            />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Capacité d'endettement</div>
        <div className="form-grid">
          <Field label="Rapport à la dette">
            <RadioGroup
              value={data.rapport_dette}
              onChange={v => set('rapport_dette', v)}
              options={[
                { value: 'aversion', label: 'Aversion' },
                { value: 'neutre', label: 'Neutre' },
                { value: 'favorable', label: 'Favorable' },
              ]}
            />
          </Field>
          <Field label="Taux d'endettement actuel" hint="Mensualités / revenus nets">
            <Input value={data.taux_endettement} onChange={v => set('taux_endettement', v)} placeholder="28" prefix="%" type="number" />
          </Field>
          <Field label="Capacité d'emprunt résiduelle mensuelle" hint="Estimation">
            <Input value={data.capacite_emprunt} onChange={v => set('capacite_emprunt', v)} placeholder="800" prefix="€" type="number" />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ───

const PHASES = [
  { id: 1, label: 'Profil personnel', Component: Phase1, key: 'profil' },
  { id: 2, label: 'Patrimoine', Component: Phase2, key: 'patrimoine' },
  { id: 3, label: 'Fiscalité', Component: Phase3, key: 'fiscalite' },
  { id: 4, label: 'Profil investisseur', Component: Phase4, key: 'investisseur' },
];

export default function PhaseForm({ onSubmit, isLoading }) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [formData, setFormData] = useState({
    profil: { prenom: '', age: '', situation: '', enfants: '0', ville: '', residence_fiscale: 'france', statut: '', secteur: '', revenus: '', revenus_excep: '0', horizon: '', projets: '', epargne_mensuelle: '' },
    patrimoine: { comptes_courants: '', livrets: '', av_total: '', av_euro: '', av_anciennete: '', per: '0', pea: '0', pea_anciennete: '0', cto: '0', scpi: '0', crypto: '0', epargne_salariale: '0', biens_immo: [{ nature: '', localisation: '', valeur: '', crd: '0', loyers: '', regime: '', taux: '', duree: '' }], credits_conso: '0', autres_dettes: '0' },
    fiscalite: { tmi: '', rfr: '', parts: '', option_capital: 'pfu', ifi: 'non', ifi_base: '0', plafond_per: '', pv_latentes: '0', niches: [] },
    investisseur: { reaction_perte: '', profil: '', rendement_cible: '', priorite: '', liquidite: '', experience: '', rapport_dette: '', taux_endettement: '', capacite_emprunt: '' },
  });

  const phase = PHASES[currentPhase - 1];
  const PhaseComponent = phase.Component;

  const handlePhaseData = (data) => {
    setFormData(prev => ({ ...prev, [phase.key]: data }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="phase-container fade-in">
      <div className="phase-header">
        <div className="phase-header-top">
          <div className="phase-num">{currentPhase}</div>
          <h2 className="phase-title">{phase.label}</h2>
        </div>
        <div className="phase-desc">
          Étape {currentPhase} sur {PHASES.length}
        </div>
      </div>

      <PhaseComponent
        data={formData[phase.key]}
        onChange={handlePhaseData}
      />

      <div className="phase-nav">
        {currentPhase > 1 && (
          <button className="btn-secondary" onClick={() => setCurrentPhase(p => p - 1)}>
            ← Précédent
          </button>
        )}
        <div className="phase-nav-spacer" />
        {currentPhase < PHASES.length ? (
          <button className="btn-primary" onClick={() => setCurrentPhase(p => p + 1)}>
            Suivant →
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Analyse en cours...' : 'Lancer l\'analyse IA →'}
          </button>
        )}
      </div>
    </div>
  );
}

export { PHASES };
