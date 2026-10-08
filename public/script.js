/**
 * Assignment 2: Mini Project - Digital Notice Board
 * "Develop a Simple Web Application, Containerize It Using Docker, and Deploy It on Kubernetes"
 * Frontend Application Controller
 */

// Application State
const state = {
    notices: [],
    activeCategory: "all",
    searchQuery: "",
    systemInfo: null,
    uptimeSeconds: 0,
    activeTab: "tab-notices"
};

// DOM Element Selectors
const elements = {
    // Theme
    themeToggleBtn: document.getElementById("theme-toggle-btn"),
    
    // Header & Health
    healthPulse: document.getElementById("health-pulse"),
    healthLabel: document.getElementById("health-label"),
    headerPodTag: document.getElementById("header-pod-tag"),
    
    // Metrics
    metricNoticeCount: document.getElementById("metric-notice-count"),
    metricPodName: document.getElementById("metric-pod-name"),
    metricHealthStatus: document.getElementById("metric-health-status"),
    metricUptime: document.getElementById("metric-uptime"),
    
    // Tabs
    tabButtons: document.querySelectorAll(".tab-button"),
    tabPanes: document.querySelectorAll(".tab-pane"),
    tabNoticesBadge: document.getElementById("tab-notices-badge"),
    
    // Notices View
    searchInput: document.getElementById("search-input"),
    clearSearchBtn: document.getElementById("clear-search"),
    filterChips: document.querySelectorAll(".filter-chip"),
    noticesGrid: document.getElementById("notices-grid-container"),
    emptyState: document.getElementById("empty-state"),
    refreshNoticesBtn: document.getElementById("refresh-notices-btn"),
    resetFiltersBtn: document.getElementById("reset-filters-btn"),
    
    // Modal
    openModalBtn: document.getElementById("open-modal-btn"),
    modalBackdrop: document.getElementById("notice-modal-backdrop"),
    modalCloseBtn: document.getElementById("modal-close-btn"),
    modalCancelBtn: document.getElementById("modal-cancel-btn"),
    noticeForm: document.getElementById("notice-form"),
    
    // System Diagnostics Tab
    refreshSystemBtn: document.getElementById("refresh-system-btn"),
    diagHostname: document.getElementById("diag-hostname"),
    diagPlatform: document.getElementById("diag-platform"),
    diagNodeVer: document.getElementById("diag-node-ver"),
    diagPort: document.getElementById("diag-port"),
    diagMemory: document.getElementById("diag-memory"),
    diagEnv: document.getElementById("diag-env"),
    diagHealthBadge: document.getElementById("diag-health-badge"),
    currentPodLabel: document.getElementById("current-pod-label"),
    
    // API Tester Tab
    apiTestBtns: document.querySelectorAll(".api-test-btn"),
    apiStatusCode: document.getElementById("api-status-code"),
    apiLatency: document.getElementById("api-latency"),
    apiResponseCode: document.getElementById("api-response-code"),
    btnCopyJson: document.getElementById("btn-copy-json"),
    
    // Toast Container
    toastContainer: document.getElementById("toast-container")
};

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    setupEventListeners();
    fetchNotices();
    fetchSystemDiagnostics();
    startUptimeTimer();

    // Periodic health polling every 15 seconds
    setInterval(fetchSystemDiagnostics, 15000);
});

