from stepper import ArrayMonitor
import asyncio
import numpy as np
import time

class StepperStoppedError(RuntimeError):
    pass


class StepperLimitError(RuntimeError):
    pass


class RuntimeControl:
    def __init__(self):
        self.reset(12.0)

    def reset(self, max_seconds):
        self.max_seconds = max(0.25, float(max_seconds))
        self.started_at = time.monotonic()
        self.paused = False
        self.stopped = False

    def _validate_limits(self):
        if (time.monotonic() - self.started_at) > self.max_seconds:
            raise StepperLimitError(
                f"Execution timed out after {self.max_seconds:.1f}s."
            )

    def _check_runtime_state(self):
        if self.stopped:
            raise StepperStoppedError("Execution stopped by user.")
        self._validate_limits()

    async def checkpoint(self):
        self._check_runtime_state()
        while self.paused:
            if self.stopped:
                raise StepperStoppedError("Execution stopped by user.")
            self._validate_limits()
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
    CONTROL.reset(max_seconds)
    monitored_arr = ArrayMonitor(np.array(arr), CONTROL)
    try:
        if user_code and user_code.strip():
            await run_user_algorithm(monitored_arr, user_code)
    finally:
        CONTROL.paused = False


async def run_user_algorithm(arr, user_code):
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

    await asyncio.wait_for(result, timeout=CONTROL.max_seconds)

    arr.highlighted_indices.clear()
    arr.side_elements = []
    await arr.update()
