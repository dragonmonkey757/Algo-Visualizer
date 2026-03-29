import js
from default import entry_point

print("firstload.py is running on startup")

async def triggerStepper(arr, code=""):
    try:
        await entry_point(list(arr), code)
    except Exception as exc:
        report_error = getattr(js.globalThis, "reportRuntimeError", None)
        if report_error:
            report_error(str(exc))
        raise

js.globalThis.triggerStepper = triggerStepper