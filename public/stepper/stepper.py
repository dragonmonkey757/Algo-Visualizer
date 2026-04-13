import js
from pyodide.ffi import to_js


class ArrayMonitor:
    def __init__(self, array, control):
        self.array = array
        assert control is not None, "Control object must be provided to ArrayMonitor"
        self.control = control
        self.highlighted_indices = {}
        # side_elements will be a list of tuples: [ (name, value, color), ... ]
        self.side_elements = []

    async def update(self):

        update_data = {
            "array": self.array.tolist(),
            "highlighted_indices": self.highlighted_indices,
            "side_elements": self.side_elements,
        }
        js_data = to_js(update_data)

        update_display = getattr(js.globalThis, "updateDisplay", None)
        update_display(js_data)

    async def step(self, delay_seconds=0.15):
        await self.update()
        await self.control.sleep(delay_seconds)

    def __getitem__(self, key):
        return self.array[key]

    def __len__(self):
        return len(self.array)

    def __setitem__(self, key, value):
        self.array[key] = value

    def __str__(self):
        return str(self.array)
