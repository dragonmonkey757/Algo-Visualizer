import numpy as np
from js import console
from pyodide.ffi import to_js

class ArrayMonitor:
    def __init__(self, array):
        self.array = array
        self.highlighted_indices = set()
        self.steps = 0
        self.update()

    def update(self):
        js_array = to_js(self.array.tolist())
        console.log(js_array)

    def __getitem__(self, key):
        return self.array[key]

    def __len__(self):
        return len(self.array)

    def __setitem__(self, key, value):
        self.array[key] = value
        self.steps += 1
        self.update()

    def __str__(self):
        return str(self.array)

    def compare(self, i, j):
        self.highlighted_indices = {i, j}
        self.update()
        return self.array[i] <= self.array[j]

    def highlight(self, *indices):
        self.highlighted_indices = set(indices)
        self.update()

