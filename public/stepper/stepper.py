import asyncio
import js
from js import console
from pyodide.ffi import to_js

class ArrayMonitor:
    def __init__(self, array, control=None):
        self.array = array
        self.control = control
        self.highlighted_indices = {} 
        # side_elements will be a list of tuples: [ (name, value, color), ... ]
        self.side_elements = [] 
        asyncio.create_task(self.update())

    def _check_sync(self, step_increment=0):
        if self.control is None:
            return
        checker = getattr(self.control, "check_sync", None)
        if checker:
            checker(step_increment)

    async def update(self):
        if self.control is not None:
            checkpoint = getattr(self.control, "checkpoint", None)
            if checkpoint:
                await checkpoint(step_increment=1)

        update_data = {
            'array': self.array.tolist(),
            'highlighted_indices': self.highlighted_indices,
            'side_elements': self.side_elements
        }
        js_data = to_js(update_data)

        update_display = getattr(js.globalThis, 'updateDisplay', None)
        update_display(js_data)

    async def sleep(self, seconds=0.15):
        remaining = max(0.0, float(seconds))
        while remaining > 0:
            if self.control is not None:
                checkpoint = getattr(self.control, "checkpoint", None)
                if checkpoint:
                    await checkpoint()
            slice_duration = min(0.05, remaining)
            await asyncio.sleep(slice_duration)
            remaining -= slice_duration

    async def step(self, delay_seconds=0.15):
        await self.update()
        await self.sleep(delay_seconds)

    def __getitem__(self, key):
        self._check_sync()
        return self.array[key]

    def __len__(self):
        return len(self.array)

    def __setitem__(self, key, value):
        self._check_sync(step_increment=1)
        self.array[key] = value
        asyncio.create_task(self.update())

    def __str__(self):
        return str(self.array)

