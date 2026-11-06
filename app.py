import argparse
import asyncio
import atexit
import base64
import ctypes
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import threading
import time
import traceback
import urllib.parse
import webbrowser
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

import webview
from aiohttp import ClientSession, ClientTimeout, web

APP_TITLE = "OpenCode 桌面"
APP_VERSION = "2.7.6"
APP_DIR = Path(__file__).resolve().parent
RESOURCE_DIR = APP_DIR
if getattr(sys, "frozen", False):
    APP_DIR = Path(sys.executable).resolve().parent
    RESOURCE_DIR = Path(getattr(sys, "_MEIPASS", APP_DIR))
STATIC_DIR = RESOURCE_DIR / "static"
ICON_PATH = RESOURCE_DIR / "icon.ico"
CLI_DIR = APP_DIR / "cli"
WEBVIEW2_INSTALLER_PATH = APP_DIR / "webview2" / "MicrosoftEdgeWebView2Setup.exe"
CONFIG_DIR = Path(
    os.environ.get("OPENCODE_DESKTOP_CONFIG_DIR")
    or (Path(os.environ.get("APPDATA") or Path.home()) / "opencode-desktop")
)
CONFIG_PATH = CONFIG_DIR / "config.json"
SERVE_LOG_PATH = CONFIG_DIR / "serve.log"
DESKTOP_LOG_PATH = CONFIG_DIR / "desktop.log"
STORAGE_DIR = CONFIG_DIR / "webview"
WALLPAPER_PATH = CONFIG_DIR / "wallpaper.bin"
MAX_WALLPAPER_BYTES = 8 * 1024 * 1024
MAX_PINNED_SESSIONS = 500
WALLPAPER_MIME_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}
WALLPAPER_DATA_URL_RE = re.compile(
    r"^data:(image/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$"
)
AUTH_PATH = (
    Path(os.environ.get("XDG_DATA_HOME") or (Path.home() / ".local" / "share"))
    / "opencode"
    / "auth.json"
)
CREATE_NO_WINDOW = 0x08000000 if os.name == "nt" else 0
CREATE_NEW_CONSOLE = 0x00000010 if os.name == "nt" else 0
NOTIFY_APP_ID = "OpenCode.Desktop"
NOTIFY_SCRIPT = (
    "$ErrorActionPreference = 'Stop';"
    "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime] | Out-Null;"
    "[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType=WindowsRuntime] | Out-Null;"
    "$xml = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($env:OPENCODE_TOAST_XML));"
    "$doc = New-Object Windows.Data.Xml.Dom.XmlDocument;"
    "$doc.LoadXml($xml);"
    "$toast = New-Object Windows.UI.Notifications.ToastNotification $doc;"
    "$notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($env:OPENCODE_TOAST_APPID);"
    "$notifier.Show($toast);"
)
PROXY_ROOTS = {"session", "event", "permission", "question", "command", "skill"}
META_CACHE = {"cwd": None, "time": 0.0, "data": None}
UPDATE_CACHE_TTL = 300
UPDATE_TIMEOUT = 900
NPM_LATEST_URL = (
    os.environ.get("OPENCODE_NPM_LATEST_URL")
    or "https://registry.npmjs.org/opencode-ai/latest"
)
CLI_UPDATE_CACHE = {"exe": None, "time": 0.0, "data": None}
VERSION_PATTERN = re.compile(
    r"(?<!\d)v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?![\d.])"
)


def print_log(message):
    try:
        print(message, flush=True)
    except Exception:
        pass


def register_notify_app_id():
    if os.name != "nt":
        return
    try:
        import winreg

        key_path = "Software\\Classes\\AppUserModelId\\" + NOTIFY_APP_ID
        with winreg.CreateKeyEx(
            winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_WRITE
        ) as key:
            winreg.SetValueEx(key, "DisplayName", 0, winreg.REG_SZ, APP_TITLE)
            if ICON_PATH.exists():
                winreg.SetValueEx(key, "IconUri", 0, winreg.REG_SZ, str(ICON_PATH))
            winreg.SetValueEx(key, "ShowInSettings", 0, winreg.REG_DWORD, 1)
    except Exception as exc:
        print_log(f"notify register: {exc}")


def show_system_notification(title, body):
    if os.name != "nt":
        return False
    title = str(title or "任务完成").strip()[:120]
    body = str(body or "").strip()[:400]
    xml = (
        "<toast><visual><binding template=\"ToastGeneric\">"
        f"<text>{xml_escape(title)}</text>"
        f"<text>{xml_escape(body)}</text>"
        "</binding></visual></toast>"
    )
    env = os.environ.copy()
    env["OPENCODE_TOAST_XML"] = base64.b64encode(xml.encode("utf-8")).decode("ascii")
    env["OPENCODE_TOAST_APPID"] = NOTIFY_APP_ID
    powershell = shutil.which("powershell.exe") or os.path.join(
        os.environ.get("SystemRoot", "C:\\Windows"),
        "System32",
        "WindowsPowerShell",
        "v1.0",
        "powershell.exe",
    )
    try:
        result = subprocess.run(
            [
                powershell,
                "-NoLogo",
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                NOTIFY_SCRIPT,
            ],
            env=env,
            capture_output=True,
            timeout=15,
            creationflags=CREATE_NO_WINDOW,
        )
    except Exception as exc:
        print_log(f"notify: {exc}")
        return False
    if result.returncode != 0:
        error = (result.stderr or b"").decode("utf-8", "replace").strip()
        print_log(f"notify failed ({result.returncode}): {error[:300]}")
        return False
    return True


def show_native_error(title, message):
    print_log(f"{title}: {message}")
    if os.name != "nt":
        return
    try:
        ctypes.windll.user32.MessageBoxW(None, str(message), str(title), 0x10)
    except Exception:
        pass


def log_desktop_error():
    try:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        stamp = time.strftime("%Y-%m-%d %H:%M:%S")
        with open(DESKTOP_LOG_PATH, "a", encoding="utf-8") as file:
            file.write(f"\n===== {stamp} =====\n")
            file.write(traceback.format_exc())
            file.write("\n")
    except Exception:
        pass


def launch_auth_login(exe, cwd=None):
    workdir = cwd if cwd and Path(cwd).is_dir() else str(Path.home())
    if os.name != "nt":
        return subprocess.Popen([exe, "auth", "login"], cwd=workdir)
    if exe.lower().endswith((".cmd", ".bat")):
        command = subprocess.list2cmdline([exe, "auth", "login"])
        args = [os.environ.get("COMSPEC", "cmd.exe"), "/d", "/c", command]
    else:
        args = [exe, "auth", "login"]
    return subprocess.Popen(
        args,
        cwd=workdir,
        creationflags=CREATE_NEW_CONSOLE,
    )


