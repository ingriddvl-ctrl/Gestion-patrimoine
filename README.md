# Conseiller Patrimonial IA

Outil de gestion de patrimoine avec analyse personnalisée et scénarios d'optimisation.

## Architecture

```
GitHub
├── frontend/   → déployé sur Vercel (React)
└── backend/    → déployé sur Render (Python/FastAPI)
```

---

## 1. Clé API Groq (gratuit)

1. Va sur https://console.groq.com
2. Crée un compte (gratuit)
3. Génère une API Key dans "API Keys"
4. Copie la clé — tu en auras besoin pour Render

---

## 2. Déploiement Backend sur Render

1. Va sur https://render.com → "New Web Service"
2. Connecte ton repo GitHub → sélectionne ce repo
3. Configure :
   - **Name** : `patrimoine-backend` (ou ce que tu veux)
   - **Root Directory** : `backend`
   - **Runtime** : Python 3
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type** : Free
4. Dans "Environment Variables", ajoute :
   - Key : `GROQ_API_KEY` → Value : ta clé Groq
5. Clique "Create Web Service"
6. Attends le déploiement → copie l'URL (ex: `https://patrimoine-backend.onrender.com`)

---

## 3. Déploiement Frontend sur Vercel

1. Va sur https://vercel.com → "New Project"
2. Importe ce repo GitHub
3. Configure :
   - **Framework Preset** : Other (on a notre propre vercel.json)
   - Dans "Environment Variables", ajoute :
     - Key : `BACKEND_URL` → Value : l'URL Render du step 2 (ex: `https://patrimoine-backend.onrender.com`)
4. Clique "Deploy"

---

## 4. Développement local

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Ajoute ta clé Groq dans .env
uvicorn server:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
# Crée un fichier .env.local :
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env.local
npm start
```

---

## Notes importantes

- **Render free tier** : le backend s'endort après 15 min d'inactivité. Le premier message après une période d'inactivité peut prendre ~30 secondes (cold start). C'est normal et gratuit.
- **Groq free tier** : 14 400 requêtes/jour, largement suffisant.
- Le modèle utilisé est `llama3-70b-8192` — excellent pour ce type d'analyse structurée.
