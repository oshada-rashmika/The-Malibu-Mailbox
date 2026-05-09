# 💌 Contributing to The Malibu Mailbox 🌴

First off, thank you for considering contributing to **The Malibu Mailbox**! Whether you're delivering an elegant new feature, squashing a pesky bug, or just fixing a typo, your help makes this digital sanctuary a more beautiful place. 

We aim to keep our codebase as polished as a handwritten love letter and the contribution process as enjoyable as receiving one. This guide will help you get your code delivered smoothly! 📮

---

## 🗺️ The Landscape (Architecture)

The Malibu Mailbox is a harmonious union of two realms:

- **`frontend/`**: The presentation layer. Built with **Next.js**, **React**, and **Tailwind CSS**. It houses all of our immersive, sentimental UI components like `BloomingFlower`, `WatercolorBouquet`, and the `HeartbeatNotebook`.
- **`backend/`**: The trusted postal workers behind the scenes. Powered by **Node.js**, **Express**, and **TypeScript**, handling crucial routes for letters, vouchers, notebooks, and admin duties.

Both interact closely with **Supabase** for keeping real-time data safe and secure.

---

## 🛠️ Getting Started: Your Local Mailroom

### Prerequisites
- **Node.js** (v18+ recommended)
- Your favorite package manager (npm, yarn, pnpm)
- A passion for clean, readable code ✨

### Setup Instructions
1. **Fork & Clone** the repository to your local machine.
2. **Install Dependencies** in both directories:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. **Environment Setup**: Set up your development environment by creating necessary `.env` files (often `.env.local` in the frontend) with your local or development Supabase keys.
4. **Boot it up**: Start your local dev servers and make sure everything is blooming beautifully!

---

## 🌿 Branching Strategy

We like our Git history like we like our letters: clean, purposeful, and easy to read.
Please branch off of `main` using the following naming conventions:

- `feat/add-rose-petal-animation` 🌹 (for new features)
- `fix/letter-canvas-overlap` 🩹 (for bug fixes)
- `chore/update-dependencies` 🧹 (for routine maintenance)
- `docs/update-readme` 📚 (for documentation)

---

## 💅 Code Style & Vibe Check

- **TypeScript is our Love Language:** Use strong, meaningful typings. Avoid `any` like an ex's phone number!
- **Linting & Formatting:** We use ESLint and Prettier. Make sure your code passes our linting rules before committing (`npm run lint`).
- **Component Design:** Keep UI components in the `frontend` modular. If you are building a new romantic widget, consider if it can be broken down into smaller, reusable pieces.
- **Fun over Boring:** If you get a chance to name a variable something clever but still clear (e.g., `const sealedWithAKiss = true;`), go for it—just don't sacrifice readability!

---

## 📝 Commit Messages

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/); it keeps our release notes looking stellar.

*   `feat: add new watercolor brush to letter canvas`
*   `fix: resolve countdown timer sync issue`
*   `style: center heartbeat notebook icon`

---

## 🚀 The Pull Request (Delivering the Mail)

Ready to ship your masterpiece? 

1. **Push** your branch to your fork.
2. **Open a Pull Request** against the `main` branch.
3. **Describe your changes:** Use the PR template (if we have one). Explain *what* you changed and *why*. Add screenshots if you altered the UI—we love seeing visual proof of your hard work!
4. **Review:** Be patient and receptive to feedback. A maintainer will review your beautiful code, perhaps suggest a few tweaks, and then merge it in!

---

## 🤝 Code of Conduct

We're building a project centered around joy, connection, and good vibes. Please treat fellow contributors with kindness, respect, and empathy. Be constructive in code reviews and celebrate each other's work!

---

**Thank you for helping The Malibu Mailbox deliver smiles, one commit at a time!** 📬✨