def load_config():
    try:
        data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return {}


def save_config(data):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    temp = CONFIG_PATH.with_suffix(".json.tmp")
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(temp, CONFIG_PATH)


def normalize_pinned_sessions(value):
    if not isinstance(value, list):
        return []
    result = []
    seen = set()
    for item in value:
        if not isinstance(item, str):
            continue
        item = item.strip()
        if not item or len(item) > 200 or item in seen:
            continue
        seen.add(item)
        result.append(item)
        if len(result) >= MAX_PINNED_SESSIONS:
            break
    return result


def wallpaper_transparency(config):
    try:
        value = int(config.get("wallpaperTransparency", 35))
    except (TypeError, ValueError):
        value = 35
    return max(0, min(100, value))


def wallpaper_state(config=None):
    config = load_config() if config is None else config
    transparency = wallpaper_transparency(config)
    if not WALLPAPER_PATH.is_file():
        return {"hasImage": False, "url": "", "transparency": transparency}
    mime = config.get("wallpaperMime")
    if mime not in WALLPAPER_MIME_TYPES:
        mime = "image/webp"
    try:
        version = WALLPAPER_PATH.stat().st_mtime_ns
    except OSError:
        version = int(time.time() * 1000)
    return {
        "hasImage": True,
        "url": f"/local/wallpaper?v={version}",
        "transparency": transparency,
        "mime": mime,
    }


def bundled_opencode_exe():
    path = CLI_DIR / "opencode.exe"
    if path.is_file():
        return str(path.resolve())
    return None


def cli_is_bundled(exe):
    bundled = bundled_opencode_exe()
    if not exe or not bundled:
        return False
    try:
        return os.path.normcase(str(Path(exe).resolve())) == os.path.normcase(
            str(Path(bundled).resolve())
        )
    except Exception:
        return False


def auth_configured():
    try:
        return AUTH_PATH.is_file() and AUTH_PATH.stat().st_size > 0
    except Exception:
        return False


def find_opencode_exe():
    candidates = []
    env_path = os.environ.get("OPENCODE_EXE")
    if env_path:
        candidates.append(env_path)
    bundled = bundled_opencode_exe()
    if bundled:
        candidates.append(bundled)
    for name in ("opencode.exe", "opencode.cmd", "opencode"):
        found = shutil.which(name)
        if found:
            candidates.append(found)
    appdata = os.environ.get("APPDATA")
    if appdata:
        base = Path(appdata)
        candidates.extend(
            [
                base / "npm" / "node_modules" / "opencode-ai" / "bin" / "opencode.exe",
                base / "npm" / "opencode.cmd",
                base / "npm" / "opencode.exe",
            ]
        )
    localappdata = os.environ.get("LOCALAPPDATA")
    if localappdata:
        candidates.extend(
            [
                Path(localappdata) / "Programs" / "opencode" / "opencode.exe",
                Path(localappdata) / "opencode" / "bin" / "opencode.exe",
            ]
        )
    for candidate in candidates:
        try:
            path = Path(candidate)
            if path.is_file():
                return str(path.resolve())
        except Exception:
            continue
    return None


def free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def read_tail(path, max_bytes=16000):
    try:
        with open(path, "rb") as file:
            file.seek(0, os.SEEK_END)
            size = file.tell()
            file.seek(max(0, size - max_bytes))
            return file.read().decode("utf-8", "replace")
    except Exception:
        return ""


def json_response(data, status=200):
    if status == 204:
        return web.Response(status=204)
    return web.Response(
        text=json.dumps(data, ensure_ascii=False),
        status=status,
        content_type="application/json",
        charset="utf-8",
    )


def normalize_model_ref(value):
    if not isinstance(value, dict):
        return None
    provider = value.get("providerID")
    model = value.get("modelID") or value.get("id")
    if not provider or not model:
        return None
    return {
        "providerID": provider,
        "modelID": model,
        "variant": value.get("variant"),
    }


class ServeManager:
    def __init__(self, cwd):
        self.cwd = str(Path(cwd)) if cwd else None
        self.exe = find_opencode_exe()
        self.proc = None
        self.port = None
        self.phase = "idle"
        self.error = None
        self.detail = None
        self._lock = asyncio.Lock()
        self._log_file = None

    def status(self):
        data = {
            "phase": self.phase,
            "error": self.error,
            "detail": self.detail,
            "cwd": self.cwd,
            "port": self.port,
            "pid": self.proc.pid if self.proc and self.proc.poll() is None else None,
            "exe": self.exe,
            "exeFound": bool(self.exe),
            "bundled": cli_is_bundled(self.exe),
        }
        if self.phase in ("error", "stopped"):
            tail = read_tail(SERVE_LOG_PATH, 6000)
            if tail.strip():
                data["log"] = tail[-6000:]
        return data

    @property
    def base_url(self):
        if not self.port:
            return None
        return f"http://127.0.0.1:{self.port}"

    async def start(self, cwd):
        async with self._lock:
            await self._stop_locked()
            self.cwd = str(Path(cwd).expanduser().resolve()) if cwd else None
            self.error = None
            self.detail = None
            if not self.cwd:
                self.phase = "needs_folder"
                return self.status()
            if not Path(self.cwd).is_dir():
                self.phase = "error"
                self.error = "项目文件夹不存在"
                self.detail = self.cwd
                return self.status()
            if not self.exe:
                self.phase = "error"
                self.error = "未找到 opencode 可执行文件"
                self.detail = "请先安装 OpenCode CLI，或设置 OPENCODE_EXE 环境变量。"
                return self.status()
            try:
                CONFIG_DIR.mkdir(parents=True, exist_ok=True)
                self._log_file = open(SERVE_LOG_PATH, "ab", buffering=0)
                header = f"\n\n===== {time.strftime('%Y-%m-%d %H:%M:%S')} | {self.cwd} =====\n"
                self._log_file.write(header.encode("utf-8", "replace"))
                port = free_port()
                args = [
                    self.exe,
                    "serve",
                    "--hostname",
                    "127.0.0.1",
                    "--port",
                    str(port),
                ]
                env = os.environ.copy()
                self.proc = subprocess.Popen(
                    args,
                    cwd=self.cwd,
                    env=env,
                    stdin=subprocess.DEVNULL,
                    stdout=self._log_file,
                    stderr=subprocess.STDOUT,
                    creationflags=CREATE_NO_WINDOW,
                )
                self.port = port
                self.phase = "starting"
                deadline = time.monotonic() + 90
                health = f"http://127.0.0.1:{port}/api/health"
                async with ClientSession(timeout=ClientTimeout(total=3)) as session:
                    while time.monotonic() < deadline:
                        code = self.proc.poll()
                        if code is not None:
                            self.phase = "error"
                            self.error = f"OpenCode 服务启动失败（退出码 {code}）"
                            self.detail = read_tail(SERVE_LOG_PATH)[-6000:]
                            await self._stop_locked(keep_phase=True)
                            return self.status()
                        try:
                            async with session.get(health) as response:
                                if response.status == 200:
                                    payload = await response.json(content_type=None)
                                    if payload.get("healthy", True):
                                        self.phase = "ready"
                                        self.error = None
                                        self.detail = None
                                        return self.status()
                        except Exception:
                            pass
                        await asyncio.sleep(0.35)
                self.phase = "error"
                self.error = "OpenCode 服务启动超时"
                self.detail = read_tail(SERVE_LOG_PATH)[-6000:]
                await self._stop_locked(keep_phase=True)
                return self.status()
            except asyncio.CancelledError:
                await self._stop_locked()
                raise
            except Exception as exc:
                self.phase = "error"
                self.error = "启动 OpenCode 服务时出错"
                self.detail = f"{exc}\n\n{read_tail(SERVE_LOG_PATH)[-4000:]}"
                await self._stop_locked(keep_phase=True)
                return self.status()

    async def _stop_locked(self, keep_phase=False):
        proc = self.proc
        self.proc = None
        self.port = None
        if not keep_phase:
            self.phase = "stopped"
        if proc and proc.poll() is None:
            try:
                if os.name == "nt":
                    subprocess.run(
                        ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                        capture_output=True,
                        timeout=10,
                        creationflags=CREATE_NO_WINDOW,
                    )
                else:
                    proc.terminate()
            except Exception:
                try:
                    proc.terminate()
                except Exception:
                    pass
            try:
                proc.wait(timeout=8)
            except Exception:
                try:
                    proc.kill()
                except Exception:
                    pass
        if self._log_file:
            try:
                self._log_file.close()
            except Exception:
                pass
            self._log_file = None

    async def stop(self):
        async with self._lock:
            await self._stop_locked()

    def kill_sync(self):
        proc = self.proc
        self.proc = None
        if proc and proc.poll() is None:
            try:
                if os.name == "nt":
                    subprocess.run(
                        ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                        capture_output=True,
                        timeout=10,
                        creationflags=CREATE_NO_WINDOW,
                    )
                else:
                    proc.terminate()
            except Exception:
                pass


