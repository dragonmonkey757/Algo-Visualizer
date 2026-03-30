from stepper import ArrayMonitor
import asyncio
import numpy as np

STEP_DELAY_SECONDS = 0.75

# Async sleep must be used here, otherwise the main browser thread will be blocked
# https://github.com/pyscript/pyscript/issues/324


async def entry_point(arr):
    monitored_arr = ArrayMonitor(np.array(arr))
    await insertion_sort(monitored_arr)


async def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        arr.highlighted_indices = {i: "red"}
        arr.side_elements = [["key", key, "red"]]
        await arr.update()
        await asyncio.sleep(STEP_DELAY_SECONDS)
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr.highlighted_indices = {i: "red", j: "orange", j + 1: "orange"}
            arr.side_elements = [["key", key, "red"], ["shifting", arr[j], "purple"]]
            await arr.update()
            arr[j + 1] = arr[j]
            j -= 1
            await asyncio.sleep(STEP_DELAY_SECONDS)
        arr[j + 1] = key
        await asyncio.sleep(STEP_DELAY_SECONDS)
        arr.highlighted_indices.clear()
        arr.side_elements = []
        await arr.update()
        await asyncio.sleep(STEP_DELAY_SECONDS)


async def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                await arr.update()
                await asyncio.sleep(STEP_DELAY_SECONDS)
