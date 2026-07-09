import asyncio
import json
import random
import time
import logging
import os
import base64
import jwt
from jwt import PyJWKClient
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ai_core import simulate_ai_reasoning
from collections import defaultdict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aetheris.backend")

app = FastAPI(title="Aetheris Backend", version="3.0")

frontend_url = os.getenv("FRONTEND_URL")
allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ─── Rate Limiter ───────────────────────────────────────────────────────────────

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        self.requests[key] = [t for t in self.requests[key] if now - t < self.window]
        if len(self.requests[key]) >= self.max_requests:
            return False
        self.requests[key].append(now)
        return True

# Global: 100 WebSocket messages/min per IP
ws_limiter = RateLimiter(max_requests=100, window_seconds=60)
# Sandbox provisioning: 5 req/min per IP
sandbox_limiter = RateLimiter(max_requests=5, window_seconds=60)

# ─── JWT Verification ───────────────────────────────────────────────────────────

def get_jwks_client():
    pub_key = os.getenv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")
    if not pub_key:
        return None
    try:
        b64_str = pub_key.split('_')[2]
        padded = b64_str + '=' * (4 - len(b64_str) % 4)
        domain = base64.b64decode(padded).decode('utf-8').strip('$')
        return PyJWKClient(f"https://{domain}/.well-known/jwks.json")
    except Exception as e:
        logger.error(f"Failed to setup JWKS client: {e}")
        return None

jwks_client = get_jwks_client()

async def verify_token(token: str) -> bool:
    if not jwks_client:
        logger.critical("REJECTING: No JWKS client configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.")
        return False
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        jwt.decode(token, signing_key.key, algorithms=["RS256"], options={"verify_aud": False})
        return True
    except Exception as e:
        logger.error(f"JWT Verification failed: {e}")
        return False

# ─── Telemetry Queue ────────────────────────────────────────────────────────────

telemetry_queue = asyncio.Queue()

# ─── Connection Manager ─────────────────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")

manager = ConnectionManager()

# ─── Simulation Data ────────────────────────────────────────────────────────────

THREAT_TYPES = [
    'Ransomware Payload', 'DDoS Attack', 'SQL Injection',
    'Phishing Campaign', 'Lateral Movement', 'Zero-Day Exploit',
    'Credential Stuffing'
]
MITIGATION_ACTIONS = [
    'ISOLATING COMPROMISED NODE', 'REROUTING TRAFFIC THROUGH SCRUBBING CENTER',
    'DEPLOYING MICRO-SEGMENTATION', 'REVOKING STOLEN CREDENTIALS',
    'QUARANTINING MALICIOUS PAYLOAD', 'UPDATING FIREWALL RULES DYNAMICALLY'
]
NODES = ['fw-1', 'web-cluster-1', 'internal-api', 'db-main', 'cloud-storage']

# ─── Backend Tasks ──────────────────────────────────────────────────────────────

async def execute_ansible_mitigation(target_node: str, action: str):
    logs = [
        f"[ANSIBLE] Initiating playbook generation for action: {action}",
        "[ANSIBLE] Connecting to control node via SSH...",
        "[ANSIBLE] Loading inventory and checking node health...",
        f"[ANSIBLE] Executing playbook tasks against {target_node}...",
        "[CILIUM] Pushing new eBPF network policies...",
        "[ANSIBLE] Containment successful. Node isolated from primary cluster."
    ]
    
    for log in logs:
        await telemetry_queue.put({
            "type": "ORCHESTRATION_LOG",
            "data": {"envId": "PROD-ORCHESTRATOR", "log": log}
        })
        await asyncio.sleep(random.uniform(0.6, 1.2))

async def run_ai_reasoning_task(threat: dict, active_threats_state: list):
    async for ai_event in simulate_ai_reasoning(threat):
        if ai_event["type"] == "mitigation_decision":
            threat["status"] = "MITIGATING"
            threat["mitigationAction"] = ai_event["action"]
            await telemetry_queue.put({"type": "UPDATE_THREAT", "data": {"id": threat["id"], "status": "MITIGATING", "action": ai_event["action"]}})
            await execute_ansible_mitigation(threat["targetNode"], ai_event["action"])
        else:
            await telemetry_queue.put({"type": "AI_REASONING_LOG", "data": ai_event})
    
    await asyncio.sleep(4.0)
    threat["status"] = "RESOLVED"
    await telemetry_queue.put({"type": "UPDATE_THREAT", "data": {"id": threat["id"], "status": "RESOLVED"}})
    if threat in active_threats_state:
        active_threats_state.remove(threat)