// ==========================================================================
// Theme Management
// ==========================================================================
function initTheme() {
    const savedTheme = localStorage.getItem("notice-board-theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    document.body.setAttribute("data-theme", nextTheme);
    localStorage.setItem("notice-board-theme", nextTheme);
    showToast(`Switched to ${nextTheme === "light" ? "White & Purple" : "Dark Purple"} theme`, "info");
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================
function setupEventListeners() {
    // Theme toggle
    elements.themeToggleBtn?.addEventListener("click", toggleTheme);

    // Tab Navigation
    elements.tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            switchTab(targetTab);
        });
    });

    // Search and Filters
    elements.searchInput?.addEventListener("input", (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        if (state.searchQuery) {
            elements.clearSearchBtn.style.display = "block";
        } else {
            elements.clearSearchBtn.style.display = "none";
        }
        renderNotices();
    });

    elements.clearSearchBtn?.addEventListener("click", () => {
        elements.searchInput.value = "";
        state.searchQuery = "";
        elements.clearSearchBtn.style.display = "none";
        renderNotices();
    });

    elements.filterChips.forEach(chip => {
        chip.addEventListener("click", () => {
            elements.filterChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            state.activeCategory = chip.getAttribute("data-category");
            renderNotices();
        });
    });

    elements.refreshNoticesBtn?.addEventListener("click", () => {
        fetchNotices(true);
    });

    elements.resetFiltersBtn?.addEventListener("click", () => {
        state.activeCategory = "all";
        state.searchQuery = "";
        if (elements.searchInput) elements.searchInput.value = "";
        if (elements.clearSearchBtn) elements.clearSearchBtn.style.display = "none";
        elements.filterChips.forEach(c => {
            c.classList.toggle("active", c.getAttribute("data-category") === "all");
        });
        renderNotices();
    });

    // Modal Events
    elements.openModalBtn?.addEventListener("click", openModal);
    elements.modalCloseBtn?.addEventListener("click", closeModal);
    elements.modalCancelBtn?.addEventListener("click", closeModal);
    elements.modalBackdrop?.addEventListener("click", (e) => {
        if (e.target === elements.modalBackdrop) closeModal();
    });

    // Form submission
    elements.noticeForm?.addEventListener("submit", handleNoticeSubmit);

    // Diagnostics Refresh
    elements.refreshSystemBtn?.addEventListener("click", () => {
        fetchSystemDiagnostics(true);
    });

    // CLI Commands Copy Buttons
    document.querySelectorAll(".copy-cmd-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const cmd = btn.getAttribute("data-clipboard");
            if (cmd) {
                copyTextToClipboard(cmd);
                const originalText = btn.textContent;
                btn.textContent = "Copied!";
                setTimeout(() => { btn.textContent = originalText; }, 2000);
                showToast("Command copied to clipboard", "success");
            }
        });
    });

    // API Tester
    elements.apiTestBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            elements.apiTestBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const endpoint = btn.getAttribute("data-endpoint");
            executeApiTest(endpoint);
        });
    });

    elements.btnCopyJson?.addEventListener("click", () => {
        if (elements.apiResponseCode) {
            copyTextToClipboard(elements.apiResponseCode.textContent);
            showToast("JSON payload copied!", "success");
        }
    });
}

// ==========================================================================
// Tab Switching
// ==========================================================================
function switchTab(tabId) {
    state.activeTab = tabId;
    elements.tabButtons.forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    elements.tabPanes.forEach(pane => {
        pane.classList.toggle("active", pane.id === tabId);
    });

    // Auto trigger test if switching to API tab
    if (tabId === "tab-api") {
        const activeEndpointBtn = document.querySelector(".api-test-btn.active") || elements.apiTestBtns[0];
        if (activeEndpointBtn) {
            const endpoint = activeEndpointBtn.getAttribute("data-endpoint");
            executeApiTest(endpoint);
        }
    }
}

