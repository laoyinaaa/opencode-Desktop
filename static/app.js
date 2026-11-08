(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORE = {
    theme: "oc.theme",
    model: "oc.model",
    agent: "oc.agent",
    variants: "oc.variants",
    session: "oc.session",
    autoAllow: "oc.autoAllow",
    pinned: "oc.pinnedSessions",
    sidebarWidth: "oc.sidebarWidth"
  };

  const ui = {
    app: $("#app"),
    appBackground: $("#app-background"),
    sidebar: $("#sidebar"),
    sidebarResizer: $("#sidebar-resizer"),
    sidebarToggle: $("#sidebar-toggle"),
    sidebarBackdrop: $("#sidebar-backdrop"),
    themeToggle: $("#theme-toggle"),
    newChat: $("#new-chat"),
    sessionSearch: $("#session-search"),
    sessionList: $("#session-list"),
    projectBtn: $("#project-btn"),
    projectPath: $("#project-path"),
    connDot: $("#conn-dot"),
    connText: $("#conn-text"),
    settingsBtn: $("#settings-btn"),
    chatTitle: $("#chat-title"),
    chatStateDot: $("#chat-state-dot"),
    chatState: $("#chat-state"),
    chatAgent: $("#chat-agent"),
    todoBtn: $("#todo-btn"),
    todoProgress: $("#todo-progress"),
    updateBtn: $("#update-btn"),
    updateVersion: $("#update-version"),
    updateModal: $("#update-modal"),
    updateClose: $("#update-close"),
    updateCurrent: $("#update-current"),
    updateLatest: $("#update-latest"),
    updateProgress: $("#update-progress"),
    updateError: $("#update-error"),
    updateErrorText: $("#update-error-text"),
    updateDetail: $("#update-detail"),
    updateStart: $("#update-start"),
    updateLater: $("#update-later"),
    openFolderBtn: $("#open-folder-btn"),
    chatScroll: $("#chat-scroll"),
    welcome: $("#welcome"),
    welcomeSub: $("#welcome-sub"),
    messages: $("#messages"),
    jumpLatest: $("#jump-latest"),
    composer: $(".composer"),
    prompt: $("#prompt"),
    attachBtn: $("#attach-btn"),
    imageInput: $("#image-input"),
    fileBtn: $("#file-btn"),
    attachments: $("#composer-attachments"),
    promptQueue: $("#prompt-queue"),
    commandPopover: $("#command-popover"),
    agentPicker: $("#agent-picker"),
    agentLabel: $("#agent-label"),
    modelPicker: $("#model-picker"),
    modelLabel: $("#model-label"),
    variantPicker: $("#variant-picker"),
    variantLabel: $("#variant-label"),
    contextUsage: $("#context-usage"),
    contextUsageTokens: $("#context-usage-tokens"),
    contextUsageValue: $("#context-usage-value"),
    composerHint: $("#composer-hint"),
    stopBtn: $("#stop-btn"),
    sendBtn: $("#send-btn"),
    composerStatus: $("#composer-status"),
    onboarding: $("#onboarding"),
    onboardingPath: $("#onboarding-path"),
    onboardingBrowse: $("#onboarding-browse"),
    onboardingStart: $("#onboarding-start"),
    onboardingLogin: $("#onboarding-login"),
    onboardingAuthHint: $("#onboarding-auth-hint"),
    settingsLogin: $("#settings-login"),
    settingsAutoAllow: $("#settings-auto-allow"),
    loading: $("#loading"),
    loadingTitle: $("#loading-title"),
    loadingText: $("#loading-text"),
    fatal: $("#fatal"),
    fatalTitle: $("#fatal-title"),
    fatalText: $("#fatal-text"),
    fatalLog: $("#fatal-log"),
    fatalChange: $("#fatal-change"),
    fatalRetry: $("#fatal-retry"),
    settingsModal: $("#settings-modal"),
    settingsPath: $("#settings-path"),
    settingsBrowse: $("#settings-browse"),
    settingsWallpaperPreview: $("#settings-wallpaper-preview"),
    settingsWallpaperPick: $("#settings-wallpaper-pick"),
    settingsWallpaperClear: $("#settings-wallpaper-clear"),
    settingsWallpaperInput: $("#settings-wallpaper-input"),
    settingsWallpaperOpacity: $("#settings-wallpaper-opacity"),
    settingsWallpaperOpacityValue: $("#settings-wallpaper-opacity-value"),
    serviceExe: $("#service-exe"),
    servicePort: $("#service-port"),
    serviceConfig: $("#service-config"),
    settingsSave: $("#settings-save"),
    modelModal: $("#model-modal"),
    modelSearch: $("#model-search"),
    modelList: $("#model-list"),
    variantSection: $("#variant-section"),
    variantOptions: $("#variant-options"),
    agentModal: $("#agent-modal"),
    agentList: $("#agent-list"),
    permissionModal: $("#permission-modal"),
    permissionSub: $("#permission-sub"),
    permissionType: $("#permission-type"),
    permissionDetail: $("#permission-detail"),
    permissionPatterns: $("#permission-patterns"),
    permissionReject: $("#permission-reject"),
    permissionAlways: $("#permission-always"),
    permissionOnce: $("#permission-once"),
    questionModal: $("#question-modal"),
    questionBody: $("#question-body"),
    questionRejectX: $("#question-reject-x"),
    questionReject: $("#question-reject"),
    questionSubmit: $("#question-submit"),
    renameModal: $("#rename-modal"),
    renameInput: $("#rename-input"),
    renameCancel: $("#rename-cancel"),
    renameSave: $("#rename-save"),
    confirmModal: $("#confirm-modal"),
    confirmTitle: $("#confirm-title"),
    confirmText: $("#confirm-text"),
    confirmCancel: $("#confirm-cancel"),
    confirmOk: $("#confirm-ok"),
    todoDrawer: $("#todo-drawer"),
    todoSummary: $("#todo-summary"),
    todoList: $("#todo-list"),
    todoClose: $("#todo-close"),
    drawerBackdrop: $("#drawer-backdrop"),
    toasts: $("#toasts"),
    hljsTheme: $("#hljs-theme")
  };

  const state = {
    bootstrap: null,
    cwd: "",
    meta: null,
    sessions: [],
    sessionId: null,
    sessionInfo: null,
    messages: new Map(),
    messageOrder: [],
    partNodes: new Map(),
    todos: [],
    busy: new Map(),
    queues: new Map(),
    queueSending: new Set(),
    queuePaused: new Set(),
    queueTimers: new Map(),
    queueRuns: new Map(),
    queueStepReady: new Set(),
    queueAwaiting: new Set(),
    taskStarted: new Set(),
    notifySuppressed: new Set(),
    notifyFailed: new Set(),
    commands: [],
    commandsLoaded: false,
    commandsLoading: false,
    commandMenuOpen: false,
    commandMenuItems: [],
    commandMenuIndex: 0,
    commandMenuQuery: "",
    attachments: [],
    addingImages: false,
    autoAllow: false,
    autoAllowNoticeAt: 0,
    pinned: new Set(),
    autoApproving: new Set(),
    autoApprovingBatch: false,
    permissions: [],
    questions: [],
    activePermissionId: null,
    activeQuestionId: null,
    selectedModel: null,
    selectedAgent: "build",
    selectedVariant: null,
    selectedVariants: {},
    theme: "dark",
    wallpaperImage: "",
    wallpaperTransparency: 35,
    eventSource: null,
    eventConnected: false,
    eventEverOpen: false,
    connectionToast: null,
    loadingSession: false,
    sendInFlight: false,
    autoScroll: true,
    loadSeq: 0,
    search: "",
    lastConnectionError: false,
    fatalDetail: "",
    confirmResolve: null,
    renameSessionID: null,
    renameBusy: false,
    sessionMenu: null,
    pendingTheme: null,
    updateInfo: null,
    updateChecking: false,
    updating: false,
    loginOpening: false,
    loginOpened: false
  };

  const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
  const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
  const MAX_IMAGE_COUNT = 4;
  const MAX_FILE_COUNT = 8;
  const DEFAULT_WALLPAPER_TRANSPARENCY = 35;
  const MAX_WALLPAPER_DIMENSION = 2560;
  const MAX_WALLPAPER_SOURCE_BYTES = 30 * 1024 * 1024;
  const MAX_QUEUE_ITEMS = 20;
  const MAX_QUEUE_BYTES = 64 * 1024 * 1024;
  const QUEUE_FLUSH_DELAY = 180;
  const LOCAL_COMMANDS = [
    { name: "sessions", description: "搜索并切换会话", source: "local", action: "sessions" },
    { name: "new", description: "开始一个新的会话", source: "local", action: "new" },
    { name: "models", description: "选择模型与推理强度", source: "local", action: "models" },
    { name: "agents", description: "切换 Agent", source: "local", action: "agents" },
    { name: "settings", description: "打开项目与权限设置", source: "local", action: "settings" }
  ];
  let localIdSeq = 0;

  function localId(prefix) {
    localIdSeq += 1;
    return prefix + Date.now().toString(36) + "_" + localIdSeq;
  }

  const ICONS = {
    info: '<svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="M12 10.5v6M12 7.5v.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    success: '<svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="m8.2 12.2 2.5 2.4 5.1-5.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error: '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M12 3.5 21 20H3L12 3.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 9v5M12 17.2v.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    folder: '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-9Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    file: '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M6.5 3.5h7l4 4v13h-11z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13.5 3.5v4h4" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    image: '<svg class="icon" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10" r="1.6" stroke="currentColor" stroke-width="1.4"/><path d="m5.5 17 4.5-4.5 3 3 2.2-2.2 3.3 3.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    reasoning: '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M9.5 18.5h5M10 21h4M8 15.5a6.5 6.5 0 1 1 8 0c-.9.8-1.5 1.7-1.5 2.5h-5c0-.8-.6-1.7-1.5-2.5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevron: '<svg class="icon chevron" viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    stop: '<svg class="icon" viewBox="0 0 24 24" fill="none"><rect x="7" y="7" width="10" height="10" rx="1.6" fill="currentColor"/></svg>',
    pin: '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M8 4h8l-1.5 5.5 3 3V14H6.5v-1.5l3-3L8 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 14v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };

  const TOOL_META = {
    bash: { label: "Shell", icon: "terminal" },
    read: { label: "读取", icon: "file" },
    write: { label: "写入", icon: "edit" },
    edit: { label: "编辑", icon: "edit" },
    glob: { label: "查找", icon: "search" },
    grep: { label: "搜索", icon: "search" },
    list: { label: "列出", icon: "list" },
    task: { label: "子任务", icon: "spark" },
    todowrite: { label: "更新待办", icon: "checklist" },
    webfetch: { label: "网页", icon: "globe" },
    question: { label: "询问", icon: "question" },
    skill: { label: "技能", icon: "spark" },
    patch: { label: "补丁", icon: "edit" }
  };

  const TOOL_PATHS = {
    terminal: '<path d="M5 7.5 9.5 12 5 16.5M11.5 17h7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    file: '<path d="M6.5 3.5h7l4 4v13h-11z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13.5 3.5v4h4" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    edit: '<path d="m5 16.5 8.8-8.8 2.5 2.5L7.5 19H5v-2.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m14.7 6.8 2-2a1.4 1.4 0 0 1 2 0l.5.5a1.4 1.4 0 0 1 0 2l-2 2" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    search: '<circle cx="11" cy="11" r="6.2" stroke="currentColor" stroke-width="1.6"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="4.5" cy="6.5" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="17.5" r="1" fill="currentColor"/>',
    spark: '<path d="M12 3.5 13.7 9l5.3 1.7-5.3 1.7L12 18l-1.7-5.6L5 10.7 10.3 9 12 3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    checklist: '<path d="m4.5 7 1.4 1.4L8.5 5.8M4.5 12.5l1.4 1.4 2.6-2.6M4.5 18l1.4 1.4 2.6-2.6M11.5 7H20M11.5 12.5H20M11.5 18H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    globe: '<circle cx="12" cy="12" r="8.3" stroke="currentColor" stroke-width="1.6"/><path d="M3.8 12h16.4M12 3.7c2.3 2.3 3.4 5.1 3.4 8.3s-1.1 6-3.4 8.3c-2.3-2.3-3.4-5.1-3.4-8.3S9.7 6 12 3.7Z" stroke="currentColor" stroke-width="1.4"/>',
    question: '<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M9.7 9.2a2.4 2.4 0 1 1 3.6 2.1c-.8.5-1.3 1-1.3 2M12 16.8v.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
  };

  function iconForTool(tool) {
    const meta = TOOL_META[tool] || {};
    const path = TOOL_PATHS[meta.icon] || TOOL_PATHS.terminal;
    return '<svg class="icon" viewBox="0 0 24 24" fill="none">' + path + "</svg>";
  }

  const mdTimers = new WeakMap();

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function truncate(value, limit) {
    const text = String(value == null ? "" : value);
    if (text.length <= limit) return text;
    return text.slice(0, Math.max(0, limit - 1)).trimEnd() + "…";
  }

  function limitText(value, limit) {
    const text = String(value == null ? "" : value);
    if (text.length <= limit) return text;
    return text.slice(0, limit) + "\n\n… 已省略 " + (text.length - limit) + " 个字符";
  }

  function formatNumber(value) {
    const number = Number(value) || 0;
    if (number >= 1000000) return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
    if (number >= 1000) return (number / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(number);
  }

  function formatCost(value) {
    const number = Number(value) || 0;
    if (!number) return "";
    if (number < 0.01) return "$" + number.toFixed(4);
    return "$" + number.toFixed(2);
  }

  function formatClock(timestamp) {
    if (!timestamp) return "";
    try {
      return new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(new Date(timestamp));
    } catch (error) {
      return "";
    }
  }

  function formatDuration(milliseconds) {
    const value = Math.max(0, Number(milliseconds) || 0);
    if (value < 100) return "<0.1 秒";
    if (value < 60000) {
      const seconds = value / 1000;
      const text = seconds < 10 ? seconds.toFixed(1) : String(Math.round(seconds));
      return text.replace(/\.0$/, "") + " 秒";
    }
    const totalSeconds = Math.round(value / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 60) {
      return minutes + " 分 " + String(seconds).padStart(2, "0") + " 秒";
    }
    const hours = Math.floor(minutes / 60);
    return hours + " 小时 " + String(minutes % 60).padStart(2, "0") + " 分";
  }

  function formatRelative(timestamp) {
    if (!timestamp) return "";
    const now = Date.now();
    const diff = Math.max(0, now - Number(timestamp));
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return Math.floor(diff / 60000) + " 分钟前";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = new Date(Number(timestamp));
    const target = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const days = Math.round((today.getTime() - target.getTime()) / 86400000);
    if (days <= 0) return formatClock(timestamp);
    if (days === 1) return "昨天";
    if (days < 7) return days + " 天前";
    try {
      return new Intl.DateTimeFormat("zh-CN", {
        year: day.getFullYear() === today.getFullYear() ? undefined : "numeric",
        month: "short",
        day: "numeric"
      }).format(day);
    } catch (error) {
      return "";
    }
  }

  function sessionGroupKey(timestamp) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const day = new Date(Number(timestamp) || Date.now());
    const target = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const diff = Math.round((today - target) / 86400000);
    if (diff <= 0) return "今天";
    if (diff === 1) return "昨天";
    if (diff < 7) return "过去 7 天";
    return "更早";
  }

  function modelKey(providerID, modelID) {
    return String(providerID || "") + "/" + String(modelID || "");
  }

  function normalizeRef(ref) {
    if (!ref || typeof ref !== "object") return null;
    const providerID = ref.providerID || ref.provider;
    const modelID = ref.modelID || ref.id;
    if (!providerID || !modelID) return null;
    return {
      providerID,
      modelID,
      variant: ref.variant || null
    };
  }

  function findModel(ref) {
    if (!ref || !state.meta) return null;
    const providers = state.meta.providers || [];
    for (const provider of providers) {
      if (provider.id !== ref.providerID) continue;
      for (const model of provider.models || []) {
        if (model.id === ref.modelID) return { provider, model };
      }
    }
    return null;
  }

  function findProvider(providerID) {
    if (!state.meta) return null;
    return (state.meta.providers || []).find((provider) => provider.id === providerID) || null;
  }

  function modelDisplay(ref) {
    const found = findModel(ref);
    if (found) return found.model.name || found.model.id;
    return ref && ref.modelID ? ref.modelID : "";
  }

  function contextUsage() {
    let last = null;
    for (let index = state.messageOrder.length - 1; index >= 0; index -= 1) {
      const rec = state.messages.get(state.messageOrder[index]);
      if (!rec || rec.role !== "assistant" || !rec.info) continue;
      const tokens = rec.info.tokens || {};
      if (Number(tokens.output) > 0) {
        last = rec;
        break;
      }
    }
    if (!last) return null;
    const tokens = last.info.tokens || {};
    const cache = tokens.cache || {};
    const used = [
      tokens.input,
      tokens.output,
      tokens.reasoning,
      cache.read,
      cache.write
    ].reduce((sum, value) => sum + (Number(value) || 0), 0);
    if (!used) return null;
    let model = state.selectedModel ? findModel(state.selectedModel) : null;
    if (!model && last.info.providerID && last.info.modelID) {
      model = findModel({
        providerID: last.info.providerID,
        modelID: last.info.modelID
      });
    }
    const limit = Number(model && model.model && model.model.limit && model.model.limit.context) || 0;
    if (!limit) return null;
    return {
      used,
      limit,
      percent: Math.round((used / limit) * 100)
    };
  }

  function updateContextUsage() {
    if (!ui.contextUsage || !ui.contextUsageTokens || !ui.contextUsageValue) return;
    const usage = contextUsage();
    if (!usage) {
      ui.contextUsage.hidden = true;
      ui.contextUsage.title = "";
      ui.contextUsage.classList.remove("warn", "danger");
      return;
    }
    ui.contextUsage.hidden = false;
    ui.contextUsageTokens.textContent =
      formatNumber(usage.used) + " / " + formatNumber(usage.limit);
    ui.contextUsageValue.textContent =
      usage.percent === 0 ? "<1%" : usage.percent + "%";
    ui.contextUsage.title =
      "上下文已用 " +
      formatNumber(usage.used) +
      " / " +
      formatNumber(usage.limit) +
      " tokens";
    ui.contextUsage.classList.toggle("warn", usage.percent >= 80 && usage.percent < 95);
    ui.contextUsage.classList.toggle("danger", usage.percent >= 95);
  }

  function agentDisplay(name) {
    const value = String(name || "build");
    if (value === "build") return "Build";
    if (value === "plan") return "Plan";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function readStoredJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function writeStoredJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  }

  function debounce(fn, delay) {
    let timer = 0;
    return function () {
      const args = arguments;
      clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(null, args), delay);
    };
  }

  async function apiFetch(base, path, options) {
    const opts = options || {};
    const method = opts.method || "GET";
    const timeout = opts.timeout || 30000;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    if (opts.signal) {
      if (opts.signal.aborted) controller.abort();
      else opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
    try {
      const url = new URL(base + String(path).replace(/^\/+/, ""), location.origin);
      if (base.startsWith("/oc/") && state.cwd && !url.searchParams.has("directory")) {
        url.searchParams.set("directory", state.cwd);
      }
      const headers = { Accept: "application/json" };
      let payload;
      if (opts.body !== undefined) {
        headers["Content-Type"] = "application/json";
        payload = JSON.stringify(opts.body);
      }
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: payload,
        signal: controller.signal
      });
      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (error) {
          data = text;
        }
      }
      if (!response.ok) {
        const message =
          (data && (data.error || data.message)) ||
          (typeof data === "string" ? data.slice(0, 400) : "HTTP " + response.status);
        const failure = new Error(message);
        failure.status = response.status;
        failure.data = data;
        throw failure;
      }
      return data;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("请求超时，请稍后重试");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function ocFetch(path, options) {
    return apiFetch("/oc/", path, options);
  }

  function localFetch(path, options) {
    return apiFetch("/local/", path, options);
  }

  function copyText(text) {
    const value = String(text == null ? "" : text);
    if (!value) return Promise.resolve(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard
        .writeText(value)
        .then(() => true)
        .catch(() => fallbackCopy(value));
    }
    return Promise.resolve(fallbackCopy(value));
  }

  function fallbackCopy(value) {
    try {
      const helper = document.createElement("textarea");
      helper.value = value;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const ok = document.execCommand("copy");
      helper.remove();
      return ok;
    } catch (error) {
      return false;
    }
  }

  async function openExternal(url) {
    const value = String(url || "");
    if (!/^https?:\/\//i.test(value)) return;
    try {
      if (window.pywebview && window.pywebview.api && window.pywebview.api.open_url) {
        await window.pywebview.api.open_url(value);
        return;
      }
    } catch (error) {}
    window.open(value, "_blank", "noopener");
  }

  async function pickFolder() {
    try {
      if (window.pywebview && window.pywebview.api && window.pywebview.api.pick_folder) {
        const result = await window.pywebview.api.pick_folder();
        return result || "";
      }
    } catch (error) {}
    toast("当前环境无法打开文件夹选择器，请直接输入路径", "error");
    return "";
  }

  function prettyJson(value) {
    if (value == null) return "";
    if (typeof value === "string") {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch (error) {
        return value;
      }
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return String(value);
    }
  }

  function isNearBottom() {
    const el = ui.chatScroll;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  function scrollToBottom(behavior) {
    if (behavior === "smooth") {
      ui.chatScroll.scrollTo({
        top: ui.chatScroll.scrollHeight,
        behavior: "smooth"
      });
    } else {
      ui.chatScroll.scrollTop = ui.chatScroll.scrollHeight;
    }
    state.autoScroll = true;
    ui.jumpLatest.hidden = true;
  }

  const scheduleScroll = debounce(() => {
    if (state.autoScroll) scrollToBottom("auto");
  }, 40);

  function syncNativeTitlebarTheme(theme, attempt) {
    const api = window.pywebview && window.pywebview.api;
    if (api && typeof api.set_titlebar_theme === "function") {
      try {
        const result = api.set_titlebar_theme(theme);
        if (result && typeof result.catch === "function") result.catch(() => {});
      } catch (error) {}
      return;
    }
    const tries = attempt || 0;
    if (tries < 5) {
      window.setTimeout(
        () => syncNativeTitlebarTheme(theme, tries + 1),
        250
      );
    }
  }

  function applyTheme(theme, persist) {
    const next = theme === "light" ? "light" : "dark";
    state.theme = next;
    document.documentElement.dataset.theme = next;
    syncNativeTitlebarTheme(next);
    if (ui.hljsTheme) {
      ui.hljsTheme.href =
        next === "light"
          ? "/static/vendor/github.min.css"
          : "/static/vendor/github-dark.min.css";
    }
    $$("[data-theme-choice]").forEach((button) => {
      button.classList.toggle("active", button.dataset.themeChoice === next);
    });
    try {
      localStorage.setItem(STORE.theme, next);
    } catch (error) {}
    if (persist) {
      localFetch("preferences", {
        method: "POST",
        body: { theme: next },
        timeout: 15000
      }).catch(() => {});
    }
  }

  function initTheme() {
    let saved = "";
    try {
      saved = localStorage.getItem(STORE.theme) || "";
    } catch (error) {}
    if (saved !== "light" && saved !== "dark") {
      saved = state.bootstrap && state.bootstrap.theme ? state.bootstrap.theme : "dark";
    }
    applyTheme(saved);
  }

  function toggleTheme() {
    applyTheme(state.theme === "dark" ? "light" : "dark", true);
  }

  function initAutoAllow() {
    let saved = false;
    try {
      saved = localStorage.getItem(STORE.autoAllow) === "1";
    } catch (error) {}
    state.autoAllow = saved;
    if (ui.settingsAutoAllow) ui.settingsAutoAllow.checked = saved;
  }

  function initSidebarResize() {
    const resizer = ui.sidebarResizer;
    const sidebar = ui.sidebar;
    if (!resizer || !sidebar) return;

    const MIN = 220;
    const MAX = 520;
    const DEFAULT = 292;

    let saved = 0;
    try {
      saved = parseInt(localStorage.getItem(STORE.sidebarWidth) || "", 10) || 0;
    } catch (e) {}
    if (!saved && state.bootstrap && state.bootstrap.sidebarWidth) {
      saved = state.bootstrap.sidebarWidth;
    }
    if (saved >= MIN && saved <= MAX) {
      document.documentElement.style.setProperty("--sidebar-width", saved + "px");
    }

    let dragging = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener("mousedown", function (e) {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;
      resizer.classList.add("active");
      document.body.classList.add("resizing");

      function onMove(e) {
        if (!dragging) return;
        const delta = e.clientX - startX;
        const newWidth = Math.min(MAX, Math.max(MIN, startWidth + delta));
        document.documentElement.style.setProperty("--sidebar-width", newWidth + "px");
      }

      function onUp() {
        dragging = false;
        resizer.classList.remove("active");
        document.body.classList.remove("resizing");
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);

        const finalWidth = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width")
        ) || DEFAULT;
        try {
          localStorage.setItem(STORE.sidebarWidth, String(finalWidth));
        } catch (e) {}
        localFetch("preferences", {
          method: "POST",
          body: { sidebarWidth: finalWidth },
          timeout: 15000
        }).catch(function () {});
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }

  function clampWallpaperTransparency(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return DEFAULT_WALLPAPER_TRANSPARENCY;
    return Math.min(100, Math.max(0, Math.round(number)));
  }

  function applyWallpaper() {
    const active = Boolean(state.wallpaperImage);
    const tint = Math.round((1 - state.wallpaperTransparency / 100) * 1000) / 1000;
    document.documentElement.classList.toggle("has-wallpaper", active);
    document.documentElement.style.setProperty("--wallpaper-tint", String(tint));
    document.documentElement.style.setProperty(
      "--wallpaper-panel-alpha",
      String(Math.round(tint * 0.62 * 1000) / 1000)
    );
    document.documentElement.style.setProperty(
      "--wallpaper-composer-alpha",
      String(Math.round((0.42 + tint * 0.5) * 1000) / 1000)
    );
    const image = active ? 'url("' + state.wallpaperImage + '")' : "";
    if (ui.appBackground) {
      ui.appBackground.hidden = !active;
      ui.appBackground.style.backgroundImage = image;
    }
    if (ui.settingsWallpaperPreview) {
      ui.settingsWallpaperPreview.style.backgroundImage = image;
      ui.settingsWallpaperPreview.classList.toggle("has-image", active);
    }
    if (ui.settingsWallpaperClear) ui.settingsWallpaperClear.disabled = !active;
    if (ui.settingsWallpaperOpacity) {
      ui.settingsWallpaperOpacity.value = String(state.wallpaperTransparency);
    }
    if (ui.settingsWallpaperOpacityValue) {
      ui.settingsWallpaperOpacityValue.textContent =
        state.wallpaperTransparency + "%";
    }
  }

  function initWallpaper() {
    state.wallpaperImage = "";
    state.wallpaperTransparency = DEFAULT_WALLPAPER_TRANSPARENCY;
    applyWallpaper();
  }

  function applyWallpaperBootstrap(wallpaper) {
    if (!wallpaper || typeof wallpaper !== "object") return;
    const url = typeof wallpaper.url === "string" ? wallpaper.url : "";
    state.wallpaperTransparency = clampWallpaperTransparency(
      wallpaper.transparency
    );
    state.wallpaperImage =
      wallpaper.hasImage && /^\/[^/]/.test(url) ? url : "";
    applyWallpaper();
  }

  const scheduleWallpaperPersist = debounce(() => {
    localFetch("wallpaper", {
      method: "POST",
      body: { transparency: state.wallpaperTransparency },
      timeout: 15000
    }).catch(() => {});
  }, 250);

  function setWallpaperTransparency(value, persist) {
    state.wallpaperTransparency = clampWallpaperTransparency(value);
    applyWallpaper();
    if (persist) scheduleWallpaperPersist();
  }

  async function clearWallpaper() {
    if (!state.wallpaperImage) return;
    try {
      const result = await localFetch("wallpaper", {
        method: "POST",
        body: { image: null },
        timeout: 30000
      });
      if (!result || !result.ok) {
        throw new Error((result && result.error) || "清除背景图片失败");
      }
      applyWallpaperBootstrap(result.wallpaper);
      toast("界面背景已清除", "info", 2400);
    } catch (error) {
      toast(error.message || "清除背景图片失败", "error", 4000);
    }
  }

  function loadWallpaperImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("图片解析失败"));
      image.src = src;
    });
  }

  async function prepareWallpaperImage(file) {
    const source = await readFileAsDataUrl(file);
    const image = await loadWallpaperImage(source);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) throw new Error("无法读取图片尺寸");
    const scale = Math.min(
      1,
      MAX_WALLPAPER_DIMENSION / Math.max(width, height)
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("无法处理背景图片");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let result = canvas.toDataURL("image/webp", 0.86);
    if (!result.startsWith("data:image/webp")) {
      result = canvas.toDataURL("image/jpeg", 0.9);
    }
    if (!result || result === "data:,") {
      throw new Error("无法生成背景图片");
    }
    return result;
  }

  async function handleWallpaperFile(file) {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      toast("请选择图片文件", "error", 3200);
      return;
    }
    if (file.size > MAX_WALLPAPER_SOURCE_BYTES) {
      toast("图片过大，请选择 30 MB 以内的图片", "error", 4000);
      return;
    }
    try {
      const dataUrl = await prepareWallpaperImage(file);
      const result = await localFetch("wallpaper", {
        method: "POST",
        body: {
          image: dataUrl,
          transparency: state.wallpaperTransparency
        },
        timeout: 30000
      });
      if (!result || !result.ok) {
        throw new Error((result && result.error) || "背景图片保存失败");
      }
      applyWallpaperBootstrap(result.wallpaper);
      toast("界面背景已更新", "success", 2600);
    } catch (error) {
      toast(error.message || "无法读取背景图片", "error", 4000);
    }
  }

  function setAutoAllow(value) {
    state.autoAllow = Boolean(value);
    if (ui.settingsAutoAllow) ui.settingsAutoAllow.checked = state.autoAllow;
    try {
      if (state.autoAllow) localStorage.setItem(STORE.autoAllow, "1");
      else localStorage.removeItem(STORE.autoAllow);
    } catch (error) {}
    updateComposer();
    refreshComposerStatus();
    if (state.autoAllow) {
      toast("自动允许权限已开启", "info", 3200);
      autoApprovePendingPermissions();
    } else {
      toast("自动允许权限已关闭", "info", 2600);
    }
  }

  async function autoApprovePermission(request) {
    if (!request || !request.id || state.autoApproving.has(request.id)) return false;
    state.autoApproving.add(request.id);
    try {
      await ocFetch(
        "permission/" + encodeURIComponent(request.id) + "/reply",
        {
          method: "POST",
          body: { reply: "once" },
          timeout: 30000
        }
      );
      removePermission(request.id);
      const now = Date.now();
      if (now - state.autoAllowNoticeAt > 5000) {
        state.autoAllowNoticeAt = now;
        toast(
          "已自动允许权限：" + permissionTypeLabel(request.permission),
          "info",
          2600
        );
      }
      return true;
    } catch (error) {
      if (error.status === 404) {
        removePermission(request.id);
        return true;
      }
      toast("自动允许权限失败，已改为手动确认：" + error.message, "error", 6000);
      return false;
    } finally {
      state.autoApproving.delete(request.id);
    }
  }

  async function autoApprovePendingPermissions() {
    const pending = state.permissions.slice();
    if (!pending.length) {
      maybeShowCurrentPrompt();
      return;
    }
    state.autoApprovingBatch = true;
    try {
      for (const request of pending) {
        if (!state.autoAllow) break;
        await autoApprovePermission(request);
      }
    } finally {
      state.autoApprovingBatch = false;
      renderSessions();
      updateTopbar();
      refreshComposerStatus();
      maybeShowCurrentPrompt();
    }
  }

  function toast(message, kind, duration) {
    const type = kind || "info";
    const node = document.createElement("div");
    node.className = "toast " + type;
    node.innerHTML = ICONS[type] || ICONS.info;
    const text = document.createElement("span");
    text.textContent = String(message || "");
    node.appendChild(text);
    ui.toasts.appendChild(node);
    const timer = window.setTimeout(() => {
      node.style.opacity = "0";
      node.style.transform = "translateY(6px)";
      window.setTimeout(() => node.remove(), 180);
    }, duration || 3800);
    node.addEventListener("click", () => {
      clearTimeout(timer);
      node.remove();
    });
    return node;
  }

  function sendSystemNotification(title, body, kind) {
    const payload = { title: title, body: body };
    const fallback = () => {
      if (window.pywebview && window.pywebview.api && typeof window.pywebview.api.notify === "function") {
        try {
          window.pywebview.api.notify(title, body);
          return;
        } catch (error) {}
      }
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body: body });
          return;
        }
      } catch (error) {}
      toast(body, kind || "success", 5200);
    };
    localFetch("notify", { method: "POST", body: payload, timeout: 15000 })
      .then((result) => {
        if (!result || result.ok === false) fallback();
      })
      .catch(fallback);
  }

  function sessionDisplayTitle(sessionID) {
    const info =
      state.sessions.find((item) => item.id === sessionID) ||
      (state.sessionInfo && state.sessionInfo.id === sessionID ? state.sessionInfo : null);
    return sessionTitle(info);
  }

  function notifyPermissionRequest(request) {
    const type = permissionTypeLabel(request.permission);
    const title = sessionDisplayTitle(request.sessionID);
    sendSystemNotification(
      "需要你的授权",
      "会话「" + title + "」正在请求" + type + "，请返回应用处理。",
      "info"
    );
  }

  function notifyQuestionRequest(request) {
    const title = sessionDisplayTitle(request.sessionID);
    sendSystemNotification(
      "需要你的选择",
      "会话「" + title + "」正在等待你的回答，请返回应用处理。",
      "info"
    );
  }

  function notifySessionFinished(sessionID) {
    state.busy.delete(sessionID);
    const active = state.taskStarted.has(sessionID);
    const suppressed = state.notifySuppressed.delete(sessionID);
    if (!active) return;
    const queue = queueFor(sessionID);
    const paused = queuePausedFor(sessionID);
    if (suppressed) {
      state.taskStarted.delete(sessionID);
      return;
    }
    if (queue.length && !paused) return;
    state.taskStarted.delete(sessionID);
    const info =
      state.sessions.find((item) => item.id === sessionID) ||
      (state.sessionInfo && state.sessionInfo.id === sessionID ? state.sessionInfo : null);
    const title = sessionTitle(info);
    const failed = state.notifyFailed.delete(sessionID);
    const prefix = failed ? "任务未完成" : "任务完成";
    let body = failed
      ? "会话「" + title + "」执行失败，请返回查看"
      : "会话「" + title + "」已完成";
    if (queue.length && paused) body += "，排队消息已暂停";
    sendSystemNotification(prefix, body);
  }

  function setConnection(kind, text) {
    ui.connDot.className = "conn-dot " + (kind || "");
    ui.connText.textContent = text || "";
  }

  function setChatState(kind, text) {
    ui.chatStateDot.className = "state-dot " + (kind || "idle");
    ui.chatState.textContent = text || "";
  }

  function currentBusy() {
    if (!state.sessionId) return null;
    return state.busy.get(state.sessionId) || null;
  }

  function queueFor(sessionID) {
    return (sessionID && state.queues.get(sessionID)) || [];
  }

  function currentQueue() {
    return queueFor(state.sessionId);
  }

  function currentQueueHasError() {
    const queue = currentQueue();
    return queue.length > 0 && Boolean(queue[0].error);
  }

  function queuePausedFor(sessionID) {
    return Boolean(sessionID && state.queuePaused.has(sessionID));
  }

  function queueAttachmentBytes(queue) {
    return (queue || []).reduce((total, item) => {
      return (
        total +
        (item.attachments || []).reduce(
          (sum, attachment) =>
            sum + (attachment.dataUrl ? Number(attachment.size) || 0 : 0),
          0
        )
      );
    }, 0);
  }

  function pendingQueueCount() {
    let total = 0;
    for (const queue of state.queues.values()) total += queue.length;
    return total;
  }

  async function confirmQueueDiscard(action) {
    const total = pendingQueueCount();
    if (!total) return true;
    return confirmAction(
      "排队消息将被清空",
      "当前还有 " + total + " 条排队消息。" + action + "会清空这些消息，是否继续？",
      "继续"
    );
  }

  function clearQueueTimer(sessionID) {
    const timer = state.queueTimers.get(sessionID);
    if (timer) window.clearTimeout(timer);
    state.queueTimers.delete(sessionID);
  }

  function clearAllQueueTimers() {
    for (const timer of state.queueTimers.values()) window.clearTimeout(timer);
    state.queueTimers.clear();
  }

  function scheduleQueueFlush(sessionID, delay) {
    if (!sessionID) return;
    clearQueueTimer(sessionID);
    const queue = state.queues.get(sessionID);
    if (!queue || !queue.length) return;
    if (queuePausedFor(sessionID) || queue[0].error) return;
    const timer = window.setTimeout(() => {
      state.queueTimers.delete(sessionID);
      flushQueue(sessionID);
    }, delay == null ? QUEUE_FLUSH_DELAY : delay);
    state.queueTimers.set(sessionID, timer);
  }

  function refreshQueueUI(sessionID) {
    renderSessions();
    if (sessionID === state.sessionId) {
      renderQueue();
      updateComposer();
      refreshComposerStatus();
    }
  }

  function setQueuePaused(sessionID, paused) {
    if (!sessionID) return;
    if (paused) {
      state.queuePaused.add(sessionID);
      clearQueueTimer(sessionID);
    } else {
      state.queuePaused.delete(sessionID);
      scheduleQueueFlush(sessionID, 0);
    }
    refreshQueueUI(sessionID);
  }

  async function clearQueue(sessionID) {
    const queue = state.queues.get(sessionID);
    if (!queue || !queue.length) return;
    if (state.queueSending.has(sessionID)) {
      toast("首条消息正在发送，完成后才能清空队列", "info", 2600);
      return;
    }
    const removing = new Set(queue.map((item) => item.id));
    const confirmed = await confirmAction(
      "清空排队消息",
      "确定清空当前会话的 " + queue.length + " 条排队消息吗？图片附件也会一并移除。",
      "清空"
    );
    if (!confirmed) return;
    if (state.queueSending.has(sessionID)) {
      toast("首条消息正在发送，完成后才能清空队列", "info", 2600);
      return;
    }
    const current = state.queues.get(sessionID);
    if (!current) return;
    const remaining = current.filter((item) => !removing.has(item.id));
    if (remaining.length) {
      state.queues.set(sessionID, remaining);
    } else {
      state.queues.delete(sessionID);
      state.queuePaused.delete(sessionID);
      state.queueStepReady.delete(sessionID);
      clearQueueTimer(sessionID);
    }
    refreshQueueUI(sessionID);
    if (!queuePausedFor(sessionID)) scheduleQueueFlush(sessionID, 0);
    toast("已清空排队消息", "info", 2200);
  }

  function fileSizeLabel(bytes) {
    const size = Number(bytes) || 0;
    if (size >= 1024 * 1024) {
      return (size / 1024 / 1024).toFixed(1).replace(/\.0$/, "") + " MB";
    }
    if (size >= 1024) return Math.round(size / 1024) + " KB";
    return size + " B";
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("读取图片失败"));
      reader.readAsDataURL(file);
    });
  }

  function renderAttachments() {
    if (!ui.attachments) return;
    ui.attachments.innerHTML = "";
    ui.attachments.hidden = !state.attachments.length;
    for (const item of state.attachments) {
      if (item.path) {
        const chip = document.createElement("div");
        chip.className = "attachment-file";
        chip.title = [item.name, item.path, item.size ? fileSizeLabel(item.size) : ""]
          .filter(Boolean)
          .join(" · ");
        const icon = document.createElement("span");
        icon.className = "attachment-file-icon";
        icon.innerHTML = ICONS.file;
        chip.appendChild(icon);
        const body = document.createElement("span");
        body.className = "attachment-file-body";
        const name = document.createElement("strong");
        name.className = "attachment-file-name";
        name.textContent = item.name || "文件";
        body.appendChild(name);
        const path = document.createElement("span");
        path.className = "attachment-file-path";
        path.textContent = item.path;
        body.appendChild(path);
        chip.appendChild(body);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "attachment-remove";
        remove.title = "移除文件";
        remove.setAttribute("aria-label", "移除文件");
        remove.innerHTML = ICONS.close;
        remove.addEventListener("click", () => removeAttachment(item.id));
        chip.appendChild(remove);
        ui.attachments.appendChild(chip);
        continue;
      }
      const thumb = document.createElement("div");
      thumb.className = "attachment-thumb";
      thumb.title = (item.name || "图片") + " · " + fileSizeLabel(item.size);
      const img = document.createElement("img");
      img.src = item.dataUrl;
      img.alt = item.name || "图片";
      thumb.appendChild(img);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "attachment-remove";
      remove.title = "移除图片";
      remove.setAttribute("aria-label", "移除图片");
      remove.innerHTML = ICONS.close;
      remove.addEventListener("click", () => removeAttachment(item.id));
      thumb.appendChild(remove);
      ui.attachments.appendChild(thumb);
    }
  }

  function removeAttachment(attachmentID) {
    state.attachments = state.attachments.filter((item) => item.id !== attachmentID);
    renderAttachments();
    updateComposer();
  }

  async function addImageFiles(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (state.addingImages) {
      toast("图片正在处理中，请稍候", "info", 2200);
      return;
    }
    let remaining =
      MAX_IMAGE_COUNT - state.attachments.filter((item) => item.dataUrl).length;
    if (remaining <= 0) {
      toast("最多同时添加 " + MAX_IMAGE_COUNT + " 张图片", "error");
      return;
    }
    state.addingImages = true;
    updateComposer();
    let added = 0;
    let overflow = false;
    try {
      for (const file of list) {
        if (remaining <= 0) {
          overflow = true;
          break;
        }
        if (!IMAGE_TYPES.has(file.type)) {
          toast("不支持的图片格式：" + (file.name || file.type || "未知"), "error");
          continue;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          toast(
            "图片 " + (file.name || "") + " 超过 " + fileSizeLabel(MAX_IMAGE_BYTES),
            "error"
          );
          continue;
        }
        try {
          const dataUrl = await readFileAsDataUrl(file);
          state.attachments.push({
            id: localId("img_"),
            name: file.name || "image." + (file.type.split("/")[1] || "png"),
            mime: file.type,
            size: file.size,
            dataUrl: dataUrl
          });
          added += 1;
          remaining -= 1;
        } catch (error) {
          toast("读取图片失败：" + error.message, "error");
        }
      }
    } finally {
      state.addingImages = false;
      renderAttachments();
      updateComposer();
      if (added) forcePromptFocus();
      if (overflow) {
        toast("最多同时添加 " + MAX_IMAGE_COUNT + " 张图片", "error");
      }
    }
  }

  function addLocalFiles(files) {
    const list = (Array.isArray(files) ? files : files ? [files] : [])
      .map((item) => (typeof item === "string" ? { path: item } : item))
      .filter(Boolean);
    if (!list.length) return;
    const existing = new Set(
      state.attachments.filter((item) => item.path).map((item) => item.path.toLowerCase())
    );
    let remaining = MAX_FILE_COUNT - existing.size;
    if (remaining <= 0) {
      toast("最多同时添加 " + MAX_FILE_COUNT + " 个文件", "error");
      return;
    }
    let added = 0;
    let duplicate = 0;
    let overflow = false;
    for (const file of list) {
      const path = String(file.path || "").trim();
      if (!path) continue;
      const key = path.toLowerCase();
      if (existing.has(key)) {
        duplicate += 1;
        continue;
      }
      if (remaining <= 0) {
        overflow = true;
        break;
      }
      state.attachments.push({
        id: localId("file_"),
        name: String(file.name || path.split(/[\\/]/).pop() || "文件"),
        path: path,
        size: Number(file.size) || 0
      });
      existing.add(key);
      added += 1;
      remaining -= 1;
    }
    if (added) {
      renderAttachments();
      updateComposer();
      forcePromptFocus();
    }
    if (overflow) {
      toast("最多同时添加 " + MAX_FILE_COUNT + " 个文件", "error");
    } else if (!added && duplicate) {
      toast("该文件已在列表中", "info", 2200);
    }
  }

  async function pickLocalFiles() {
    try {
      if (window.pywebview && window.pywebview.api && window.pywebview.api.pick_files) {
        const files = await window.pywebview.api.pick_files();
        addLocalFiles(files);
        return;
      }
    } catch (error) {
      toast("选择文件失败：" + (error && error.message ? error.message : error), "error");
      return;
    }
    toast("当前环境无法读取本地文件路径，请在桌面应用中使用", "error", 3200);
  }

  function renderQueue() {
    if (!ui.promptQueue) return;
    const queue = currentQueue();
    const sessionID = state.sessionId;
    const paused = queuePausedFor(sessionID);
    const sending = Boolean(sessionID && state.queueSending.has(sessionID));
    const headError = queue.length > 0 && Boolean(queue[0].error);
    ui.promptQueue.innerHTML = "";
    ui.promptQueue.hidden = !queue.length;
    if (!queue.length) return;
    const head = document.createElement("div");
    head.className = "queue-head";
    const label = document.createElement("strong");
    label.textContent =
      "排队消息 " + queue.length + " 条" + (sending ? " · 插入中" : "");
    head.appendChild(label);
    const hint = document.createElement("span");
    hint.textContent = headError
      ? "首条失败，处理后可继续"
      : paused
      ? "已暂停，等待手动继续"
      : sending
      ? "正在插入当前任务，下一步继续"
      : state.busy.get(sessionID)
      ? "将在下一个分段插入"
      : "空闲时会立即发送";
    head.appendChild(hint);
    const tools = document.createElement("div");
    tools.className = "queue-tools";
    const pause = document.createElement("button");
    pause.type = "button";
    pause.className = "queue-btn";
    pause.textContent = paused ? "继续" : "暂停";
    pause.title = paused ? "继续发送排队消息" : "暂停发送排队消息";
    pause.setAttribute("aria-label", pause.title);
    pause.addEventListener("click", () => setQueuePaused(sessionID, !paused));
    tools.appendChild(pause);
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "queue-btn danger";
    clear.textContent = "清空";
    clear.title = sending ? "首条消息正在插入，完成后才能清空" : "清空排队消息";
    clear.setAttribute("aria-label", clear.title);
    clear.disabled = sending;
    clear.addEventListener("click", () => clearQueue(sessionID));
    tools.appendChild(clear);
    head.appendChild(tools);
    ui.promptQueue.appendChild(head);
    queue.forEach((item, index) => {
      const isSending = sending && index === 0 && !item.error;
      const row = document.createElement("div");
      row.className =
        "queue-item" +
        (item.error ? " error" : "") +
        (isSending ? " sending" : "");
      row.dataset.queueId = item.id;
      const order = document.createElement("span");
      order.className = "queue-order";
      order.textContent = String(index + 1).padStart(2, "0");
      row.appendChild(order);
      const attachments = item.attachments || [];
      const fileCount = attachments.filter((attachment) => attachment.path).length;
      const imageCount = attachments.length - fileCount;
      const image = attachments.find(
        (attachment) => attachment.dataUrl && attachment.mime
      );
      if (image) {
        const img = document.createElement("img");
        img.src = image.dataUrl;
        img.alt = image.name || "图片";
        row.appendChild(img);
      }
      const body = document.createElement("div");
      body.className = "queue-body";
      const text = document.createElement("div");
      text.className = "queue-text";
      text.textContent = item.text
        ? truncate(String(item.text).replace(/\s+/g, " ").trim(), 140)
        : fileCount && !imageCount
        ? fileCount + " 个文件"
        : "图片消息";
      body.appendChild(text);
      const meta = document.createElement("div");
      meta.className = "queue-meta";
      if (item.error) {
        meta.textContent = "发送失败：" + item.error;
      } else {
        const attachmentLabel = [
          imageCount ? imageCount + " 张图片" : "",
          fileCount ? fileCount + " 个文件" : ""
        ]
          .filter(Boolean)
          .join("、");
        if (isSending) {
          const spin = document.createElement("span");
          spin.className = "queue-spin";
          meta.appendChild(spin);
        }
        meta.appendChild(
          document.createTextNode(
            (isSending
              ? "插入中…"
              : paused
              ? "已暂停"
              : state.busy.get(sessionID)
              ? "等待插入"
              : "等待发送") + (attachmentLabel ? " · " + attachmentLabel : "")
          )
        );
      }
      body.appendChild(meta);
      row.appendChild(body);
      const actions = document.createElement("div");
      actions.className = "queue-actions";
      if (item.error) {
        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "queue-btn";
        retry.textContent = "重试";
        retry.addEventListener("click", () => retryQueueItem(item.sessionID, item.id));
        actions.appendChild(retry);
      }
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "queue-btn danger";
      remove.title = isSending ? "正在插入，暂时不能移除" : "移除排队消息";
      remove.setAttribute("aria-label", remove.title);
      remove.textContent = "移除";
      remove.disabled = isSending;
      remove.addEventListener("click", () => removeQueueItem(item.sessionID, item.id));
      actions.appendChild(remove);
      row.appendChild(actions);
      ui.promptQueue.appendChild(row);
    });
  }

  function removeQueueItem(sessionID, itemID, options) {
    const queue = state.queues.get(sessionID);
    if (!queue) return;
    const index = queue.findIndex((item) => item.id === itemID);
    if (index < 0) return;
    if ((!options || !options.skipFlush) && index === 0 && state.queueSending.has(sessionID)) {
      toast("首条消息正在发送，暂时不能移除", "info", 2400);
      return;
    }
    queue.splice(index, 1);
    if (!queue.length) {
      state.queues.delete(sessionID);
      state.queuePaused.delete(sessionID);
      state.queueStepReady.delete(sessionID);
      clearQueueTimer(sessionID);
    }
    renderQueue();
    renderSessions();
    updateComposer();
    if (sessionID === state.sessionId) refreshComposerStatus();
    if (!options || !options.skipFlush) scheduleQueueFlush(sessionID, 0);
  }

  function retryQueueItem(sessionID, itemID) {
    const queue = state.queues.get(sessionID);
    if (!queue) return;
    const item = queue.find((entry) => entry.id === itemID);
    if (!item) return;
    item.error = null;
    renderQueue();
    updateComposer();
    if (sessionID === state.sessionId) refreshComposerStatus();
    scheduleQueueFlush(sessionID, 0);
  }

  function flushPendingQueues() {
    for (const [sessionID, queue] of state.queues) {
      if (!state.busy.get(sessionID)) {
        state.queueAwaiting.delete(sessionID);
        state.queueStepReady.delete(sessionID);
      }
      if (queue.length) scheduleQueueFlush(sessionID, QUEUE_FLUSH_DELAY);
    }
  }

  function currentInfo() {
    if (state.sessionInfo && state.sessionInfo.id === state.sessionId) return state.sessionInfo;
    return state.sessions.find((item) => item.id === state.sessionId) || null;
  }

  function updateTopbar() {
    const info = currentInfo();
    const title = info && info.title ? info.title : "新会话";
    ui.chatTitle.textContent = title;
    ui.chatTitle.title = title;
    ui.chatAgent.textContent = agentDisplay(state.selectedAgent);
    document.title = title + " - OpenCode 桌面";
    const busy = currentBusy();
    const hasPermission = state.permissions.some((item) => item.sessionID === state.sessionId);
    const hasQuestion = state.questions.some((item) => item.sessionID === state.sessionId);
    if (hasPermission) {
      setChatState("retry", "等待授权");
    } else if (hasQuestion) {
      setChatState("retry", "等待回答");
    } else if (busy && busy.type === "retry") {
      setChatState("retry", "正在重试");
    } else if (busy) {
      setChatState("busy", "正在生成");
    } else {
      setChatState("idle", "已就绪");
    }
    updateContextUsage();
  }

  function updateComposer() {
    const selected = state.selectedModel;
    ui.modelLabel.textContent = selected ? modelDisplay(selected) : "选择模型";
    ui.agentLabel.textContent = agentDisplay(state.selectedAgent);
    const found = findModel(selected);
    const variants = found && found.model.variants ? found.model.variants : [];
    ui.variantPicker.hidden = !variants.length;
    if (variants.length) {
      ui.variantLabel.textContent = state.selectedVariant || "默认";
    }
    const disconnected = !state.cwd;
    const hasContent = Boolean(ui.prompt.value.trim()) || state.attachments.length > 0;
    ui.sendBtn.disabled =
      !hasContent ||
      !selected ||
      state.sendInFlight ||
      state.addingImages ||
      disconnected;
    const busy = Boolean(currentBusy());
    const queue = currentQueue();
    const queued = queue.length > 0;
    const paused = queuePausedFor(state.sessionId);
    const toQueue = busy || queued;
    ui.sendBtn.hidden = false;
    ui.stopBtn.hidden = !busy;
    ui.sendBtn.title = toQueue ? "加入队列" : "发送";
    ui.prompt.placeholder = busy
      ? "模型正在工作，发送的消息会在下一个分段插入…"
      : queued
      ? paused
        ? "队列已暂停，发送的消息会继续排队…"
        : "发送的消息会加入当前队列…"
      : "给 OpenCode 发送消息…";
    ui.composerHint.textContent =
      (toQueue ? "Enter 加入队列 · Ctrl+Enter 换行" : "Enter 发送 · Ctrl+Enter 换行") +
      (queued && paused ? " · 队列已暂停" : "") +
      (state.autoAllow ? " · 自动允许权限" : "");
    resizePrompt();
  }

  function setComposerStatus(kind, text) {
    ui.composerStatus.innerHTML = "";
    if (!text) return;
    const wrap = document.createElement("span");
    if (kind === "loading") {
      const spin = document.createElement("span");
      spin.className = "status-spin";
      wrap.appendChild(spin);
    }
    const label = document.createElement("span");
    if (kind === "warn") label.className = "warn";
    label.textContent = text;
    wrap.appendChild(label);
    ui.composerStatus.appendChild(wrap);
  }

  function updateProject() {
    const path = state.cwd || "未选择文件夹";
    ui.projectPath.textContent = path;
    ui.projectPath.title = path;
    ui.projectBtn.title = state.cwd ? "切换项目文件夹\n" + state.cwd : "选择项目文件夹";
  }

  function updateServiceInfo() {
    const serve = state.bootstrap && state.bootstrap.serve ? state.bootstrap.serve : {};
    ui.serviceExe.textContent = serve.exe || "未找到";
    ui.serviceExe.title = serve.exe || "";
    ui.servicePort.textContent = serve.port ? "127.0.0.1:" + serve.port : "未启动";
    const configPath =
      (state.bootstrap && state.bootstrap.configPath) || "未知";
    ui.serviceConfig.textContent = configPath;
    ui.serviceConfig.title = configPath;
  }

  function resizePrompt() {
    const el = ui.prompt;
    el.style.height = "auto";
    el.style.height = Math.min(208, Math.max(26, el.scrollHeight)) + "px";
  }

  function insertPromptNewline() {
    const el = ui.prompt;
    const start = typeof el.selectionStart === "number" ? el.selectionStart : el.value.length;
    const end = typeof el.selectionEnd === "number" ? el.selectionEnd : el.value.length;
    el.setRangeText("\n", start, end, "end");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function modelRefString(model) {
    if (!model) return "";
    return model.providerID + "/" + model.modelID;
  }

  function allCommands() {
    const localNames = new Set(LOCAL_COMMANDS.map((command) => command.name));
    const remote = (state.commands || []).filter(
      (command) => command && command.name && !localNames.has(command.name)
    );
    return LOCAL_COMMANDS.concat(remote);
  }

  function commandSourceLabel(source) {
    if (source === "local") return "本地";
    if (source === "skill") return "技能";
    if (source === "mcp") return "MCP";
    return "命令";
  }

  function commandCategory(source) {
    if (source === "local") return "local";
    if (source === "skill") return "skill";
    if (source === "mcp") return "mcp";
    return "command";
  }

  function findCommandByName(name) {
    const target = String(name || "").toLowerCase();
    return allCommands().find((command) => String(command.name || "").toLowerCase() === target) || null;
  }

  function parseSlashCommand(text) {
    const value = String(text || "");
    if (!value.startsWith("/")) return null;
    const match = value.match(/^\/([^\s]+)(?:\s+([\s\S]*))?$/);
    if (!match) return null;
    const command = findCommandByName(match[1]);
    if (!command) return null;
    return { command, arguments: String(match[2] || "").trim() };
  }

  async function loadCommands() {
    if (state.commandsLoading || state.commandsLoaded) return;
    state.commandsLoading = true;
    try {
      const results = await Promise.allSettled([
        ocFetch("command", { timeout: 30000 }),
        ocFetch("skill", { timeout: 30000 })
      ]);
      const commands = results[0].status === "fulfilled" && Array.isArray(results[0].value)
        ? results[0].value
        : [];
      const skills = results[1].status === "fulfilled" && Array.isArray(results[1].value)
        ? results[1].value
        : [];
      const skillNames = new Map(
        skills
          .filter((skill) => skill && skill.name)
          .map((skill) => [String(skill.name).toLowerCase(), skill])
      );
      const localNames = new Set(LOCAL_COMMANDS.map((command) => command.name));
      const seen = new Set();
      const next = [];
      for (const command of commands) {
        if (!command || !command.name) continue;
        const name = String(command.name).trim();
        const key = name.toLowerCase();
        if (!name || seen.has(key) || localNames.has(key)) continue;
        seen.add(key);
        const skill = skillNames.get(key);
        next.push({
          name,
          description: command.description || (skill && skill.description) || "",
          source: command.source || "command",
          template: command.template || "",
          agent: command.agent || "",
          model: command.model || "",
          subtask: Boolean(command.subtask),
          hints: Array.isArray(command.hints) ? command.hints : []
        });
      }
      state.commands = next;
      state.commandsLoaded = true;
    } catch (error) {
      state.commandsLoaded = true;
    } finally {
      state.commandsLoading = false;
      if (state.commandMenuOpen) updateCommandPopover();
    }
  }

  function closeCommandPopover() {
    state.commandMenuOpen = false;
    state.commandMenuItems = [];
    state.commandMenuIndex = 0;
    ui.commandPopover.hidden = true;
    ui.commandPopover.innerHTML = "";
  }

  function updateCommandSelection(scroll) {
    const items = $$(".command-item", ui.commandPopover);
    items.forEach((item, index) => {
      const active = index === state.commandMenuIndex;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", active ? "true" : "false");
      if (active && scroll) item.scrollIntoView({ block: "nearest" });
    });
  }

  function renderCommandPopover() {
    const groups = [
      { key: "local", label: "本地操作" },
      { key: "command", label: "OpenCode 命令" },
      { key: "mcp", label: "MCP 命令" },
      { key: "skill", label: "技能" }
    ];
    ui.commandPopover.innerHTML = "";
    const items = [];
    for (const group of groups) {
      const commands = state.commandMenuItems.filter(
        (command) => commandCategory(command.source) === group.key
      );
      if (!commands.length) continue;
      const label = document.createElement("div");
      label.className = "command-group-label";
      label.textContent = group.label + (group.key === "skill" && state.commandsLoading ? " · 载入中" : "");
      ui.commandPopover.appendChild(label);
      for (const command of commands) {
        const index = items.length;
        items.push(command);
        const item = document.createElement("button");
        item.type = "button";
        item.className = "command-item";
        item.dataset.commandIndex = String(index);
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", "false");
        const name = document.createElement("span");
        name.className = "command-name";
        name.textContent = "/" + command.name;
        item.appendChild(name);
        const description = document.createElement("span");
        description.className = "command-desc";
        description.textContent = command.description || "运行 OpenCode 命令";
        item.appendChild(description);
        const badge = document.createElement("span");
        badge.className = "command-badge " + commandCategory(command.source);
        badge.textContent = commandSourceLabel(command.source);
        item.appendChild(badge);
        item.addEventListener("mouseenter", () => {
          state.commandMenuIndex = index;
          updateCommandSelection(false);
        });
        item.addEventListener("click", () => selectCommandMenuItem(index));
        ui.commandPopover.appendChild(item);
      }
    }
    const foot = document.createElement("div");
    foot.className = "command-foot";
    foot.textContent = "↑↓ 选择 · Enter 执行 · Esc 关闭";
    ui.commandPopover.appendChild(foot);
    state.commandMenuItems = items;
    updateCommandSelection(true);
  }

  function updateCommandPopover() {
    const value = ui.prompt.value;
    if (!value.startsWith("/") || /[\r\n]/.test(value) || /\s/.test(value)) {
      closeCommandPopover();
      return;
    }
    if (!state.commandsLoaded && !state.commandsLoading) loadCommands();
    const query = value.slice(1).toLowerCase();
    const filtered = allCommands().filter((command) => {
      if (!query) return true;
      return (
        String(command.name || "").toLowerCase().includes(query) ||
        String(command.description || "").toLowerCase().includes(query)
      );
    });
    if (!filtered.length) {
      closeCommandPopover();
      return;
    }
    const queryChanged = query !== state.commandMenuQuery;
    state.commandMenuQuery = query;
    state.commandMenuItems = filtered;
    if (queryChanged) state.commandMenuIndex = 0;
    if (state.commandMenuIndex >= filtered.length) state.commandMenuIndex = 0;
    state.commandMenuOpen = true;
    ui.commandPopover.hidden = false;
    renderCommandPopover();
  }

  function handleCommandMenuKeydown(event) {
    if (!state.commandMenuOpen) return false;
    const count = state.commandMenuItems.length;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!count) return false;
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      state.commandMenuIndex = (state.commandMenuIndex + delta + count) % count;
      updateCommandSelection(true);
      return true;
    }
    if (event.key === "Tab") {
      if (!count) return false;
      event.preventDefault();
      selectCommandMenuItem(state.commandMenuIndex);
      return true;
    }
    if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      if (!count) return false;
      event.preventDefault();
      selectCommandMenuItem(state.commandMenuIndex);
      return true;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeCommandPopover();
      return true;
    }
    return false;
  }

  function selectCommandMenuItem(index) {
    const command = state.commandMenuItems[index];
    if (!command) return;
    closeCommandPopover();
    if (command.source === "local" || command.action) {
      runLocalCommand(command);
      return;
    }
    const template = String(command.template || "");
    if (template.includes("$ARGUMENTS")) {
      ui.prompt.value = "/" + command.name + " ";
      resizePrompt();
      updateComposer();
      forcePromptFocus();
      return;
    }
    executeSlashCommand(command, "", "/" + command.name, state.attachments.slice());
  }

  function runLocalCommand(command) {
    ui.prompt.value = "";
    resizePrompt();
    updateComposer();
    if (command.action === "sessions") {
      state.search = "";
      ui.sessionSearch.value = "";
      renderSessions();
      toggleSidebar(true);
      window.setTimeout(() => {
        ui.sessionSearch.focus();
        ui.sessionSearch.select();
      }, 50);
    } else if (command.action === "new") {
      newChat();
    } else if (command.action === "models") {
      openModelPicker();
    } else if (command.action === "agents") {
      openAgentPicker();
    } else if (command.action === "settings") {
      openSettings();
    }
  }

  async function createSessionForCommand(titleSource) {
    const created = await ocFetch("session", {
      method: "POST",
      body: { title: truncate(titleSource, 60) || "新会话" },
      timeout: 30000
    });
    if (!created || !created.id) throw new Error("创建会话失败");
    const existingIndex = state.sessions.findIndex((item) => item.id === created.id);
    if (existingIndex >= 0) state.sessions[existingIndex] = created;
    else state.sessions.push(created);
    state.sessionId = created.id;
    state.sessionInfo = created;
    try {
      localStorage.setItem(STORE.session, created.id);
    } catch (error) {}
    resetConversationView();
    renderSessions();
    updateTopbar();
    updateComposer();
    return created.id;
  }

  async function executeSlashCommand(command, args, rawText, attachments) {
    if (!command) return;
    closeCommandPopover();
    if (command.source === "local" || command.action) {
      runLocalCommand(command);
      return;
    }
    if (currentBusy() || currentQueue().length) {
      toast("当前任务进行中，请等待或清空队列后再执行命令", "info", 3200);
      return;
    }
    if (!state.cwd) {
      toast("请先选择项目文件夹", "error");
      showOnboarding(state.cwd);
      return;
    }
    if (!state.selectedModel) {
      toast("请先选择一个模型", "error");
      openModelPicker();
      return;
    }
    const sessionIDAtStart = state.sessionId;
    const draft = rawText;
    const draftAttachments = attachments || [];
    let sessionID = state.sessionId;
    state.sendInFlight = true;
    updateComposer();
    try {
      if (!sessionID) {
        sessionID = await createSessionForCommand(
          "/" + command.name + (args ? " " + args : "")
        );
      }
      const payload = {
        command: command.name,
        arguments: args || "",
        agent: command.agent || state.selectedAgent,
        model: command.model || modelRefString(state.selectedModel),
        parts: buildPromptParts("", draftAttachments)
      };
      if (state.selectedVariant) payload.variant = state.selectedVariant;
      if (state.sessionId === sessionID) {
        ui.prompt.value = "";
        state.attachments = [];
        renderAttachments();
        resizePrompt();
      }
      state.notifySuppressed.delete(sessionID);
      state.notifyFailed.delete(sessionID);
      setSessionStatus(sessionID, { type: "busy" });
      refreshComposerStatus();
      updateComposer();
      updateThinkingRow();
      await ocFetch("session/" + encodeURIComponent(sessionID) + "/command", {
        method: "POST",
        body: payload,
        timeout: 180000
      });
      if (state.sessionId === sessionID) {
        state.autoScroll = true;
        scheduleScroll();
      }
      refreshComposerStatus();
      updateComposer();
      loadSessions();
    } catch (error) {
      if (sessionIDAtStart === state.sessionId) {
        if (!ui.prompt.value) {
          ui.prompt.value = draft;
          resizePrompt();
        }
        if (!state.attachments.length && draftAttachments.length) {
          state.attachments = draftAttachments;
          renderAttachments();
          updateComposer();
        }
      }
      const failedSessionID = sessionID || sessionIDAtStart;
      if (failedSessionID) {
        state.notifySuppressed.add(failedSessionID);
        setSessionStatus(failedSessionID, { type: "idle" });
        state.taskStarted.delete(failedSessionID);
        state.notifySuppressed.delete(failedSessionID);
      }
      refreshComposerStatus();
      updateComposer();
      toast("命令执行失败：" + error.message, "error");
    } finally {
      state.sendInFlight = false;
      updateComposer();
    }
  }

  function showLoading(title, text) {
    ui.loadingTitle.textContent = title || "正在启动 OpenCode";
    ui.loadingText.textContent = text || "载入项目上下文与模型配置…";
    ui.loading.hidden = false;
  }

  function hideLoading() {
    ui.loading.hidden = true;
  }

  function releaseVersion(value) {
    const match = String(value || "").match(/(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/);
    return match ? match[1] : "";
  }

  function updateVersionLabel(value) {
    const version = releaseVersion(value);
    return version ? "v" + version : "未知";
  }

  function setUpdateButton(info) {
    const available = Boolean(info && info.updateAvailable);
    ui.updateBtn.hidden = !available;
    if (!available) return;
    const latest = releaseVersion(info.latestVersion) || "新版本";
    ui.updateVersion.textContent = latest;
    ui.updateBtn.title = "发现 OpenCode CLI 新版本 " + latest + "，点击更新";
  }

  async function checkForCliUpdate() {
    if (state.updateChecking || state.updating) return null;
    state.updateChecking = true;
    try {
      const info = await localFetch("update-check", { timeout: 60000 });
      if (!info || !info.ok) return null;
      state.updateInfo = info;
      setUpdateButton(info);
      return info;
    } catch (error) {
      return null;
    } finally {
      state.updateChecking = false;
    }
  }

  function openUpdateModal() {
    const info = state.updateInfo;
    if (!info || !info.updateAvailable || state.updating) return;
    ui.updateCurrent.textContent = updateVersionLabel(info.currentVersion);
    ui.updateLatest.textContent = updateVersionLabel(info.latestVersion);
    ui.updateProgress.hidden = true;
    ui.updateError.hidden = true;
    ui.updateErrorText.textContent = "";
    ui.updateDetail.textContent = "";
    ui.updateDetail.hidden = true;
    ui.updateClose.disabled = false;
    ui.updateLater.hidden = false;
    ui.updateLater.disabled = false;
    ui.updateLater.textContent = "稍后";
    ui.updateStart.hidden = false;
    ui.updateStart.disabled = false;
    ui.updateStart.textContent = "更新并重启";
    openModal(ui.updateModal);
  }

  function setUpdateBusy(busy) {
    ui.updateStart.disabled = busy;
    ui.updateLater.disabled = busy;
    ui.updateClose.disabled = busy;
    ui.updateProgress.hidden = !busy;
    if (busy) {
      ui.updateError.hidden = true;
      ui.updateStart.textContent = "正在更新";
      ui.updateLater.textContent = "请稍候";
    }
  }

  function showUpdateFailure(result) {
    const info = state.updateInfo || {};
    const current = (result && result.installedVersion) || info.currentVersion || "";
    const latest = (result && result.latestVersion) || info.latestVersion || "";
    const available =
      result && typeof result.updateAvailable === "boolean"
        ? result.updateAvailable
        : true;
    state.updateInfo = Object.assign({}, info, {
      currentVersion: current,
      latestVersion: latest,
      updateAvailable: available
    });
    setUpdateButton(state.updateInfo);
    ui.updateCurrent.textContent = updateVersionLabel(current);
    ui.updateLatest.textContent = updateVersionLabel(latest);
    const detail = String(
      (result && (result.detail || result.output)) || ""
    ).trim();
    ui.updateProgress.hidden = true;
    ui.updateError.hidden = false;
    ui.updateErrorText.textContent =
      (result && (result.error || result.message)) || "更新未完成";
    ui.updateDetail.textContent = detail;
    ui.updateDetail.hidden = !detail;
    ui.updateClose.disabled = false;
    ui.updateLater.hidden = false;
    ui.updateLater.disabled = false;
    ui.updateLater.textContent = "关闭";
    ui.updateStart.hidden = !available;
    ui.updateStart.disabled = false;
    ui.updateStart.textContent = "重试更新";
    openModal(ui.updateModal);
  }

  async function refreshAfterUpdate() {
    const bootstrap = await localFetch("bootstrap", { timeout: 20000 });
    state.bootstrap = bootstrap;
    applyWallpaperBootstrap(bootstrap.wallpaper);
    state.cwd = bootstrap.cwd || (bootstrap.serve && bootstrap.serve.cwd) || "";
    const serve = bootstrap.serve || {};
    if (serve.phase === "ready") {
      await startApp(bootstrap);
      return { phase: "ready" };
    }
    if (serve.phase === "needs_folder") {
      hideLoading();
      closeAllModals();
      updateProject();
      updateServiceInfo();
      showOnboarding(bootstrap.savedCwd || "");
      return { phase: "needs_folder" };
    }
    const log = await fetchFatalLog();
    return { phase: "error", serve, log };
  }

  async function runCliUpdate() {
    if (state.updating) return;
    const info = state.updateInfo;
    if (!info || !info.updateAvailable) return;
    if (!(await confirmQueueDiscard("更新 OpenCode CLI"))) return;
    state.updating = true;
    setUpdateBusy(true);
    if (state.eventSource) {
      try {
        state.eventSource.close();
      } catch (error) {}
      state.eventSource = null;
    }
    setConnection("starting", "正在更新 OpenCode");
    let result = null;
    let requestError = null;
    try {
      result = await localFetch("update", { method: "POST", timeout: 1200000 });
    } catch (error) {
      requestError = error;
    }
    state.updating = false;
    let refresh;
    try {
      refresh = await refreshAfterUpdate();
    } catch (error) {
      closeModal(ui.updateModal);
      showFatal(
        "无法重新连接本地服务",
        error.message,
        (result && result.detail) || ""
      );
      return;
    }
    if (result && result.ok) {
      state.updateInfo = null;
      ui.updateBtn.hidden = true;
      closeModal(ui.updateModal);
      toast(
        result.updated
          ? "OpenCode CLI 已更新到 " + updateVersionLabel(result.installedVersion)
          : "OpenCode CLI 已是最新版本",
        "success",
        6000
      );
      return;
    }
    if (refresh.phase === "error") {
      closeModal(ui.updateModal);
      showFatal(
        "OpenCode 更新后未能重启",
        statusToErrorText(refresh.serve),
        (result && (result.detail || result.error)) || refresh.log || ""
      );
      return;
    }
    if (!result && refresh.phase === "ready") {
      const fresh = await checkForCliUpdate();
      if (fresh && !fresh.updateAvailable) {
        state.updateInfo = null;
        ui.updateBtn.hidden = true;
        closeModal(ui.updateModal);
        toast(
          "OpenCode CLI 已更新到 " + updateVersionLabel(fresh.currentVersion),
          "success",
          6000
        );
        return;
      }
    }
    showUpdateFailure(
      result || {
        ok: false,
        error: requestError ? requestError.message : "更新请求已中断",
        detail: "",
        updateAvailable: true
      }
    );
  }

  function updateAuthUi() {
    const serve = (state.bootstrap && state.bootstrap.serve) || {};
    const found = serve.exeFound !== false;
    const configured = Boolean(state.bootstrap && state.bootstrap.authConfigured);
    if (ui.onboardingLogin) {
      ui.onboardingLogin.hidden = !found || configured;
      ui.onboardingLogin.disabled = state.loginOpening;
    }
    if (ui.settingsLogin) {
      ui.settingsLogin.disabled = !found || state.loginOpening;
    }
    if (!ui.onboardingAuthHint) return;
    if (!found) {
      ui.onboardingAuthHint.textContent = "未找到 OpenCode CLI，请检查安装后重试。";
    } else if (configured) {
      ui.onboardingAuthHint.textContent = "已检测到 OpenCode 账户配置。";
    } else if (state.loginOpened) {
      ui.onboardingAuthHint.textContent =
        "登录窗口已打开，完成后回到此窗口；如果服务已启动，请重启服务。";
    } else {
      ui.onboardingAuthHint.textContent =
        "首次使用请先登录自己的 OpenCode 账户。首次启动服务可能需要几秒钟。";
    }
  }

  async function openCliLogin() {
    if (state.loginOpening) return;
    state.loginOpening = true;
    state.loginOpened = true;
    updateAuthUi();
    try {
      await localFetch("auth-login", { method: "POST", timeout: 20000 });
      toast(
        "登录窗口已打开，请使用自己的 OpenCode 账户完成登录。",
        "info",
        8000
      );
    } catch (error) {
      state.loginOpened = false;
      toast(error.message || "无法打开 OpenCode 登录窗口", "error", 7000);
    } finally {
      state.loginOpening = false;
      updateAuthUi();
    }
  }

  async function refreshAuthStatus() {
    if (!state.loginOpened) return;
    try {
      const data = await localFetch("auth-status", { timeout: 10000 });
      if (!data.authConfigured) return;
      state.bootstrap = { ...(state.bootstrap || {}), authConfigured: true };
      state.loginOpened = false;
      updateAuthUi();
      toast("OpenCode 登录已完成", "success", 5000);
    } catch (error) {}
  }

  function showOnboarding(path) {
    ui.onboardingPath.value = path || state.cwd || "";
    ui.fatal.hidden = true;
    ui.loading.hidden = true;
    ui.onboarding.hidden = false;
    updateAuthUi();
    window.setTimeout(() => ui.onboardingPath.focus(), 80);
  }

  function hideOnboarding() {
    ui.onboarding.hidden = true;
  }

  function showFatal(title, detail, log) {
    ui.fatalTitle.textContent = title || "无法启动 OpenCode 服务";
    ui.fatalText.textContent = detail || "请检查安装或日志后重试。";
    state.fatalDetail = log || detail || "";
    ui.fatalLog.textContent = state.fatalDetail.slice(-8000);
    ui.loading.hidden = true;
    ui.onboarding.hidden = true;
    ui.fatal.hidden = false;
  }

  function hideFatal() {
    ui.fatal.hidden = true;
  }

  function openModal(node) {
    if (!node) return;
    $$(".modal", document).forEach((modal) => {
      if (modal !== node && modal !== ui.confirmModal) modal.hidden = true;
    });
    node.hidden = false;
  }

  function closeModal(nodeOrId) {
    const node =
      typeof nodeOrId === "string" ? document.getElementById(nodeOrId) : nodeOrId;
    if (node) node.hidden = true;
  }

  function closeAllModals() {
    $$(".modal", document).forEach((modal) => {
      modal.hidden = true;
    });
    state.activePermissionId = null;
    state.activeQuestionId = null;
  }

  function closeDrawer() {
    ui.todoDrawer.hidden = true;
    ui.drawerBackdrop.hidden = true;
  }

  function toggleDrawer(open) {
    const next = open == null ? ui.todoDrawer.hidden : Boolean(open);
    ui.todoDrawer.hidden = !next;
    ui.drawerBackdrop.hidden = !next;
  }

  function toggleSidebar(open) {
    const next = open == null ? !ui.app.classList.contains("sidebar-open") : Boolean(open);
    ui.app.classList.toggle("sidebar-open", next);
  }

  function confirmAction(title, text, okLabel) {
    if (state.confirmResolve) {
      state.confirmResolve(false);
      state.confirmResolve = null;
    }
    ui.confirmTitle.textContent = title || "确认操作";
    ui.confirmText.textContent = text || "";
    ui.confirmOk.textContent = okLabel || "删除";
    openModal(ui.confirmModal);
    return new Promise((resolve) => {
      state.confirmResolve = resolve;
    });
  }

  function resolveConfirm(value) {
    closeModal(ui.confirmModal);
    if (state.confirmResolve) {
      const resolve = state.confirmResolve;
      state.confirmResolve = null;
      resolve(Boolean(value));
    }
  }

  function sortedSessions() {
    return state.sessions
      .slice()
      .sort((a, b) => {
        const ta = (a.time && (a.time.updated || a.time.created)) || 0;
        const tb = (b.time && (b.time.updated || b.time.created)) || 0;
        return tb - ta;
      });
  }

  function sessionTitle(info) {
    const title = info && info.title ? String(info.title).trim() : "";
    return title || "新会话";
  }

  function loadPinnedSessions(serverPins) {
    const raw = Array.isArray(serverPins)
      ? serverPins
      : readStoredJson(STORE.pinned, []);
    if (!Array.isArray(raw)) return new Set();
    return new Set(raw.filter((id) => typeof id === "string" && id));
  }

  function savePinnedSessions() {
    const pins = Array.from(state.pinned);
    writeStoredJson(STORE.pinned, pins);
    localFetch("pins", {
      method: "POST",
      body: { pins },
      timeout: 15000
    }).catch(() => {});
  }

  function toggleSessionPin(info) {
    if (!info || !info.id) return;
    if (state.pinned.has(info.id)) {
      state.pinned.delete(info.id);
      toast("已取消置顶", "info", 2200);
    } else {
      state.pinned.add(info.id);
      toast("会话已置顶", "success", 2200);
    }
    savePinnedSessions();
    renderSessions();
  }

  function createSessionItem(info) {
    const stamp =
      (info.time && (info.time.updated || info.time.created)) || Date.now();
    const pinned = state.pinned.has(info.id);
    const item = document.createElement("div");
    item.className =
      "session-item" +
      (info.id === state.sessionId ? " active" : "") +
      (pinned ? " pinned" : "");
    item.dataset.sessionId = info.id;
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.title = sessionTitle(info);

    const indicator = document.createElement("span");
    indicator.className = "session-indicator";
    item.appendChild(indicator);

    const main = document.createElement("span");
    main.className = "session-main";
    const titleEl = document.createElement("span");
    titleEl.className = "session-title";
    titleEl.textContent = sessionTitle(info);
    main.appendChild(titleEl);

    const meta = document.createElement("span");
    meta.className = "session-meta";
    const model = document.createElement("span");
    model.className = "meta-model";
    model.textContent =
      info.model && (info.model.id || info.model.modelID)
        ? modelDisplay({
            providerID: info.model.providerID,
            modelID: info.model.id || info.model.modelID
          })
        : "未指定模型";
    meta.appendChild(model);
    const dot = document.createElement("span");
    dot.textContent = "·";
    dot.style.opacity = "0.55";
    meta.appendChild(dot);
    const timeEl = document.createElement("span");
    timeEl.textContent = formatRelative(stamp);
    meta.appendChild(timeEl);
    main.appendChild(meta);
    item.appendChild(main);

    if (pinned) {
      const pin = document.createElement("span");
      pin.className = "session-pin";
      pin.title = "已置顶";
      pin.setAttribute("aria-label", "已置顶");
      pin.innerHTML = ICONS.pin;
      item.appendChild(pin);
    }

    if (state.busy.has(info.id)) {
      const busy = document.createElement("span");
      busy.className = "session-busy";
      busy.title = "正在处理";
      item.appendChild(busy);
    }
    if (state.permissions.some((permission) => permission.sessionID === info.id)) {
      const perm = document.createElement("span");
      perm.className = "session-perm";
      perm.title = "等待授权";
      item.appendChild(perm);
    }
    const queued = queueFor(info.id).length;
    if (queued) {
      const paused = queuePausedFor(info.id);
      const queueBadge = document.createElement("span");
      queueBadge.className = "session-queue" + (paused ? " paused" : "");
      queueBadge.textContent = String(queued);
      queueBadge.title = paused
        ? queued + " 条消息排队中（已暂停）"
        : queued + " 条消息排队中";
      item.appendChild(queueBadge);
    }

    const remove = document.createElement("button");
    remove.className = "session-delete";
    remove.type = "button";
    remove.dataset.action = "delete-session";
    remove.title = "删除会话";
    remove.setAttribute("aria-label", "删除会话");
    remove.innerHTML = ICONS.close.replace('class="icon"', 'class="icon"');
    item.appendChild(remove);

    return item;
  }

  function renderSessions() {
    const query = state.search.trim().toLowerCase();
    const all = sortedSessions();
    const list = query
      ? all.filter((info) => {
          const haystack = [
            info.title,
            info.slug,
            info.agent,
            info.model && info.model.id,
            info.model && info.model.providerID
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        })
      : all;

    ui.sessionList.innerHTML = "";
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "session-empty";
      empty.textContent = query
        ? "没有找到匹配的会话"
        : "还没有会话。发送第一条消息开始吧。";
      ui.sessionList.appendChild(empty);
      return;
    }

    const pinned = [];
    const regular = [];
    for (const info of list) {
      if (state.pinned.has(info.id)) pinned.push(info);
      else regular.push(info);
    }

    const sections = [];
    if (pinned.length) {
      sections.push({ label: "置顶", items: pinned });
    }
    let currentGroup = "";
    let group = null;
    for (const info of regular) {
      const stamp =
        (info.time && (info.time.updated || info.time.created)) || Date.now();
      const groupKey = sessionGroupKey(stamp);
      if (groupKey !== currentGroup) {
        currentGroup = groupKey;
        group = { label: groupKey, items: [] };
        sections.push(group);
      }
      group.items.push(info);
    }

    for (const section of sections) {
      const groupEl = document.createElement("div");
      groupEl.className =
        "session-group" + (section.label === "置顶" ? " pinned" : "");
      const label = document.createElement("div");
      label.className = "session-group-label";
      label.textContent = section.label;
      groupEl.appendChild(label);
      for (const info of section.items) {
        groupEl.appendChild(createSessionItem(info));
      }
      ui.sessionList.appendChild(groupEl);
    }
  }

  function applyMarkdown(node, text) {
    if (!node) return;
    const value = String(text == null ? "" : text);
    if (!value) {
      node.innerHTML = "";
      return;
    }
    let html;
    try {
      html = window.marked ? window.marked.parse(value) : escapeHtml(value).replace(/\n/g, "<br>");
    } catch (error) {
      html = escapeHtml(value).replace(/\n/g, "<br>");
    }
    if (window.DOMPurify) {
      html = window.DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
    }
    node.innerHTML = html;
    $$("pre code", node).forEach((code) => {
      if (window.hljs) {
        try {
          window.hljs.highlightElement(code);
        } catch (error) {}
      }
      const pre = code.closest("pre");
      if (!pre || pre.querySelector(".code-copy")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "复制";
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (await copyText(code.textContent || "")) {
          button.textContent = "已复制";
          window.setTimeout(() => {
            button.textContent = "复制";
          }, 1200);
        }
      });
      pre.appendChild(button);
    });
  }

  function scheduleMarkdown(node, text) {
    const pending = mdTimers.get(node);
    if (pending) {
      pending.text = text;
      return;
    }
    const record = { text };
    mdTimers.set(node, record);
    window.setTimeout(() => {
      mdTimers.delete(node);
      if (node.isConnected) applyMarkdown(node, record.text);
    }, 28);
  }

  function initMarkdown() {
    if (window.marked && window.marked.setOptions) {
      try {
        window.marked.setOptions({ gfm: true, breaks: true });
      } catch (error) {}
    }
  }

  function saveSelection() {
    if (state.selectedModel) {
      writeStoredJson(STORE.model, {
        providerID: state.selectedModel.providerID,
        modelID: state.selectedModel.modelID
      });
      const key = modelKey(
        state.selectedModel.providerID,
        state.selectedModel.modelID
      );
      if (state.selectedVariants && state.selectedVariant) {
        state.selectedVariants[key] = state.selectedVariant;
      } else if (state.selectedVariants) {
        delete state.selectedVariants[key];
      }
    }
    try {
      localStorage.setItem(STORE.agent, state.selectedAgent);
    } catch (error) {}
    writeStoredJson(STORE.variants, state.selectedVariants);
  }

  function applyMetaSelection(payload) {
    const savedModel = normalizeRef(readStoredJson(STORE.model, null));
    const lastModel = normalizeRef(payload.lastModel);
    const defaultModel = normalizeRef(payload.defaultModel);
    let chosen = null;
    if (savedModel && findModel(savedModel)) chosen = savedModel;
    if (!chosen && lastModel && findModel(lastModel)) chosen = lastModel;
    if (!chosen && defaultModel && findModel(defaultModel)) chosen = defaultModel;
    if (!chosen) {
      const provider = (payload.providers || []).find((item) => item.models && item.models.length);
      if (provider) {
        chosen = {
          providerID: provider.id,
          modelID: provider.models[0].id,
          variant: null
        };
      }
    }
    state.selectedModel = chosen ? { providerID: chosen.providerID, modelID: chosen.modelID } : null;
    state.selectedVariants = readStoredJson(STORE.variants, {});
    if (!state.selectedVariants || typeof state.selectedVariants !== "object") {
      state.selectedVariants = {};
    }
    state.selectedVariant = null;
    if (chosen) {
      const found = findModel(chosen);
      const variants = found && found.model.variants ? found.model.variants : [];
      const key = modelKey(chosen.providerID, chosen.modelID);
      const savedVariant = state.selectedVariants[key];
      if (savedVariant && variants.includes(savedVariant)) {
        state.selectedVariant = savedVariant;
      } else if (chosen.variant && variants.includes(chosen.variant)) {
        state.selectedVariant = chosen.variant;
      }
    }

    const agents = payload.agents || [];
    const savedAgent = (() => {
      try {
        return localStorage.getItem(STORE.agent) || "";
      } catch (error) {
        return "";
      }
    })();
    const names = agents.map((agent) => agent.name);
    let agent = savedAgent;
    if (!agent || !names.includes(agent)) {
      agent = payload.lastAgent && names.includes(payload.lastAgent) ? payload.lastAgent : "";
    }
    if (!agent && names.includes("build")) agent = "build";
    if (!agent && names.length) agent = names[0];
    state.selectedAgent = agent || "build";
    saveSelection();
  }

  async function loadMeta() {
    const payload = await localFetch("meta", { timeout: 120000 });
    if (!payload || !Array.isArray(payload.providers)) {
      throw new Error("模型配置格式异常");
    }
    state.meta = payload;
    if (payload.cwd) state.cwd = payload.cwd;
    applyMetaSelection(payload);
    renderModelList();
    renderAgents();
    renderVariantOptions();
    updateComposer();
    updateTopbar();
  }

  function selectModel(providerID, modelID) {
    const next = { providerID, modelID };
    const found = findModel(next);
    if (!found) return;
    state.selectedModel = next;
    const variants = found.model.variants || [];
    const key = modelKey(providerID, modelID);
    const saved = state.selectedVariants[key];
    state.selectedVariant = saved && variants.includes(saved) ? saved : null;
    saveSelection();
    updateComposer();
    updateTopbar();
    updateModelSelectionClasses();
    renderVariantOptions();
  }

  function selectVariant(variant) {
    if (!state.selectedModel) return;
    const found = findModel(state.selectedModel);
    const variants = found && found.model.variants ? found.model.variants : [];
    const next = variant && variants.includes(variant) ? variant : null;
    state.selectedVariant = next;
    const key = modelKey(state.selectedModel.providerID, state.selectedModel.modelID);
    if (next) state.selectedVariants[key] = next;
    else delete state.selectedVariants[key];
    saveSelection();
    updateComposer();
    renderVariantOptions();
  }

  function updateModelSelectionClasses() {
    $$(".model-row", ui.modelList).forEach((row) => {
      const selected =
        state.selectedModel &&
        row.dataset.providerId === state.selectedModel.providerID &&
        row.dataset.modelId === state.selectedModel.modelID;
      row.classList.toggle("selected", Boolean(selected));
      const check = $(".model-check", row);
      if (check) check.style.visibility = selected ? "visible" : "hidden";
    });
  }

  function renderModelList() {
    ui.modelList.innerHTML = "";
    if (!state.meta) {
      const empty = document.createElement("div");
      empty.className = "empty-note";
      empty.textContent = "模型信息尚未加载";
      ui.modelList.appendChild(empty);
      return;
    }
    const query = ui.modelSearch.value.trim().toLowerCase();
    let count = 0;
    for (const provider of state.meta.providers || []) {
      const models = (provider.models || []).filter((model) => {
        if (!query) return true;
        return (
          String(model.name || "").toLowerCase().includes(query) ||
          String(model.id || "").toLowerCase().includes(query) ||
          String(provider.name || "").toLowerCase().includes(query)
        );
      });
      if (!models.length) continue;
      count += models.length;
      const label = document.createElement("div");
      label.className = "provider-label";
      label.textContent = provider.name || provider.id;
      ui.modelList.appendChild(label);
      for (const model of models) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "model-row";
        row.dataset.providerId = provider.id;
        row.dataset.modelId = model.id;
        const selected =
          state.selectedModel &&
          state.selectedModel.providerID === provider.id &&
          state.selectedModel.modelID === model.id;
        if (selected) row.classList.add("selected");

        const main = document.createElement("span");
        main.className = "model-main";
        const name = document.createElement("span");
        name.className = "model-name";
        name.textContent = model.name || model.id;
        main.appendChild(name);
        const id = document.createElement("span");
        id.className = "model-id";
        id.textContent = model.id;
        main.appendChild(id);
        row.appendChild(main);

        const tags = document.createElement("span");
        tags.className = "model-tags";
        const cost = model.cost || {};
        const free =
          Object.prototype.hasOwnProperty.call(cost, "input") &&
          Object.prototype.hasOwnProperty.call(cost, "output") &&
          Number(cost.input) === 0 &&
          Number(cost.output) === 0;
        if (free) {
          const freeTag = document.createElement("span");
          freeTag.className = "tag free";
          freeTag.textContent = "免费";
          tags.appendChild(freeTag);
        }
        if (model.reasoning) {
          const reasonTag = document.createElement("span");
          reasonTag.className = "tag reasoning";
          reasonTag.textContent = "推理";
          tags.appendChild(reasonTag);
        }
        row.appendChild(tags);

        const check = document.createElement("span");
        check.className = "model-check";
        check.innerHTML = ICONS.check;
        check.style.visibility = selected ? "visible" : "hidden";
        row.appendChild(check);
        ui.modelList.appendChild(row);
      }
    }
    if (!count) {
      const empty = document.createElement("div");
      empty.className = "empty-note";
      empty.textContent = query ? "没有找到匹配的模型" : "没有可用模型";
      ui.modelList.appendChild(empty);
    }
  }

  function renderVariantOptions() {
    const found = findModel(state.selectedModel);
    const variants = found && found.model.variants ? found.model.variants : [];
    ui.variantSection.hidden = !variants.length;
    ui.variantOptions.innerHTML = "";
    if (!variants.length) return;
    const all = [null].concat(variants);
    for (const variant of all) {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "variant-pill" + (state.selectedVariant === variant ? " active" : "");
      pill.dataset.variant = variant || "";
      pill.textContent = variant || "默认";
      ui.variantOptions.appendChild(pill);
    }
  }

  function renderAgents() {
    ui.agentList.innerHTML = "";
    if (!state.meta || !state.meta.agents || !state.meta.agents.length) {
      const empty = document.createElement("div");
      empty.className = "session-empty";
      empty.textContent = "没有可用 Agent";
      ui.agentList.appendChild(empty);
      return;
    }
    for (const agent of state.meta.agents) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "agent-row" + (agent.name === state.selectedAgent ? " selected" : "");
      row.dataset.agent = agent.name;
      const ico = document.createElement("span");
      ico.className = "agent-ico";
      ico.innerHTML =
        '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M12 3.8 19 8v8l-7 4.2L5 16V8l7-4.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.4" stroke="currentColor" stroke-width="1.6"/></svg>';
      row.appendChild(ico);
      const copy = document.createElement("span");
      copy.className = "agent-copy";
      const name = document.createElement("div");
      name.className = "agent-name";
      name.textContent = agentDisplay(agent.name);
      copy.appendChild(name);
      if (agent.description) {
        const desc = document.createElement("div");
        desc.className = "agent-desc";
        desc.textContent = agent.description;
        copy.appendChild(desc);
      }
      row.appendChild(copy);
      ui.agentList.appendChild(row);
    }
  }

  function selectAgent(name) {
    const agents = state.meta && state.meta.agents ? state.meta.agents : [];
    const agent = agents.find((item) => item.name === name);
    if (!agent) return;
    state.selectedAgent = agent.name;
    const agentModel = normalizeRef(agent.model);
    if (agentModel && findModel(agentModel)) {
      const next = { providerID: agentModel.providerID, modelID: agentModel.modelID };
      const found = findModel(next);
      const variants = found.model.variants || [];
      state.selectedModel = next;
      const key = modelKey(next.providerID, next.modelID);
      const saved = state.selectedVariants[key];
      state.selectedVariant =
        saved && variants.includes(saved)
          ? saved
          : agentModel.variant && variants.includes(agentModel.variant)
            ? agentModel.variant
            : null;
    }
    saveSelection();
    renderAgents();
    updateModelSelectionClasses();
    renderVariantOptions();
    updateComposer();
    updateTopbar();
    closeModal(ui.agentModal);
  }

  function openModelPicker() {
    renderModelList();
    renderVariantOptions();
    openModal(ui.modelModal);
    window.setTimeout(() => ui.modelSearch.focus(), 50);
  }

  function openAgentPicker() {
    renderAgents();
    openModal(ui.agentModal);
  }

  function upsertSession(info) {
    if (!info || !info.id) return;
    const index = state.sessions.findIndex((item) => item.id === info.id);
    if (index >= 0) state.sessions[index] = Object.assign({}, state.sessions[index], info);
    else state.sessions.push(info);
    if (info.id === state.sessionId) {
      state.sessionInfo = Object.assign({}, state.sessionInfo || {}, info);
    }
    scheduleSessionRefresh();
  }

  const scheduleSessionRefresh = debounce(() => {
    renderSessions();
    updateTopbar();
  }, 45);

  async function loadSessions() {
    const data = await ocFetch("session?limit=200", { timeout: 40000 });
    const sessions = Array.isArray(data) ? data : [];
    const byId = new Map(sessions.map((item) => [item.id, item]));
    const existing = new Map(state.sessions.map((item) => [item.id, item]));
    const missingPinned = [];
    for (const id of state.pinned) {
      if (!byId.has(id)) missingPinned.push(id);
    }
    if (missingPinned.length) {
      const results = await Promise.allSettled(
        missingPinned.map((id) =>
          ocFetch("session/" + encodeURIComponent(id), { timeout: 15000 })
        )
      );
      let pinsChanged = false;
      results.forEach((result, index) => {
        const id = missingPinned[index];
        if (result.status === "fulfilled" && result.value && result.value.id) {
          byId.set(result.value.id, result.value);
        } else if (
          result.status === "rejected" &&
          result.reason &&
          result.reason.status === 404
        ) {
          if (state.pinned.delete(id)) pinsChanged = true;
        } else if (existing.has(id)) {
          byId.set(id, existing.get(id));
        }
      });
      if (pinsChanged) savePinnedSessions();
    }
    state.sessions = Array.from(byId.values());
    renderSessions();
    updateTopbar();
  }

  function removeSessionLocally(sessionID) {
    state.sessions = state.sessions.filter((item) => item.id !== sessionID);
    state.queues.delete(sessionID);
    state.queueSending.delete(sessionID);
    state.queuePaused.delete(sessionID);
    state.queueRuns.delete(sessionID);
    state.queueStepReady.delete(sessionID);
    state.queueAwaiting.delete(sessionID);
    state.taskStarted.delete(sessionID);
    state.notifySuppressed.delete(sessionID);
    state.notifyFailed.delete(sessionID);
    if (state.pinned.delete(sessionID)) savePinnedSessions();
    clearQueueTimer(sessionID);
    if (state.sessionId === sessionID) {
      state.sessionId = null;
      state.sessionInfo = null;
    }
    try {
      if (localStorage.getItem(STORE.session) === sessionID) {
        localStorage.removeItem(STORE.session);
      }
    } catch (error) {}
    renderSessions();
    updateTopbar();
    renderQueue();
    updateComposer();
  }

  async function loadStatuses() {
    try {
      const data = await ocFetch("session/status", { timeout: 20000 });
      const next = new Map();
      if (data && typeof data === "object") {
        Object.keys(data).forEach((sessionID) => {
          const status = data[sessionID];
          if (status && status.type && status.type !== "idle") {
            next.set(sessionID, status);
          }
        });
      }
      state.busy = next;
      renderSessions();
      updateTopbar();
      updateComposer();
      refreshComposerStatus();
      updateThinkingRow();
      flushPendingQueues();
    } catch (error) {}
  }

  async function loadPending() {
    try {
      const results = await Promise.all([
        ocFetch("permission", { timeout: 20000 }),
        ocFetch("question", { timeout: 20000 })
      ]);
      state.permissions = Array.isArray(results[0]) ? results[0] : [];
      state.questions = Array.isArray(results[1]) ? results[1] : [];
      renderSessions();
      updateTopbar();
      refreshComposerStatus();
      if (state.autoAllow && state.permissions.length) {
        autoApprovePendingPermissions();
      } else {
        maybeShowCurrentPrompt();
      }
    } catch (error) {}
  }

  function setSessionStatus(sessionID, status) {
    if (!sessionID) return;
    if (!status || status.type === "idle") {
      state.queueAwaiting.delete(sessionID);
      state.queueStepReady.delete(sessionID);
      notifySessionFinished(sessionID);
    } else {
      state.taskStarted.add(sessionID);
      state.busy.set(sessionID, status);
      clearQueueTimer(sessionID);
    }
    renderSessions();
    if (sessionID === state.sessionId) {
      updateTopbar();
      updateComposer();
      refreshComposerStatus();
      updateThinkingRow();
    }
  }

  function refreshComposerStatus() {
    const queue = currentQueue();
    const paused = queuePausedFor(state.sessionId);
    const queueSuffix = queue.length ? " · 已排队 " + queue.length + " 条" : "";
    const pausedSuffix = paused ? " · 队列已暂停" : "";
    if (state.activePermissionId) {
      setComposerStatus("warn", "等待你授权下一步操作" + queueSuffix + pausedSuffix);
      return;
    }
    if (state.activeQuestionId) {
      setComposerStatus("warn", "等待你的回答" + queueSuffix + pausedSuffix);
      return;
    }
    const busy = currentBusy();
    if (busy && busy.type === "retry") {
      const wait = busy.next ? "，将在 " + Math.max(1, Math.round((busy.next - Date.now()) / 1000)) + " 秒后重试" : "";
      setComposerStatus(
        "warn",
        "请求失败" + (busy.message ? "：" + busy.message : "") + wait + queueSuffix + pausedSuffix
      );
      return;
    }
    if (busy) {
      const queuedText = queue.length
        ? paused
          ? " · 已排队 " + queue.length + " 条，队列已暂停"
          : state.queueSending.has(state.sessionId)
          ? " · 正在插入 " + queue.length + " 条排队消息"
          : " · 已排队 " + queue.length + " 条，将在下一个分段插入"
        : "";
      setComposerStatus("loading", "正在生成…" + queuedText);
      return;
    }
    if (currentQueueHasError()) {
      setComposerStatus("warn", "第 1 条排队消息发送失败，请重试或移除");
      return;
    }
    if (paused && queue.length) {
      setComposerStatus("warn", "队列已暂停 · " + queue.length + " 条等待发送");
      return;
    }
    if (queue.length) {
      const text = state.queueSending.has(state.sessionId)
        ? "正在插入排队的消息…"
        : "准备插入排队的消息…";
      setComposerStatus("loading", text);
      return;
    }
    setComposerStatus("", "");
  }

  function resetConversationView() {
    state.messages.clear();
    state.messageOrder = [];
    state.partNodes.clear();
    ui.messages.innerHTML = "";
    ui.welcome.hidden = false;
    ui.jumpLatest.hidden = true;
  }

  function showChatLoading() {
    state.messages.clear();
    state.messageOrder = [];
    state.partNodes.clear();
    ui.welcome.hidden = true;
    ui.messages.innerHTML =
      '<div class="chat-loading"><div class="spinner large"></div><span>正在载入会话…</span></div>';
  }

  function messageErrorText(error) {
    if (!error) return "";
    if (typeof error === "string") return error;
    if (error.name === "MessageAbortedError") return "已停止生成";
    const data = error.data || error;
    if (data && typeof data.message === "string") return data.message;
    if (typeof error.message === "string") return error.message;
    if (error.name) return String(error.name);
    return prettyJson(error);
  }

  function createMessageElement(rec) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + (rec.role === "user" ? "user" : "assistant");
    wrap.dataset.messageId = rec.id;
    rec.el = wrap;

    if (rec.role === "user") {
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      const parts = document.createElement("div");
      parts.className = "user-parts";
      bubble.appendChild(parts);
      wrap.appendChild(bubble);
      rec.partsEl = parts;
    } else {
      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5.2" stroke="white" stroke-width="2.3"/><path d="m16.2 16.2 3.4 3.4" stroke="white" stroke-width="2.3" stroke-linecap="round"/><circle cx="12" cy="12" r="1.6" fill="white"/></svg>';
      wrap.appendChild(avatar);

      const body = document.createElement("div");
      body.className = "msg-body";
      const head = document.createElement("div");
      head.className = "msg-head";
      const name = document.createElement("span");
      name.className = "msg-name";
      name.textContent = "OpenCode";
      head.appendChild(name);
      const agent = document.createElement("span");
      agent.className = "msg-agent";
      head.appendChild(agent);
      const time = document.createElement("span");
      time.className = "msg-time";
      head.appendChild(time);
      body.appendChild(head);
      const parts = document.createElement("div");
      parts.className = "parts";
      body.appendChild(parts);
      const foot = document.createElement("div");
      foot.className = "msg-foot";
      foot.hidden = true;
      body.appendChild(foot);
      wrap.appendChild(body);
      rec.partsEl = parts;
      rec.headEl = head;
      rec.agentEl = agent;
      rec.timeEl = time;
      rec.footEl = foot;
    }

    ui.messages.appendChild(wrap);
    ui.welcome.hidden = true;
    updateMessageHead(rec);
    return wrap;
  }

  function updateMessageHead(rec) {
    if (!rec || !rec.el) return;
    if (rec.role !== "user") {
      const info = rec.info || {};
      const agent = info.agent || info.mode || state.selectedAgent || "build";
      if (rec.agentEl) rec.agentEl.textContent = agentDisplay(agent);
      if (rec.timeEl) {
        rec.timeEl.textContent = formatClock(
          info.time && (info.time.completed || info.time.created)
        );
      }
      updateMessageFoot(rec);
    }
    updateMessageError(rec);
  }

  function messageTiming(rec, now) {
    const info = (rec && rec.info) || {};
    const time = info.time || {};
    const start = Number(time.created) || 0;
    if (!start) return null;
    const completed = Number(time.completed) || 0;
    const running = !completed && Boolean(info.sessionID) && state.busy.has(info.sessionID);
    const end = completed || (running ? now : 0);
    return {
      start: start,
      end: end,
      running: running,
      duration: end ? Math.max(0, end - start) : 0
    };
  }

  function turnTiming(rec, now) {
    const parentID = rec && rec.info && rec.info.parentID;
    if (!parentID) return null;
    let count = 0;
    let start = 0;
    let end = 0;
    let running = false;
    let last = null;
    for (const messageID of state.messageOrder) {
      const item = state.messages.get(messageID);
      if (!item || item.role !== "assistant" || !item.info || item.info.parentID !== parentID) {
        continue;
      }
      const timing = messageTiming(item, now);
      if (!timing) continue;
      count += 1;
      if (!start || timing.start < start) start = timing.start;
      if (timing.end > end) end = timing.end;
      if (timing.running) running = true;
      last = item;
    }
    if (count < 2 || !start || !end) return null;
    return {
      count: count,
      start: start,
      end: end,
      running: running,
      last: last,
      duration: Math.max(0, end - start)
    };
  }

  function updateMessageFoot(rec, now) {
    if (!rec || !rec.footEl) return;
    const info = rec.info || {};
    const stamp = Number(now) || Date.now();
    rec.footEl.innerHTML = "";
    const tokens = info.tokens || {};
    const items = [];
    if (rec.role === "assistant") {
      const timing = messageTiming(rec, stamp);
      if (timing && timing.end) {
        const turn = turnTiming(rec, stamp);
        if (turn && turn.last === rec) {
          items.push({
            label: "本轮耗时",
            value: formatDuration(turn.duration),
            duration: true,
            turn: true,
            running: turn.running
          });
        }
        items.push({
          label: turn && turn.count > 1 ? "本段耗时" : "耗时",
          value: formatDuration(timing.duration),
          duration: true,
          running: timing.running
        });
      }
    }
    if (Number(tokens.output) > 0 || Number(tokens.total) > 0) {
      items.push({ label: "Token", value: formatNumber(tokens.output || tokens.total) });
    }
    const cost = formatCost(info.cost);
    if (cost) items.push({ label: "费用", value: cost });
    if (info.modelID) {
      items.push({
        label: "模型",
        value: modelDisplay({ providerID: info.providerID, modelID: info.modelID }),
        model: true
      });
    }
    if (!items.length) {
      rec.footEl.hidden = true;
      return;
    }
    rec.footEl.hidden = false;
    for (const item of items) {
      const span = document.createElement("span");
      span.className =
        "foot-item" +
        (item.model ? " foot-model" : "") +
        (item.duration ? " foot-duration" : "") +
        (item.turn ? " foot-turn" : "") +
        (item.running ? " running" : "");
      span.textContent = item.label + " ";
      const strong = document.createElement("strong");
      strong.textContent = item.value;
      span.appendChild(strong);
      rec.footEl.appendChild(span);
    }
  }

  function refreshAssistantFoots(parentID) {
    if (!parentID) return;
    for (const item of state.messages.values()) {
      if (item.role === "assistant" && item.info && item.info.parentID === parentID) {
        updateMessageFoot(item);
      }
    }
  }

  function tickDurations() {
    const now = Date.now();
    for (const rec of state.messages.values()) {
      if (rec.role !== "assistant") continue;
      const time = rec.info && rec.info.time;
      if (time && time.completed) continue;
      updateMessageFoot(rec, now);
    }
  }

  function updateMessageError(rec) {
    if (!rec) return;
    if (rec.errorEl) {
      rec.errorEl.remove();
      rec.errorEl = null;
    }
    if (rec.role === "user") return;
    const info = rec.info || {};
    if (!info.error) return;
    const node = document.createElement("div");
    node.className = "error-part";
    node.innerHTML = ICONS.error;
    const text = document.createElement("span");
    text.textContent = messageErrorText(info.error);
    node.appendChild(text);
    rec.errorEl = node;
    rec.partsEl.appendChild(node);
  }

  function ensureMessage(info, forceRole) {
    const data = info || {};
    const id = data.id;
    if (!id) return null;
    let rec = state.messages.get(id);
    if (!rec) {
      const role =
        data.role || forceRole || (data.parentID || data.modelID ? "assistant" : "assistant");
      rec = {
        id,
        role,
        info: data,
        parts: new Map(),
        order: [],
        el: null,
        partsEl: null
      };
      state.messages.set(id, rec);
      state.messageOrder.push(id);
      createMessageElement(rec);
      if (rec.role === "assistant" && data.parentID) {
        refreshAssistantFoots(data.parentID);
      }
    } else {
      const previousParentID = rec.info && rec.info.parentID;
      if (data.role) rec.role = data.role;
      rec.info = Object.assign({}, rec.info || {}, data);
      updateMessageHead(rec);
      if (
        rec.role === "assistant" &&
        rec.info.parentID &&
        rec.info.parentID !== previousParentID
      ) {
        refreshAssistantFoots(rec.info.parentID);
      }
    }
    updateMessageVisibility(rec);
    updateContextUsage();
    return rec;
  }

  function partNode(rec, part) {
    let node = state.partNodes.get(part.id);
    if (node) return node;
    node = document.createElement("div");
    node.className = "part";
    node.dataset.partId = part.id;
    state.partNodes.set(part.id, node);
    if (rec.errorEl) rec.partsEl.insertBefore(node, rec.errorEl);
    else rec.partsEl.appendChild(node);
    return node;
  }

  function addPart(part, options) {
    if (!part || !part.id) return;
    const opts = options || {};
    if (part.type === "text" && (part.synthetic || part.ignored)) {
      removePart(part.id);
      const rec = state.messages.get(part.messageID);
      if (rec) updateMessageVisibility(rec);
      return;
    }
    const existing = state.messages.get(part.messageID);
    const rec = ensureMessage(
      {
        id: part.messageID,
        sessionID: part.sessionID,
        role: existing ? existing.role : "assistant",
        time: { created: Date.now() }
      },
      existing ? existing.role : "assistant"
    );
    if (!rec) return;
    let previous = null;
    if (rec.parts.has(part.id)) {
      previous = rec.parts.get(part.id);
      rec.parts.set(part.id, part);
    } else {
      rec.parts.set(part.id, part);
      rec.order.push(part.id);
    }
    if (part.type === "step-start" || part.type === "step-finish" || part.type === "snapshot") {
      if (previous && state.partNodes.has(part.id)) removePart(part.id);
      return;
    }
    renderPart(rec, part, previous, opts);
    updateMessageVisibility(rec);
    updateThinkingRow();
    scheduleScroll();
  }

  function renderPart(rec, part, previous, options) {
    const opts = options || {};
    const node = partNode(rec, part);
    if (part.type === "text") {
      renderTextPart(rec, part, node, opts);
    } else if (part.type === "reasoning") {
      renderReasoningPart(rec, part, node);
    } else if (part.type === "tool") {
      renderToolPart(part, node);
    } else if (part.type === "file") {
      renderFilePart(part, node);
    } else if (part.type === "patch") {
      renderPatchPart(part, node);
    } else if (part.type === "subtask") {
      renderSubtaskPart(part, node);
    } else if (part.type === "agent") {
      renderAgentPart(part, node);
    } else if (part.type === "retry") {
      renderRetryPart(part, node);
    } else if (part.type === "compaction") {
      renderNotice(node, "上下文已压缩");
    } else if (part.type === "error") {
      renderNotice(node, part.message || "发生错误", true);
    } else {
      node.remove();
      state.partNodes.delete(part.id);
    }
  }

  function renderTextPart(rec, part, node, options) {
    let md = $(".markdown", node);
    if (!md) {
      md = document.createElement("div");
      md.className = "markdown";
      node.appendChild(md);
    }
    const active =
      rec.role !== "user" &&
      !(part.time && part.time.end) &&
      !(rec.info && rec.info.time && rec.info.time.completed);
    md.classList.toggle("streaming-cursor", Boolean(active));
    if (options.immediate || !active) applyMarkdown(md, part.text || "");
    else scheduleMarkdown(md, part.text || "");
  }

  function renderReasoningPart(rec, part, node) {
    let details = $("details", node);
    if (!details) {
      details = document.createElement("details");
      details.className = "reasoning";
      details.innerHTML =
        '<summary>' +
        ICONS.reasoning +
        '<span>思考过程</span><span class="reason-count"></span>' +
        ICONS.chevron +
        "</summary><div class=\"reasoning-body\"></div>";
      details.open = !(part.time && part.time.end);
      details.addEventListener("toggle", () => {
        details.dataset.touched = "1";
      });
      node.appendChild(details);
    }
    const body = $(".reasoning-body", details);
    const text = part.text || "";
    if (body) body.textContent = text;
    const count = $(".reason-count", details);
    if (count) count.textContent = text ? text.length + " 字" : "";
    details.classList.toggle("running", !(part.time && part.time.end));
  }

  function toolSummary(part) {
    const current = part.state || {};
    if (current.title) return current.title;
    const input = current.input || {};
    return (
      input.command ||
      input.filePath ||
      input.path ||
      input.pattern ||
      input.query ||
      input.url ||
      input.description ||
      input.prompt ||
      part.tool ||
      ""
    );
  }

  function toolStatusLabel(status) {
    if (status === "running") return "运行中";
    if (status === "completed") return "完成";
    if (status === "error") return "失败";
    return "等待";
  }

  function appendToolSection(body, label, text, isError) {
    const section = document.createElement("div");
    section.className = "tool-section";
    const head = document.createElement("div");
    head.className = "tool-section-label";
    const title = document.createElement("span");
    title.textContent = label;
    head.appendChild(title);
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-mini";
    copy.textContent = "复制";
    copy.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (await copyText(text)) {
        copy.textContent = "已复制";
        window.setTimeout(() => {
          copy.textContent = "复制";
        }, 1200);
      }
    });
    head.appendChild(copy);
    const pre = document.createElement("pre");
    pre.className = "tool-pre" + (isError ? " error" : "");
    pre.textContent = limitText(text, 40000);
    section.appendChild(head);
    section.appendChild(pre);
    body.appendChild(section);
  }

  function makeFileChip(part) {
    const chip = document.createElement("div");
    chip.className = "file-chip";
    chip.innerHTML = /^image\//.test(part.mime || "") ? ICONS.image : ICONS.file;
    const label = document.createElement("span");
    label.textContent = part.filename || part.source && part.source.path || part.mime || "附件";
    chip.appendChild(label);
    return chip;
  }

  function renderToolPart(part, node) {
    const open = node.classList.contains("open");
    const current = part.state || {};
    const status = current.status || "pending";
    const meta = TOOL_META[part.tool] || {};
    const label = meta.label || part.tool || "Tool";
    const summary = toolSummary(part);
    node.innerHTML = "";
    node.className = "part tool" + (open ? " open" : "");

    const head = document.createElement("div");
    head.className = "tool-head";
    const ico = document.createElement("span");
    ico.className = "tool-ico";
    ico.innerHTML = iconForTool(part.tool);
    head.appendChild(ico);
    const name = document.createElement("span");
    name.className = "tool-name";
    name.textContent = label;
    head.appendChild(name);
    const title = document.createElement("span");
    title.className = "tool-title";
    title.textContent = truncate(summary, 180);
    title.title = summary;
    head.appendChild(title);
    const statusEl = document.createElement("span");
    statusEl.className = "tool-state " + status;
    statusEl.innerHTML = '<span class="dot"></span>';
    const statusText = document.createElement("span");
    statusText.textContent = toolStatusLabel(status);
    statusEl.appendChild(statusText);
    head.appendChild(statusEl);
    const chevron = document.createElement("span");
    chevron.className = "tool-chevron";
    chevron.innerHTML = ICONS.chevron;
    head.appendChild(chevron);
    node.appendChild(head);

    const body = document.createElement("div");
    body.className = "tool-body";
    let hasContent = false;

    if (current.input && Object.keys(current.input).length) {
      appendToolSection(body, "输入", prettyJson(current.input), false);
      hasContent = true;
    }
    if (status === "error" && current.error) {
      appendToolSection(body, "错误", String(current.error), true);
      hasContent = true;
    }
    if (status === "completed" && current.output) {
      appendToolSection(body, "输出", String(current.output), false);
      hasContent = true;
    }
    if (current.metadata && current.metadata.exit != null && Number(current.metadata.exit) !== 0) {
      const warn = document.createElement("div");
      warn.className = "tool-running";
      warn.textContent = "退出码 " + current.metadata.exit;
      body.appendChild(warn);
      hasContent = true;
    }
    if (Array.isArray(current.attachments) && current.attachments.length) {
      const section = document.createElement("div");
      section.className = "tool-section";
      const sectionLabel = document.createElement("div");
      sectionLabel.className = "tool-section-label";
      sectionLabel.textContent = "附件";
      section.appendChild(sectionLabel);
      for (const attachment of current.attachments) {
        section.appendChild(makeFileChip(attachment));
      }
      body.appendChild(section);
      hasContent = true;
    }
    if (status === "running") {
      const running = document.createElement("div");
      running.className = "tool-running";
      running.innerHTML = '<span class="spinner"></span><span>正在执行…</span>';
      body.appendChild(running);
      hasContent = true;
    }
    if (!hasContent) {
      const empty = document.createElement("div");
      empty.className = "tool-running";
      empty.textContent = status === "pending" ? "等待执行…" : "没有更多输出";
      body.appendChild(empty);
    }
    node.appendChild(body);
  }

  function renderFilePart(part, node) {
    node.innerHTML = "";
    node.className = "part";
    const isImage = /^image\//.test(part.mime || "") && /^data:image\//.test(part.url || "");
    if (isImage) {
      const img = document.createElement("img");
      img.src = part.url;
      img.alt = part.filename || "图片";
      img.loading = "lazy";
      img.style.maxWidth = "100%";
      img.style.borderRadius = "8px";
      img.style.border = "1px solid var(--border-soft)";
      node.appendChild(img);
      if (part.filename) {
        const caption = document.createElement("div");
        caption.className = "msg-time";
        caption.style.marginTop = "4px";
        caption.textContent = part.filename;
        node.appendChild(caption);
      }
    } else {
      node.appendChild(makeFileChip(part));
    }
  }

  function renderPatchPart(part, node) {
    node.innerHTML = "";
    node.className = "part";
    const card = document.createElement("div");
    card.className = "patch-card";
    const head = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = "补丁";
    head.appendChild(strong);
    const count = document.createElement("span");
    count.textContent = " · " + ((part.files && part.files.length) || 0) + " 个文件";
    head.appendChild(count);
    card.appendChild(head);
    if (part.files && part.files.length) {
      const files = document.createElement("div");
      files.className = "patch-files";
      for (const file of part.files) {
        const code = document.createElement("code");
        code.textContent = file;
        files.appendChild(code);
      }
      card.appendChild(files);
    }
    node.appendChild(card);
  }

  function renderSubtaskPart(part, node) {
    node.innerHTML = "";
    node.className = "part";
    const card = document.createElement("div");
    card.className = "subtask";
    const ico = document.createElement("span");
    ico.className = "tool-ico";
    ico.innerHTML = iconForTool("task");
    card.appendChild(ico);
    const body = document.createElement("div");
    body.className = "subtask-body";
    const title = document.createElement("div");
    title.className = "subtask-title";
    title.textContent = part.description || "子任务";
    body.appendChild(title);
    const prompt = document.createElement("div");
    prompt.className = "subtask-prompt";
    prompt.textContent = part.prompt || "";
    body.appendChild(prompt);
    card.appendChild(body);
    node.appendChild(card);
  }

  function renderAgentPart(part, node) {
    node.innerHTML = "";
    node.className = "part";
    const chip = document.createElement("div");
    chip.className = "file-chip";
    chip.innerHTML = ICONS.folder;
    const text = document.createElement("span");
    text.textContent = "Agent · " + agentDisplay(part.name);
    chip.appendChild(text);
    node.appendChild(chip);
  }

  function renderRetryPart(part, node) {
    node.innerHTML = "";
    node.className = "part";
    const box = document.createElement("div");
    box.className = "retry-part";
    const text = document.createElement("span");
    text.textContent =
      "响应异常，正在重试" +
      (part.attempt != null ? "（第 " + (Number(part.attempt) + 1) + " 次）" : "") +
      (part.error ? "：" + messageErrorText(part.error) : "");
    box.appendChild(text);
    node.appendChild(box);
  }

  function renderNotice(node, text, danger) {
    node.innerHTML = "";
    node.className = "part";
    const box = document.createElement("div");
    box.className = danger ? "error-part" : "notice-part";
    box.innerHTML = ICONS.info;
    const label = document.createElement("span");
    label.textContent = text;
    box.appendChild(label);
    node.appendChild(box);
  }

  function removePart(partID) {
    const node = state.partNodes.get(partID);
    if (node) node.remove();
    state.partNodes.delete(partID);
    for (const rec of state.messages.values()) {
      if (rec.parts.has(partID)) {
        rec.parts.delete(partID);
        rec.order = rec.order.filter((id) => id !== partID);
        updateMessageVisibility(rec);
        break;
      }
    }
    updateThinkingRow();
  }

  function removeMessage(messageID) {
    const rec = state.messages.get(messageID);
    if (!rec) return;
    const parentID = rec.info && rec.info.parentID;
    if (rec.el) rec.el.remove();
    for (const partID of rec.order) state.partNodes.delete(partID);
    state.messages.delete(messageID);
    state.messageOrder = state.messageOrder.filter((id) => id !== messageID);
    if (!state.messageOrder.length) ui.welcome.hidden = false;
    refreshAssistantFoots(parentID);
    updateThinkingRow();
    updateContextUsage();
  }

  function hasVisibleParts(rec) {
    for (const partID of rec.order) {
      const part = rec.parts.get(partID);
      if (!part) continue;
      if (
        part.type === "text" &&
        !part.synthetic &&
        !part.ignored &&
        String(part.text || "").trim()
      ) {
        return true;
      }
      if (part.type === "reasoning" && String(part.text || "").trim()) return true;
      if (part.type === "tool" || part.type === "file" || part.type === "patch") return true;
      if (part.type === "subtask" || part.type === "agent") return true;
    }
    return false;
  }

  function userMessageHasContent(rec) {
    if (hasVisibleParts(rec)) return true;
    for (const partID of rec.order) {
      const part = rec.parts.get(partID);
      if (part && part.type === "compaction") return true;
    }
    return false;
  }

  function updateMessageVisibility(rec) {
    if (!rec || !rec.el) return;
    rec.el.classList.toggle(
      "is-empty",
      rec.role === "user" && !userMessageHasContent(rec)
    );
  }

  function updateThinkingRow() {
    $$(".thinking-row", ui.messages).forEach((node) => node.remove());
    if (!state.sessionId || !currentBusy()) return;
    for (let index = state.messageOrder.length - 1; index >= 0; index -= 1) {
      const rec = state.messages.get(state.messageOrder[index]);
      if (!rec || rec.role !== "assistant") continue;
      if (rec.info && rec.info.time && rec.info.time.completed) return;
      if (hasVisibleParts(rec)) return;
      const row = document.createElement("div");
      row.className = "thinking-row";
      row.innerHTML =
        '<div class="typing"><span>正在思考</span><span class="tdot"></span><span class="tdot"></span><span class="tdot"></span></div>';
      rec.partsEl.appendChild(row);
      return;
    }
  }

  function applyHistory(records) {
    const incoming = new Map();
    const order = [];
    for (const record of records || []) {
      if (!record || !record.info || !record.info.id) continue;
      incoming.set(record.info.id, record);
      order.push(record.info.id);
    }
    const existing = state.messages;
    state.messages = new Map();
    state.messageOrder = [];
    state.partNodes = new Map();
    ui.messages.innerHTML = "";
    for (const messageID of order) {
      const record = incoming.get(messageID);
      const rec = ensureMessage(record.info, record.info.role);
      for (const part of record.parts || []) {
        const existingRec = existing.get(messageID);
        if (!part || !part.id) continue;
        rec.parts.set(part.id, part);
        rec.order.push(part.id);
        if (part.type === "step-start" || part.type === "step-finish" || part.type === "snapshot") {
          continue;
        }
        if (part.type === "text" && (part.synthetic || part.ignored)) continue;
        renderPart(rec, part, existingRec ? existingRec.parts.get(part.id) : null, {
          immediate: true
        });
      }
      updateMessageHead(rec);
    }
    for (const messageID of existing.keys()) {
      if (!incoming.has(messageID)) {
        const rec = existing.get(messageID);
        if (!rec) continue;
        const copy = ensureMessage(rec.info, rec.role);
        for (const partID of rec.order) {
          const part = rec.parts.get(partID);
          if (!part) continue;
          copy.parts.set(partID, part);
          copy.order.push(partID);
          if (part.type === "step-start" || part.type === "step-finish" || part.type === "snapshot") {
            continue;
          }
          if (part.type === "text" && (part.synthetic || part.ignored)) continue;
          renderPart(copy, part, null, { immediate: true });
        }
      }
    }
    for (const rec of state.messages.values()) updateMessageVisibility(rec);
    ui.welcome.hidden = state.messageOrder.length > 0;
    updateThinkingRow();
    updateMessageErrorAll();
    updateContextUsage();
  }

  function updateMessageErrorAll() {
    for (const rec of state.messages.values()) updateMessageHead(rec);
  }

  async function loadSessionData(sessionID, token) {
    try {
      const results = await Promise.all([
        ocFetch(
          "session/" + encodeURIComponent(sessionID) + "/message?limit=200",
          { timeout: 120000 }
        ),
        ocFetch("session/" + encodeURIComponent(sessionID) + "/todo", {
          timeout: 30000
        }).catch(() => [])
      ]);
      if (token !== state.loadSeq || state.sessionId !== sessionID) return;
      state.todos = Array.isArray(results[1]) ? results[1] : [];
      applyHistory(Array.isArray(results[0]) ? results[0] : []);
      renderTodos();
      state.loadingSession = false;
      updateTopbar();
      updateComposer();
      refreshComposerStatus();
      maybeShowCurrentPrompt();
      state.autoScroll = true;
      window.setTimeout(() => scrollToBottom("auto"), 20);
    } catch (error) {
      if (token !== state.loadSeq || state.sessionId !== sessionID) return;
      state.loadingSession = false;
      ui.messages.innerHTML = "";
      const note = document.createElement("div");
      note.className = "empty-note";
      note.textContent = "载入会话失败：" + error.message;
      ui.messages.appendChild(note);
      ui.welcome.hidden = true;
      toast("载入会话失败：" + error.message, "error");
    }
  }

  async function selectSession(sessionID) {
    closeCommandPopover();
    if (!sessionID) {
      newChat();
      return;
    }
    if (state.sessionId === sessionID) {
      toggleSidebar(false);
      return;
    }
    const info = state.sessions.find((item) => item.id === sessionID) || null;
    const token = ++state.loadSeq;
    state.sessionId = sessionID;
    state.sessionInfo = info;
    state.todos = [];
    state.loadingSession = true;
    state.activePermissionId = null;
    state.activeQuestionId = null;
    closeModal(ui.permissionModal);
    closeModal(ui.questionModal);
    try {
      localStorage.setItem(STORE.session, sessionID);
    } catch (error) {}
    showChatLoading();
    renderTodos();
    renderSessions();
    updateTopbar();
    renderQueue();
    updateComposer();
    refreshComposerStatus();
    toggleSidebar(false);
    await loadSessionData(sessionID, token);
  }

  function newChat() {
    closeCommandPopover();
    state.loadSeq += 1;
    state.sessionId = null;
    state.sessionInfo = null;
    state.todos = [];
    state.loadingSession = false;
    state.activePermissionId = null;
    state.activeQuestionId = null;
    closeModal(ui.permissionModal);
    closeModal(ui.questionModal);
    try {
      localStorage.removeItem(STORE.session);
    } catch (error) {}
    resetConversationView();
    renderTodos();
    renderSessions();
    updateTopbar();
    renderQueue();
    updateComposer();
    setComposerStatus("", "");
    state.autoScroll = true;
    forcePromptFocus();
  }

  function closeSessionMenu() {
    if (state.sessionMenu) {
      state.sessionMenu.remove();
      state.sessionMenu = null;
    }
  }

  function openSessionMenu(x, y, info) {
    if (!info) return;
    closeSessionMenu();
    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "会话操作");
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "context-menu-item";
    pin.setAttribute("role", "menuitem");
    pin.textContent = state.pinned.has(info.id) ? "取消置顶" : "置顶会话";
    pin.addEventListener("click", () => {
      closeSessionMenu();
      toggleSessionPin(info);
    });
    menu.appendChild(pin);
    const rename = document.createElement("button");
    rename.type = "button";
    rename.className = "context-menu-item";
    rename.setAttribute("role", "menuitem");
    rename.textContent = "重命名";
    rename.addEventListener("click", () => {
      closeSessionMenu();
      openRenameSession(info);
    });
    menu.appendChild(rename);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "context-menu-item danger";
    remove.setAttribute("role", "menuitem");
    remove.textContent = "删除会话";
    remove.addEventListener("click", () => {
      closeSessionMenu();
      deleteSession(info);
    });
    menu.appendChild(remove);
    menu.addEventListener("keydown", (event) => {
      const items = $$(".context-menu-item", menu);
      const index = items.indexOf(document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        closeSessionMenu();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const next = items[(index + delta + items.length) % items.length];
        if (next) next.focus();
      }
    });
    document.body.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    const left = Math.max(8, Math.min(x, window.innerWidth - rect.width - 8));
    const top = Math.max(8, Math.min(y, window.innerHeight - rect.height - 8));
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    state.sessionMenu = menu;
    pin.focus();
  }

  function openRenameSession(info) {
    if (!info) return;
    state.renameSessionID = info.id;
    ui.renameInput.value = sessionTitle(info);
    openModal(ui.renameModal);
    window.setTimeout(() => {
      ui.renameInput.focus();
      ui.renameInput.select();
    }, 40);
  }

  function closeRenameSession() {
    state.renameSessionID = null;
    closeModal(ui.renameModal);
  }

  async function saveSessionRename() {
    if (state.renameBusy) return;
    const sessionID = state.renameSessionID;
    if (!sessionID) return;
    const title = ui.renameInput.value.trim();
    if (!title) {
      toast("会话名称不能为空", "error");
      ui.renameInput.focus();
      return;
    }
    const info = state.sessions.find((item) => item.id === sessionID);
    if (info && sessionTitle(info) === title) {
      closeRenameSession();
      return;
    }
    state.renameBusy = true;
    ui.renameSave.disabled = true;
    ui.renameSave.textContent = "保存中…";
    try {
      const updated = await ocFetch("session/" + encodeURIComponent(sessionID), {
        method: "PATCH",
        body: { title },
        timeout: 30000
      });
      upsertSession(updated && updated.id ? updated : { id: sessionID, title });
      renderSessions();
      updateTopbar();
      closeRenameSession();
      toast("会话已重命名", "success");
    } catch (error) {
      toast("重命名失败：" + error.message, "error");
    } finally {
      state.renameBusy = false;
      ui.renameSave.disabled = false;
      ui.renameSave.textContent = "保存";
    }
  }

  async function deleteSession(info) {
    if (!info) return;
    const confirmed = await confirmAction(
      "删除会话",
      "确定要删除“" + sessionTitle(info) + "”吗？消息记录将被永久移除。",
      "删除"
    );
    if (!confirmed) return;
    try {
      await ocFetch("session/" + encodeURIComponent(info.id), {
        method: "DELETE",
        timeout: 30000
      });
      removeSessionLocally(info.id);
      if (!state.sessionId) newChat();
      toast("会话已删除", "success");
    } catch (error) {
      toast("删除会话失败：" + error.message, "error");
    }
  }

  function renderTodos() {
    const todos = Array.isArray(state.todos) ? state.todos : [];
    const total = todos.length;
    const done = todos.filter((todo) => todo.status === "completed").length;
    ui.todoBtn.hidden = !state.sessionId || !total;
    ui.todoProgress.textContent = done + "/" + total;
    ui.todoSummary.textContent = total ? done + "/" + total + " 已完成" : "当前没有待办";
    ui.todoList.innerHTML = "";
    if (!total) {
      const empty = document.createElement("div");
      empty.className = "todo-empty";
      empty.textContent = "这个会话还没有待办事项。\nOpenCode 规划任务后会显示在这里。";
      empty.style.whiteSpace = "pre-line";
      ui.todoList.appendChild(empty);
      return;
    }
    for (const todo of todos) {
      const item = document.createElement("div");
      item.className = "todo-item " + (todo.status || "pending");
      const check = document.createElement("span");
      check.className = "todo-check";
      check.textContent =
        todo.status === "completed" ? "✓" : todo.status === "in_progress" ? "•" : todo.status === "cancelled" ? "–" : "";
      item.appendChild(check);
      const text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = todo.content || "";
      item.appendChild(text);
      if (todo.priority) {
        const priority = document.createElement("span");
        priority.className = "todo-prio " + todo.priority;
        priority.textContent =
          todo.priority === "high" ? "高" : todo.priority === "low" ? "低" : "中";
        item.appendChild(priority);
      }
      ui.todoList.appendChild(item);
    }
  }

  async function loadTodos(sessionID) {
    if (!sessionID) return;
    try {
      const todos = await ocFetch(
        "session/" + encodeURIComponent(sessionID) + "/todo",
        { timeout: 30000 }
      );
      if (state.sessionId !== sessionID) return;
      state.todos = Array.isArray(todos) ? todos : [];
      renderTodos();
    } catch (error) {}
  }

  function forcePromptFocus() {
    window.setTimeout(() => ui.prompt.focus(), 30);
  }

  function buildPromptParts(text, attachments) {
    const parts = [];
    const localFiles = (attachments || [])
      .filter((attachment) => attachment.path)
      .map((attachment) => attachment.path);
    let value = String(text || "").trim();
    if (localFiles.length) {
      const block =
        "本地文件（绝对路径）：\n" +
        localFiles.map((path) => "- " + path).join("\n");
      value = value ? value + "\n\n" + block : block;
    }
    if (value) parts.push({ type: "text", text: value });
    for (const attachment of attachments || []) {
      if (!attachment.dataUrl || !attachment.mime) continue;
      parts.push({
        type: "file",
        mime: attachment.mime,
        filename: attachment.name || "image",
        url: attachment.dataUrl
      });
    }
    return parts;
  }

  function buildPromptPayload(item) {
    const payload = {
      model: {
        providerID: item.model.providerID,
        modelID: item.model.modelID
      },
      agent: item.agent,
      parts: buildPromptParts(item.text, item.attachments)
    };
    if (item.variant) payload.variant = item.variant;
    return payload;
  }

  function enqueueCurrentPrompt(text, attachments) {
    const sessionID = state.sessionId;
    if (!sessionID || !state.selectedModel) return false;
    const queue = state.queues.get(sessionID) || [];
    if (queue.length >= MAX_QUEUE_ITEMS) {
      toast("排队消息最多 " + MAX_QUEUE_ITEMS + " 条，请先发送或清空队列", "error", 5000);
      return false;
    }
      const incomingBytes = (attachments || []).reduce(
        (sum, attachment) =>
          sum + (attachment.dataUrl ? Number(attachment.size) || 0 : 0),
        0
      );
    if (queueAttachmentBytes(queue) + incomingBytes > MAX_QUEUE_BYTES) {
      toast(
        "排队附件总量不能超过 " + fileSizeLabel(MAX_QUEUE_BYTES) + "，请先发送或清空队列",
        "error",
        5000
      );
      return false;
    }
    const item = {
      id: localId("queue_"),
      sessionID: sessionID,
      text: String(text || "").trim(),
      attachments: (attachments || []).map((attachment) => ({ ...attachment })),
      model: {
        providerID: state.selectedModel.providerID,
        modelID: state.selectedModel.modelID
      },
      agent: state.selectedAgent,
      variant: state.selectedVariant,
      createdAt: Date.now(),
      error: null
    };
    queue.push(item);
    state.queues.set(sessionID, queue);
    ui.prompt.value = "";
    state.attachments = [];
    renderAttachments();
    resizePrompt();
    renderQueue();
    renderSessions();
    updateComposer();
    refreshComposerStatus();
    scheduleQueueFlush(sessionID, 0);
    return true;
  }

  async function sendQueuedPrompt(sessionID, item, token) {
    state.notifySuppressed.delete(sessionID);
    state.notifyFailed.delete(sessionID);
    setSessionStatus(sessionID, { type: "busy" });
    try {
      await ocFetch(
        "session/" + encodeURIComponent(sessionID) + "/prompt_async",
        {
          method: "POST",
          body: buildPromptPayload(item),
          timeout: 180000
        }
      );
    } catch (error) {
      if (state.queueRuns.get(sessionID) === token) {
        state.notifySuppressed.add(sessionID);
        setSessionStatus(sessionID, { type: "idle" });
        state.taskStarted.delete(sessionID);
        state.notifySuppressed.delete(sessionID);
      }
      throw error;
    }
    if (state.queueRuns.get(sessionID) !== token) return;
    if (sessionID === state.sessionId) {
      state.autoScroll = true;
      scheduleScroll();
      refreshComposerStatus();
      updateComposer();
    }
  }

  async function flushQueue(sessionID) {
    clearQueueTimer(sessionID);
    if (
      !sessionID ||
      state.queueSending.has(sessionID) ||
      state.queueAwaiting.has(sessionID) ||
      queuePausedFor(sessionID)
    ) {
      return;
    }
    const queue = state.queues.get(sessionID);
    if (!queue || !queue.length) return;
    const item = queue[0];
    if (item.error) return;
    if (!item.model) {
      item.error = "缺少模型信息";
      renderQueue();
      renderSessions();
      updateComposer();
      if (sessionID === state.sessionId) refreshComposerStatus();
      return;
    }
    state.queueSending.add(sessionID);
    const token = localId("run_");
    state.queueRuns.set(sessionID, token);
    renderQueue();
    renderSessions();
    updateComposer();
    if (sessionID === state.sessionId) refreshComposerStatus();
    try {
      await sendQueuedPrompt(sessionID, item, token);
      if (state.queueRuns.get(sessionID) !== token) return;
      state.queueAwaiting.add(sessionID);
      removeQueueItem(sessionID, item.id, { skipFlush: true });
    } catch (error) {
      if (state.queueRuns.get(sessionID) !== token) return;
      item.error = error.message || "发送失败";
      toast("排队消息发送失败：" + item.error, "error", 6000);
    } finally {
      if (state.queueRuns.get(sessionID) === token) {
        state.queueRuns.delete(sessionID);
        state.queueSending.delete(sessionID);
        renderQueue();
        renderSessions();
        updateComposer();
        if (sessionID === state.sessionId) refreshComposerStatus();
        if (!item.error) {
          const stepReady = state.queueStepReady.delete(sessionID);
          if (stepReady) state.queueAwaiting.delete(sessionID);
          if (stepReady || !state.busy.get(sessionID)) {
            scheduleQueueFlush(sessionID, QUEUE_FLUSH_DELAY);
          }
        }
      }
    }
  }

  async function sendPrompt() {
    const text = ui.prompt.value.trim();
    const attachments = state.attachments.slice();
    if ((!text && !attachments.length) || state.sendInFlight || state.addingImages) return;
    const slash = parseSlashCommand(text);
    if (slash) {
      executeSlashCommand(slash.command, slash.arguments, ui.prompt.value, attachments);
      return;
    }
    closeCommandPopover();
    if (!state.cwd) {
      toast("请先选择项目文件夹", "error");
      showOnboarding(state.cwd);
      return;
    }
    if (!state.selectedModel) {
      toast("请先选择一个模型", "error");
      openModelPicker();
      return;
    }
    if (currentBusy() || currentQueue().length) {
      enqueueCurrentPrompt(text, attachments);
      return;
    }
    const sessionIDAtStart = state.sessionId;
    const draft = ui.prompt.value;
    const draftAttachments = attachments;
    state.sendInFlight = true;
    updateComposer();
    try {
      let sessionID = state.sessionId;
      if (!sessionID) {
        const firstLine = text.split(/\r?\n/)[0];
        const titleSource =
          firstLine || (attachments[0] && attachments[0].name) || "新会话";
        const created = await ocFetch("session", {
          method: "POST",
          body: { title: truncate(titleSource, 60) || "新会话" },
          timeout: 30000
        });
        if (!created || !created.id) throw new Error("创建会话失败");
        sessionID = created.id;
        const existingIndex = state.sessions.findIndex((item) => item.id === created.id);
        if (existingIndex >= 0) state.sessions[existingIndex] = created;
        else state.sessions.push(created);
        state.sessionId = created.id;
        state.sessionInfo = created;
        try {
          localStorage.setItem(STORE.session, created.id);
        } catch (error) {}
        resetConversationView();
        renderSessions();
        updateTopbar();
        updateComposer();
      }

      const payload = {
        model: {
          providerID: state.selectedModel.providerID,
          modelID: state.selectedModel.modelID
        },
        agent: state.selectedAgent,
        parts: buildPromptParts(text, attachments)
      };
      if (state.selectedVariant) payload.variant = state.selectedVariant;
      state.notifySuppressed.delete(sessionID);
      state.notifyFailed.delete(sessionID);
      await ocFetch(
        "session/" + encodeURIComponent(sessionID) + "/prompt_async",
        {
          method: "POST",
          body: payload,
          timeout: 180000
        }
      );
      if (state.sessionId === sessionID) {
        ui.prompt.value = "";
        state.attachments = [];
        renderAttachments();
        resizePrompt();
        state.autoScroll = true;
        scheduleScroll();
      }
      setSessionStatus(sessionID, { type: "busy" });
      refreshComposerStatus();
      updateComposer();
      updateThinkingRow();
      window.setTimeout(() => {
        if (!state.eventConnected) loadStatuses();
      }, 1400);
    } catch (error) {
      if (!ui.prompt.value && sessionIDAtStart === state.sessionId) {
        ui.prompt.value = draft;
        resizePrompt();
      }
      if (!state.attachments.length && sessionIDAtStart === state.sessionId) {
        state.attachments = draftAttachments;
        renderAttachments();
        updateComposer();
      }
      toast("发送失败：" + error.message, "error");
    } finally {
      state.sendInFlight = false;
      updateComposer();
    }
  }

  async function abortCurrent() {
    const sessionID = state.sessionId;
    if (!sessionID) return;
    const pauseQueue = currentQueue().length > 0;
    if (pauseQueue) setQueuePaused(sessionID, true);
    state.notifySuppressed.add(sessionID);
    ui.stopBtn.disabled = true;
    try {
      await ocFetch("session/" + encodeURIComponent(sessionID) + "/abort", {
        method: "POST",
        timeout: 30000
      });
      setSessionStatus(sessionID, { type: "idle" });
      refreshComposerStatus();
      window.setTimeout(() => loadStatuses(), 500);
      if (pauseQueue) {
        toast("已停止生成，排队消息已暂停", "info", 3200);
      }
    } catch (error) {
      state.notifySuppressed.delete(sessionID);
      toast("停止生成失败：" + error.message, "error");
    } finally {
      ui.stopBtn.disabled = false;
    }
  }

  async function openCurrentFolder() {
    if (!state.cwd) {
      showOnboarding("");
      return;
    }
    try {
      await localFetch("open-folder", {
        method: "POST",
        body: { path: state.cwd },
        timeout: 15000
      });
    } catch (error) {
      try {
        if (window.pywebview && window.pywebview.api && window.pywebview.api.open_folder) {
          await window.pywebview.api.open_folder(state.cwd);
          return;
        }
      } catch (inner) {}
      toast("无法打开文件夹：" + error.message, "error");
    }
  }

  function permissionTypeLabel(permission) {
    const value = String(permission || "");
    const labels = {
      bash: "执行命令",
      edit: "修改文件",
      write: "写入文件",
      webfetch: "访问网页",
      external_directory: "访问外部目录",
      task: "启动子任务",
      doom_loop: "重复操作",
      read: "读取文件",
      glob: "查找文件",
      grep: "搜索内容",
      list: "查看目录"
    };
    return labels[value] || value || "执行操作";
  }

  function permissionDetailText(request) {
    const meta = request.metadata || {};
    const lines = [];
    if (meta.command) lines.push(String(meta.command));
    if (meta.filePath) lines.push(String(meta.filePath));
    else if (meta.path) lines.push(String(meta.path));
    if (meta.url) lines.push(String(meta.url));
    if (meta.description) lines.push(String(meta.description));
    if (meta.diff && typeof meta.diff === "string") lines.push(meta.diff);
    if (!lines.length && Object.keys(meta).length) {
      lines.push(prettyJson(meta));
    }
    return lines.join("\n\n");
  }

  function showPermission(request) {
    if (!request) return;
    state.activePermissionId = request.id;
    const type = permissionTypeLabel(request.permission);
    ui.permissionSub.textContent = "OpenCode 想要" + type;
    ui.permissionType.textContent = type;
    ui.permissionDetail.textContent = permissionDetailText(request);
    ui.permissionPatterns.innerHTML = "";
    for (const pattern of request.patterns || []) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = pattern;
      chip.title = pattern;
      ui.permissionPatterns.appendChild(chip);
    }
    setPermissionBusy(false);
    openModal(ui.permissionModal);
    updateTopbar();
    refreshComposerStatus();
  }

  function setPermissionBusy(busy) {
    ui.permissionReject.disabled = busy;
    ui.permissionAlways.disabled = busy;
    ui.permissionOnce.disabled = busy;
  }

  function removePermission(requestID) {
    state.permissions = state.permissions.filter((item) => item.id !== requestID);
    if (state.activePermissionId === requestID) {
      state.activePermissionId = null;
      closeModal(ui.permissionModal);
    }
    renderSessions();
    updateTopbar();
    refreshComposerStatus();
    maybeShowCurrentPrompt();
  }

  async function replyPermission(reply) {
    const request = state.permissions.find((item) => item.id === state.activePermissionId);
    if (!request) {
      state.activePermissionId = null;
      closeModal(ui.permissionModal);
      maybeShowCurrentPrompt();
      return;
    }
    setPermissionBusy(true);
    try {
      await ocFetch(
        "permission/" + encodeURIComponent(request.id) + "/reply",
        {
          method: "POST",
          body: { reply },
          timeout: 30000
        }
      );
      removePermission(request.id);
    } catch (error) {
      toast("提交授权失败：" + error.message, "error");
      setPermissionBusy(false);
    }
  }

  function questionAnswersFromDom(request) {
    const answers = [];
    const questions = request.questions || [];
    for (let index = 0; index < questions.length; index += 1) {
      const block = $('[data-question-index="' + index + '"]', ui.questionBody);
      const selected = block
        ? $$('input[type="radio"]:checked, input[type="checkbox"]:checked', block).map(
            (input) => input.value
          )
        : [];
      const custom = block ? $(".q-custom", block) : null;
      if (custom && custom.value.trim()) selected.push(custom.value.trim());
      answers.push(selected);
    }
    return answers;
  }

  function setQuestionBusy(busy) {
    ui.questionSubmit.disabled = busy;
    ui.questionReject.disabled = busy;
    ui.questionRejectX.disabled = busy;
  }

  function showQuestion(request) {
    if (!request) return;
    state.activeQuestionId = request.id;
    ui.questionBody.innerHTML = "";
    const questions = request.questions || [];
    questions.forEach((question, index) => {
      const block = document.createElement("div");
      block.className = "question-block";
      block.dataset.questionIndex = String(index);
      const title = document.createElement("div");
      title.className = "question-title";
      if (question.header) {
        const tag = document.createElement("span");
        tag.className = "question-tag";
        tag.textContent = question.header;
        title.appendChild(tag);
      }
      const titleText = document.createElement("span");
      titleText.textContent = question.question || "";
      title.appendChild(titleText);
      block.appendChild(title);

      if (question.options && question.options.length) {
        const options = document.createElement("div");
        options.className = "question-options";
        question.options.forEach((option) => {
          const label = document.createElement("label");
          label.className = "q-option";
          const input = document.createElement("input");
          input.type = question.multiple ? "checkbox" : "radio";
          input.name = "question-" + index;
          input.value = option.label || "";
          label.appendChild(input);
          const copy = document.createElement("span");
          copy.className = "q-option-copy";
          const optionLabel = document.createElement("span");
          optionLabel.className = "q-option-label";
          optionLabel.textContent = option.label || "";
          copy.appendChild(optionLabel);
          if (option.description) {
            const desc = document.createElement("span");
            desc.className = "q-option-desc";
            desc.textContent = option.description;
            copy.appendChild(desc);
          }
          label.appendChild(copy);
          input.addEventListener("change", () => {
            if (!question.multiple) {
              $$(".q-option", options).forEach((item) => item.classList.remove("selected"));
            }
            label.classList.toggle("selected", input.checked);
            updateQuestionSelectionStyle(options);
          });
          options.appendChild(label);
        });
        block.appendChild(options);
      }

      if (question.custom || !question.options || !question.options.length) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "q-custom";
        input.placeholder = question.custom ? "其他回答…" : "输入你的回答…";
        input.spellcheck = false;
        block.appendChild(input);
      }
      ui.questionBody.appendChild(block);
    });
    setQuestionBusy(false);
    openModal(ui.questionModal);
    updateTopbar();
    refreshComposerStatus();
    window.setTimeout(() => {
      const first = $("input, .q-custom", ui.questionBody);
      if (first) first.focus();
    }, 50);
  }

  function updateQuestionSelectionStyle(options) {
    $$(".q-option", options).forEach((item) => {
      const input = $("input", item);
      item.classList.toggle("selected", Boolean(input && input.checked));
    });
  }

  function removeQuestion(requestID) {
    state.questions = state.questions.filter((item) => item.id !== requestID);
    if (state.activeQuestionId === requestID) {
      state.activeQuestionId = null;
      closeModal(ui.questionModal);
    }
    renderSessions();
    updateTopbar();
    refreshComposerStatus();
    maybeShowCurrentPrompt();
  }

  async function submitQuestion() {
    const request = state.questions.find((item) => item.id === state.activeQuestionId);
    if (!request) {
      state.activeQuestionId = null;
      closeModal(ui.questionModal);
      maybeShowCurrentPrompt();
      return;
    }
    const answers = questionAnswersFromDom(request);
    if (answers.some((answer) => !answer.length)) {
      toast("请回答所有问题后再提交", "error");
      return;
    }
    setQuestionBusy(true);
    try {
      await ocFetch(
        "question/" + encodeURIComponent(request.id) + "/reply",
        {
          method: "POST",
          body: { answers },
          timeout: 30000
        }
      );
      removeQuestion(request.id);
    } catch (error) {
      toast("提交回答失败：" + error.message, "error");
      setQuestionBusy(false);
    }
  }

  async function rejectQuestion() {
    const request = state.questions.find((item) => item.id === state.activeQuestionId);
    if (!request) {
      state.activeQuestionId = null;
      closeModal(ui.questionModal);
      maybeShowCurrentPrompt();
      return;
    }
    setQuestionBusy(true);
    try {
      await ocFetch(
        "question/" + encodeURIComponent(request.id) + "/reject",
        {
          method: "POST",
          timeout: 30000
        }
      );
      removeQuestion(request.id);
    } catch (error) {
      toast("跳过问题失败：" + error.message, "error");
      setQuestionBusy(false);
    }
  }

  function maybeShowCurrentPrompt() {
    if (state.autoApprovingBatch) return;
    if (!state.sessionId) {
      if (state.activePermissionId) {
        state.activePermissionId = null;
        closeModal(ui.permissionModal);
      }
      if (state.activeQuestionId) {
        state.activeQuestionId = null;
        closeModal(ui.questionModal);
      }
      return;
    }

    if (state.activePermissionId) {
      const active = state.permissions.find(
        (item) =>
          item.id === state.activePermissionId && item.sessionID === state.sessionId
      );
      if (active) return;
      state.activePermissionId = null;
      closeModal(ui.permissionModal);
    }
    if (state.activeQuestionId) {
      const active = state.questions.find(
        (item) =>
          item.id === state.activeQuestionId && item.sessionID === state.sessionId
      );
      if (active) return;
      state.activeQuestionId = null;
      closeModal(ui.questionModal);
    }

    const permission = state.permissions.find((item) => item.sessionID === state.sessionId);
    if (permission) {
      showPermission(permission);
      return;
    }
    const question = state.questions.find((item) => item.sessionID === state.sessionId);
    if (question) showQuestion(question);
  }

  function applyTextDelta(props) {
    if (!props || !props.partID || !props.messageID) return;
    let rec = state.messages.get(props.messageID);
    if (!rec) {
      rec = ensureMessage(
        {
          id: props.messageID,
          sessionID: props.sessionID,
          role: "assistant",
          time: { created: Date.now() }
        },
        "assistant"
      );
    }
    if (!rec) return;
    let part = rec.parts.get(props.partID);
    if (!part) {
      const inferred =
        props.field === "reasoning"
          ? "reasoning"
          : props.field === "text"
            ? "text"
            : "text";
      part = {
        id: props.partID,
        messageID: props.messageID,
        sessionID: props.sessionID,
        type: inferred,
        text: "",
        time: inferred === "reasoning" ? { start: Date.now() } : undefined
      };
      rec.parts.set(part.id, part);
      rec.order.push(part.id);
    }
    const field = props.field || "text";
    part[field] = String(part[field] || "") + String(props.delta || "");
    renderPart(rec, part, null, { immediate: false });
    updateMessageVisibility(rec);
    updateThinkingRow();
    scheduleScroll();
  }

  async function addPermissionRequest(request) {
    if (!request || !request.id) return;
    if (state.autoApproving.has(request.id)) return;
    if (state.autoAllow) {
      const approved = await autoApprovePermission(request);
      if (approved) {
        updateTopbar();
        updateComposer();
        refreshComposerStatus();
        return;
      }
    }
    const existing = state.permissions.find((item) => item.id === request.id);
    if (!existing) {
      state.permissions.push(request);
      notifyPermissionRequest(request);
    }
    renderSessions();
    updateTopbar();
    if (request.sessionID === state.sessionId) {
      maybeShowCurrentPrompt();
    } else {
      toast("另一个会话正在等待授权", "info", 3000);
    }
  }

  function addQuestionRequest(request) {
    if (!request || !request.id) return;
    const existing = state.questions.find((item) => item.id === request.id);
    if (!existing) {
      state.questions.push(request);
      notifyQuestionRequest(request);
    }
    renderSessions();
    updateTopbar();
    if (request.sessionID === state.sessionId) {
      maybeShowCurrentPrompt();
    } else {
      toast("另一个会话正在等待你的回答", "info", 3000);
    }
  }

  function handleServerEvent(payload) {
    if (!payload || !payload.type) return;
    const props = payload.properties || payload.data || {};
    switch (payload.type) {
      case "server.connected":
        state.eventConnected = true;
        state.lastConnectionError = false;
        setConnection("ready", "本地服务已连接");
        break;
      case "session.created":
      case "session.updated":
        if (props.info) upsertSession(props.info);
        break;
      case "session.deleted": {
        const id = props.sessionID || (props.info && props.info.id);
        if (id) {
          const wasCurrent = state.sessionId === id;
          removeSessionLocally(id);
          if (wasCurrent) newChat();
        }
        break;
      }
      case "session.status":
        setSessionStatus(props.sessionID, props.status);
        if (!props.status || props.status.type === "idle") {
          scheduleQueueFlush(props.sessionID, QUEUE_FLUSH_DELAY);
        }
        break;
      case "session.idle":
        setSessionStatus(props.sessionID, { type: "idle" });
        if (props.sessionID === state.sessionId) {
          loadTodos(props.sessionID);
          updateThinkingRow();
        }
        scheduleQueueFlush(props.sessionID, QUEUE_FLUSH_DELAY);
        break;
      case "session.error":
        if (props.sessionID) state.notifyFailed.add(props.sessionID);
        if (props.error) toast(messageErrorText(props.error), "error", 6000);
        break;
      case "message.updated":
        if (props.sessionID === state.sessionId && props.info) {
          ensureMessage(props.info, props.info.role);
          updateThinkingRow();
          scheduleScroll();
        }
        break;
      case "message.part.updated":
        if (
          props.sessionID === state.sessionId &&
          props.part &&
          props.part.messageID
        ) {
          addPart(props.part, {
            immediate: Boolean(props.part.time && props.part.time.end)
          });
        }
        if (props.part && props.part.type === "step-finish") {
          const stepSessionID = props.sessionID || props.part.sessionID;
          const pending = stepSessionID && state.queues.get(stepSessionID);
          if (pending && pending.length) {
            state.queueStepReady.add(stepSessionID);
            state.queueAwaiting.delete(stepSessionID);
            scheduleQueueFlush(stepSessionID, 0);
          }
        }
        break;
      case "message.part.delta":
        if (props.sessionID === state.sessionId) applyTextDelta(props);
        break;
      case "message.part.removed":
        if (props.sessionID === state.sessionId && props.partID) removePart(props.partID);
        break;
      case "message.removed":
        if (props.sessionID === state.sessionId && props.messageID) {
          removeMessage(props.messageID);
        }
        break;
      case "permission.asked":
        addPermissionRequest(props);
        break;
      case "permission.replied":
        if (props.requestID) removePermission(props.requestID);
        break;
      case "question.asked":
        addQuestionRequest(props);
        break;
      case "question.replied":
      case "question.rejected":
        if (props.requestID) removeQuestion(props.requestID);
        break;
      case "todo.updated":
        if (props.sessionID === state.sessionId) {
          state.todos = Array.isArray(props.todos) ? props.todos : [];
          renderTodos();
        }
        break;
      case "session.compacted":
        toast("上下文已压缩", "success");
        break;
      default:
        break;
    }
  }

  function connectEvents() {
    if (state.eventSource) {
      try {
        state.eventSource.close();
      } catch (error) {}
      state.eventSource = null;
    }
    state.eventConnected = false;
    state.eventEverOpen = false;
    if (!state.cwd) return;
    setConnection("starting", "正在连接本地服务…");
    const source = new EventSource(
      "/oc/event?directory=" + encodeURIComponent(state.cwd)
    );
    state.eventSource = source;
    source.onopen = () => {
      const reconnected = state.eventEverOpen;
      state.eventEverOpen = true;
      state.eventConnected = true;
      state.lastConnectionError = false;
      setConnection("ready", "本地服务已连接");
      if (state.connectionToast) {
        state.connectionToast.remove();
        state.connectionToast = null;
      }
      if (reconnected) {
        window.setTimeout(() => {
          loadSessions();
          loadStatuses();
          loadPending();
        }, 300);
      }
    };
    source.onmessage = (event) => {
      if (!event.data) return;
      try {
        handleServerEvent(JSON.parse(event.data));
      } catch (error) {}
    };
    source.onerror = () => {
      const wasConnected = state.eventConnected;
      state.eventConnected = false;
      setConnection(
        "starting",
        state.updating ? "正在更新 OpenCode" : "事件流已断开，正在重连…"
      );
      if (wasConnected && !state.lastConnectionError && !state.updating) {
        state.lastConnectionError = true;
        state.connectionToast = toast(
          "与本地服务的连接中断，正在自动重连",
          "error",
          6000
        );
      }
    };
  }

  async function fetchFatalLog() {
    try {
      const text = await localFetch("log?lines=120", { timeout: 15000 });
      return typeof text === "string" ? text : "";
    } catch (error) {
      return "";
    }
  }

  function statusToErrorText(serve) {
    if (!serve) return "OpenCode 服务未能启动";
    return serve.error || serve.detail || "OpenCode 服务未能启动";
  }

  async function startApp(bootstrap) {
    const data = bootstrap || {};
    clearAllQueueTimers();
    state.bootstrap = data;
    state.cwd = data.cwd || (data.serve && data.serve.cwd) || "";
    state.sessionId = null;
    state.sessionInfo = null;
    state.sessions = [];
    state.todos = [];
    state.permissions = [];
    state.questions = [];
    state.busy = new Map();
    state.queues = new Map();
    state.queueSending = new Set();
    state.queuePaused = new Set();
    state.queueTimers = new Map();
    state.queueRuns = new Map();
    state.queueStepReady = new Set();
    state.queueAwaiting = new Set();
    state.taskStarted = new Set();
    state.notifySuppressed = new Set();
    state.notifyFailed = new Set();
    state.pinned = loadPinnedSessions(data.pinnedSessions);
    if (!Array.isArray(data.pinnedSessions) && state.pinned.size) {
      savePinnedSessions();
    }
    state.attachments = [];
    state.addingImages = false;
    state.autoApproving = new Set();
    state.autoApprovingBatch = false;
    state.renameSessionID = null;
    state.renameBusy = false;
    closeSessionMenu();
    closeCommandPopover();
    state.commands = [];
    state.commandsLoaded = false;
    state.commandsLoading = false;
    state.meta = null;
    state.selectedModel = null;
    state.loadSeq += 1;
    state.loadingSession = false;
    state.autoScroll = true;
    closeAllModals();
    closeDrawer();
    hideFatal();
    hideOnboarding();
    updateProject();
    updateServiceInfo();
    renderTodos();
    resetConversationView();
    renderAttachments();
    renderQueue();
    renderSessions();
    updateTopbar();
    updateComposer();
    showLoading("正在载入项目", "读取模型与会话列表…");
    connectEvents();

    const results = await Promise.allSettled([
      loadMeta(),
      loadSessions(),
      loadStatuses(),
      loadPending(),
      loadCommands()
    ]);
    const metaFailed = results[0] && results[0].status === "rejected";
    if (metaFailed) {
      toast(
        "读取模型配置失败：" +
          (results[0].reason && results[0].reason.message
            ? results[0].reason.message
            : "未知错误"),
        "error",
        6000
      );
    }
    if (results[1] && results[1].status === "rejected") {
      toast("读取会话列表失败：" + results[1].reason.message, "error", 5000);
    }
    hideLoading();
    updateProject();
    updateServiceInfo();
    updateTopbar();
    updateComposer();

    let saved = "";
    try {
      saved = localStorage.getItem(STORE.session) || "";
    } catch (error) {}
    let target = saved ? state.sessions.find((item) => item.id === saved) : null;
    if (saved && !target) {
      try {
        const info = await ocFetch("session/" + encodeURIComponent(saved), {
          timeout: 15000
        });
        if (info && info.id) {
          state.sessions.push(info);
          target = info;
        }
      } catch (error) {}
    }
    if (target) await selectSession(target.id);
    else newChat();
    maybeShowCurrentPrompt();
    state.autoScroll = true;
    window.setTimeout(() => {
      updateComposer();
      forcePromptFocus();
    }, 80);
  }

  async function waitForReady(baseBootstrap) {
    let last = baseBootstrap;
    for (let index = 0; index < 160; index += 1) {
      const serve = last.serve || {};
      if (serve.phase === "ready") {
        await startApp(last);
        return;
      }
      if (serve.phase === "error") {
        const log = await fetchFatalLog();
        showFatal(
          "无法启动 OpenCode 服务",
          statusToErrorText(serve),
          log || serve.detail || ""
        );
        return;
      }
      if (serve.phase === "needs_folder") {
        hideLoading();
        showOnboarding((last && last.savedCwd) || "");
        return;
      }
      showLoading(
        "正在启动 OpenCode",
        serve.phase === "starting" ? "载入项目上下文与模型配置…" : "准备本地服务…"
      );
      await new Promise((resolve) => window.setTimeout(resolve, 600));
      try {
        const status = await localFetch("status", { timeout: 12000 });
        last = Object.assign({}, last, {
          serve: status.serve,
          cwd: status.cwd,
          theme: status.theme
        });
        state.bootstrap = last;
        state.cwd = last.cwd || (last.serve && last.serve.cwd) || "";
        updateProject();
        updateServiceInfo();
      } catch (error) {}
    }
    const log = await fetchFatalLog();
    showFatal("OpenCode 服务启动超时", "请检查 OpenCode CLI 是否正常运行。", log);
  }

  async function applyProjectPath(path) {
    const cwd = String(path || "").trim().replace(/^"|"$/g, "");
    if (!cwd) {
      toast("请选择一个项目文件夹", "error");
      return;
    }
    if (!(await confirmQueueDiscard("切换项目"))) return;
    hideOnboarding();
    hideFatal();
    closeModal(ui.settingsModal);
    showLoading("正在切换项目", "重启本地服务并载入项目上下文…");
    try {
      const result = await localFetch("config", {
        method: "POST",
        body: { cwd, theme: state.theme },
        timeout: 180000
      });
      if (!result || !result.ok) {
        const serve = result && result.serve ? result.serve : {};
        const log = await fetchFatalLog();
        showFatal("无法打开这个项目", statusToErrorText(serve), serve.detail || log);
        return;
      }
      const bootstrap = await localFetch("bootstrap", { timeout: 20000 });
      await startApp(bootstrap);
    } catch (error) {
      hideLoading();
      if (error.status === 400) {
        toast(error.message, "error");
        showOnboarding(cwd);
        return;
      }
      const log = await fetchFatalLog();
      showFatal("无法切换项目", error.message, log);
    }
  }

  async function restartService() {
    if (!state.cwd) {
      hideFatal();
      showOnboarding("");
      return;
    }
    if (!(await confirmQueueDiscard("重启服务"))) return;
    hideFatal();
    showLoading("正在重启 OpenCode", "重新启动本地服务…");
    try {
      const result = await localFetch("restart", {
        method: "POST",
        timeout: 180000
      });
      if (!result || !result.ok) {
        const serve = result && result.serve ? result.serve : {};
        const log = await fetchFatalLog();
        showFatal("无法重启 OpenCode 服务", statusToErrorText(serve), serve.detail || log);
        return;
      }
      const bootstrap = await localFetch("bootstrap", { timeout: 20000 });
      await startApp(bootstrap);
    } catch (error) {
      const log = await fetchFatalLog();
      showFatal("无法重启 OpenCode 服务", error.message, log);
    }
  }

  async function boot() {
    initMarkdown();
    initTheme();
    initAutoAllow();
    initSidebarResize();
    initWallpaper();
    bindEvents();
    window.setTimeout(() => checkForCliUpdate(), 1000);
    showLoading("正在启动 OpenCode", "连接本地桌面服务…");
    updateServiceInfo();
    try {
        const bootstrap = await localFetch("bootstrap", { timeout: 20000 });
        state.bootstrap = bootstrap;
        applyWallpaperBootstrap(bootstrap.wallpaper);
        state.cwd =
          bootstrap.cwd || (bootstrap.serve && bootstrap.serve.cwd) || "";
        if (bootstrap.theme) {
          applyTheme(bootstrap.theme);
        }
      updateProject();
      updateServiceInfo();
      const serve = bootstrap.serve || {};
      if (serve.phase === "ready") {
        await startApp(bootstrap);
      } else if (serve.phase === "needs_folder") {
        hideLoading();
        showOnboarding(bootstrap.savedCwd || "");
      } else if (serve.phase === "error") {
        const log = await fetchFatalLog();
        showFatal(
          "无法启动 OpenCode 服务",
          statusToErrorText(serve),
          serve.detail || log
        );
      } else {
        await waitForReady(bootstrap);
      }
    } catch (error) {
      showFatal("无法连接本地界面服务", error.message, "");
    }
  }

  function openSettings() {
    ui.settingsPath.value = state.cwd || "";
    if (ui.settingsAutoAllow) ui.settingsAutoAllow.checked = state.autoAllow;
    updateServiceInfo();
    updateAuthUi();
    openModal(ui.settingsModal);
    window.setTimeout(() => ui.settingsPath.focus(), 50);
  }

  async function browseInto(input) {
    const folder = await pickFolder();
    if (!folder) return;
    input.value = folder;
    input.focus();
  }

  function openSessionFromRow(row) {
    if (!row) return;
    const sessionID = row.dataset.sessionId;
    if (sessionID) selectSession(sessionID);
  }

  function bindEvents() {
    ui.themeToggle.addEventListener("click", toggleTheme);
    ui.newChat.addEventListener("click", newChat);
    ui.sidebarToggle.addEventListener("click", () => toggleSidebar());
    ui.sidebarBackdrop.addEventListener("click", () => toggleSidebar(false));

    ui.sessionSearch.addEventListener("input", () => {
      state.search = ui.sessionSearch.value;
      renderSessions();
    });
    ui.sessionList.addEventListener("click", (event) => {
      const remove = event.target.closest('[data-action="delete-session"]');
      if (remove) {
        event.stopPropagation();
        const row = remove.closest(".session-item");
        const info = row
          ? state.sessions.find((item) => item.id === row.dataset.sessionId)
          : null;
        if (info) deleteSession(info);
        return;
      }
      openSessionFromRow(event.target.closest(".session-item"));
    });
    ui.sessionList.addEventListener("contextmenu", (event) => {
      const row = event.target.closest(".session-item");
      if (!row) return;
      const info = state.sessions.find((item) => item.id === row.dataset.sessionId);
      if (!info) return;
      event.preventDefault();
      openSessionMenu(event.clientX, event.clientY, info);
    });
    ui.sessionList.addEventListener("keydown", (event) => {
      const row = event.target.closest(".session-item");
      if (!row) return;
      if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
        const info = state.sessions.find((item) => item.id === row.dataset.sessionId);
        if (!info) return;
        event.preventDefault();
        const rect = row.getBoundingClientRect();
        openSessionMenu(rect.left + 24, rect.top + rect.height - 4, info);
        return;
      }
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest('[data-action="delete-session"]')) return;
      event.preventDefault();
      openSessionFromRow(row);
    });
    document.addEventListener("pointerdown", (event) => {
      if (state.sessionMenu && !state.sessionMenu.contains(event.target)) {
        closeSessionMenu();
      }
    });
    window.addEventListener("resize", closeSessionMenu);
    ui.sessionList.addEventListener("scroll", closeSessionMenu, { passive: true });

    ui.projectBtn.addEventListener("click", openSettings);
    ui.settingsBtn.addEventListener("click", openSettings);
    ui.settingsBrowse.addEventListener("click", () => browseInto(ui.settingsPath));
    ui.settingsSave.addEventListener("click", () => applyProjectPath(ui.settingsPath.value));
    ui.onboardingBrowse.addEventListener("click", () => browseInto(ui.onboardingPath));
    ui.onboardingStart.addEventListener("click", () =>
      applyProjectPath(ui.onboardingPath.value)
    );
    ui.onboardingLogin.addEventListener("click", openCliLogin);
    ui.settingsLogin.addEventListener("click", openCliLogin);
    if (ui.settingsAutoAllow) {
      ui.settingsAutoAllow.addEventListener("change", () =>
        setAutoAllow(ui.settingsAutoAllow.checked)
      );
    }
    if (ui.settingsWallpaperPick && ui.settingsWallpaperInput) {
      ui.settingsWallpaperPick.addEventListener("click", () =>
        ui.settingsWallpaperInput.click()
      );
      ui.settingsWallpaperInput.addEventListener("change", async () => {
        const file =
          ui.settingsWallpaperInput.files && ui.settingsWallpaperInput.files[0];
        ui.settingsWallpaperInput.value = "";
        if (file) await handleWallpaperFile(file);
      });
    }
    if (ui.settingsWallpaperClear) {
      ui.settingsWallpaperClear.addEventListener("click", clearWallpaper);
    }
    if (ui.settingsWallpaperOpacity) {
      ui.settingsWallpaperOpacity.addEventListener("input", () => {
        setWallpaperTransparency(ui.settingsWallpaperOpacity.value, true);
      });
    }
    window.addEventListener("focus", () => {
      if (state.loginOpened) refreshAuthStatus();
    });
    ui.onboardingPath.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyProjectPath(ui.onboardingPath.value);
      }
    });
    ui.settingsPath.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyProjectPath(ui.settingsPath.value);
      }
    });

    $$("[data-theme-choice]").forEach((button) => {
      button.addEventListener("click", () =>
        applyTheme(button.dataset.themeChoice, true)
      );
    });

    ui.modelPicker.addEventListener("click", openModelPicker);
    ui.variantPicker.addEventListener("click", openModelPicker);
    ui.agentPicker.addEventListener("click", openAgentPicker);
    ui.modelSearch.addEventListener("input", debounce(renderModelList, 70));
    ui.modelList.addEventListener("click", (event) => {
      const row = event.target.closest(".model-row");
      if (!row) return;
      selectModel(row.dataset.providerId, row.dataset.modelId);
    });
    ui.variantOptions.addEventListener("click", (event) => {
      const pill = event.target.closest(".variant-pill");
      if (!pill) return;
      selectVariant(pill.dataset.variant || null);
    });
    $("#model-done", document).addEventListener("click", () => closeModal(ui.modelModal));
    ui.agentList.addEventListener("click", (event) => {
      const row = event.target.closest(".agent-row");
      if (row) selectAgent(row.dataset.agent);
    });

    ui.permissionReject.addEventListener("click", () => replyPermission("reject"));
    ui.permissionAlways.addEventListener("click", () => replyPermission("always"));
    ui.permissionOnce.addEventListener("click", () => replyPermission("once"));
    ui.questionRejectX.addEventListener("click", rejectQuestion);
    ui.questionReject.addEventListener("click", rejectQuestion);
    ui.questionSubmit.addEventListener("click", submitQuestion);
    ui.confirmCancel.addEventListener("click", () => resolveConfirm(false));
    ui.confirmOk.addEventListener("click", () => resolveConfirm(true));
    ui.renameCancel.addEventListener("click", closeRenameSession);
    ui.renameSave.addEventListener("click", saveSessionRename);
    ui.renameInput.addEventListener("keydown", (event) => {
      if (event.isComposing || event.keyCode === 229) return;
      if (event.key === "Enter") {
        event.preventDefault();
        saveSessionRename();
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeRenameSession();
      }
    });

    ui.todoBtn.addEventListener("click", () => toggleDrawer(true));
    ui.todoClose.addEventListener("click", closeDrawer);
    ui.drawerBackdrop.addEventListener("click", closeDrawer);

    ui.openFolderBtn.addEventListener("click", openCurrentFolder);
    ui.updateBtn.addEventListener("click", openUpdateModal);
    ui.updateStart.addEventListener("click", runCliUpdate);
    ui.updateLater.addEventListener("click", () => closeModal(ui.updateModal));
    ui.jumpLatest.addEventListener("click", () => scrollToBottom("smooth"));

    ui.attachBtn.addEventListener("click", () => ui.imageInput.click());
    ui.fileBtn.addEventListener("click", pickLocalFiles);
    ui.imageInput.addEventListener("change", () => {
      const files = Array.from(ui.imageInput.files || []);
      ui.imageInput.value = "";
      addImageFiles(files);
    });
    ui.prompt.addEventListener("paste", (event) => {
      const clipboard = event.clipboardData;
      if (!clipboard) return;
      let files = Array.from(clipboard.files || []);
      if (!files.length && clipboard.items) {
        files = Array.from(clipboard.items)
          .filter((item) => item.kind === "file")
          .map((item) => item.getAsFile())
          .filter(Boolean);
      }
      const images = files.filter((file) => IMAGE_TYPES.has(file.type));
      if (!images.length) return;
      event.preventDefault();
      addImageFiles(images);
    });
    let dragDepth = 0;
    if (ui.composer) {
      ui.composer.addEventListener("dragenter", (event) => {
        const types = Array.from((event.dataTransfer && event.dataTransfer.types) || []);
        if (!types.includes("Files")) return;
        event.preventDefault();
        dragDepth += 1;
        ui.composer.classList.add("dragging");
      });
      ui.composer.addEventListener("dragover", (event) => {
        const types = Array.from((event.dataTransfer && event.dataTransfer.types) || []);
        if (!types.includes("Files")) return;
        event.preventDefault();
      });
      ui.composer.addEventListener("dragleave", (event) => {
        event.preventDefault();
        dragDepth = Math.max(0, dragDepth - 1);
        if (!dragDepth) ui.composer.classList.remove("dragging");
      });
      ui.composer.addEventListener("drop", (event) => {
        const files = event.dataTransfer ? event.dataTransfer.files : null;
        if (!files || !files.length) return;
        event.preventDefault();
        dragDepth = 0;
        ui.composer.classList.remove("dragging");
        addImageFiles(files);
      });
    }
    ui.prompt.addEventListener("input", () => {
      updateComposer();
      resizePrompt();
      updateCommandPopover();
    });
    ui.prompt.addEventListener("keydown", (event) => {
      if (event.isComposing || event.keyCode === 229) return;
      if (handleCommandMenuKeydown(event)) return;
      if (event.key !== "Enter") return;
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        insertPromptNewline();
        return;
      }
      if (event.shiftKey) return;
      event.preventDefault();
      sendPrompt();
    });
    ui.prompt.addEventListener("blur", () => {
      window.setTimeout(() => {
        if (!ui.commandPopover.contains(document.activeElement)) closeCommandPopover();
      }, 120);
    });
    ui.sendBtn.addEventListener("click", sendPrompt);
    ui.stopBtn.addEventListener("click", abortCurrent);

    $$(".suggestion", document).forEach((button) => {
      button.addEventListener("click", () => {
        ui.prompt.value = button.dataset.prompt || "";
        updateComposer();
        resizePrompt();
        forcePromptFocus();
      });
    });

    ui.chatScroll.addEventListener(
      "scroll",
      () => {
        state.autoScroll = isNearBottom();
        ui.jumpLatest.hidden = state.autoScroll;
      },
      { passive: true }
    );
    ui.messages.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (link) {
        const href = link.getAttribute("href") || "";
        if (/^https?:\/\//i.test(href)) {
          event.preventDefault();
          openExternal(href);
          return;
        }
      }
      const head = event.target.closest(".tool-head");
      if (head) {
        const part = head.closest(".part");
        if (part) part.classList.toggle("open");
      }
    });

    ui.fatalRetry.addEventListener("click", restartService);
    ui.fatalChange.addEventListener("click", () => {
      hideFatal();
      showOnboarding(state.cwd || "");
    });

    document.addEventListener("click", (event) => {
      const close = event.target.closest("[data-close]");
      if (close) {
        if (close.dataset.close === "update-modal" && state.updating) return;
        closeModal(close.dataset.close);
        return;
      }
      if (!event.target.classList.contains("modal")) return;
      const modal = event.target;
      if (modal === ui.confirmModal) {
        resolveConfirm(false);
        return;
      }
      if (modal === ui.permissionModal || modal === ui.questionModal) return;
      if (modal === ui.updateModal && state.updating) return;
      closeModal(modal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (!ui.confirmModal.hidden) {
          resolveConfirm(false);
          return;
        }
        if (!ui.updateModal.hidden && state.updating) return;
        if (!ui.todoDrawer.hidden) {
          closeDrawer();
          return;
        }
        if (ui.app.classList.contains("sidebar-open")) {
          toggleSidebar(false);
          return;
        }
        const open = $$(".modal", document).find(
          (modal) =>
            !modal.hidden &&
            modal !== ui.permissionModal &&
            modal !== ui.questionModal
        );
        if (open) closeModal(open);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        newChat();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault();
        openSettings();
      }
    });

    window.setInterval(tickDurations, 1000);

    window.addEventListener("beforeunload", () => {
      if (state.eventSource) {
        try {
          state.eventSource.close();
        } catch (error) {}
      }
    });
  }

  boot();
})();
