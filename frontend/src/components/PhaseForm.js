import React, { useState } from 'react';

// ─── Composants de base ───

function Field({ label, hint, children, full }) {
  return (
    <div className={`form-field${full ? ' form-full' : ''}`}>
      <label className="form-label">{label}</label>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', prefix, disabled }) {
  if (prefix) {
    return (
      <div className="form-input-prefix" data-prefix={prefix}>
        <input type={type} className="form-input" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} />
      </div>
    );
  }
  return <input type={type} className="form-input" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} />;
}

function Select({ value, onChange, options, placeholder = '— Sélectionner' }) {
  return (
    <select className="form-input" value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function RadioGroup({ value, onChange, options }) {
  return (
    <div className="form-radio-group">
      {options.map(o => (
        <div key={o.value} className={`form-radio ${value === o.value ? 'selected' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </div>
      ))}
    </div>
  );
}

function CheckGroup({ values = [], onChange, options }) {
  const toggle = (val) => {
    const next = values.includes(val) ? values.filter(v => v !== val) : [...values, val];
    onChange(next);
  };
  return (
    <div className="form-radio-group" style={{ flexWrap: 'wrap' }}>
      {options.map(o => (
        <div key={o.value} className={`form-radio ${values.includes(o.value) ? 'selected' : ''}`} onClick={() => toggle(o.value)}>
          {o.label}
        </div>
      ))}
    </div>
  );
}

// ─── Bloc crédit détaillé ───
function CreditBlock({ credit, index, onChange, onRemove }) {
  const set = (key, val) => onChange(index, { ...credit, [key]: val });
  return (
    <div className="immo-block">
      <div className="immo-block-header">
        <span className="immo-block-title">Crédit #{index + 1}</span>
        <button className="btn-remove" onClick={() => onRemove(index)}>×</button>
      </div>
      <div className="form-grid">
        <Field label="Type de crédit">
          <Select value={credit.type} onChange={v => set('type', v)} options={[
            { value: 'immobilier_rp', label: 'Immobilier — Résidence principale' },
            { value: 'immobilier_locatif', label: 'Immobilier — Locatif' },
            { value: 'etudiant', label: 'Crédit étudiant' },
            { value: 'auto', label: 'Crédit auto' },
            { value: 'conso', label: 'Crédit à la consommation' },
            { value: 'travaux', label: 'Crédit travaux' },
            { value: 'autre', label: 'Autre' },
          ]} />
        </Field>
        <Field label="Capital restant dû">
          <Input value={credit.crd} onChange={v => set('crd', v)} placeholder="45 000" prefix="€" type="number" />
        </Field>
        <Field label="Taux d'intérêt">
          <Input value={credit.taux} onChange={v => set('taux', v)} placeholder="3.5" prefix="%" type="number" />
        </Field>
        <Field label="Mensualité">
          <Input value={credit.mensualite} onChange={v => set('mensualite', v)} placeholder="650" prefix="€" type="number" />
        </Field>
        <Field label="Durée résiduelle (mois)">
          <Input value={credit.duree_restante} onChange={v => set('duree_restante', v)} placeholder="48" type="number" />
        </Field>
        <Field label="Date de fin estimée">
          <Input value={credit.date_fin} onChange={v => set('date_fin', v)} placeholder="2028" type="number" />
        </Field>
      </div>
    </div>
  );
}

// ─── Bloc bien immobilier ───
function ImmoBlock({ bien, index, onChange, onRemove, perimetre }) {
  const set = (key, val) => onChange(index, { ...bien, [key]: val });
  const isCouple = perimetre === 'couple_communaute' || perimetre === 'couple_separation';
  return (
    <div className="immo-block">
      <div className="immo-block-header">
        <span className="immo-block-title">Bien #{index + 1}</span>
        {index > 0 && <button className="btn-remove" onClick={() => onRemove(index)}>×</button>}
      </div>
      <div className="form-grid">
        <Field label="Nature du bien">
          <Select value={bien.nature} onChange={v => set('nature', v)} options={[
            { value: 'residence_principale', label: 'Résidence principale' },
            { value: 'residence_secondaire', label: 'Résidence secondaire' },
            { value: 'locatif_nu', label: 'Locatif nu' },
            { value: 'locatif_meuble', label: 'Locatif meublé (LMNP)' },
            { value: 'sci', label: 'Détenu via SCI' },
            { value: 'commercial', label: 'Local commercial / bureaux' },
            { value: 'terrain', label: 'Terrain' },
          ]} />
        </Field>
        <Field label="Localisation">
          <Input value={bien.localisation} onChange={v => set('localisation', v)} placeholder="Paris 16e, Lyon 6e..." />
        </Field>
        <Field label="Valeur de marché estimée">
          <Input value={bien.valeur} onChange={v => set('valeur', v)} placeholder="350 000" prefix="€" type="number" />
        </Field>
        <Field label="Année d'acquisition">
          <Input value={bien.annee_achat} onChange={v => set('annee_achat', v)} placeholder="2015" type="number" />
        </Field>
        <Field label="Prix d'acquisition (pour PV)">
          <Input value={bien.prix_achat} onChange={v => set('prix_achat', v)} placeholder="280 000" prefix="€" type="number" />
        </Field>
        {isCouple && (
          <Field label="Détenu par">
            <Select value={bien.detenteur} onChange={v => set('detenteur', v)} options={[
              { value: 'client', label: 'Client seul' },
              { value: 'conjoint', label: 'Conjoint seul' },
              { value: 'commun', label: 'En commun (indivision / communauté)' },
              { value: 'sci', label: 'SCI commune' },
            ]} />
          </Field>
        )}
        {(bien.nature === 'locatif_nu' || bien.nature === 'locatif_meuble' || bien.nature === 'sci' || bien.nature === 'commercial') && (
          <>
            <Field label="Loyers bruts annuels">
              <Input value={bien.loyers} onChange={v => set('loyers', v)} placeholder="14 400" prefix="€" type="number" />
            </Field>
            <Field label="Charges annuelles (copro, TF, entretien)">
              <Input value={bien.charges} onChange={v => set('charges', v)} placeholder="3 000" prefix="€" type="number" />
            </Field>
            <Field label="Régime fiscal">
              <Select value={bien.regime} onChange={v => set('regime', v)} options={[
                { value: 'nu_micro', label: 'Nu — micro-foncier (30% abattement)' },
                { value: 'nu_reel', label: 'Nu — régime réel' },
                { value: 'lmnp_micro', label: 'LMNP — micro-BIC (50% abattement)' },
                { value: 'lmnp_reel', label: 'LMNP — régime réel (amortissements)' },
                { value: 'sci_ir', label: 'SCI à l\'IR' },
                { value: 'sci_is', label: 'SCI à l\'IS' },
              ]} />
            </Field>
            <Field label="Dispositif fiscal en cours">
              <Select value={bien.dispositif} onChange={v => set('dispositif', v)} options={[
                { value: 'aucun', label: 'Aucun' },
                { value: 'pinel', label: 'Pinel' },
                { value: 'malraux', label: 'Malraux' },
                { value: 'deficit_foncier', label: 'Déficit foncier' },
                { value: 'denormandie', label: 'Denormandie' },
                { value: 'loc_avantageuse', label: 'Location avantageuse (Cosse)' },
              ]} />
            </Field>
          </>
        )}
        <Field label="Crédit en cours sur ce bien ?">
          <RadioGroup value={bien.a_credit} onChange={v => set('a_credit', v)} options={[
            { value: 'oui', label: 'Oui' },
            { value: 'non', label: 'Non' },
          ]} />
        </Field>
        {bien.a_credit === 'oui' && (
          <>
            <Field label="Capital restant dû">
              <Input value={bien.crd} onChange={v => set('crd', v)} placeholder="180 000" prefix="€" type="number" />
            </Field>
            <Field label="Taux du crédit">
              <Input value={bien.taux} onChange={v => set('taux', v)} placeholder="1.25" prefix="%" type="number" />
            </Field>
            <Field label="Mensualité">
              <Input value={bien.mensualite} onChange={v => set('mensualite', v)} placeholder="900" prefix="€" type="number" />
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

// ─── PHASE 1 — Périmètre & Profil ───
function Phase1({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  const isCouple = data.perimetre === 'couple_communaute' || data.perimetre === 'couple_separation';

  return (
    <div>
      <div className="form-section">
        <div className="form-section-title">Périmètre de l'analyse</div>
        <Field label="Cette analyse porte sur :" hint="Ce choix conditionne toute la saisie">
          <RadioGroup value={data.perimetre} onChange={v => set('perimetre', v)} options={[
            { value: 'individuel', label: 'Client seul' },
            { value: 'couple_communaute', label: 'Couple — communauté de biens' },
            { value: 'couple_separation', label: 'Couple — séparation de biens' },
          ]} />
        </Field>
      </div>

      <div className="form-section">
        <div className="form-section-title">Identité du client</div>
        <div className="form-grid">
          <Field label="Prénom">
            <Input value={data.prenom} onChange={v => set('prenom', v)} placeholder="Marie" />
          </Field>
          <Field label="Âge">
            <Input value={data.age} onChange={v => set('age', v)} placeholder="42" type="number" />
          </Field>
          <Field label="Situation familiale">
            <Select value={data.situation} onChange={v => set('situation', v)} options={[
              { value: 'celibataire', label: 'Célibataire' },
              { value: 'marie_communaute', label: 'Marié(e) — communauté réduite aux acquêts' },
              { value: 'marie_separation', label: 'Marié(e) — séparation de biens' },
              { value: 'marie_communaute_universelle', label: 'Marié(e) — communauté universelle' },
              { value: 'pacse_indivision', label: 'Pacsé(e) — indivision' },
              { value: 'pacse_separation', label: 'Pacsé(e) — séparation de biens' },
              { value: 'concubinage', label: 'Concubinage' },
              { value: 'divorce', label: 'Divorcé(e)' },
              { value: 'veuf', label: 'Veuf / Veuve' },
            ]} />
          </Field>
          <Field label="Nombre d'enfants" hint="Enfants à charge ou majeurs rattachés">
            <Input value={data.enfants} onChange={v => set('enfants', v)} placeholder="2" type="number" />
          </Field>
          <Field label="Âges des enfants" hint="Si pertinent pour la transmission">
            <Input value={data.ages_enfants} onChange={v => set('ages_enfants', v)} placeholder="8, 14" />
          </Field>
          <Field label="Ville / Département">
            <Input value={data.ville} onChange={v => set('ville', v)} placeholder="Paris (75)" />
          </Field>
          <Field label="Résidence fiscale">
            <Select value={data.residence_fiscale} onChange={v => set('residence_fiscale', v)} options={[
              { value: 'france', label: 'France métropolitaine' },
              { value: 'dom', label: 'DOM-TOM' },
              { value: 'expatrie', label: 'Expatrié (hors France)' },
            ]} />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Situation professionnelle — {data.prenom || 'Client'}</div>
        <div className="form-grid">
          <Field label="Statut professionnel">
            <Select value={data.statut} onChange={v => set('statut', v)} options={[
              { value: 'salarie_cadre', label: 'Salarié — Cadre' },
              { value: 'salarie_nc', label: 'Salarié — Non-cadre' },
              { value: 'fonctionnaire_a', label: 'Fonctionnaire — Catégorie A' },
              { value: 'fonctionnaire_bc', label: 'Fonctionnaire — Catégorie B/C' },
              { value: 'independant_ei', label: 'Indépendant — EI / micro-entreprise' },
              { value: 'independant_eurl', label: 'Indépendant — EURL / SARL' },
              { value: 'dirigeant_sas', label: 'Dirigeant — SAS / SA' },
              { value: 'liberal_bnc', label: 'Profession libérale — BNC' },
              { value: 'liberal_selas', label: 'Profession libérale — SEL' },
              { value: 'agriculteur', label: 'Exploitant agricole' },
              { value: 'retraite', label: 'Retraité(e)' },
              { value: 'sans', label: 'Sans activité' },
            ]} />
          </Field>
          <Field label="Secteur d'activité">
            <Select value={data.secteur} onChange={v => set('secteur', v)} options={[
              { value: 'finance_assurance', label: 'Finance / Assurance' },
              { value: 'sante', label: 'Santé / Médical' },
              { value: 'tech_numerique', label: 'Tech / Numérique' },
              { value: 'juridique', label: 'Droit / Notariat / Comptabilité' },
              { value: 'immobilier', label: 'Immobilier / Construction' },
              { value: 'industrie', label: 'Industrie / Ingénierie' },
              { value: 'commerce', label: 'Commerce / Distribution' },
              { value: 'education', label: 'Éducation / Recherche' },
              { value: 'fonction_publique', label: 'Fonction publique' },
              { value: 'liberal_medical', label: 'Libéral médical / paramédical' },
              { value: 'autre', label: 'Autre' },
            ]} />
          </Field>
          <Field label="Revenus nets annuels du client" hint="Salaire net après IR, hors revenus du capital">
            <Input value={data.revenus} onChange={v => set('revenus', v)} placeholder="65 000" prefix="€" type="number" />
          </Field>
          <Field label="Ancienneté dans le poste">
            <Select value={data.anciennete} onChange={v => set('anciennete', v)} options={[
              { value: '<1', label: 'Moins d\'1 an' },
              { value: '1-3', label: '1 à 3 ans' },
              { value: '3-10', label: '3 à 10 ans' },
              { value: '>10', label: 'Plus de 10 ans' },
            ]} />
          </Field>
          <Field label="Revenus variables ou exceptionnels attendus" hint="Bonus, intéressement, cession, héritage, dividendes...">
            <Input value={data.revenus_excep} onChange={v => set('revenus_excep', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Nature des revenus exceptionnels">
            <Select value={data.type_revenu_excep} onChange={v => set('type_revenu_excep', v)} options={[
              { value: 'aucun', label: 'Aucun' },
              { value: 'bonus', label: 'Bonus / Intéressement' },
              { value: 'dividendes', label: 'Dividendes' },
              { value: 'cession_entreprise', label: 'Cession d\'entreprise' },
              { value: 'heritage', label: 'Héritage attendu' },
              { value: 'plus_value_immo', label: 'Plus-value immobilière' },
              { value: 'autre', label: 'Autre' },
            ]} />
          </Field>
        </div>
      </div>

      {isCouple && (
        <div className="form-section">
          <div className="form-section-title">Situation professionnelle — Conjoint</div>
          <div className="form-grid">
            <Field label="Prénom du conjoint">
              <Input value={data.conjoint_prenom} onChange={v => set('conjoint_prenom', v)} placeholder="Pierre" />
            </Field>
            <Field label="Âge du conjoint">
              <Input value={data.conjoint_age} onChange={v => set('conjoint_age', v)} placeholder="45" type="number" />
            </Field>
            <Field label="Statut professionnel">
              <Select value={data.conjoint_statut} onChange={v => set('conjoint_statut', v)} options={[
                { value: 'salarie_cadre', label: 'Salarié — Cadre' },
                { value: 'salarie_nc', label: 'Salarié — Non-cadre' },
                { value: 'fonctionnaire_a', label: 'Fonctionnaire — Catégorie A' },
                { value: 'fonctionnaire_bc', label: 'Fonctionnaire — Catégorie B/C' },
                { value: 'independant_ei', label: 'Indépendant — EI / micro-entreprise' },
                { value: 'dirigeant_sas', label: 'Dirigeant — SAS / SA' },
                { value: 'liberal_bnc', label: 'Profession libérale — BNC' },
                { value: 'retraite', label: 'Retraité(e)' },
                { value: 'sans', label: 'Sans activité / Au foyer' },
              ]} />
            </Field>
            <Field label="Revenus nets annuels du conjoint">
              <Input value={data.conjoint_revenus} onChange={v => set('conjoint_revenus', v)} placeholder="45 000" prefix="€" type="number" />
            </Field>
          </div>
        </div>
      )}

      <div className="form-section">
        <div className="form-section-title">Projets & horizon</div>
        <div className="form-grid">
          <Field label="Horizon d'investissement principal">
            <RadioGroup value={data.horizon} onChange={v => set('horizon', v)} options={[
              { value: 'court', label: '< 3 ans' },
              { value: 'moyen', label: '3–10 ans' },
              { value: 'long', label: '> 10 ans' },
            ]} />
          </Field>
          <Field label="Projets identifiés" hint="Plusieurs choix possibles" full>
            <CheckGroup values={data.projets || []} onChange={v => set('projets', v)} options={[
              { value: 'retraite_anticipee', label: 'Retraite anticipée' },
              { value: 'retraite_complementaire', label: 'Compléter la retraite' },
              { value: 'achat_rp', label: 'Achat résidence principale' },
              { value: 'agrandissement_rp', label: 'Agrandissement / travaux RP' },
              { value: 'investissement_locatif', label: 'Investissement locatif' },
              { value: 'transmission_enfants', label: 'Transmission aux enfants' },
              { value: 'optimisation_fiscale', label: 'Réduction d\'impôts' },
              { value: 'constitution_capital', label: 'Constitution d\'un capital' },
              { value: 'revenus_passifs', label: 'Générer des revenus passifs' },
              { value: 'etudes_enfants', label: 'Financement études enfants' },
              { value: 'protection_conjoint', label: 'Protection du conjoint' },
              { value: 'cession_entreprise', label: 'Cession d\'entreprise' },
              { value: 'donation', label: 'Donation de son vivant' },
              { value: 'autre', label: 'Autre' },
            ]} />
          </Field>
          <Field label="Capacité d'épargne mensuelle — client seul" hint="Ce que le client peut investir chaque mois sur son propre patrimoine">
            <Input value={data.epargne_mensuelle} onChange={v => set('epargne_mensuelle', v)} placeholder="1 500" prefix="€" type="number" />
          </Field>
          {isCouple && (
            <Field label="Capacité d'épargne mensuelle — foyer complet" hint="Épargne totale du foyer si analyse commune">
              <Input value={data.epargne_foyer} onChange={v => set('epargne_foyer', v)} placeholder="3 000" prefix="€" type="number" />
            </Field>
          )}
          <Field label="Épargne de précaution déjà constituée ?" hint="Fonds disponibles en cas d'urgence (hors livrets d'épargne long terme)">
            <RadioGroup value={data.precaution_ok} onChange={v => set('precaution_ok', v)} options={[
              { value: 'suffisante', label: 'Suffisante (3–6 mois de charges)' },
              { value: 'insuffisante', label: 'Insuffisante' },
              { value: 'excessive', label: 'Trop élevée (capital dormant)' },
            ]} />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── PHASE 2 — Patrimoine ───
function Phase2({ data, onChange, perimetre }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  const isCouple = perimetre === 'couple_communaute' || perimetre === 'couple_separation';
  const label = (base) => isCouple ? `${base} — client` : base;
  const labelF = (base) => `${base} — foyer`;

  const addBien = () => set('biens_immo', [...(data.biens_immo || []), { nature: '', localisation: '', valeur: '', annee_achat: '', prix_achat: '', detenteur: 'client', loyers: '', charges: '', regime: '', dispositif: 'aucun', a_credit: 'non', crd: '', taux: '', mensualite: '', duree: '' }]);
  const updateBien = (i, b) => { const arr = [...(data.biens_immo || [])]; arr[i] = b; set('biens_immo', arr); };
  const removeBien = (i) => set('biens_immo', (data.biens_immo || []).filter((_, idx) => idx !== i));

  const addCredit = () => set('credits', [...(data.credits || []), { type: '', crd: '', taux: '', mensualite: '', duree_restante: '', date_fin: '' }]);
  const updateCredit = (i, c) => { const arr = [...(data.credits || [])]; arr[i] = c; set('credits', arr); };
  const removeCredit = (i) => set('credits', (data.credits || []).filter((_, idx) => idx !== i));

  return (
    <div>
      {/* Épargne de précaution */}
      <div className="form-section">
        <div className="form-section-title">Épargne de précaution & liquidités</div>
        <div className="form-grid">
          <Field label={label("Comptes courants")} hint="Solde moyen disponible">
            <Input value={data.comptes_courants} onChange={v => set('comptes_courants', v)} placeholder="8 000" prefix="€" type="number" />
          </Field>
          {isCouple && <Field label={labelF("Comptes courants communs")}>
            <Input value={data.comptes_courants_foyer} onChange={v => set('comptes_courants_foyer', v)} placeholder="5 000" prefix="€" type="number" />
          </Field>}
          <Field label={label("Livret A")} hint="Plafond 22 950 €">
            <Input value={data.livret_a} onChange={v => set('livret_a', v)} placeholder="22 950" prefix="€" type="number" />
          </Field>
          <Field label={label("LDDS")} hint="Plafond 12 000 €">
            <Input value={data.ldds} onChange={v => set('ldds', v)} placeholder="12 000" prefix="€" type="number" />
          </Field>
          <Field label={label("LEP")} hint="Plafond 10 000 € — sous conditions revenus">
            <Input value={data.lep} onChange={v => set('lep', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label={label("Livret d'épargne entreprise (PEE — disponible)")}>
            <Input value={data.pee_dispo} onChange={v => set('pee_dispo', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          {isCouple && <>
            <Field label="Livret A — conjoint"><Input value={data.livret_a_conjoint} onChange={v => set('livret_a_conjoint', v)} placeholder="22 950" prefix="€" type="number" /></Field>
            <Field label="LDDS — conjoint"><Input value={data.ldds_conjoint} onChange={v => set('ldds_conjoint', v)} placeholder="0" prefix="€" type="number" /></Field>
          </>}
        </div>
      </div>

      {/* Placements financiers long terme */}
      <div className="form-section">
        <div className="form-section-title">Placements financiers long terme</div>
        <div className="form-grid">
          <Field label={label("Assurance-vie — valeur totale de rachat")}>
            <Input value={data.av_total} onChange={v => set('av_total', v)} placeholder="120 000" prefix="€" type="number" />
          </Field>
          <Field label={label("AV — dont fonds euro")} hint="Le reste est en unités de compte (UC)">
            <Input value={data.av_euro} onChange={v => set('av_euro', v)} placeholder="80 000" prefix="€" type="number" />
          </Field>
          <Field label={label("AV — ancienneté du contrat")} hint="Important pour la fiscalité (abattement après 8 ans)">
            <Select value={data.av_anciennete} onChange={v => set('av_anciennete', v)} options={[
              { value: '<4', label: 'Moins de 4 ans' },
              { value: '4-8', label: '4 à 8 ans' },
              { value: '>8', label: 'Plus de 8 ans (avantage fiscal)' },
            ]} />
          </Field>
          <Field label={label("AV — gestion")} hint="">
            <Select value={data.av_gestion} onChange={v => set('av_gestion', v)} options={[
              { value: 'libre', label: 'Gestion libre' },
              { value: 'pilotee', label: 'Gestion pilotée' },
              { value: 'horizon', label: 'Gestion à horizon' },
            ]} />
          </Field>
          {isCouple && <>
            <Field label="AV — conjoint (valeur totale)"><Input value={data.av_conjoint} onChange={v => set('av_conjoint', v)} placeholder="0" prefix="€" type="number" /></Field>
            <Field label="AV conjoint — dont fonds euro"><Input value={data.av_conjoint_euro} onChange={v => set('av_conjoint_euro', v)} placeholder="0" prefix="€" type="number" /></Field>
          </>}
          <Field label={label("PER individuel — encours")} hint="Plan d'Épargne Retraite">
            <Input value={data.per} onChange={v => set('per', v)} placeholder="35 000" prefix="€" type="number" />
          </Field>
          <Field label={label("PER — versements annuels actuels")}>
            <Input value={data.per_versements} onChange={v => set('per_versements', v)} placeholder="3 000" prefix="€" type="number" />
          </Field>
          {isCouple && <Field label="PER — conjoint"><Input value={data.per_conjoint} onChange={v => set('per_conjoint', v)} placeholder="0" prefix="€" type="number" /></Field>}
          <Field label={label("PEA — encours")} hint="Plafond versements 150 000 €">
            <Input value={data.pea} onChange={v => set('pea', v)} placeholder="50 000" prefix="€" type="number" />
          </Field>
          <Field label={label("PEA — ancienneté")} hint="Exonération IR après 5 ans">
            <Select value={data.pea_anciennete} onChange={v => set('pea_anciennete', v)} options={[
              { value: '<5', label: 'Moins de 5 ans' },
              { value: '>5', label: 'Plus de 5 ans (exonération IR)' },
            ]} />
          </Field>
          <Field label={label("Compte-titres ordinaire (CTO)")} hint="Soumis à la flat tax 30%">
            <Input value={data.cto} onChange={v => set('cto', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label={label("Plus-values latentes sur CTO / PEA")} hint="Gains non réalisés à ce jour">
            <Input value={data.pv_latentes_cto} onChange={v => set('pv_latentes_cto', v)} placeholder="0" prefix="€" type="number" />
          </Field>
        </div>
      </div>

      {/* Épargne salariale */}
      <div className="form-section">
        <div className="form-section-title">Épargne salariale & retraite collective</div>
        <div className="form-grid">
          <Field label={label("PEE — montant bloqué")} hint="Déblocable après 5 ans ou événements exceptionnels">
            <Input value={data.pee_bloque} onChange={v => set('pee_bloque', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label={label("PERCOL / PERCO")} hint="Plan d'épargne retraite collectif">
            <Input value={data.percol} onChange={v => set('percol', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label={label("Article 83 / PER collectif obligatoire")}>
            <Input value={data.per_collectif} onChange={v => set('per_collectif', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label={label("Stock-options / BSPCE / AGA (valeur estimée)")} hint="Valeur vénale actuelle des titres">
            <Input value={data.bspce} onChange={v => set('bspce', v)} placeholder="0" prefix="€" type="number" />
          </Field>
        </div>
      </div>

      {/* Placements alternatifs */}
      <div className="form-section">
        <div className="form-section-title">Placements alternatifs & autres actifs</div>
        <div className="form-grid">
          <Field label="SCPI en direct — valeur de parts" hint="Sociétés civiles de placement immobilier">
            <Input value={data.scpi} onChange={v => set('scpi', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="SCPI — revenus trimestriels bruts">
            <Input value={data.scpi_revenus} onChange={v => set('scpi_revenus', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="OPCI / SCI de placement">
            <Input value={data.opci} onChange={v => set('opci', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Private equity / FCPI / FIP" hint="Fonds non cotés, souvent illiquides">
            <Input value={data.private_equity} onChange={v => set('private_equity', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Crypto-actifs" hint="Valeur de marché au moment de la saisie">
            <Input value={data.crypto} onChange={v => set('crypto', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Métaux précieux (or, argent...)">
            <Input value={data.metaux} onChange={v => set('metaux', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Parts de société non cotée (hors BSPCE)" hint="Valeur estimée des parts détenues">
            <Input value={data.parts_societe} onChange={v => set('parts_societe', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Prêts consentis à des tiers" hint="Créances à recouvrer">
            <Input value={data.prets_tiers} onChange={v => set('prets_tiers', v)} placeholder="0" prefix="€" type="number" />
          </Field>
        </div>
      </div>

      {/* Patrimoine immobilier */}
      <div className="form-section">
        <div className="form-section-title">Patrimoine immobilier</div>
        {(data.biens_immo || [{ nature: '', localisation: '', valeur: '', annee_achat: '', prix_achat: '', detenteur: 'client', loyers: '', charges: '', regime: '', dispositif: 'aucun', a_credit: 'non', crd: '', taux: '', mensualite: '', duree: '' }]).map((bien, i) => (
          <ImmoBlock key={i} bien={bien} index={i} onChange={updateBien} onRemove={removeBien} perimetre={perimetre} />
        ))}
        <button className="btn-add" onClick={addBien}>+ Ajouter un bien immobilier</button>
      </div>

      {/* Crédits */}
      <div className="form-section">
        <div className="form-section-title">Dettes & crédits</div>
        <div className="form-hint" style={{ marginBottom: 12 }}>Listez ici tous les crédits non rattachés à un bien immobilier (ou les crédits immo si vous préférez tout centraliser ici)</div>
        {(data.credits || []).map((c, i) => (
          <CreditBlock key={i} credit={c} index={i} onChange={updateCredit} onRemove={removeCredit} />
        ))}
        <button className="btn-add" onClick={addCredit}>+ Ajouter un crédit</button>
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
          <Field label="Tranche Marginale d'Imposition (TMI)" full>
            <RadioGroup value={data.tmi} onChange={v => set('tmi', v)} options={[
              { value: '0', label: '0 %' },
              { value: '11', label: '11 %' },
              { value: '30', label: '30 %' },
              { value: '41', label: '41 %' },
              { value: '45', label: '45 %' },
            ]} />
          </Field>
          <Field label="Revenu fiscal de référence (RFR) du foyer" hint="Visible sur l'avis d'imposition">
            <Input value={data.rfr} onChange={v => set('rfr', v)} placeholder="75 000" prefix="€" type="number" />
          </Field>
          <Field label="Nombre de parts fiscales" hint="2 parts pour couple sans enfant, +0,5 par enfant jusqu'au 3e, +1 ensuite">
            <Input value={data.parts} onChange={v => set('parts', v)} placeholder="2.5" type="number" />
          </Field>
          <Field label="Impôt sur le revenu payé (N-1)">
            <Input value={data.ir_paye} onChange={v => set('ir_paye', v)} placeholder="8 400" prefix="€" type="number" />
          </Field>
          <Field label="Option pour les revenus du capital">
            <RadioGroup value={data.option_capital} onChange={v => set('option_capital', v)} options={[
              { value: 'pfu', label: 'Flat tax 30 % (PFU)' },
              { value: 'bareme', label: 'Option barème IR' },
            ]} />
          </Field>
          <Field label="Prélèvement à la source (taux actuel)">
            <Input value={data.pas} onChange={v => set('pas', v)} placeholder="8.5" prefix="%" type="number" />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Revenus fonciers & locatifs</div>
        <div className="form-grid">
          <Field label="Revenus fonciers bruts annuels déclarés">
            <Input value={data.revenus_fonciers} onChange={v => set('revenus_fonciers', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Déficit foncier reportable">
            <Input value={data.deficit_foncier} onChange={v => set('deficit_foncier', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Revenus BIC / LMNP déclarés">
            <Input value={data.revenus_bic} onChange={v => set('revenus_bic', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Amortissements LMNP non encore déduits">
            <Input value={data.amortissements} onChange={v => set('amortissements', v)} placeholder="0" prefix="€" type="number" />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">IFI & situations particulières</div>
        <div className="form-grid">
          <Field label="Assujetti à l'IFI ?">
            <RadioGroup value={data.ifi} onChange={v => set('ifi', v)} options={[
              { value: 'non', label: 'Non' },
              { value: 'oui', label: 'Oui' },
              { value: 'limite', label: 'Proche du seuil (1,3 M€)' },
            ]} />
          </Field>
          {(data.ifi === 'oui' || data.ifi === 'limite') && (
            <Field label="Base IFI approximative" hint="Actifs immobiliers non exonérés">
              <Input value={data.ifi_base} onChange={v => set('ifi_base', v)} placeholder="1 500 000" prefix="€" type="number" />
            </Field>
          )}
          <Field label="Plafond d'épargne retraite disponible" hint="Indiqué sur l'avis d'imposition — case 6PS/6QS">
            <Input value={data.plafond_per} onChange={v => set('plafond_per', v)} placeholder="12 000" prefix="€" type="number" />
          </Field>
          <Field label="Plus-values latentes totales" hint="PEA, CTO, SCPI, immobilier">
            <Input value={data.pv_latentes} onChange={v => set('pv_latentes', v)} placeholder="0" prefix="€" type="number" />
          </Field>
          <Field label="Moins-values reportables">
            <Input value={data.mv_reportables} onChange={v => set('mv_reportables', v)} placeholder="0" prefix="€" type="number" />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Niches & dispositifs fiscaux déjà utilisés</div>
        <Field label="Dispositifs actifs (plusieurs choix possibles)" full>
          <CheckGroup values={data.niches || []} onChange={v => set('niches', v)} options={[
            { value: 'per_deductible', label: 'PER déductible' },
            { value: 'deficit_foncier', label: 'Déficit foncier' },
            { value: 'pinel', label: 'Pinel' },
            { value: 'malraux', label: 'Malraux' },
            { value: 'denormandie', label: 'Denormandie' },
            { value: 'lmnp_reel', label: 'LMNP régime réel' },
            { value: 'fcpi_fip', label: 'FCPI / FIP' },
            { value: 'dons', label: 'Dons (66% ou 75%)' },
            { value: 'mecenage', label: 'Mécénat d\'entreprise' },
            { value: 'sofica', label: 'SOFICA' },
            { value: 'bspce_fiscalite', label: 'BSPCE / stock-options' },
            { value: 'aucun', label: 'Aucun' },
          ]} />
        </Field>
        <div style={{ marginTop: 12 }}>
          <Field label="Plafond global des niches fiscales déjà consommé" hint="Plafond légal : 10 000 € (18 000 € avec FCPI/SOFICA)">
            <Input value={data.niches_montant} onChange={v => set('niches_montant', v)} placeholder="0" prefix="€" type="number" />
          </Field>
        </div>
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
          <Field label="Réaction si le portefeuille perd 15 % en 6 mois" full>
            <RadioGroup value={data.reaction_perte} onChange={v => set('reaction_perte', v)} options={[
              { value: 'vendre', label: 'Je vends tout immédiatement' },
              { value: 'attendre', label: 'J\'attends la remontée' },
              { value: 'investir', label: 'J\'en profite pour investir davantage' },
            ]} />
          </Field>
          <Field label="Profil de risque déclaratif" full>
            <RadioGroup value={data.profil} onChange={v => set('profil', v)} options={[
              { value: 'defensif', label: 'Défensif — priorité à la préservation du capital' },
              { value: 'equilibre', label: 'Équilibré — rendement modéré, risque limité' },
              { value: 'dynamique', label: 'Dynamique — accepte la volatilité pour un meilleur rendement' },
              { value: 'offensif', label: 'Offensif — maximisation du rendement long terme' },
            ]} />
          </Field>
          <Field label="Perte maximale acceptable sur 1 an">
            <Select value={data.perte_max} onChange={v => set('perte_max', v)} options={[
              { value: '0', label: '0 % — aucune perte acceptable' },
              { value: '5', label: 'Jusqu\'à 5 %' },
              { value: '10', label: 'Jusqu\'à 10 %' },
              { value: '20', label: 'Jusqu\'à 20 %' },
              { value: '30', label: 'Jusqu\'à 30 % et plus' },
            ]} />
          </Field>
          <Field label="Expérience investisseur">
            <Select value={data.experience} onChange={v => set('experience', v)} options={[
              { value: 'debutant', label: 'Débutant — peu ou pas d\'expérience' },
              { value: 'intermediaire', label: 'Intermédiaire — quelques placements gérés' },
              { value: 'experimente', label: 'Expérimenté — gestion active régulière' },
            ]} />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Objectifs de rendement & liquidité</div>
        <div className="form-grid">
          <Field label="Rendement cible annuel net d'impôts" full>
            <RadioGroup value={data.rendement_cible} onChange={v => set('rendement_cible', v)} options={[
              { value: '<2', label: '< 2 % (sécurité totale)' },
              { value: '2-4', label: '2 à 4 % (prudent)' },
              { value: '4-7', label: '4 à 7 % (équilibré)' },
              { value: '>7', label: '> 7 % (dynamique)' },
            ]} />
          </Field>
          <Field label="Priorité de l'investissement" full>
            <RadioGroup value={data.priorite} onChange={v => set('priorite', v)} options={[
              { value: 'revenus', label: 'Revenus réguliers (rente, dividendes, loyers)' },
              { value: 'capitalisation', label: 'Capitalisation long terme (valorisation du capital)' },
              { value: 'mixte', label: 'Mixte (revenus + valorisation)' },
            ]} />
          </Field>
          <Field label="Besoin de disponibilité des fonds">
            <Select value={data.liquidite} onChange={v => set('liquidite', v)} options={[
              { value: 'totale', label: 'Totale — fonds disponibles à tout moment' },
              { value: 'partielle', label: 'Partielle — une partie peut être bloquée' },
              { value: 'bloquee_5ans', label: 'Horizon bloqué acceptable — 5 ans' },
              { value: 'bloquee_10ans', label: 'Horizon bloqué acceptable — 10 ans et plus' },
            ]} />
          </Field>
          <Field label="Préférence de gestion">
            <Select value={data.gestion} onChange={v => set('gestion', v)} options={[
              { value: 'deleguee', label: 'Totalement déléguée (gestion pilotée)' },
              { value: 'semi', label: 'Semi-active (arbitrages annuels)' },
              { value: 'active', label: 'Active (suivi régulier)' },
            ]} />
          </Field>
          <Field label="Contraintes ESG / éthiques">
            <Select value={data.esg} onChange={v => set('esg', v)} options={[
              { value: 'aucune', label: 'Aucune contrainte particulière' },
              { value: 'faible', label: 'Légère préférence ESG' },
              { value: 'forte', label: 'Forte : exclusion tabac, armement, fossiles...' },
            ]} />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Capacité d'endettement</div>
        <div className="form-grid">
          <Field label="Rapport à la dette" full>
            <RadioGroup value={data.rapport_dette} onChange={v => set('rapport_dette', v)} options={[
              { value: 'aversion', label: 'Aversion — préfère éviter tout endettement' },
              { value: 'neutre', label: 'Neutre — acceptable si nécessaire' },
              { value: 'favorable', label: 'Favorable — levier stratégique bienvenu' },
            ]} />
          </Field>
          <Field label="Taux d'endettement actuel" hint="Mensualités totales / revenus nets mensuels">
            <Input value={data.taux_endettement} onChange={v => set('taux_endettement', v)} placeholder="28" prefix="%" type="number" />
          </Field>
          <Field label="Capacité d'emprunt résiduelle mensuelle" hint="Estimation après charges actuelles (règle des 35%)">
            <Input value={data.capacite_emprunt} onChange={v => set('capacite_emprunt', v)} placeholder="800" prefix="€" type="number" />
          </Field>
          <Field label="Durée de crédit acceptable pour un futur emprunt">
            <Select value={data.duree_credit} onChange={v => set('duree_credit', v)} options={[
              { value: '10', label: '10 ans' },
              { value: '15', label: '15 ans' },
              { value: '20', label: '20 ans' },
              { value: '25', label: '25 ans' },
            ]} />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ───
export const PHASES = [
  { id: 1, label: 'Profil personnel', key: 'profil' },
  { id: 2, label: 'Patrimoine', key: 'patrimoine' },
  { id: 3, label: 'Fiscalité', key: 'fiscalite' },
  { id: 4, label: 'Profil investisseur', key: 'investisseur' },
];

const DEFAULT_DATA = {
  profil: { perimetre: 'individuel', prenom: '', age: '', situation: '', enfants: '0', ages_enfants: '', ville: '', residence_fiscale: 'france', statut: '', secteur: '', revenus: '', anciennete: '', revenus_excep: '0', type_revenu_excep: 'aucun', conjoint_prenom: '', conjoint_age: '', conjoint_statut: '', conjoint_revenus: '', horizon: '', projets: [], epargne_mensuelle: '', epargne_foyer: '', precaution_ok: '' },
  patrimoine: { comptes_courants: '', comptes_courants_foyer: '', livret_a: '', ldds: '', lep: '0', pee_dispo: '0', livret_a_conjoint: '', ldds_conjoint: '', av_total: '', av_euro: '', av_anciennete: '', av_gestion: '', av_conjoint: '0', av_conjoint_euro: '0', per: '0', per_versements: '0', per_conjoint: '0', pea: '0', pea_anciennete: '', cto: '0', pv_latentes_cto: '0', pee_bloque: '0', percol: '0', per_collectif: '0', bspce: '0', scpi: '0', scpi_revenus: '0', opci: '0', private_equity: '0', crypto: '0', metaux: '0', parts_societe: '0', prets_tiers: '0', biens_immo: [{ nature: '', localisation: '', valeur: '', annee_achat: '', prix_achat: '', detenteur: 'client', loyers: '', charges: '', regime: '', dispositif: 'aucun', a_credit: 'non', crd: '', taux: '', mensualite: '', duree: '' }], credits: [] },
  fiscalite: { tmi: '', rfr: '', parts: '', ir_paye: '', option_capital: 'pfu', pas: '', revenus_fonciers: '0', deficit_foncier: '0', revenus_bic: '0', amortissements: '0', ifi: 'non', ifi_base: '0', plafond_per: '', pv_latentes: '0', mv_reportables: '0', niches: [], niches_montant: '0' },
  investisseur: { reaction_perte: '', profil: '', perte_max: '', experience: '', rendement_cible: '', priorite: '', liquidite: '', gestion: '', esg: 'aucune', rapport_dette: '', taux_endettement: '', capacite_emprunt: '', duree_credit: '20' },
};

export default function PhaseForm({ onSubmit, isLoading }) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [formData, setFormData] = useState(DEFAULT_DATA);

  const phase = PHASES[currentPhase - 1];
  const perimetre = formData.profil.perimetre;

  const handleSubmit = () => onSubmit(formData);

  const renderPhase = () => {
    switch (currentPhase) {
      case 1: return <Phase1 data={formData.profil} onChange={d => setFormData(p => ({ ...p, profil: d }))} />;
      case 2: return <Phase2 data={formData.patrimoine} onChange={d => setFormData(p => ({ ...p, patrimoine: d }))} perimetre={perimetre} />;
      case 3: return <Phase3 data={formData.fiscalite} onChange={d => setFormData(p => ({ ...p, fiscalite: d }))} perimetre={perimetre} profil={formData.profil} />;
      case 4: return <Phase4 data={formData.investisseur} onChange={d => setFormData(p => ({ ...p, investisseur: d }))} />;
      default: return null;
    }
  };

  return (
    <div className="phase-container fade-in">
      <div className="phase-header">
        <div className="phase-header-top">
          <div className="phase-num">{currentPhase}</div>
          <h2 className="phase-title">{phase.label}</h2>
        </div>
        <div className="phase-desc">Étape {currentPhase} sur {PHASES.length}</div>
      </div>

      {renderPhase()}

      <div className="phase-nav">
        {currentPhase > 1 && (
          <button className="btn-secondary" onClick={() => setCurrentPhase(p => p - 1)}>← Précédent</button>
        )}
        <div className="phase-nav-spacer" />
        {currentPhase < PHASES.length ? (
          <button className="btn-primary" onClick={() => setCurrentPhase(p => p + 1)}>Suivant →</button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Analyse en cours...' : 'Lancer l\'analyse IA →'}
          </button>
        )}
      </div>
    </div>
  );
}