async def generate_telemetry():
    logger.info("Telemetry generation started.")
    active_threats_state = []
    cpu = 40.0
    network = 200.0

    while True:
        events_to_send = []

        cpu = min(100, max(10, cpu + (random.uniform(-5, 5))))
        network = network + random.uniform(-50, 100)
        
        events_to_send.append({
            "type": "SYSTEM_HEALTH",
            "data": {"cpu": cpu, "networkTraffic": network}
        })

        if random.random() < 0.10:
            target_node = random.choice(NODES)
            threat_id = f"TRT-{random.randint(1000, 9999)}"
            new_threat = {
                "id": threat_id,
                "type": random.choice(THREAT_TYPES),
                "sourceIp": f"{random.randint(1, 255)}.{random.randint(1, 255)}.x.x",
                "targetNode": target_node,
                "severity": random.choices(["CRITICAL", "HIGH", "MEDIUM"], weights=[0.2, 0.4, 0.4])[0],
                "confidence": random.randint(70, 100),
                "timestamp": int(time.time() * 1000),
                "status": "DETECTED"
            }
            active_threats_state.append(new_threat)
            events_to_send.append({"type": "NEW_THREAT", "data": new_threat})

        current_time = int(time.time() * 1000)
        for threat in active_threats_state[:]:
            elapsed = current_time - threat["timestamp"]
            status = threat["status"]
            
            if status == "DETECTED" and elapsed > (2000 + random.randint(0, 2000)):
                threat["status"] = "ANALYZING"
                events_to_send.append({"type": "UPDATE_THREAT", "data": {"id": threat["id"], "status": "ANALYZING"}})
                asyncio.create_task(run_ai_reasoning_task(threat, active_threats_state))

        for event in events_to_send:
            await telemetry_queue.put(event)
            
        await asyncio.sleep(1.0)

async def consume_telemetry():
    logger.info("Telemetry consumer started.")
    while True:
        event = await telemetry_queue.get()
        await manager.broadcast(event)
        telemetry_queue.task_done()

async def simulate_provisioning(websocket: WebSocket, environment_id: str):
    logs = [
        "INITIALIZING TERRAFORM BACKEND...",
        "ACQUIRING STATE LOCK...",
        "PROVISIONING KUBERNETES CLUSTER (EKS)...",
        "ATTACHING VPC CNI...",
        "DEPLOYING CILIUM EBPF DAEMONSET...",
        "APPLYING ZERO-TRUST NETWORK POLICIES...",
        "SPINNING UP VULNERABLE METASPLOITABLE PODS...",
        "ENVIRONMENT ONLINE. EBPF SENSORS ACTIVE."
    ]
    
    for log in logs:
        await manager.send_personal_message({
            "type": "ORCHESTRATION_LOG",
            "data": {"envId": environment_id, "log": f"[TF] {log}"}
        }, websocket)
        await asyncio.sleep(random.uniform(0.5, 1.5))
        
    await manager.send_personal_message({
        "type": "ORCHESTRATION_STATUS",
        "data": {"envId": environment_id, "status": "ONLINE"}
    }, websocket)
    
    asyncio.create_task(simulate_ebpf_telemetry(websocket, environment_id))

async def simulate_ebpf_telemetry(websocket: WebSocket, environment_id: str):
    endpoints = ["web-front", "auth-service", "redis-cache", "db-primary", "payment-api"]
    calls = ["tcp_connect", "sys_execve", "sys_open", "tcp_close", "udp_sendmsg"]
    
    for _ in range(50):
        await asyncio.sleep(random.uniform(0.1, 0.8))
        await manager.send_personal_message({
            "type": "EBPF_LOG",
            "data": {
                "envId": environment_id,
                "pod": random.choice(endpoints),
                "syscall": random.choice(calls),
                "pid": random.randint(1000, 9999),
                "verdict": random.choices(["FORWARDED", "DROPPED"], weights=[0.9, 0.1])[0],
                "timestamp": int(time.time() * 1000)
            }
        }, websocket)

# ─── Startup Validation ─────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    required_envs = ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"]
    missing = [e for e in required_envs if not os.getenv(e)]
    if missing:
        logger.critical(f"Missing required env vars: {missing}. WebSocket auth will reject all connections.")
    else:
        logger.info("All required environment variables present.")
    
    asyncio.create_task(generate_telemetry())
    asyncio.create_task(consume_telemetry())

# ─── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "Aetheris Backend is online and active.", "status": "healthy"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        auth_msg = await asyncio.wait_for(websocket.receive_text(), timeout=3.0)
        auth_payload = json.loads(auth_msg)
        if auth_payload.get("type") != "AUTH" or not await verify_token(auth_payload.get("token", "")):
            raise Exception("Invalid or missing token")
    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        manager.disconnect(websocket)
        await websocket.close(code=1008, reason="Unauthorized")
        return

    client_ip = websocket.client.host if websocket.client else "unknown"

    try:
        while True:
            data = await websocket.receive_text()

            # Global rate limiting for all WebSocket messages
            if not ws_limiter.is_allowed(client_ip):
                logger.warning(f"Global rate limit exceeded for {client_ip}")
                continue

            try:
                payload = json.loads(data)
                
                if not isinstance(payload, dict):
                    logger.warning("Received invalid payload format (not a JSON object)")
                    continue
                    
                msg_type = payload.get("type")
                if not msg_type or not isinstance(msg_type, str):
                    continue

                if msg_type == "PROVISION_SANDBOX":
                    if not sandbox_limiter.is_allowed(client_ip):
                        logger.warning(f"Sandbox rate limit exceeded for {client_ip}")
                        continue

                    env_id = payload.get("envId")
                    if not env_id or not isinstance(env_id, str):
                        env_id = f"ENV-{random.randint(100, 999)}"
                    else:
                        env_id = ''.join(e for e in env_id if e.isalnum() or e == '-')[:20]
                        
                    asyncio.create_task(simulate_provisioning(websocket, env_id))
            except json.JSONDecodeError:
                logger.warning("Received invalid JSON over websocket")
            except Exception as e:
                logger.error(f"Error processing websocket message: {e}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
