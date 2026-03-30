from stepper import ArrayMonitor
import numpy as np


def entry_point(arr):
    monitored_arr = ArrayMonitor(np.array(arr))
    insertion_sort(monitored_arr)


def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        arr.side_elements = [key]  # Show the key being inserted
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
        arr.side_elements = []  # Clear after insertion
        arr.update()  # Log only after each insertion
