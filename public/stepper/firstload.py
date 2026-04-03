import js
from default import entry_point, pause_stepper, resume_stepper, stop_stepper

print("firstload.py is running on startup")


async def triggerStepper(arr, code="", max_seconds=12):
    try:
        await entry_point(list(arr), code, float(max_seconds))
    except Exception as exc:
        report_error = getattr(js.globalThis, "reportRuntimeError", None)
        if report_error:
            report_error(str(exc))
        raise


def pauseStepper():
    pause_stepper()


def resumeStepper():
    resume_stepper()


def stopStepper():
    stop_stepper()


js.globalThis.triggerStepper = triggerStepper
js.globalThis.pauseStepper = pauseStepper
js.globalThis.resumeStepper = resumeStepper
js.globalThis.stopStepper = stopStepper
