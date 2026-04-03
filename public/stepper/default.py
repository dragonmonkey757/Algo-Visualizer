from stepper import ArrayMonitor
import asyncio
import numpy as np

class StepperStoppedError(RuntimeError):
    pass


class StepperLimitError(RuntimeError):
    pass


class RuntimeControl:
    def __init__(self):
        self.reset()

    def reset(self):
        self.paused = False
        self.stopped = False

    def _check_runtime_state(self):
        if self.stopped:
            raise StepperStoppedError("Execution stopped by user.")

    async def checkpoint(self):
        self._check_runtime_state()
        while self.paused:
            if self.stopped:
                raise StepperStoppedError("Execution stopped by user.")
            await asyncio.sleep(0.05)


CONTROL = RuntimeControl()


def pause_stepper():
    CONTROL.paused = True


def resume_stepper():
    CONTROL.paused = False


def stop_stepper():
    CONTROL.stopped = True
    CONTROL.paused = False


# Async sleep must be used here, otherwise the main browser thread will be blocked
# https://github.com/pyscript/pyscript/issues/324


async def entry_point(arr, user_code="", max_seconds=12.0):
    CONTROL.reset()
    monitored_arr = ArrayMonitor(np.array(arr), CONTROL)
    try:
        if user_code and user_code.strip():
            await run_user_algorithm(monitored_arr, user_code, max_seconds)
    finally:
        CONTROL.paused = False


async def run_user_algorithm(arr, user_code, max_seconds):
    namespace = {}
    exec(user_code, namespace)

    algorithm = namespace.get("algorithm") or namespace.get("sort")
    if not callable(algorithm):
        raise ValueError(
            "Define a function named 'algorithm(arr)' or 'sort(arr)' in the editor."
        )

    result = algorithm(arr)
    if not asyncio.iscoroutine(result):
        raise ValueError(
            "Custom algorithms must be async. Use 'async def algorithm(arr):' and 'await arr.step(...)' in loops."
        )

    timeout = max(0.25, float(max_seconds))
    try:
        await asyncio.wait_for(result, timeout=timeout)
    except asyncio.TimeoutError as exc:
        raise StepperLimitError(
            f"Execution timed out after {timeout:.1f}s."
        ) from exc

    arr.highlighted_indices.clear()
    arr.side_elements = []
    await arr.update()