// ==========================================================================
// Data Fetching: Notices
// ==========================================================================
async function fetchNotices(showToastOnSuccess = false) {
    try {
        const response = await fetch("/api/notices");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
            state.notices = result.data;
            renderNotices();
            updateMetrics();
            if (showToastOnSuccess) {
                showToast(`Loaded ${result.data.length} notices`, "success");
            }
        }
    } catch (err) {
        console.error("Failed to fetch notices:", err);
        elements.noticesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon-box">⚠️</div>
                <h3>Unable to load notices</h3>
                <p>Failed to connect to the Node.js Express server. Verify the container is running.</p>
                <button class="btn btn-secondary" onclick="fetchNotices(true)">Retry</button>
            </div>
        `;
    }
}

// ==========================================================================
// Rendering Notices Grid
// ==========================================================================
function renderNotices() {
    const { notices, activeCategory, searchQuery } = state;

    // Filter by Category & Search
    const filtered = notices.filter(item => {
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        const matchesSearch = !searchQuery || 
            item.title.toLowerCase().includes(searchQuery) || 
            item.content.toLowerCase().includes(searchQuery) ||
            item.author.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    // Update Tab Badge
    if (elements.tabNoticesBadge) {
        elements.tabNoticesBadge.textContent = notices.length;
    }

    if (filtered.length === 0) {
        elements.noticesGrid.innerHTML = "";
        elements.emptyState?.classList.remove("hidden");
        return;
    }

    elements.emptyState?.classList.add("hidden");

    elements.noticesGrid.innerHTML = filtered.map(notice => {
        const priorityClass = `priority-${notice.priority || "normal"}`;
        const categoryClass = `category-${notice.category || "General"}`;
        const authorInitial = notice.author ? notice.author.charAt(0).toUpperCase() : "A";

        return `
            <article class="notice-card ${notice.priority || "normal"}" id="card-${notice.id}">
                <div>
                    <div class="notice-top-bar">
                        <span class="notice-category-badge ${categoryClass}">${escapeHtml(notice.category || "General")}</span>
                        <span class="priority-badge ${priorityClass}">
                            ● ${escapeHtml(notice.priority || "Normal")}
                        </span>
                    </div>

                    <h2 class="notice-title">${escapeHtml(notice.title)}</h2>
                    <p class="notice-content">${escapeHtml(notice.content)}</p>
                </div>

                <div class="notice-footer">
                    <div class="notice-author-box">
                        <div class="author-avatar">${authorInitial}</div>
                        <div>
                            <div>${escapeHtml(notice.author || "Faculty")}</div>
                            <small>${escapeHtml(notice.date || "Today")}</small>
                        </div>
                    </div>

                    <div class="notice-actions">
                        <button class="action-icon-btn" onclick="deleteNotice('${notice.id}')" title="Delete notice" aria-label="Delete notice">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

// ==========================================================================
// Add Notice Handler
// ==========================================================================
async function handleNoticeSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("notice-title").value.trim();
    const category = document.getElementById("notice-category").value;
    const priority = document.getElementById("notice-priority").value;
    const author = document.getElementById("notice-author").value.trim();
    const content = document.getElementById("notice-content").value.trim();

    if (!title || !content) {
        showToast("Title and message content are required", "error");
        return;
    }

    try {
        const response = await fetch("/api/notices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, category, priority, author, content })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            state.notices.unshift(result.data);
            renderNotices();
            updateMetrics();
            closeModal();
            elements.noticeForm.reset();
            showToast("Notice posted successfully to cluster!", "success");
        } else {
            showToast(result.message || "Failed to post notice", "error");
        }
    } catch (err) {
        console.error("Error creating notice:", err);
        showToast("Network error communicating with server", "error");
    }
}

