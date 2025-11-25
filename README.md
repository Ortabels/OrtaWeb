# Projet_Jardin — Hugo + Decap CMS + GitHub Pages

Cette archive contient une base complète pour le site **Ortabels / Projet Jardin** :

- Site statique généré par **Hugo**.
- Hébergé sur **GitHub Pages**.
- Contenu géré dans `content/` (Markdown).
- Interface d’édition via **Decap CMS** accessible sur `/admin/` (avec backend GitHub).

## 1. Structure

- `config.toml` : configuration Hugo (baseURL = https://ortabels.github.io/Projet_Jardin/).
- `content/` :
  - `_index.md` : page d’accueil.
  - `projects/` :
    - `_index.md` : liste des projets.
    - `mare-ecologique.md`, `compostage-collaboratif.md`, `arrosage-durable-arbres.md` :
      - partie publique (en haut),
      - section `# INTERNAL` (cahier des charges complet, masquée sur le site).
- `themes/ortabels-theme/` : thème minimal fonctionnel.
- `static/admin/` :
  - `index.html` : charge Decap CMS.
  - `config.yml` : configuration du CMS (backend GitHub).
- `.github/workflows/deploy-hugo.yml` : GitHub Action qui build et déploie le site sur GitHub Pages.

## 2. Déploiement GitHub Pages

1. Copie tous les fichiers de cette archive dans ton dépôt `Ortabels/Projet_Jardin`.
2. Assure-toi que la branche par défaut est `main` (ou adapte le workflow).
3. Dans GitHub :
   - `Settings → Pages` :
     - Source : **GitHub Actions**.
4. À chaque `git push` sur `main`, le workflow :
   - lance `hugo --minify`,
   - publie les fichiers de `public/` sur GitHub Pages.

Site public :

> https://ortabels.github.io/Projet_Jardin/

## 3. Section INTERNAL masquée

Le template `single.html` fait :

```go
{{ $raw := .RawContent }}
{{ $public := replaceRE "(?s)# INTERNAL.*" "" $raw }}
{{ $public | markdownify }}
```

→ Tout ce qui est sous `# INTERNAL` reste dans le fichier mais n’apparaît pas sur le site.

## 4. Decap CMS /admin (backend GitHub)

L’interface d’admin sera servie à :

> https://ortabels.github.io/Projet_Jardin/admin/

Le fichier `static/admin/config.yml` indique :

```yaml
backend:
  name: github
  repo: Ortabels/Projet_Jardin
  branch: main
```

⚠ Pour que l’authentification fonctionne (login avec GitHub), Decap CMS a besoin d’un **serveur OAuth** (proxy) entre le navigateur et l’API GitHub. Quelques options possibles :

- Créer un petit service d’auth externe (Cloudflare Workers, Vercel, AWS Lambda, Docker `docker-decap-cms-standalone`, etc.) et y pointer `base_url` / `auth_endpoint`.
- Ou utiliser un provider existant qui joue ce rôle.

Tant que ce backend OAuth n’est pas en place, le site public fonctionne, mais `/admin` ne pourra pas valider la connexion GitHub.

## 5. Développement local

1. Installer Hugo.
2. Dans le dossier du projet :

```bash
hugo server -D
```

3. Ouvrir :
   - Site : http://localhost:1313/
   - CMS : http://localhost:1313/admin/ (l’UI se charge, mais la connexion GitHub nécessite aussi le backend OAuth).

## 6. Utilisation simple sans CMS

Même sans configurer tout de suite le backend OAuth, tu peux :

- éditer les projets dans `content/projects/*.md`,
- garder les cahiers des charges dans `# INTERNAL`,
- laisser GitHub Actions regénérer automatiquement le site après chaque commit.

Quand tu seras prêt à aller plus loin, on pourra ajouter la brique OAuth pour rendre `/admin` pleinement fonctionnel.
