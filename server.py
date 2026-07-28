#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TecnoCalidad E-Commerce - Backend API Server
Soporte para Mini Lámpara USB Portátil Redonda (Foto enviada por el usuario).
"""

import sys
import os
import json
import sqlite3
import hashlib
import secrets
import time
import re
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def load_env_file(filepath=".env"):
    env_vars = {}
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env_vars[key.strip()] = val.strip()
    return env_vars

ENV = load_env_file(".env")

HOST                = ENV.get("HOST", "localhost")
PORT                = int(ENV.get("PORT", "3000"))
DB_PATH             = ENV.get("DB_PATH", "tecnocalidad.db")
ADMIN_USERNAME      = ENV.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD      = ENV.get("ADMIN_PASSWORD", "TecnoCalidad2026!")
ADMIN_PASSWORD_HASH = hashlib.sha256(ADMIN_PASSWORD.encode()).hexdigest()
SESSION_TTL         = 3600

RATE_LIMITS = {
    "default": {"max": 120, "window": 60},
    "auth":    {"max": 5,   "window": 300},
    "orders":  {"max": 8,   "window": 60},
    "write":   {"max": 30,  "window": 60},
}

_rate_store = {}
_sessions   = {}

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS products (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    category        TEXT NOT NULL,
    price           REAL NOT NULL CHECK(price > 0),
    old_price       REAL,
    rating          REAL DEFAULT 5.0,
    reviews_count   INTEGER DEFAULT 0,
    stock           INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
    badge           TEXT,
    image           TEXT,
    description     TEXT,
    specs           TEXT DEFAULT '[]',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id              TEXT PRIMARY KEY,
    customer_name   TEXT NOT NULL,
    customer_email  TEXT NOT NULL,
    customer_phone  TEXT,
    address         TEXT NOT NULL,
    city            TEXT,
    payment_method  TEXT NOT NULL,
    status          TEXT DEFAULT 'Procesando',
    total           REAL NOT NULL CHECK(total > 0),
    discount_amount REAL DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id     TEXT NOT NULL REFERENCES orders(id),
    product_id   TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity     INTEGER NOT NULL CHECK(quantity > 0),
    unit_price   REAL NOT NULL CHECK(unit_price > 0)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    action       TEXT NOT NULL,
    entity       TEXT,
    entity_id    TEXT,
    performed_by TEXT,
    ip_address   TEXT,
    details      TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

EXPANDED_PRODUCTS = [
  # LÁMPARA REDONDA USB (EXACTAMENTE LA FOTO DEL USUARIO)
  ("prod-1", "Mini Lámpara USB Portátil Redonda Noche (Cálida / Blanca)", "Lámparas Recargables",
   4.990, 7.990, 4.98, 340, 150, "MÁS VENDIDO ALIEXPRESS", "public/assets/mini_usb_lamp.png",
   "Mini bombilla LED cilíndrica/redonda ultra compacta con conector USB directo. Disponible en Luz Cálida (Soft Warm) y Luz Blanca (Cool White). Ideal para Power Banks, cargadores, laptops o veladores.",
   json.dumps(["Conector: USB Plug Directo", "Luz Cálida (3000K) / Luz Blanca (6500K)", "Consumo 1W de alta eficiencia", "Compatibilidad universal USB"])),
  
  ("prod-5", "Lámpara Redonda de Pared Magnética Halo Touch", "Lámparas Recargables",
   29.990, 39.990, 4.85, 64, 30, "LUZ AMBIENTAL HALO", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
   "Lámpara de noche recargable de forma circular redonda con encendido táctil e iluminación efecto halo suave.",
   json.dumps(["Forma Circular Minimalista", "Encendido Táctil Continuo", "Batería 3000mAh USB-C", "Luz de noche difusa Ra95"])),

  # CARGADORES & BATERÍAS
  ("prod-7", "Cargador GaN 65W Dual USB-C Ultra Compacto", "Cargadores & Baterías",
   27.990, 34.990, 4.92, 145, 50, "CERO CALOR", "public/assets/charger.jpg",
   "Cargador de pared tecnología GaN Fast Charger 65W. Carga laptops, tablets y smartphones simultáneamente.",
   json.dumps(["Tecnología GaN III", "Salida 65W Max", "2x USB-C + 1x USB-A", "Protección contra sobretemperatura"])),
  
  ("prod-8", "Batería Externa Power Bank 20.000mAh MagSafe 22.5W", "Cargadores & Baterías",
   38.990, 49.990, 4.89, 98, 40, "MAGSAFE FAST", "public/assets/powerbank.jpg",
   "Power bank de alta densidad con carga rápida inalámbrica magnética y pantalla digital LED.",
   json.dumps(["Capacidad 20,000mAh", "Carga Inalámbrica 15W", "Carga por Cable PD 22.5W", "Pantalla de batería %"])),

  # ADAPTADORES & HUBS
  ("prod-9", "Adaptador Hub USB-C 8 en 1 HDMI 4K & Ethernet", "Adaptadores & Hubs",
   32.990, 42.990, 4.95, 180, 35, "OFICINA TOP", "public/assets/hub.jpg",
   "Estación Hub multipuerto de aluminio con HDMI 4K, 3x USB 3.0, Lector SD/TF, Ethernet RJ45 y PD 100W.",
   json.dumps(["Salida HDMI 4K@30Hz", "Ethernet 1000Mbps", "Pass-Through 100W PD", "Chasis de aluminio aeroespacial"])),

  ("prod-10", "Mini Adaptador OTG USB-C a USB-A 3.0 Metal", "Adaptadores & Hubs",
   5.990, 8.990, 4.8, 310, 100, "PACK x2", "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80",
   "Convertidor súper compacto OTG metálico para conectar pendrives, mouses o teclados a smartphones/laptops.",
   json.dumps(["Velocidad 5Gbps USB 3.0", "Cuerpo de aleación de zinc", "Función Plug and Play", "Compatible con Android/Mac/PC"])),

  # REPUESTOS & ACCESORIOS
  ("prod-11", "Base Magnética Redonda de Repuesto + Adhesivo 3M", "Repuestos & Accesorios",
   7.990, 11.990, 4.85, 42, 60, "REPUESTO REDONDO", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
   "Soporte magnético circular redonda de repuesto compatible con lámparas tipo disco recargables TecnoCalidad.",
   json.dumps(["Imán Circular N52", "Cinta 3M VHB adhesiva", "Rotación multidireccional"])),

  ("prod-12", "Pack Batería de Repuesto Li-ion 5000mAh 3.7V", "Repuestos & Accesorios",
   12.990, 16.990, 4.9, 29, 20, "ORIGINAL", "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80",
   "Celda de batería de litio de alta capacidad con circuito de protección BMS de repuesto para gadgets tech.",
   json.dumps(["Capacidad 5000mAh", "Protección contra sobrecarga", "Conector JST 2-pin standard"])),

  # CABLES & CARGA RÁPIDA
  ("prod-2", "Cable USB-C PD 100W Display Digital Wattage", "Cables & Carga Rápida",
   18.990, 24.990, 4.8, 94, 40, "ALTA TECNOLOGÍA", "public/assets/cable.jpg",
   "Cable USB-C 100W con pantalla LED que muestra vatios en tiempo real.",
   json.dumps(["100W Power Delivery", "480 Mbps transmisión", "1.5m trenzado nylon", "Pantalla digital LED"])),

  # AUDIO & AUDÍFONOS
  ("prod-3", "Audífonos Inalámbricos ANC Pro Studio Edition", "Audio & Audífonos",
   89.990, 119.990, 4.95, 210, 12, "CANCELACIÓN DE RUIDO", "public/assets/headphones.jpg",
   "Over-Ear ANC -45dB, Hi-Res Audio, Bluetooth 5.4, 60h de autonomía.",
   json.dumps(["ANC Híbrido -45dB", "60h autonomía", "Bluetooth 5.4 + AUX 3.5mm", "Carga rápida 10 min"])),

  # GADGETS TECH
  ("prod-4", "Estación 3 en 1 MagTech Station & Ambient Light", "Gadgets Tech",
   49.990, 69.990, 4.88, 76, 18, "NUEVO", "public/assets/dock.jpg",
   "Carga inalámbrica 15W MagSafe para Smartphone, Smartwatch y TWS.",
   json.dumps(["15W MagSafe Compatible", "Luz ambiental 3 modos", "Control térmico", "Entrada USB-C PD 30W"]))
]

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.executescript(SCHEMA_SQL)

    cur = conn.cursor()
    for prod in EXPANDED_PRODUCTS:
        cur.execute("""
            INSERT OR REPLACE INTO products
              (id, name, category, price, old_price, rating, reviews_count,
               stock, badge, image, description, specs)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        """, prod)
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def check_rate_limit(ip: str, limit_type: str = "default") -> tuple[bool, int]:
    cfg  = RATE_LIMITS.get(limit_type, RATE_LIMITS["default"])
    now  = time.time()
    key  = f"{ip}:{limit_type}"

    hits = [t for t in _rate_store.get(key, []) if now - t < cfg["window"]]
    if len(hits) >= cfg["max"]:
        _rate_store[key] = hits
        return True, 0

    hits.append(now)
    _rate_store[key] = hits
    return False, cfg["max"] - len(hits)

def create_session(username: str) -> str:
    token = secrets.token_hex(32)
    _sessions[token] = {"username": username, "expires_at": time.time() + SESSION_TTL}
    return token

def validate_session(token: str):
    if not token:
        return None
    session = _sessions.get(token)
    if not session:
        return None
    if time.time() > session["expires_at"]:
        del _sessions[token]
        return None
    return session["username"]

def delete_session(token: str):
    _sessions.pop(token, None)

_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')

def sanitize(text, max_len: int = 500) -> str:
    if not isinstance(text, str):
        return ""
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;").replace("'", "&#x27;")[:max_len].strip())

class TecnoCalidadHandler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f"[{time.strftime('%H:%M:%S')}] {self.client_address[0]} {fmt % args}")

    def send_json(self, data: dict, status: int = 200):
        body = json.dumps(data, ensure_ascii=False, default=str).encode("utf-8")
        self.send_response(status)
        self._security_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def _security_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", f"http://{HOST}:{PORT}")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if not length:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return {}

    def get_token(self) -> str:
        auth = self.headers.get("Authorization", "")
        return auth[7:] if auth.startswith("Bearer ") else ""

    @property
    def ip(self) -> str:
        return self.client_address[0]

    def rate_guard(self, limit_type: str = "default") -> bool:
        limited, remaining = check_rate_limit(self.ip, limit_type)
        if limited:
            self.send_json({"error": "Demasiadas solicitudes. Espera un momento.", "retry_after": RATE_LIMITS[limit_type]["window"]}, 429)
        return limited

    def require_admin(self):
        username = validate_session(self.get_token())
        if not username:
            self.send_json({"error": "Acceso no autorizado."}, 401)
        return username

    def do_OPTIONS(self):
        self.send_response(204)
        self._security_headers()
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        if not path.startswith("/api/"):
            self._serve_static(path)
            return
        if self.rate_guard():
            return
        if path == "/api/products":
            with get_db() as conn:
                rows = conn.execute("SELECT * FROM products ORDER BY created_at DESC").fetchall()
            products = []
            for row in rows:
                p = dict(row)
                p["specs"] = json.loads(p.get("specs") or "[]")
                p["oldPrice"] = p.pop("old_price", None)
                p["reviewsCount"] = p.pop("reviews_count", 0)
                products.append(p)
            self.send_json({"products": products})
        elif path == "/api/orders":
            if not self.require_admin():
                return
            with get_db() as conn:
                orders = [dict(r) for r in conn.execute("SELECT * FROM orders ORDER BY created_at DESC").fetchall()]
            self.send_json({"orders": orders})
        else:
            self.send_json({"error": "Ruta no encontrada."}, 404)

    def do_POST(self):
        path = self.path.split("?")[0]
        if path == "/api/auth/login":
            if self.rate_guard("auth"):
                return
            body = self.read_body()
            username = sanitize(body.get("username", ""))
            password = body.get("password", "")
            pwd_hash = hashlib.sha256(password.encode()).hexdigest()
            if username == ADMIN_USERNAME and pwd_hash == ADMIN_PASSWORD_HASH:
                token = create_session(username)
                self.send_json({"success": True, "token": token, "username": username})
            else:
                self.send_json({"error": "Credenciales incorrectas."}, 401)
        elif path == "/api/orders":
            if self.rate_guard("orders"):
                return
            body = self.read_body()
            order_id = f"TC-{secrets.randbelow(900000) + 100000}"
            with get_db() as conn:
                conn.execute("""
                    INSERT INTO orders (id, customer_name, customer_email, customer_phone, address, city, payment_method, total, discount_amount)
                    VALUES (?,?,?,?,?,?,?,?,?)
                """, (order_id, sanitize(body.get("customer_name", "")), sanitize(body.get("customer_email", "")),
                      sanitize(body.get("customer_phone", "")), sanitize(body.get("address", "")),
                      sanitize(body.get("city", "")), sanitize(body.get("payment_method", "")),
                      float(body.get("total", 0)), float(body.get("discount_amount", 0))))
            self.send_json({"success": True, "order_id": order_id}, 201)
        else:
            self.send_json({"error": "Ruta no encontrada."}, 404)

    def _serve_static(self, path: str):
        if path == "/":
            path = "/index.html"
        safe_path = os.path.normpath(path.lstrip("/"))
        if safe_path.startswith(".."):
            self.send_response(403)
            self.end_headers()
            return
        file_path = os.path.join(os.getcwd(), safe_path)
        if not os.path.isfile(file_path):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")
            return
        mime, _ = mimetypes.guess_type(file_path)
        with open(file_path, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", mime or "application/octet-stream")
        self.send_header("Content-Length", len(content))
        self.end_headers()
        self.wfile.write(content)

if __name__ == "__main__":
    print("=" * 60)
    print("  TecnoCalidad E-Commerce - Backend Server")
    print("=" * 60)
    print("  [*] Cargando entorno desde .env ...")
    init_db()
    print(f"  [OK] Base de datos conectada: {os.path.abspath(DB_PATH)}")
    print(f"  [WEB] Servidor ejecutandose en: http://{HOST}:{PORT}")
    print("=" * 60)
    server = HTTPServer((HOST, PORT), TecnoCalidadHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
        server.server_close()
