import js
from default import entry_point

print("firstload.py is running on startup")

async def triggerStepper(arr):
    await entry_point(list(arr))

js.globalThis.triggerStepper = triggerStepper