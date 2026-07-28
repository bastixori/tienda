#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TecnoCalidad E-Commerce - Backend Server
Catalogo actualizado con los 10 productos mas vendidos de AliExpress.
"""

import sys
import os
import json
import sqlite3
import hashlib
import secrets
import time
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

HOST                     = ENV.get("HOST", "localhost")
PORT                     = int(ENV.get("PORT", "3000"))
DB_PATH                  = ENV.get("DB_PATH", "tecnocalidad.db")
ADMIN_USERNAME           = ENV.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD           = ENV.get("ADMIN_PASSWORD", "TecnoCalidad2026!")
ADMIN_PASSWORD_HASH      = hashlib.sha256(ADMIN_PASSWORD.encode()).hexdigest()
SESSION_TTL              = 3600

RATE_LIMITS = {
    "default": {"max": 120, "window": 60},
    "auth":    {"max": 5,   "window": 300},
    "orders":  {"max": 10,  "window": 60},
    "write":   {"max": 30,  "window": 60},
}

_rate_store = {}
_sessions   = {}

SCHEMA_SQL = """
DROP TABLE IF EXISTS products;

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
    headline        TEXT,
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
"""

# LOS 10 PRODUCTOS MÁS VENDIDOS DE ALIEXPRESS
TOP_10_ALIEXPRESS_PRODUCTS = [
  ("prod-1", "Mini Lámpara USB Redonda Noche", "Lámparas Recargables",
   4.990, 7.990, 4.98, 340, 150, "", "public/assets/mini_usb_lamp.png",
   "Ilumina tu velador toda la noche por menos de $1 al mes de electricidad.",
   "Conéctala a cualquier cargador, power bank o notebook y listo. Sin cables, sin complicaciones. Disponible en Luz Cálida y Blanca.",
   json.dumps(["Plug & Play USB directo", "Solo 1W de consumo", "Luz antideslumbrante"])),
  
  ("prod-2", "Power Bank MagSafe 10.000mAh Cyberpunk Transparente", "Cargadores & Baterías",
   24.990, 34.990, 4.91, 280, 45, "", "public/assets/powerbank.jpg",
   "5 cargas completas sin buscar enchufe. Pégala magnéticamente a tu celular.",
   "Diseño cyberpunk transparente futurista con imán MagSafe ultra fuerte y pantalla LED digital de porcentaje de batería.",
   json.dumps(["Imán MagSafe ultra fuerte", "Pantalla LED de % real", "Carga inalámbrica 15W + PD 22.5W"])),

  ("prod-3", "Cargador GaN 65W Fast Charger Dual USB-C + USB-A", "Cargadores & Baterías",
   22.990, 29.990, 4.93, 195, 60, "", "public/assets/charger.jpg",
   "Del 0% al 50% en solo 20 minutos. Y cabe en tu bolsillo.",
   "Carga tu notebook, tablet y smartphone al mismo tiempo. Tecnología GaN III que no genera calor.",
   json.dumps(["Tecnología GaN III", "Carga 3 dispositivos simultáneos", "Salida 65W Turbo"])),

  ("prod-4", "Mini Impresora Térmica Portátil Bluetooth Pocket", "Gadgets Tech",
   21.990, 29.990, 4.88, 510, 30, "", "public/assets/dock.jpg",
   "Imprime fotos, etiquetas y notas de estudio al instante desde tu celular. ¡Sin usar tinta!",
   "Impresora térmica de bolsillo ultra compacta que se conecta por Bluetooth. Ideal para estudiantes y organizadores.",
   json.dumps(["Sin tinta (tecnología térmica)", "Conexión Bluetooth iOS/Android", "Incluye 1 rollo adhesivo"])),

  ("prod-5", "Audífonos Inalámbricos TWS Lenovo Thinkplus LivePods", "Audio & Audífonos",
   14.990, 21.990, 4.94, 620, 80, "", "public/assets/headphones.jpg",
   "Sonido HD de alta definición y batería para toda la semana.",
   "Bluetooth 5.3 de baja latencia, estuche de carga USB-C ultraliviano y micrófonos con cancelación de ruido de llamadas.",
   json.dumps(["Bluetooth 5.3 HD", "Autonomía 28 horas", "Resistencia al agua IPX4"])),

  ("prod-6", "Adaptador Hub USB-C 8 en 1 HDMI 4K + Ethernet", "Adaptadores & Hubs",
   21.990, 29.990, 4.95, 180, 35, "", "public/assets/hub.jpg",
   "Conecta monitor 4K, internet, pendrive y carga tu notebook con 1 solo puerto.",
   "Transforma el puerto USB-C de tu equipo en 8 salidas: HDMI 4K, Ethernet RJ45 Gigabit, 3x USB 3.0, Lector SD/TF y PD 100W.",
   json.dumps(["Salida HDMI 4K UHD", "Puerto Ethernet Gigabit 1000Mbps", "Chasis de aluminio aeroespacial"])),

  ("prod-7", "Cable USB-C PD 100W con Pantalla LED de Vatios", "Cables & Carga Rápida",
   11.990, 16.990, 4.89, 410, 90, "", "public/assets/cable.jpg",
   "Te MUESTRA en pantalla cuántos watts está recibiendo tu dispositivo en tiempo real.",
   "Construcción en nylon trenzado militar ultra resistente. Pantalla digital que verifica la velocidad real de carga.",
   json.dumps(["Potencia 100W Power Delivery", "Pantalla LED en tiempo real", "Nylon trenzado indestructible"])),



  ("prod-9", "Luz LED Tira RGB USB Inteligente con App & Bluetooth", "Gadgets Tech",
   7.990, 12.990, 4.87, 450, 70, "", "public/assets/lamp.jpg",
   "Ambienta tu escritorio o TV con millones de colores controlados desde tu celular.",
   "Tira LED RGB autoadhesiva con conexión USB directa y control por aplicación móvil o control remoto.",
   json.dumps(["Control por App & Bluetooth", "16 millones de colores RGB", "Sincronización con música"])),

  ("prod-10", "Soporte Plegable de Aluminio Ergonómico para Laptop", "Accesorios Tech",
   9.990, 15.990, 4.90, 290, 65, "", "public/assets/hub.jpg",
   "Evita dolores de cuello y mantiene tu computador frío mientras trabajas.",
   "Estructura de aluminio anodizado con 6 niveles de inclinación ajustable y almohadillas de silicona antideslizantes.",
   json.dumps(["Aluminio ultraliviano plegable", "6 niveles de altura ajustable", "Mejora la ventilación del equipo"]))
]

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.executescript(SCHEMA_SQL)

    cur = conn.cursor()
    for prod in TOP_10_ALIEXPRESS_PRODUCTS:
        cur.execute("""
            INSERT OR REPLACE INTO products
              (id, name, category, price, old_price, rating, reviews_count,
               stock, badge, image, headline, description, specs)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
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
    if not token: return None
    session = _sessions.get(token)
    if not session or time.time() > session["expires_at"]: return None
    return session["username"]

