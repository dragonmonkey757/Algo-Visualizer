import js
from default import entry_point
from runcont import pause_stepper, resume_stepper, stop_stepper

print("firstload.py is running on startup")

js.globalThis.triggerStepper = entry_point
js.globalThis.pauseStepper = pause_stepper
js.globalThis.resumeStepper = resume_stepper
js.globalThis.stopStepper = stop_stepper
