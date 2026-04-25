from inspect import getsource


async def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        arr.highlighted_indices = {"red": [i]}
        arr.side_elements = [["key", key, "red"]]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr.highlighted_indices = {"red": [i], "orange": [j, j + 1]}
            arr.side_elements = [["key", key, "red"], ["shifting", arr[j], "purple"]]
            arr[j + 1] = arr[j]
            j -= 1
            await arr.step(0.5)
        arr[j + 1] = key
        arr.highlighted_indices = {}
        arr.side_elements = []


async def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            arr.highlighted_indices = {"orange": [j, j + 1]}
            arr.side_elements = [["compare", f"{arr[j]} vs {arr[j + 1]}", "orange"]]
            await arr.step(0.18)

            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                arr.highlighted_indices = {"red": [j, j + 1]}
                arr.side_elements = [["swap", f"{arr[j]} <-> {arr[j + 1]}", "red"]]
                await arr.step(0.18)

    arr.highlighted_indices = {}
    arr.side_elements = []
    await arr.step(0.1)


async def purge_sort(arr):
    i = 0
    while i < len(arr):
        arr.highlighted_indices = {"orange": [i]}
        if arr[i] < arr[i - 1]:
            arr.pop(i)
        else:
            i += 1
        await arr.step(0.5)

async def binary_search(arr, tofind = 6, lower_idx = -1, higher_idx = -1):
    if lower_idx == -1:
        lower_idx = 0
    if higher_idx == -1:
        higher_idx = len(arr) - 1 
    mid_point = (lower_idx + higher_idx) // 2
    arr.highlighted_indices = {"red": list(range(lower_idx, higher_idx + 1))}
    await arr.step(0.5)
    if arr[mid_point] == tofind:
        arr.side_elements = [["found", "found", "red"]]
        await arr.step(0.15)
        return
    if tofind < arr[mid_point]:
        await binary_search(arr, tofind, lower_idx, mid_point - 1)
    else:
        await binary_search(arr, tofind, mid_point + 1, higher_idx)



async def default_algo(arr):
    pass

def read_algorithm(algo_methodname):
    return getsource(globals()[algo_methodname])
