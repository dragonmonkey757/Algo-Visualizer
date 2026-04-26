from stepper import ArrayMonitor
from runcont import CONTROL, StepperLimitError
import asyncio
import js

# Async sleep must be used here, otherwise the main browser thread will be blocked
# https://github.com/pyscript/pyscript/issues/324


async def entry_point(arr, optval = 0, user_code="", max_seconds=12.0, max_steps=1000):
    try:
        CONTROL.reset(max_steps=max_steps)
        monitored_arr = ArrayMonitor(arr, CONTROL, optval)
        try:
            if user_code and user_code.strip():
                await run_user_algorithm(monitored_arr, user_code, max_seconds)
        finally:
            CONTROL.paused = False
    except Exception as exc:
        report_error = getattr(js.globalThis, "reportError", None)
        if report_error:
            report_error(str(exc))
        raise


async def run_user_algorithm(arr, user_code, max_seconds):
    namespace = {}
    exec(user_code, namespace)

    algorithm = namespace.get("algorithm") or namespace.get("sort")
    if not callable(algorithm):
        raise ValueError(
            "Define a function named 'algorithm(arr)' in the editor."
        )

    result = algorithm(arr)
    if not asyncio.iscoroutine(result):
        raise ValueError(
            "Custom algorithms must be async. "
            "Use 'async def algorithm(arr):' in loops."
        )

    timeout = max(0.25, float(max_seconds))
    try:
        await asyncio.wait_for(result, timeout=timeout)
    except asyncio.TimeoutError as exc:
        raise StepperLimitError(f"Execution timed out after {timeout:.1f}s.") from exc

    arr.highlighted_indices.clear()
    arr.side_elements = []
    await arr.update()
