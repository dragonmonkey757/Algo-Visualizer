import numpy as np
from js import console
from pyodide.ffi import to_js

class ArrayMonitor:
    def __init__(self, array, auto_highlight=True):
        self.array = array
        self.highlighted_indices = set()
        self.side_elements = [] #temporary elements like keys in insertion sort
        self.auto_highlight = auto_highlight  # Enable/disable auto-highlighting
        self.update()

    def update(self):
        # Send the array, side elements, and highlighted indices to JS as a dict
        data = {
            'array': self.array.tolist(),
            'side_elements': self.side_elements,
            'highlights': list(self.highlighted_indices)
        }
        console.log(to_js(data))

    def __getitem__(self, key):
        if self.auto_highlight:
            self.highlighted_indices.add(key)  # Auto-highlight on access
            self.update()
        return self.array[key]

    def __len__(self):
        return len(self.array)

    def __setitem__(self, key, value):
        self.array[key] = value
        if self.auto_highlight:
            self.highlighted_indices.add(key)  # Auto-highlight on modification
        self.update()

    def __str__(self):
        return str(self.array)

    def highlight(self, *indices):
        self.highlighted_indices = set(indices)
        self.update()

    # New method to clear highlights
    def clear_highlight(self):
        self.highlighted_indices.clear()
        self.update()