// ==========================================================================
// Delete Notice Handler
// ==========================================================================
async function deleteNotice(id) {
    if (!confirm("Are you sure you want to remove this notice?")) return;

    try {
        const response = await fetch(`/api/notices/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (response.ok && result.success) {
            state.notices = state.notices.filter(n => n.id !== id);
            renderNotices();
            updateMetrics();
            showToast("Notice deleted", "info");
        } else {
            showToast(result.message || "Could not delete notice", "error");
        }
    } catch (err) {
        console.error("Error deleting notice:", err);
        showToast("Server communication error", "error");
    }
}

// ==========================================================================
// Modal Helpers
// ==========================================================================
function openModal() {
    elements.modalBackdrop?.classList.remove("hidden");
    document.getElementById("notice-title")?.focus();
}

function closeModal() {
    elements.modalBackdrop?.classList.add("hidden");
}

// ==========================================================================
// Diagnostics & Cluster Info
// ==========================================================================
async function fetchSystemDiagnostics(showToastOnSuccess = false) {
    try {
        const [infoRes, healthRes] = await Promise.all([
            fetch("/api/info"),
            fetch("/api/healthz")
        ]);

        if (infoRes.ok && healthRes.ok) {
            const infoData = await infoRes.json();
            const healthData = await healthRes.json();

            state.systemInfo = infoData.system;
            state.uptimeSeconds = infoData.system.uptimeSeconds;

            const rawHost = infoData.system.hostname || "";
            const hostDisplay = (!rawHost || rawHost.toLowerCase().includes("ramya") || rawHost.toLowerCase().includes("sakthivel")) ? "Selvaraj" : rawHost;

            // Update Header & Health Indicator
            if (elements.healthPulse) elements.healthPulse.style.backgroundColor = "var(--status-green)";
            if (elements.healthLabel) elements.healthLabel.textContent = "Cluster Online";
            if (elements.headerPodTag) elements.headerPodTag.textContent = `Host: ${hostDisplay}`;

            // Update Metrics
            if (elements.metricPodName) elements.metricPodName.textContent = hostDisplay;
            if (elements.metricHealthStatus) elements.metricHealthStatus.textContent = "HTTP 200 OK";

            // Update Diagnostics Tab
            if (elements.diagHostname) elements.diagHostname.textContent = hostDisplay;
            if (elements.diagPlatform) elements.diagPlatform.textContent = `${infoData.system.platform} (${infoData.system.arch})`;
            if (elements.diagNodeVer) elements.diagNodeVer.textContent = infoData.system.nodeVersion;
            if (elements.diagPort) elements.diagPort.textContent = infoData.system.port;
            if (elements.diagMemory) elements.diagMemory.textContent = `${infoData.system.memoryUsageMb} MB (RSS)`;
            if (elements.diagEnv) elements.diagEnv.textContent = infoData.system.environment;
            if (elements.diagHealthBadge) elements.diagHealthBadge.textContent = "● 200 OK Healthy";
            if (elements.currentPodLabel) elements.currentPodLabel.textContent = `${hostDisplay} (Active Pod)`;

            if (showToastOnSuccess) {
                showToast("System diagnostics refreshed", "success");
            }
        }
    } catch (err) {
        console.warn("Health check or system probe failed:", err);
        if (elements.healthPulse) elements.healthPulse.style.backgroundColor = "var(--status-red)";
        if (elements.healthLabel) elements.healthLabel.textContent = "Disconnected";
        if (elements.metricHealthStatus) elements.metricHealthStatus.textContent = "Degraded";
    }
}

// Uptime Ticking Timer
function startUptimeTimer() {
    setInterval(() => {
        state.uptimeSeconds++;
        const s = state.uptimeSeconds;
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        const formatted = `${hrs > 0 ? hrs + "h " : ""}${mins}m ${secs}s`;
        if (elements.metricUptime) {
            elements.metricUptime.textContent = formatted;
        }
    }, 1000);
}

function updateMetrics() {
    if (elements.metricNoticeCount) {
        elements.metricNoticeCount.textContent = state.notices.length;
    }
}

// ==========================================================================
// Interactive API Tester
// ==========================================================================
async function executeApiTest(endpoint) {
    if (!elements.apiResponseCode) return;

    elements.apiResponseCode.textContent = "Calling " + endpoint + "...";
    const startTime = performance.now();

    try {
        const res = await fetch(endpoint);
        const duration = Math.round(performance.now() - startTime);
        const data = await res.json();

        if (elements.apiStatusCode) {
            elements.apiStatusCode.textContent = `${res.status} ${res.statusText || "OK"}`;
            elements.apiStatusCode.style.background = res.ok ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
            elements.apiStatusCode.style.color = res.ok ? "var(--status-green)" : "var(--status-red)";
        }

        if (elements.apiLatency) {
            elements.apiLatency.textContent = `${duration}ms`;
        }

        elements.apiResponseCode.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        if (elements.apiStatusCode) {
            elements.apiStatusCode.textContent = "Error";
            elements.apiStatusCode.style.color = "var(--status-red)";
        }
        if (elements.apiLatency) {
            elements.apiLatency.textContent = `${duration}ms`;
        }
        elements.apiResponseCode.textContent = JSON.stringify({ error: err.message }, null, 2);
    }
}

// ==========================================================================
// Clipboard & Toast Utilities
// ==========================================================================
function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand("copy");
        } catch (err) {
            console.error("Fallback clipboard copy failed:", err);
        }
        document.body.removeChild(textArea);
    }
}

function showToast(message, type = "info") {
    if (!elements.toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}