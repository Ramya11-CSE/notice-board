const express = require("express");
const os = require("os");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Get hostname with override for user
function getHostname() {
    const raw = os.hostname();
    if (!raw || raw.toLowerCase().includes("ramya") || raw.toLowerCase().includes("sakthivel")) {
        return "Selvaraj";
    }
    return process.env.POD_NAME || raw;
}

// In-memory notice repository
let notices = [
    {
        id: "notice-1",
        title: "Mini Project Submission: Cloud Web Application",
        category: "Project",
        priority: "urgent",
        author: "Selvaraj",
        date: new Date(Date.now() - 3600000 * 2).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        content: "Mini Project 'Develop a Simple Web Application, Containerize It Using Docker, and Deploy It on Kubernetes' containerized with Docker and verified with Kubernetes 3 replicas."
    },
    {
        id: "notice-2",
        title: "Upcoming Cloud Computing Lab Examination",
        category: "Exam",
        priority: "urgent",
        author: "Lab Coordinator",
        date: new Date(Date.now() - 3600000 * 24).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        content: "The Cloud Computing & Virtualization practical examination is scheduled for Friday at 10:00 AM in Lab 3. Ensure Docker Desktop and kubectl are configured."
    },
    {
        id: "notice-3",
        title: "Kubernetes Pod Auto-Scaling Workshop",
        category: "DevOps",
        priority: "normal",
        author: "DevOps Club",
        date: new Date(Date.now() - 3600000 * 48).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        content: "Hands-on session on Horizontal Pod Autoscaler (HPA), rolling updates, and zero-downtime deployment strategies on Kubernetes cluster."
    },
    {
        id: "notice-4",
        title: "Project Architecture & Code Review",
        category: "Review",
        priority: "important",
        author: "Selvaraj",
        date: new Date(Date.now() - 3600000 * 72).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        content: "Code review for microservices containerization will be conducted next Monday. Prepare your Dockerfile and Kubernetes YAML manifests."
    }
];

// Helper: Get system / container runtime metadata
function getSystemMetadata() {
    const uptimeSec = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;

    return {
        hostname: getHostname(),
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptimeSeconds: uptimeSec,
        uptimeFormatted: `${hours}h ${minutes}m ${seconds}s`,
        memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
        freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
        environment: process.env.NODE_ENV || "production",
        port: PORT,
        isContainer: Boolean(process.env.KUBERNETES_SERVICE_HOST || process.env.DOCKER_CONTAINER || process.env.CONTAINER)
    };
}

// REST Endpoints

// 1. Health check endpoint (for Kubernetes liveness & readiness probes)
app.get("/api/healthz", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        pod: getHostname(),
        uptime: process.uptime()
    });
});

// 2. Project metadata & cluster diagnostics
app.get("/api/info", (req, res) => {
    res.json({
        project: {
            title: "Develop a Simple Web Application, Containerize It Using Docker, and Deploy It on Kubernetes",
            course: "Cloud Computing & DevOps",
            author: "Selvaraj",
            version: "1.0.0"
        },
        system: getSystemMetadata()
    });
});

// 3. Status endpoint
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "Digital Notice Board server is healthy and running!",
        timestamp: new Date().toISOString(),
        podName: getHostname(),
        uptime: process.uptime()
    });
});

// 4. Get all notices
app.get("/api/notices", (req, res) => {
    res.json({
        success: true,
        count: notices.length,
        data: notices
    });
});

// 5. Add a new notice
app.post("/api/notices", (req, res) => {
    const { title, category, priority, author, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            message: "Title and content are required fields."
        });
    }

    const newNotice = {
        id: `notice-${Date.now()}`,
        title: title.trim(),
        category: category || "General",
        priority: priority || "normal",
        author: author && author.trim() ? author.trim() : "Selvaraj",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        content: content.trim()
    };

    notices.unshift(newNotice); // prepend to top

    res.status(201).json({
        success: true,
        message: "Notice published successfully!",
        data: newNotice
    });
});

// 6. Delete a notice
app.delete("/api/notices/:id", (req, res) => {
    const id = req.params.id;
    const initialLen = notices.length;
    notices = notices.filter(n => n.id !== id);

    if (notices.length === initialLen) {
        return res.status(404).json({
            success: false,
            message: "Notice not found."
        });
    }

    res.json({
        success: true,
        message: "Notice deleted successfully!"
    });
});

// Start Express server
const server = app.listen(PORT, () => {
    console.log("=======================================================");
    console.log(" Digital Notice Board Web Server Running!");
    console.log(" Title: Develop a Simple Web Application, Containerize It");
    console.log("        Using Docker, and Deploy It on Kubernetes");
    console.log(` Server URL : http://localhost:${PORT}`);
    console.log(` Pod Host   : ${getHostname()}`);
    console.log(` Health Check: http://localhost:${PORT}/api/healthz`);
    console.log("=======================================================");
});

// Graceful shutdown handler for container terminations
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Gracefully shutting down server...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});