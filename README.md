# 🏨 Système de Gestion Hôtelière - Antigravity

Une application full-stack moderne pour la gestion complète d'un établissement hôtelier. Ce projet intègre une interface utilisateur intuitive en React et un backend robuste sécurisé avec Spring Boot.

## 🚀 Fonctionnalités Clés

- **Tableau de Bord Dynamique** : Vue d'ensemble des statistiques de l'hôtel en temps réel.
* **Gestion des Chambres** : Suivi complet du statut (Libre, Occupée, Nettoyage, Hors service) et CRUD des chambres.
- **Gestion des Utilisateurs** : Système multi-rôles (Admin, Réceptionniste) avec gestion des accès via Spring Security.
* **Système de Réservation** : Calendrier interactif (`react-big-calendar`) pour visualiser et gérer les séjours.
- **Facturation** : Génération de factures et suivi des paiements.
* **Mode Sombre (Dark Mode)** : Interface adaptable pour un confort visuel optimal de jour comme de nuit.

## 🛠️ Stack Technique

### Frontend
- **Framework** : React 19 + Vite
- **Styling** : Tailwind CSS 4
- **Icônes** : Lucide React
- **Gestion d'État** : Context API (Auth, Theme)
- **Notifications** : React Hot Toast

### Backend
- **Framework** : Spring Boot 3
- **Sécurité** : Spring Security + JWT (JSON Web Token)
- **Base de Données** : PostgreSQL
- **ORM** : Spring Data JPA

## 📦 Installation et Lancement

### Prérequis
- Node.js (version 18+)
- Java JDK 17+
- PostgreSQL installé et configuré

### Installation du Frontend
1. Accédez au répertoire racine :
   ```bash
   npm install
   ```
2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

### Installation du Backend
1. Accédez au dossier `backend`.
2. Configurez votre base de données dans `src/main/resources/application.yml`.
3. Lancez l'application avec Maven :
   ```bash
   ./mvnw spring-boot:run
   ```

## 🔒 Sécurité et Identifiants par défaut

Le système utilise une authentification JWT. Les rôles sont strictement séparés pour garantir la sécurité des données.

**Comptes de test (configurés via `data.sql`) :**
- **Administrateur** : `admin` / `Admin123`
- **Réceptionniste** : `sara` / `Reception1`

---
*Projet développé avec soin pour une gestion hôtelière simplifiée et efficace.*
