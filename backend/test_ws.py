import asyncio
import websockets

async def test_ws():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        # Send invalid JSON
        await websocket.send("{invalid_json: true}")
        # Send non-dict JSON
        await websocket.send('"just a string"')
        # Send valid JSON without type
        await websocket.send('{"id": 123}')
        # Send valid JSON with type
        await websocket.send('{"type": "PROVISION_SANDBOX"}')
        print("Sent payloads.")
        
asyncio.run(test_ws())
