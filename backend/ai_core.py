"""
Simulated reasoning trace for the demo backend.

There is no model here. Each step sleeps and returns canned or random output so the
UI's reasoning stream has something to render. When a real analysis path lands it
replaces this module; keep the yielded event shapes stable.
"""
import asyncio
import random
from typing import AsyncGenerator

MITIGATION_ACTIONS = [
    "ISOLATING COMPROMISED NODE",
    "REROUTING TRAFFIC THROUGH SCRUBBING CENTER",
    "DEPLOYING MICRO-SEGMENTATION",
    "REVOKING STOLEN CREDENTIALS",
    "QUARANTINING MALICIOUS PAYLOAD",
]


async def simulate_ai_reasoning(threat: dict) -> AsyncGenerator[dict, None]:
    tid = threat["id"]
    yield {"type": "info", "text": f"[{tid}] Engine ingested anomaly: {threat['type']} targeting {threat['targetNode']}."}

    yield {"type": "info", "text": f"[{tid}] Extracting telemetry vectors for {threat['sourceIp']}..."}

    await asyncio.sleep(1.0)
    tactic = "TA0008 (Lateral Movement)" if "Lateral" in threat["type"] else "TA0040 (Impact)"
    actor = random.choice(["APT29", "Lazarus Group", "Unknown", "Sandworm"])
    cve = f"CVE-202{random.randint(2, 6)}-{random.randint(1000, 9999)}"
    yield {"type": "info", "text": f"[{tid}] Enrichment complete. Correlated with {tactic} and {cve}. Suspected actor: {actor}."}

    await asyncio.sleep(1.5)
    yield {
        "type": "warning",
        "text": f"[{tid}] ANALYSIS: High probability of exploitation. Confidence {threat['confidence']}%. Preparing containment protocols.",
    }

    await asyncio.sleep(1.0)
    action = random.choice(MITIGATION_ACTIONS)
    yield {"type": "action", "text": f"[{tid}] EXECUTING CONTAINMENT: {action}."}
    yield {"type": "mitigation_decision", "action": action}
