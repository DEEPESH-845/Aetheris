import asyncio
import random
from typing import TypedDict, AsyncGenerator
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    threat_id: str
    threat_type: str
    source_ip: str
    target_node: str
    severity: str
    confidence: int
    enriched_data: dict
    mitigation_action: str

# Node 1: Ingest
async def ingest_node(state: AgentState) -> dict:
    # Just passing through initial data
    return {}

# Node 2: Enrich
async def enrich_node(state: AgentState) -> dict:
    # Simulate vector DB lookup / MITRE ATT&CK RAG
    await asyncio.sleep(1.0)
    mock_intel = {
        "mitre_tactic": "TA0008 (Lateral Movement)" if "Lateral" in state["threat_type"] else "TA0040 (Impact)",
        "known_actor": random.choice(["APT29", "Lazarus Group", "Unknown", "Sandworm"]),
        "cve_match": f"CVE-202{random.randint(2, 6)}-{random.randint(1000, 9999)}"
    }
    return {"enriched_data": mock_intel}

# Node 3: Analyze
async def analyze_node(state: AgentState) -> dict:
    await asyncio.sleep(1.5)
    return {}

# Node 4: Mitigate
async def mitigate_node(state: AgentState) -> dict:
    await asyncio.sleep(1.0)
    actions = [
        "ISOLATING COMPROMISED NODE",
        "REROUTING TRAFFIC THROUGH SCRUBBING CENTER",
        "DEPLOYING MICRO-SEGMENTATION",
        "REVOKING STOLEN CREDENTIALS",
        "QUARANTINING MALICIOUS PAYLOAD"
    ]
    return {"mitigation_action": random.choice(actions)}

workflow = StateGraph(AgentState)
workflow.add_node("ingest", ingest_node)
workflow.add_node("enrich", enrich_node)
workflow.add_node("analyze", analyze_node)
workflow.add_node("mitigate", mitigate_node)

workflow.set_entry_point("ingest")
workflow.add_edge("ingest", "enrich")
workflow.add_edge("enrich", "analyze")
workflow.add_edge("analyze", "mitigate")
workflow.add_edge("mitigate", END)

app_graph = workflow.compile()

async def simulate_ai_reasoning(threat: dict) -> AsyncGenerator[dict, None]:
    """
    Simulates the AI's internal thought process as it steps through the LangGraph.
    Yields events meant for the AI Reasoning Stream in the UI.
    """
    initial_state = {
        "threat_id": threat["id"],
        "threat_type": threat["type"],
        "source_ip": threat["sourceIp"],
        "target_node": threat["targetNode"],
        "severity": threat["severity"],
        "confidence": threat["confidence"],
        "enriched_data": {},
        "mitigation_action": ""
    }
    
    yield {
        "type": "info",
        "text": f"[{threat['id']}] Neural engine ingested anomaly: {threat['type']} targeting {threat['targetNode']}."
    }
    
    # Run through the graph step by step
    async for event in app_graph.astream(initial_state):
        node_name = list(event.keys())[0]
        state_update = event[node_name]
        
        if node_name == "ingest":
            yield {
                "type": "info", 
                "text": f"[{threat['id']}] Extracting telemetry vectors for {threat['sourceIp']}..."
            }
        
        elif node_name == "enrich":
            intel = state_update.get("enriched_data", {})
            yield {
                "type": "info",
                "text": f"[{threat['id']}] RAG complete. Correlated with {intel.get('mitre_tactic')} and {intel.get('cve_match')}. Suspected actor: {intel.get('known_actor')}."
            }
            
        elif node_name == "analyze":
            yield {
                "type": "warning",
                "text": f"[{threat['id']}] ANALYSIS: High probability of exploitation. Confidence upgraded to {threat['confidence']}%. Preparing containment protocols."
            }
            
        elif node_name == "mitigate":
            action = state_update.get("mitigation_action")
            yield {
                "type": "action",
                "text": f"[{threat['id']}] EXECUTING CONTAINMENT: {action}."
            }
            # We also need to inform the UI that the mitigation action is chosen so the topology updates
            yield {
                "type": "mitigation_decision",
                "action": action
            }
