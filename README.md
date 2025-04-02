# ⚗️ API Potions & Auth - Node.js / MongoDB / Docker

Une API magique pour gérer des potions et l’authentification utilisateur avec JWT + Swagger.

---

## 🚀 Lancer le projet

### 1. Cloner le projet

```bash
git clone https://github.com/tonrepo/api-potions.git
cd api-potions

# Installe nodemon globalement pour le dev
npm install -g nodemon

# Lancer avec nodemon
nodemon server.js

# Ou lancer avec un script (si présent dans package.json)
npm run dev

npm install express dotenv cors mongodb

npm install jsonwebtoken cookie-parser bcryptjs sanitize

npm install swagger-ui-express swagger-jsdoc

docker-compose up --build
