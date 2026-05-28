<div align="center">
  <br />
  <h1>🛡️ Aetheris.ai</h1>
  <p><strong>Next-Generation Autonomous Multimodal AI Cyber Defense Platform</strong></p>
  <br />
</div>

> **Aetheris.ai** is a highly interactive, DARPA-grade AI cybersecurity command center MVP built with Next.js 16, Framer Motion, and Tailwind CSS v4. It features a fully autonomous simulation engine that generates, analyzes, and mitigates synthetic cyber threats in real-time across a dynamic glassmorphism UI.

---

## ⚡ Key Features

| Feature | Description |
| :--- | :--- |
| **Autonomous Simulation Engine** | A headless background loop (Zustand) that continuously spawns random threats (Ransomware, DDoS, SQLi), mutates system health, and orchestrates an automated mitigation lifecycle. |
| **Interactive Network Topology** | A real-time SVG and Framer Motion-powered interactive map. Visualize enterprise assets, watch active threat paths, and see nodes change status (`warning`, `compromised`, `isolated`). |
| **Command Center Dashboard** | Live telemetry visualizing network health and Global Threat Scores via Recharts area and bar charts, complete with glowing cyberpunk visual aesthetics. |
| **AI Reasoning Stream** | A terminal-style feed outputting the autonomous decisions the AI engine makes as it analyzes patterns and deploys countermeasures. |
| **Sandbox Attack Simulator** | Manually trigger targeted attacks against the simulated network to watch the AI's incident response times and mitigation workflows dynamically kick in. |

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (Custom Dark Glassmorphism Theme)
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **Language**: TypeScript (Strict)

## 📸 System Architecture

Aetheris.ai relies on a centralized global state driven by a deterministic interval engine.

1. **`useSimulationStore.ts`**: The single source of truth for the network architecture, live system health, incident logs, and active threat arrays.
2. **`simulation/engine.ts`**: Mounted globally via the `DashboardLayout`, this hook loops every second to spawn threats, advance their state from `DETECTED` to `RESOLVED`, and isolate affected nodes dynamically.
3. **UI Components**: Components subscribe directly to the store and react with high-performance CSS and Framer Motion animations based on the severity of the threat.

> [!TIP]
> **Performance Note:** To handle the heavy re-rendering of live charts and SVG topologies, components are deeply memoized and use independent localized framer-motion loops for ambient glow effects.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Navigate to the directory**
```bash
cd ai-defense-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the Development Server**
```bash
npm run dev
```

4. **Access the Command Center**
Open [http://localhost:3000](http://localhost:3000) in your browser. You will be greeted by the cinematic boot sequence and biometric authentication screen before gaining access to the main dashboard.

---

## 🎛 System Configuration & Sandbox

### Manual Override (Force Defense)
On the top right of the dashboard, you can trigger a **Force Defense**. This overrides the AI, resolving all active threats immediately and resetting the Global Threat Score.

### Sandbox Simulator
Navigate to the **Sandbox** in the sidebar. Here you can inject custom payloads (e.g., Spear Phishing, DDoS) into the simulation engine. Once deployed, jump back to the **Topology** or **Dashboard** to see how the system isolates the compromised node in real-time.

---
<div align="center">
  <i>Developed as a demonstration of high-performance React visualization and complex autonomous state management.</i>
</div>