async def fetch_json(session, url, timeout=45):
    async with session.get(url, timeout=ClientTimeout(total=timeout)) as response:
        text = await response.text()
        if response.status >= 400:
            raise RuntimeError(f"{response.status}: {text[:500]}")
        return json.loads(text)


def version_key(value):
    match = VERSION_PATTERN.search(str(value or ""))
    if not match:
        return None
    prerelease = match.group(4)
    if prerelease:
        pre = tuple(
            (0, int(part)) if part.isdigit() else (1, part.lower())
            for part in prerelease.split(".")
            if part
        )
        return (
            int(match.group(1)),
            int(match.group(2)),
            int(match.group(3)),
            0,
            pre,
        )
    return (
        int(match.group(1)),
        int(match.group(2)),
        int(match.group(3)),
        1,
        (),
    )


def version_is_newer(latest, current):
    latest_key = version_key(latest)
    current_key = version_key(current)
    return bool(latest_key and current_key and latest_key > current_key)


def version_text(value):
    match = VERSION_PATTERN.search(str(value or ""))
    return match.group(0).lstrip("v") if match else ""


def command_output_text(value):
    if not value:
        return ""
    if isinstance(value, bytes):
        return value.decode("utf-8", "replace")
    return str(value)


def read_cli_version(exe, cwd=None):
    if not exe:
        return None, "未找到 OpenCode CLI，请先安装或设置 OPENCODE_EXE"
    try:
        if not Path(exe).is_file():
            return None, "OpenCode CLI 文件不存在"
    except Exception as exc:
        return None, f"无法检查 OpenCode CLI：{exc}"
    workdir = cwd if cwd and Path(cwd).is_dir() else str(APP_DIR)
    try:
        completed = subprocess.run(
            [exe, "--version"],
            cwd=workdir,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=20,
            creationflags=CREATE_NO_WINDOW,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
    except subprocess.TimeoutExpired:
        return None, "读取 OpenCode CLI 版本超时"
    except Exception as exc:
        return None, f"无法读取 OpenCode CLI 版本：{exc}"
    version = version_text(completed.stdout)
    if version:
        return version, None
    if completed.returncode != 0:
        return None, f"无法读取 OpenCode CLI 版本（退出码 {completed.returncode}）"
    return None, "OpenCode CLI 未返回有效版本号"


async def fetch_latest_cli_version(client):
    data = await fetch_json(client, NPM_LATEST_URL, timeout=20)
    version = version_text(data.get("version") if isinstance(data, dict) else "")
    if not version:
        raise RuntimeError("npm 返回了无效的版本号")
    return version


async def inspect_cli_update(app, force=False):
    manager = app["manager"]
    exe = manager.exe or find_opencode_exe()
    if not exe:
        return {
            "ok": False,
            "error": "未找到 OpenCode CLI，请先安装或设置 OPENCODE_EXE",
            "bundled": False,
            "managed": False,
            "updateAvailable": False,
        }
    manager.exe = exe
    managed = cli_is_bundled(exe)
    now = time.monotonic()
    cached = CLI_UPDATE_CACHE
    if (
        not force
        and cached["data"]
        and cached["exe"] == exe
        and now - cached["time"] < UPDATE_CACHE_TTL
    ):
        return dict(cached["data"])
    current, current_error = await asyncio.to_thread(
        read_cli_version, exe, manager.cwd
    )
    if current_error:
        return {
            "ok": False,
            "error": current_error,
            "exe": exe,
            "bundled": managed,
            "managed": managed,
            "updateAvailable": False,
        }
    try:
        latest = await fetch_latest_cli_version(app["client"])
    except Exception as exc:
        return {
            "ok": False,
            "error": f"无法查询 npm 最新版本：{exc}",
            "exe": exe,
            "currentVersion": current,
            "bundled": managed,
            "managed": managed,
            "updateAvailable": False,
        }
    data = {
        "ok": True,
        "exe": exe,
        "bundled": managed,
        "managed": managed,
        "currentVersion": current,
        "latestVersion": latest,
        "updateAvailable": version_is_newer(latest, current) and not managed,
        "checkedAt": time.time(),
    }
    CLI_UPDATE_CACHE.update({"exe": exe, "time": now, "data": data})
    return dict(data)


def run_cli_upgrade(exe, cwd=None, target=None):
    workdir = cwd if cwd and Path(cwd).is_dir() else str(APP_DIR)
    env = os.environ.copy()
    env["NO_COLOR"] = "1"
    args = [exe, "upgrade"]
    if target:
        args.append(target)
    try:
        completed = subprocess.run(
            args,
            cwd=workdir,
            env=env,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=UPDATE_TIMEOUT,
            creationflags=CREATE_NO_WINDOW,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
    except subprocess.TimeoutExpired as exc:
        output = command_output_text(exc.stdout) + command_output_text(exc.stderr)
        return {
            "ok": False,
            "code": None,
            "output": output[-8000:],
            "error": f"更新超时（超过 {UPDATE_TIMEOUT // 60} 分钟）",
        }
    except Exception as exc:
        return {
            "ok": False,
            "code": None,
            "output": "",
            "error": f"无法启动 OpenCode 更新程序：{exc}",
        }
    output = command_output_text(completed.stdout)
    return {
        "ok": completed.returncode == 0,
        "code": completed.returncode,
        "output": output[-8000:],
        "error": (
            None
            if completed.returncode == 0
            else f"OpenCode 更新程序退出码 {completed.returncode}"
        ),
    }


def build_meta_payload(config, provider_data, agents, sessions):
    connected_order = provider_data.get("connected") or []
    connected = set(connected_order)
    providers = []
    model_index = {}
    for provider in provider_data.get("all") or []:
        provider_id = provider.get("id")
        if provider_id not in connected:
            continue
        models = []
        raw_models = provider.get("models") or {}
        iterator = raw_models.values() if isinstance(raw_models, dict) else raw_models
        for model in iterator:
            if not isinstance(model, dict):
                continue
            status = model.get("status")
            if status not in (None, "active"):
                continue
            capabilities = model.get("capabilities") or {}
            output = capabilities.get("output") or {}
            if output and not output.get("text", True):
                continue
            model_id = model.get("id") or model.get("modelID")
            if not model_id:
                continue
            entry = {
                "id": model_id,
                "name": model.get("name") or model_id,
                "variants": sorted((model.get("variants") or {}).keys()),
                "reasoning": bool(capabilities.get("reasoning")),
                "toolcall": bool(capabilities.get("toolcall")),
                "attachment": bool(capabilities.get("attachment")),
                "limit": model.get("limit") or {},
                "cost": model.get("cost") or {},
            }
            models.append(entry)
            model_index[(provider_id, model_id)] = entry
        if models:
            models.sort(key=lambda item: item["name"].lower())
            providers.append(
                {
                    "id": provider_id,
                    "name": provider.get("name") or provider_id,
                    "models": models,
                }
            )
    order = {provider_id: index for index, provider_id in enumerate(connected_order)}
    providers.sort(key=lambda item: (order.get(item["id"], 999), item["name"].lower()))

    normalized_agents = []
    for agent in agents or []:
        if agent.get("hidden"):
            continue
        if agent.get("mode") not in ("primary", "all"):
            continue
        model_ref = None
        if agent.get("model"):
            model_ref = {
                "providerID": agent["model"].get("providerID"),
                "modelID": agent["model"].get("modelID"),
                "variant": agent.get("variant"),
            }
        normalized_agents.append(
            {
                "name": agent.get("name"),
                "description": agent.get("description") or "",
                "native": bool(agent.get("native")),
                "color": agent.get("color"),
                "model": model_ref,
            }
        )
    normalized_agents.sort(
        key=lambda item: (0 if item["name"] == "build" else 1, item["name"].lower())
    )

    default_model = None
    config_model = config.get("model")
    if isinstance(config_model, str) and "/" in config_model:
        provider_id, model_id = config_model.split("/", 1)
        if (provider_id, model_id) in model_index:
            default_model = {
                "providerID": provider_id,
                "modelID": model_id,
                "variant": None,
            }
    last_model = None
    last_agent = None
    if sessions:
        last_model = normalize_model_ref(sessions[0].get("model"))
        last_agent = sessions[0].get("agent")
    if default_model is None:
        default_model = last_model
    if default_model is None and providers and providers[0]["models"]:
        default_model = {
            "providerID": providers[0]["id"],
            "modelID": providers[0]["models"][0]["id"],
            "variant": None,
        }
    if default_model and default_model.get("modelID"):
        entry = model_index.get(
            (default_model["providerID"], default_model["modelID"])
        )
        if entry and default_model.get("variant") not in entry["variants"]:
            default_model["variant"] = None
    if last_model and last_model.get("modelID"):
        entry = model_index.get((last_model["providerID"], last_model["modelID"]))
        if entry and last_model.get("variant") not in entry["variants"]:
            last_model["variant"] = None

    return {
        "providers": providers,
        "agents": normalized_agents,
        "defaultModel": default_model,
        "lastModel": last_model,
        "lastAgent": last_agent,
        "configModel": config_model,
        "username": config.get("username"),
    }


async def get_meta(app):
    manager = app["manager"]
    if manager.phase != "ready" or not manager.base_url:
        return None
    now = time.monotonic()
    if (
        META_CACHE["data"]
        and META_CACHE["cwd"] == manager.cwd
        and now - META_CACHE["time"] < 20
    ):
        return META_CACHE["data"]
    client = app["client"]
    session_query = urllib.parse.urlencode({"directory": manager.cwd, "limit": 1})
    config, provider_data, agents, sessions = await asyncio.gather(
        fetch_json(client, f"{manager.base_url}/config"),
        fetch_json(client, f"{manager.base_url}/provider", timeout=90),
        fetch_json(client, f"{manager.base_url}/agent"),
        fetch_json(client, f"{manager.base_url}/session?{session_query}"),
    )
    payload = build_meta_payload(config, provider_data, agents, sessions)
    META_CACHE["cwd"] = manager.cwd
    META_CACHE["time"] = now
    META_CACHE["data"] = payload
    return payload


async def index_handler(request):
    return web.FileResponse(
        STATIC_DIR / "index.html",
        headers={"Cache-Control": "no-store, max-age=0"},
    )


async def favicon_handler(request):
    target = STATIC_DIR / "icon.png"
    if target.exists():
        return web.FileResponse(target)
    return web.Response(status=404)


async def wallpaper_handler(request):
    if request.method == "GET":
        if not WALLPAPER_PATH.is_file():
            return web.Response(status=404)
        config = load_config()
        mime = config.get("wallpaperMime")
        if mime not in WALLPAPER_MIME_TYPES:
            mime = "image/webp"
        try:
            body = await asyncio.to_thread(WALLPAPER_PATH.read_bytes)
        except OSError:
            return web.Response(status=404)
        return web.Response(
            body=body,
            headers={"Content-Type": mime, "Cache-Control": "no-store"},
        )

    if request.method != "POST":
        return json_response({"error": "method not allowed"}, status=405)
    try:
        body = await request.json()
    except Exception:
        return json_response({"error": "无效的请求数据"}, status=400)
    if not isinstance(body, dict):
        return json_response({"error": "无效的请求数据"}, status=400)

    config = load_config()
    if "transparency" in body:
        try:
            transparency = int(body.get("transparency"))
        except (TypeError, ValueError):
            return json_response({"error": "透明度参数无效"}, status=400)
        config["wallpaperTransparency"] = max(0, min(100, transparency))

    if "image" in body:
        image = body.get("image")
        if image in (None, ""):
            try:
                WALLPAPER_PATH.unlink()
            except FileNotFoundError:
                pass
            except OSError as exc:
                return json_response({"error": f"无法删除背景图片：{exc}"}, status=500)
            config.pop("wallpaperMime", None)
        else:
            if not isinstance(image, str):
                return json_response({"error": "背景图片格式无效"}, status=400)
            match = WALLPAPER_DATA_URL_RE.match(image)
            if not match:
                return json_response({"error": "背景图片格式无效"}, status=400)
            mime, payload = match.groups()
            try:
                raw = base64.b64decode(payload, validate=True)
            except Exception:
                return json_response({"error": "背景图片数据无效"}, status=400)
            if not raw:
                return json_response({"error": "背景图片数据为空"}, status=400)
            if len(raw) > MAX_WALLPAPER_BYTES:
                return json_response({"error": "背景图片过大"}, status=413)
            try:
                CONFIG_DIR.mkdir(parents=True, exist_ok=True)
                temp = WALLPAPER_PATH.with_suffix(".tmp")
                temp.write_bytes(raw)
                os.replace(temp, WALLPAPER_PATH)
            except OSError as exc:
                return json_response({"error": f"无法保存背景图片：{exc}"}, status=500)
            config["wallpaperMime"] = mime

    try:
        save_config(config)
    except OSError as exc:
        return json_response({"error": f"无法保存背景设置：{exc}"}, status=500)
    return json_response({"ok": True, "wallpaper": wallpaper_state(config)})


async def bootstrap_handler(request):
    app = request.app
    manager = app["manager"]
    config = load_config()
    return json_response(
        {
            "app": APP_TITLE,
            "version": APP_VERSION,
            "cwd": manager.cwd,
            "savedCwd": config.get("cwd"),
            "configPath": str(CONFIG_PATH),
            "authConfigured": auth_configured(),
            "serve": manager.status(),
            "headless": bool(app.get("headless")),
            "theme": config.get("theme"),
            "pinnedSessions": config.get("pinnedSessions"),
            "wallpaper": wallpaper_state(config),
        }
    )


async def auth_status_handler(request):
    return json_response({"authConfigured": auth_configured()})


async def auth_login_handler(request):
    if request.method != "POST":
        return json_response({"error": "method not allowed"}, status=405)
    manager = request.app["manager"]
    exe = manager.exe or find_opencode_exe()
    if not exe:
        return json_response(
            {"error": "未找到 OpenCode CLI，无法打开登录窗口"}, status=400
        )
    try:
        process = await asyncio.to_thread(launch_auth_login, exe, manager.cwd)
    except Exception as exc:
        return json_response({"error": f"无法打开登录窗口：{exc}"}, status=500)
    return json_response({"ok": True, "pid": process.pid})


async def status_handler(request):
    manager = request.app["manager"]
    return json_response(
        {
            "serve": manager.status(),
            "cwd": manager.cwd,
            "theme": load_config().get("theme"),
        }
    )


async def update_check_handler(request):
    force = request.query.get("force", "").lower() in ("1", "true", "yes")
    data = await inspect_cli_update(request.app, force=force)
    return json_response(data)


async def update_handler(request):
    if request.method != "POST":
        return json_response({"error": "method not allowed"}, status=405)
    app = request.app
    manager = app["manager"]
    exe = manager.exe or find_opencode_exe()
    if cli_is_bundled(exe):
        return json_response(
            {
                "ok": False,
                "error": "内置 OpenCode CLI 随桌面版更新，请安装新版桌面包",
                "bundled": True,
                "managed": True,
                "serve": manager.status(),
            },
            status=400,
        )
    lock = app["update_lock"]
    if lock.locked():
        return json_response(
            {"ok": False, "error": "OpenCode 正在更新中", "serve": manager.status()},
            status=409,
        )
    async with lock:
        check = await inspect_cli_update(app, force=True)
        if not check.get("ok"):
            return json_response({**check, "serve": manager.status()})
        latest = check["latestVersion"]
        if not check.get("updateAvailable"):
            return json_response(
                {
                    "ok": True,
                    "updated": False,
                    "currentVersion": check["currentVersion"],
                    "installedVersion": check["currentVersion"],
                    "latestVersion": latest,
                    "bundled": check.get("bundled", False),
                    "managed": check.get("managed", False),
                    "updateAvailable": False,
                    "message": "当前已是最新版本",
                    "serve": manager.status(),
                }
            )
        exe = manager.exe or find_opencode_exe()
        if not exe:
            return json_response(
                {
                    "ok": False,
                    "error": "未找到 OpenCode CLI",
                    "serve": manager.status(),
                }
            )
        cwd = manager.cwd
        serve = manager.status()
        update_result = {
            "ok": False,
            "code": None,
            "output": "",
            "error": "更新未执行",
        }
        cancelled = False
        await manager.stop()
        CLI_UPDATE_CACHE.update({"exe": None, "time": 0.0, "data": None})
        try:
            update_result = await asyncio.to_thread(
                run_cli_upgrade, exe, cwd, latest
            )
        except asyncio.CancelledError:
            cancelled = True
        except Exception as exc:
            update_result = {
                "ok": False,
                "code": None,
                "output": "",
                "error": f"更新过程中出错：{exc}",
            }
        finally:
            manager.exe = find_opencode_exe() or manager.exe or exe
            if cwd and Path(cwd).is_dir():
                META_CACHE["data"] = None
                serve = await manager.start(cwd)
            elif not cwd:
                manager.phase = "needs_folder"
                manager.error = None
                manager.detail = None
                serve = manager.status()
            else:
                manager.phase = "error"
                manager.error = "项目文件夹不存在，无法重启 OpenCode 服务"
                manager.detail = cwd
                serve = manager.status()
        if cancelled:
            raise asyncio.CancelledError
        after, after_error = await asyncio.to_thread(
            read_cli_version, manager.exe, cwd
        )
        update_available = version_is_newer(latest, after) if after else True
        ok = bool(
            update_result.get("ok")
            and after
            and not version_is_newer(latest, after)
            and serve.get("phase") in ("ready", "needs_folder")
        )
        error = update_result.get("error")
        if update_result.get("ok") and not ok and not error:
            if after_error:
                error = after_error
            elif after:
                error = (
                    f"更新命令已完成，但当前版本仍为 {after}，"
                    f"最新版本为 {latest}"
                )
            else:
                error = "更新命令已完成，但无法确认新版本"
        if serve.get("phase") not in ("ready", "needs_folder"):
            restart_error = serve.get("error") or "本地服务未能重新启动"
            error = f"{error}；{restart_error}" if error else restart_error
        return json_response(
            {
                "ok": ok,
                "updated": bool(
                    after
                    and check.get("currentVersion")
                    and after != check["currentVersion"]
                ),
                "currentVersion": check.get("currentVersion"),
                "installedVersion": after,
                "latestVersion": latest,
                "bundled": False,
                "managed": False,
                "updateAvailable": update_available,
                "error": None if ok else error or "OpenCode 更新失败",
                "detail": update_result.get("output") or "",
                "serve": serve,
            }
        )


async def config_handler(request):
    manager = request.app["manager"]
    if request.method != "POST":
        return json_response({"error": "method not allowed"}, status=405)
    try:
        body = await request.json()
    except Exception:
        return json_response({"error": "无效的请求数据"}, status=400)
    cwd = (body.get("cwd") or "").strip().strip('"')
    if not cwd:
        return json_response({"error": "请选择一个项目文件夹"}, status=400)
    try:
        path = Path(cwd).expanduser()
        if not path.is_dir():
            return json_response({"error": f"文件夹不存在：{cwd}"}, status=400)
        resolved = str(path.resolve())
    except Exception as exc:
        return json_response({"error": f"无法打开文件夹：{exc}"}, status=400)
    theme = body.get("theme")
    config = load_config()
    config["cwd"] = resolved
    if theme in ("dark", "light"):
        config["theme"] = theme
    save_config(config)
    META_CACHE["data"] = None
    result = await manager.start(resolved)
    return json_response({"ok": result["phase"] == "ready", "cwd": resolved, "serve": result})


async def preferences_handler(request):
    if request.method != "POST":
        return json_response({"error": "method not allowed"}, status=405)
    try:
        body = await request.json()
    except Exception:
        return json_response({"error": "无效的请求数据"}, status=400)
    theme = body.get("theme") if isinstance(body, dict) else None
    if theme not in ("dark", "light"):
        return json_response({"error": "主题参数无效"}, status=400)
    config = load_config()
    config["theme"] = theme
    try:
        save_config(config)
    except OSError as exc:
        return json_response({"error": f"无法保存界面设置：{exc}"}, status=500)
    return json_response({"ok": True, "theme": theme})


async def pins_handler(request):
    if request.method != "POST":
        return json_response({"error": "method not allowed"}, status=405)
    try:
        body = await request.json()
    except Exception:
        return json_response({"error": "无效的请求数据"}, status=400)
    pins = normalize_pinned_sessions(body.get("pins") if isinstance(body, dict) else None)
    config = load_config()
    config["pinnedSessions"] = pins
    try:
        save_config(config)
    except OSError as exc:
        return json_response({"error": f"无法保存置顶设置：{exc}"}, status=500)
    return json_response({"ok": True, "pinnedSessions": pins})


async def restart_handler(request):
    manager = request.app["manager"]
    if not manager.cwd:
        return json_response({"error": "尚未选择项目文件夹"}, status=400)
    META_CACHE["data"] = None
    result = await manager.start(manager.cwd)
    return json_response({"ok": result["phase"] == "ready", "serve": result})


async def meta_handler(request):
    manager = request.app["manager"]
    if manager.phase != "ready":
        return json_response(
            {"error": "OpenCode 服务尚未就绪", "serve": manager.status()},
            status=503,
        )
    try:
        payload = await get_meta(request.app)
    except Exception as exc:
        return json_response(
            {"error": f"读取模型信息失败：{exc}", "serve": manager.status()},
            status=502,
        )
    payload["cwd"] = manager.cwd
    return json_response(payload)


async def log_handler(request):
    try:
        lines = int(request.query.get("lines", "120"))
    except Exception:
        lines = 120
    lines = max(10, min(lines, 800))
    text = read_tail(SERVE_LOG_PATH, 120000)
    tail = "\n".join(text.splitlines()[-lines:])
    return web.Response(text=tail, content_type="text/plain", charset="utf-8")


async def open_folder_handler(request):
    if request.method != "POST":
        return json_response({"error": "method not allowed"}, status=405)
    try:
        body = await request.json()
    except Exception:
        body = {}
    target = (body.get("path") or "").strip()
    manager = request.app["manager"]
    if not target:
        target = manager.cwd or ""
    try:
        path = Path(target)
        if not path.exists():
            return json_response({"error": "文件夹不存在"}, status=404)
        if os.name == "nt":
            os.startfile(str(path))
        elif sys.platform == "darwin":
            subprocess.Popen(["open", str(path)])
        else:
            subprocess.Popen(["xdg-open", str(path)])
        return json_response({"ok": True})
    except Exception as exc:
        return json_response({"error": str(exc)}, status=500)


async def notify_handler(request):
    if request.method != "POST":
        return json_response({"error": "method not allowed"}, status=405)
    try:
        body = await request.json()
    except Exception:
        body = {}
    title = body.get("title") if isinstance(body, dict) else ""
    message = body.get("body") if isinstance(body, dict) else ""
    ok = await asyncio.to_thread(show_system_notification, title, message)
    return json_response({"ok": bool(ok)})


async def proxy_handler(request):
    app = request.app
    manager = app["manager"]
    path = request.match_info.get("path", "")
    root = path.split("/", 1)[0]
    if root not in PROXY_ROOTS:
        return json_response({"error": "不支持的接口"}, status=403)
    if manager.phase != "ready" or not manager.base_url:
        return json_response(
            {"error": "OpenCode 服务尚未就绪", "serve": manager.status()},
            status=503,
        )
    query = request.query_string
    url = f"{manager.base_url}/{path}"
    if query:
        url = f"{url}?{query}"
    headers = {}
    for name in ("Accept", "Content-Type", "Last-Event-ID"):
        value = request.headers.get(name)
        if value:
            headers[name] = value
    payload = None
    if request.method not in ("GET", "HEAD"):
        payload = await request.read()
    client = app["client"]
    if path == "event":
        upstream = None
        response = None
        try:
            upstream = await client.get(url, headers=headers)
            if upstream.status != 200:
                text = await upstream.text()
                upstream.release()
                return json_response(
                    {"error": f"事件流连接失败（{upstream.status}）", "detail": text[:1000]},
                    status=502,
                )
            response = web.StreamResponse(
                status=200,
                headers={
                    "Content-Type": "text/event-stream; charset=utf-8",
                    "Cache-Control": "no-cache, no-transform",
                    "X-Accel-Buffering": "no",
                },
            )
            await response.prepare(request)
            async for chunk in upstream.content.iter_any():
                await response.write(chunk)
            await response.write_eof()
            return response
        except asyncio.CancelledError:
            raise
        except ConnectionResetError:
            if response is None:
                return web.Response(status=499)
            return response
        except Exception as exc:
            if not request.transport or request.transport.is_closing():
                return web.Response(status=499)
            return json_response({"error": f"事件流中断：{exc}"}, status=502)
        finally:
            if upstream is not None and not upstream.closed:
                upstream.release()
    try:
        async with client.request(
            request.method,
            url,
            headers=headers,
            data=payload,
            timeout=ClientTimeout(total=180),
        ) as upstream:
            data = await upstream.read()
            content_type = upstream.headers.get("Content-Type", "application/json")
            if upstream.status == 204:
                return web.Response(status=204)
            return web.Response(
                status=upstream.status,
                body=data,
                headers={"Content-Type": content_type},
            )
    except Exception as exc:
        return json_response({"error": f"请求 OpenCode 服务失败：{exc}"}, status=502)


async def on_startup(app):
    app["client"] = ClientSession(
        timeout=ClientTimeout(total=None, connect=30, sock_read=None)
    )
    manager = app["manager"]
    if manager.cwd:
        app["start_task"] = asyncio.create_task(manager.start(manager.cwd))
    else:
        manager.phase = "needs_folder"


async def on_cleanup(app):
    task = app.get("start_task")
    if task and not task.done():
        task.cancel()
        try:
            await task
        except Exception:
            pass
    await app["manager"].stop()
    client = app.get("client")
    if client:
        await client.close()


def build_app(headless=False):
    register_notify_app_id()
    config = load_config()
    cwd = os.environ.get("OPENCODE_DESKTOP_CWD") or config.get("cwd")
    app = web.Application(client_max_size=64 * 1024 * 1024)
    app["manager"] = ServeManager(cwd)
    app["headless"] = headless
    app["update_lock"] = asyncio.Lock()
    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)
    app.router.add_get("/", index_handler)
    app.router.add_get("/favicon.ico", favicon_handler)
    app.router.add_get("/local/bootstrap", bootstrap_handler)
    app.router.add_get("/local/wallpaper", wallpaper_handler)
    app.router.add_post("/local/wallpaper", wallpaper_handler)
    app.router.add_get("/local/status", status_handler)
    app.router.add_get("/local/auth-status", auth_status_handler)
    app.router.add_post("/local/auth-login", auth_login_handler)
    app.router.add_get("/local/update-check", update_check_handler)
    app.router.add_post("/local/update", update_handler)
    app.router.add_post("/local/config", config_handler)
    app.router.add_post("/local/preferences", preferences_handler)
    app.router.add_post("/local/pins", pins_handler)
    app.router.add_post("/local/restart", restart_handler)
    app.router.add_get("/local/meta", meta_handler)
    app.router.add_get("/local/log", log_handler)
    app.router.add_post("/local/open-folder", open_folder_handler)
    app.router.add_post("/local/notify", notify_handler)
    app.router.add_route("*", "/oc/{path:.*}", proxy_handler)
    app.router.add_static("/static/", STATIC_DIR, show_index=False)
    return app


def apply_titlebar_theme(window=None, theme=None):
    if os.name != "nt":
        return
    try:
        user32 = ctypes.windll.user32
        dwmapi = ctypes.windll.dwmapi
        hwnd = 0
        if window is not None:
            native = getattr(window, "native", None)
            handle = getattr(native, "Handle", None)
            if handle is not None:
                hwnd = int(handle.ToInt64()) if hasattr(handle, "ToInt64") else int(handle)
        if not hwnd:
            hwnd = user32.FindWindowW(None, APP_TITLE)
        if not hwnd:
            return
        if theme not in ("dark", "light"):
            theme = load_config().get("theme")
        if theme not in ("dark", "light"):
            theme = "dark"
        dark = theme == "dark"
        enabled = ctypes.c_int(1 if dark else 0)
        dwmapi.DwmSetWindowAttribute(hwnd, 20, ctypes.byref(enabled), 4)
        dwmapi.DwmSetWindowAttribute(hwnd, 19, ctypes.byref(enabled), 4)
        caption_color = 0x00130E0B if dark else 0x00FBF7F6
        border_color = 0x00130E0B if dark else 0x00EDE2DC
        text_color = 0x00F5EDE6 if dark else 0x00312118
        caption = ctypes.c_int(caption_color)
        border = ctypes.c_int(border_color)
        text = ctypes.c_int(text_color)
        dwmapi.DwmSetWindowAttribute(hwnd, 35, ctypes.byref(caption), 4)
        dwmapi.DwmSetWindowAttribute(hwnd, 36, ctypes.byref(text), 4)
        dwmapi.DwmSetWindowAttribute(hwnd, 34, ctypes.byref(border), 4)
        flags = 0x0001 | 0x0002 | 0x0004 | 0x0010 | 0x0020
        user32.SetWindowPos(hwnd, 0, 0, 0, 0, 0, flags)
        dwmapi.DwmFlush()
    except Exception as exc:
        print_log(f"titlebar: {exc}")


class JsApi:
    def __init__(self):
        self._window = None

    def set_titlebar_theme(self, theme):
        apply_titlebar_theme(
            self._window, "light" if theme == "light" else "dark"
        )
        return True

    def pick_folder(self):
        try:
            if not self._window:
                return ""
            result = self._window.create_file_dialog(webview.FileDialog.FOLDER)
            if not result:
                return ""
            if isinstance(result, (list, tuple)):
                return result[0] or ""
            return str(result)
        except Exception as exc:
            print_log(f"pick_folder: {exc}")
            return ""

    def pick_files(self):
        try:
            if not self._window:
                return []
            result = self._window.create_file_dialog(
                webview.FileDialog.OPEN,
                allow_multiple=True,
            )
            if not result:
                return []
            if isinstance(result, str):
                result = [result]
            files = []
            seen = set()
            for raw in result:
                path = os.path.abspath(str(raw))
                key = os.path.normcase(path)
                if key in seen:
                    continue
                seen.add(key)
                try:
                    size = os.path.getsize(path)
                except OSError:
                    size = 0
                files.append(
                    {
                        "path": path,
                        "name": os.path.basename(path),
                        "size": size,
                    }
                )
            return files
        except Exception as exc:
            print_log(f"pick_files: {exc}")
            return []

    def open_url(self, url):
        try:
            if isinstance(url, str) and url.startswith(("http://", "https://")):
                webbrowser.open(url)
                return True
        except Exception as exc:
            print_log(f"open_url: {exc}")
        return False

    def notify(self, title, body):
        try:
            worker = threading.Thread(
                target=show_system_notification,
                args=(title, body),
                daemon=True,
            )
            worker.start()
            return True
        except Exception as exc:
            print_log(f"notify: {exc}")
        return False

    def open_folder(self, path):
        try:
            target = path or ""
            if target and os.path.exists(target):
                if os.name == "nt":
                    os.startfile(target)
                elif sys.platform == "darwin":
                    subprocess.Popen(["open", target])
                else:
                    subprocess.Popen(["xdg-open", target])
                return True
        except Exception as exc:
            print_log(f"open_folder: {exc}")
        return False


def run_server_thread(port, ready_event, holder):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    holder["loop"] = loop
    runner = None
    try:
        app = build_app(headless=False)
        holder["app"] = app
        holder["manager"] = app["manager"]
        runner = web.AppRunner(app)
        holder["runner"] = runner
        loop.run_until_complete(runner.setup())
        site = web.TCPSite(runner, "127.0.0.1", port)
        loop.run_until_complete(site.start())
        ready_event.set()
        loop.run_forever()
    except Exception as exc:
        holder["error"] = str(exc)
        print_log(f"server: {exc}")
        ready_event.set()
    finally:
        if runner is not None:
            try:
                loop.run_until_complete(runner.cleanup())
            except Exception:
                pass
        try:
            loop.close()
        except Exception:
            pass


def shutdown_gui(holder, thread):
    loop = holder.get("loop")
    runner = holder.get("runner")
    if loop and runner and loop.is_running():
        try:
            future = asyncio.run_coroutine_threadsafe(runner.cleanup(), loop)
            future.result(timeout=15)
        except Exception:
            pass
        try:
            loop.call_soon_threadsafe(loop.stop)
        except Exception:
            pass
    if thread:
        thread.join(timeout=10)
    manager = holder.get("manager")
    if manager:
        manager.kill_sync()


def webview2_installed():
    if os.name != "nt":
        return True
    browser_path = os.environ.get("WEBVIEW2_BROWSER_EXECUTABLE_FOLDER")
    if browser_path and Path(browser_path).is_dir():
        return True
    client = "{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
    try:
        import winreg

        locations = [
            (winreg.HKEY_LOCAL_MACHINE, rf"SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{client}"),
            (winreg.HKEY_LOCAL_MACHINE, rf"SOFTWARE\Microsoft\EdgeUpdate\Clients\{client}"),
            (winreg.HKEY_CURRENT_USER, rf"SOFTWARE\Microsoft\EdgeUpdate\Clients\{client}"),
        ]
        for hive, key_path in locations:
            try:
                with winreg.OpenKey(hive, key_path) as key:
                    value, _ = winreg.QueryValueEx(key, "pv")
                    if value and str(value) != "0.0.0.0":
                        return True
            except OSError:
                continue
    except Exception:
        pass
    roots = [
        Path(os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)"))
        / "Microsoft"
        / "EdgeWebView"
        / "Application",
        Path(os.environ.get("ProgramFiles", r"C:\Program Files"))
        / "Microsoft"
        / "EdgeWebView"
        / "Application",
        Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local"))
        / "Microsoft"
        / "EdgeWebView"
        / "Application",
    ]
    for root in roots:
        try:
            if not root.is_dir():
                continue
            for child in root.iterdir():
                if child.is_dir() and (child / "msedgewebview2.exe").is_file():
                    return True
        except Exception:
            continue
    return False


def ensure_webview2():
    if webview2_installed():
        return
    installer = WEBVIEW2_INSTALLER_PATH
    if not installer.is_file():
        raise RuntimeError(
            "此电脑缺少 Microsoft Edge WebView2 Runtime，无法启动界面。\n\n"
            f"请安装 WebView2 Runtime 后重试。\n预期安装程序位置：{installer}"
        )
    answer = 6
    if os.name == "nt":
        answer = ctypes.windll.user32.MessageBoxW(
            None,
            "此电脑缺少 Microsoft Edge WebView2 Runtime。\n\n"
            "是否现在自动安装？安装完成后将自动继续启动。",
            APP_TITLE,
            0x34,
        )
    if answer != 6:
        raise RuntimeError(
            "未安装 Microsoft Edge WebView2 Runtime，无法启动界面。\n\n"
            f"可手动运行：{installer}"
        )
    completed = subprocess.run(
        [str(installer), "/silent", "/install"],
        timeout=300,
        creationflags=CREATE_NO_WINDOW,
    )
    for _ in range(30):
        if webview2_installed():
            return
        time.sleep(1)
    raise RuntimeError(
        "Microsoft Edge WebView2 Runtime 安装未完成，"
        f"安装程序退出码：{completed.returncode}。\n\n"
        f"可手动运行：{installer}"
    )


def start_gui(debug=False):
    ensure_webview2()
    port = free_port()
    ready_event = threading.Event()
    holder = {}
    thread = threading.Thread(
        target=run_server_thread,
        args=(port, ready_event, holder),
        daemon=True,
    )
    thread.start()
    if not ready_event.wait(20):
        raise RuntimeError("本地界面服务启动超时")
    if holder.get("error"):
        raise RuntimeError(holder["error"])
    manager = holder.get("manager")
    if manager:
        atexit.register(manager.kill_sync)
    api = JsApi()
    window = webview.create_window(
        APP_TITLE,
        f"http://127.0.0.1:{port}/",
        width=1320,
        height=880,
        min_size=(1020, 660),
        background_color="#0b0e13",
        js_api=api,
        text_select=True,
        zoomable=True,
        confirm_close=False,
    )
    api._window = window

    def on_loaded(*_args):
        for delay in (0.15, 0.6, 1.5):
            timer = threading.Timer(delay, apply_titlebar_theme, args=(window,))
            timer.daemon = True
            timer.start()

    window.events.loaded += on_loaded
    try:
        webview.start(
            icon=str(ICON_PATH) if ICON_PATH.exists() else None,
            private_mode=False,
            storage_path=str(STORAGE_DIR),
            debug=debug,
        )
    finally:
        shutdown_gui(holder, thread)


def start_headless(port):
    app = build_app(headless=True)
    print_log(f"OpenCode desktop headless: http://127.0.0.1:{port}/")
    web.run_app(app, host="127.0.0.1", port=port, print=None)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--debug", action="store_true")
    args = parser.parse_args()
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    if args.headless:
        port = args.port or int(os.environ.get("OPENCODE_DESKTOP_PORT") or "8765")
        start_headless(port)
    else:
        try:
            start_gui(debug=args.debug)
        except Exception as exc:
            log_desktop_error()
            show_native_error(
                "OpenCode 桌面启动失败",
                f"{exc}\n\n详细日志：{DESKTOP_LOG_PATH}",
            )
            raise


if __name__ == "__main__":
    main()
