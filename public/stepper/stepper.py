import asyncio
import js
from pyodide.ffi import to_js


class ArrayMonitor:
    def __init__(self, array):
        self.array = array
        self.highlighted_indices = {}
        # side_elements will be a list of tuples: [ (name, value, color), ... ]
        self.side_elements = []
        asyncio.create_task(self.update())

    async def update(self):
        update_data = {
            'array': self.array.tolist(),
            'highlighted_indices': self.highlighted_indices,
            'side_elements': self.side_elements
        }
        js_data = to_js(update_data)

        update_display = getattr(js.globalThis, 'updateDisplay', None)
        update_display(js_data)

    def __getitem__(self, key):
        asyncio.create_task(self.update())
        return self.array[key]

    def __len__(self):
        return len(self.array)

    def __setitem__(self, key, value):
        self.array[key] = value
        asyncio.create_task(self.update())

    def __str__(self):
        return str(self.array)
