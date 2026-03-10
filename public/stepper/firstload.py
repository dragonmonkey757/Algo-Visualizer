import js
from default import entry_point

print("firstload.py is running on startup")

def triggerStepper(arr):
    entry_point(list(arr))

js.globalThis.triggerStepper = triggerStepper