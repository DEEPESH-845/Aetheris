import asyncio
import json
import random
import time
import logging
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ai_core import simulate_ai_reasoning

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
    allow_methods=["*"],
    allow_headers=["*"],
)

telemetry_queue = asyncio.Queue()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
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

async def execute_ansible_mitigation(target_node: str, action: str):
    """Simulates the backend triggering real Ansible playbooks for Phase 5 orchestration"""
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
            
            # Phase 5: Trigger real-world Ansible execution simulation
            await execute_ansible_mitigation(threat["targetNode"], ai_event["action"])
        else:
            await telemetry_queue.put({"type": "AI_REASONING_LOG", "data": ai_event})
    
    # Conclude with resolution after mitigation
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
                # Offload the rest of the threat lifecycle to the AI LangGraph
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
    """Simulates Terraform/Ansible infrastructure provisioning"""
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
    
    # Start simulating eBPF logs for this environment
    asyncio.create_task(simulate_ebpf_telemetry(websocket, environment_id))

async def simulate_ebpf_telemetry(websocket: WebSocket, environment_id: str):
    """Simulates incoming Cilium eBPF packet logs from the provisioned cluster"""
    endpoints = ["web-front", "auth-service", "redis-cache", "db-primary", "payment-api"]
    calls = ["tcp_connect", "sys_execve", "sys_open", "tcp_close", "udp_sendmsg"]
    
    for _ in range(50): # Send 50 packets then stop for demo purposes
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

@app.get("/")
async def root():
    return {"message": "Aetheris Backend is online and active.", "status": "healthy"}

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(generate_telemetry())
    asyncio.create_task(consume_telemetry())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                
                if not isinstance(payload, dict):
                    logger.warning("Received invalid payload format (not a JSON object)")
                    continue
                    
                msg_type = payload.get("type")
                if not msg_type or not isinstance(msg_type, str):
                    continue

                if msg_type == "PROVISION_SANDBOX":
                    env_id = payload.get("envId")
                    if not env_id or not isinstance(env_id, str):
                        env_id = f"ENV-{random.randint(100, 999)}"
                    asyncio.create_task(simulate_provisioning(websocket, env_id))
            except json.JSONDecodeError:
                logger.warning("Received invalid JSON over websocket")
            except Exception as e:
                logger.error(f"Error processing websocket message: {e}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

