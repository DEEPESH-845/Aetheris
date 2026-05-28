import time
import json
import random
import uuid
import logging
from kafka import KafkaProducer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aetheris.telemetry")

KAFKA_BROKER = "localhost:9092"
KAFKA_TOPIC = "network.telemetry"

THREAT_TYPES = [
    'Ransomware Payload',
    'DDoS Attack',
    'SQL Injection',
    'Phishing Campaign',
    'Lateral Movement',
    'Zero-Day Exploit',
    'Credential Stuffing',
]

MITIGATION_ACTIONS = [
    'ISOLATING COMPROMISED NODE',
    'REROUTING TRAFFIC THROUGH SCRUBBING CENTER',
    'DEPLOYING MICRO-SEGMENTATION',
    'REVOKING STOLEN CREDENTIALS',
    'QUARANTINING MALICIOUS PAYLOAD',
    'UPDATING FIREWALL RULES DYNAMICALLY'
]

NODES = ['fw-1', 'web-cluster-1', 'internal-api', 'db-main', 'cloud-storage']

def get_producer():
    for _ in range(10):
        try:
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_BROKER,
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            logger.info("Connected to Redpanda producer.")
            return producer
        except Exception as e:
            logger.warning(f"Waiting for Redpanda... ({e})")
            time.sleep(2)
    raise Exception("Could not connect to Redpanda broker")

def main():
    producer = get_producer()
    logger.info("Starting telemetry generation...")

    active_threats_state = []
    
    # Base system health
    cpu = 40.0
    network = 200.0

    while True:
        events_to_send = []

        # 1. Fluctuating System Health Event
        cpu = min(100, max(10, cpu + (random.uniform(-5, 5))))
        network = network + random.uniform(-50, 100)
        
        events_to_send.append({
            "type": "SYSTEM_HEALTH",
            "data": {
                "cpu": cpu,
                "networkTraffic": network
            }
        })

        # 2. Randomly Generate New Threats (approx 10% chance per second)
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
            
            events_to_send.append({
                "type": "NEW_THREAT",
                "data": new_threat
            })

        # 3. Progress Active Threats
        current_time = int(time.time() * 1000)
        for threat in active_threats_state[:]:
            elapsed = current_time - threat["timestamp"]
            status = threat["status"]
            
            if status == "DETECTED" and elapsed > (2000 + random.randint(0, 2000)):
                threat["status"] = "ANALYZING"
                events_to_send.append({
                    "type": "UPDATE_THREAT",
                    "data": {"id": threat["id"], "status": "ANALYZING"}
                })
            
            elif status == "ANALYZING" and elapsed > (5000 + random.randint(0, 3000)):
                threat["status"] = "MITIGATING"
                action = random.choice(MITIGATION_ACTIONS)
                threat["mitigationAction"] = action
                events_to_send.append({
                    "type": "UPDATE_THREAT",
                    "data": {"id": threat["id"], "status": "MITIGATING", "action": action}
                })
                
            elif status == "MITIGATING" and elapsed > (9000 + random.randint(0, 4000)):
                threat["status"] = "RESOLVED"
                events_to_send.append({
                    "type": "UPDATE_THREAT",
                    "data": {"id": threat["id"], "status": "RESOLVED"}
                })
                active_threats_state.remove(threat)

        # Publish all events to Kafka
        for event in events_to_send:
            producer.send(KAFKA_TOPIC, event)
            logger.info(f"Published event: {event['type']}")
            
        producer.flush()
        time.sleep(1) # Emit every second

if __name__ == "__main__":
    main()
