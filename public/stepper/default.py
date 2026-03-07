from stepper import ArrayMonitor
import numpy as np

def entry_point():
    arr = np.array([5, 2, 9, 1, 5, 6])
    monitored_arr = ArrayMonitor(arr)
    insertion_sort(monitored_arr)

def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr.compare(j, i):
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key