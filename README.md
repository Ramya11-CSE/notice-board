# Digital Notice Board & Cloud Container Hub
## "Develop a Simple Web Application, Containerize It Using Docker, and Deploy It on Kubernetes"

![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)
![Express](https://img.shields.io/badge/Express-v5.0.0-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5.svg)
![Status](https://img.shields.io/badge/Health-200%20OK-brightgreen.svg)
![Author](https://img.shields.io/badge/Lead-Selvaraj-purple.svg)

---

## 📌 Project Overview
> **Title: Develop a Simple Web Application, Containerize It Using Docker, and Deploy It on Kubernetes**
> **Author: Selvaraj**

A high-performance, modern **Cloud & DevOps Digital Notice Board** built with Express.js and a White & Purple design aesthetic. The application is containerized with **Docker** and orchestrated with **Kubernetes** featuring high availability (3 replicas), health and readiness probes (`/api/healthz`), and NodePort service access.

---

## ✨ Features & Architecture

- 🌟 **Modern White & Purple UI**: Crisp white cards, rich purple accents, ambient lighting, responsive grid, and fluid micro-animations.
- 📋 **Interactive Notice Board**:
  - Filter notices by category (*Project*, *Exam*, *DevOps*, *Review*, *General*).
  - Real-time search by keyword, author, or content.
  - "Post Notice" modal dialog with instant publication and deletion.
- ☸️ **Kubernetes & Docker Monitor Tab**:
  - Live container runtime diagnostics (*Pod Hostname: Selvaraj*, *Memory RSS*, *OS Architecture*, *Uptime*).
  - Visual topology diagram (*Client → K8s Service :30080 → Pods Replicas → Docker Express :3000*).
  - Active replica pod status tracker.
- 🚀 **CLI Runbook & Commands Tab**: One-click copy buttons for all Docker and Kubernetes terminal operations.
- ⚡ **Interactive REST API Inspector**: Real-time test console for `/api/healthz`, `/api/info`, `/api/notices`, and `/api/status`.
- 🛡️ **Container Health Probes**: Built-in `/api/healthz` endpoint for Kubernetes liveness & readiness probes.

---

## 🗂️ Project Directory Structure

```plaintext
notice-board/
├── Dockerfile                   # Production Dockerfile (Node 20 Alpine, Healthcheck)
├── .dockerignore                # Excludes node_modules and transient files
├── docker-compose.yml           # Docker Compose orchestrator
├── package.json                 # Node dependencies and npm scripts
├── server.js                    # Express.js backend & REST API endpoints
├── k8s/                         # Kubernetes deployment manifests
│   ├── deployment.yaml          # Deployment spec with 3 replicas & health probes
│   ├── service.yaml             # NodePort Service (NodePort: 30080)
│   └── k8s-all-in-one.yaml      # All-in-one manifest for single-command deploy
└── public/                      # Static web assets
    ├── index.html               # Semantic HTML5 frontend layout
    ├── style.css                # Custom White & Purple CSS design system
    └── script.js                # Dynamic frontend controller & API handler
```

---

## 🚀 Execution Guide

### Phase 1: Local Development (Node.js)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local server:
   ```bash
   npm start
   ```
3. Open your browser:
   ```text
   http://localhost:3000
   ```
   *(Note: Press Ctrl+C in your terminal to stop the local server before running Docker to avoid port 3000 conflicts!)*

---

### Phase 2: Containerize with Docker

1. **Build the Docker Image**:
   ```bash
   docker build -t notice-board-app:latest .
   ```

2. **Run the Docker Container on Port 3000**:
   ```bash
   docker run -d -p 3000:3000 --name notice-board-container notice-board-app:latest
   ```

   *(Tip: If port 3000 is occupied by a local process, you can either stop that process or run on port 3001:*
   `docker run -d -p 3001:3000 --name notice-board-container notice-board-app:latest`*)*

3. **Verify Container Execution**:
   ```bash
   # Check running containers
   docker ps

   # View container logs
   docker logs notice-board-container

   # Health probe check
   curl http://localhost:3000/api/healthz
   ```

---

### Phase 3: Deploy on Kubernetes Cluster

1. **Apply Manifests to Kubernetes**:
   ```bash
   kubectl apply -f k8s/k8s-all-in-one.yaml
   ```

2. **Verify Pods & Deployments**:
   ```bash
   kubectl get deployments
   kubectl get pods -l app=notice-board-app -o wide
   ```
   *You will see 3 replicas running in parallel.*

3. **Verify Service**:
   ```bash
   kubectl get service notice-board-service
   ```

4. **Access Application via Port Forward**:
   ```bash
   kubectl port-forward service/notice-board-service 3000:3000
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 🔌 API Endpoints Reference

| Endpoint | Method | Description | Usage |
| :--- | :--- | :--- | :--- |
| `/api/healthz` | `GET` | Health status, timestamp, pod name (`Selvaraj`) | Kubernetes Liveness/Readiness Probe |
| `/api/info` | `GET` | Full project & system runtime metadata | Pod & System Diagnostics Tab |
| `/api/status` | `GET` | Server heartbeat & uptime ping | Basic Ping / Status Check |
| `/api/notices` | `GET` | Retrieve all active notices | Notice Board Feed |
| `/api/notices` | `POST` | Publish a new notice | Modal Form Submission |
| `/api/notices/:id` | `DELETE` | Delete a notice by ID | Notice Card Trash Action |