def sanitize(text, max_len: int = 500) -> str:
    if not isinstance(text, str): return ""
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

    def read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if not length: return {}
        try: return json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception: return {}

    def do_GET(self):
        path = self.path.split("?")[0]
        if not path.startswith("/api/"):
            self._serve_static(path)
            return
        if path == "/api/products":
            with get_db() as conn:
                rows = conn.execute("SELECT * FROM products ORDER BY id ASC").fetchall()
            products = []
            for row in rows:
                p = dict(row)
                p["specs"] = json.loads(p.get("specs") or "[]")
                p["oldPrice"] = p.pop("old_price", None)
                p["reviewsCount"] = p.pop("reviews_count", 0)
                products.append(p)
            self.send_json({"products": products})
        else:
            self.send_json({"error": "No encontrado"}, 404)

    def _serve_static(self, path: str):
        if path == "/": path = "/index.html"
        safe_path = os.path.normpath(path.lstrip("/"))
        file_path = os.path.join(os.getcwd(), safe_path)
        if not os.path.isfile(file_path):
            self.send_response(404)
            self.end_headers()
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
    print("  TecnoCalidad E-Commerce - TOP 10 AliExpress Server")
    print("=" * 60)
    init_db()
    print(f"  [OK] Base de datos conectada con los 10 mas vendidos")
    print(f"  [WEB] http://{HOST}:{PORT}")
    print("=" * 60)
    server = HTTPServer((HOST, PORT), TecnoCalidadHandler)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
