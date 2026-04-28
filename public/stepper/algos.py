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


async def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        arr.highlighted_indices = {"purple": [i]}
        arr.side_elements = [["anchor", i, "purple"]]
        await arr.step(0.2)

        for j in range(i + 1, n):
            arr.highlighted_indices = {"purple": [i], "orange": [min_idx, j]}
            arr.side_elements = [
                ["minimum", arr[min_idx], "purple"],
                ["compare", arr[j], "orange"],
            ]
            await arr.step(0.14)
            if arr[j] < arr[min_idx]:
                min_idx = j
                arr.highlighted_indices = {"purple": [i], "red": [min_idx]}
                arr.side_elements = [["new minimum", arr[min_idx], "red"]]
                await arr.step(0.14)

        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            arr.highlighted_indices = {"red": [i, min_idx]}
            arr.side_elements = [["swap", f"{arr[i]} <-> {arr[min_idx]}", "red"]]
            await arr.step(0.2)

    arr.highlighted_indices = {}
    arr.side_elements = []
    await arr.step(0.1)


async def quick_sort(arr):
    async def partition(low, high):
        pivot = arr[high]
        i = low - 1
        arr.highlighted_indices = {"purple": [high]}
        arr.side_elements = [["pivot", pivot, "purple"]]
        await arr.step(0.18)

        for j in range(low, high):
            arr.highlighted_indices = {"purple": [high], "orange": [j]}
            arr.side_elements = [
                ["pivot", pivot, "purple"],
                ["compare", arr[j], "orange"],
            ]
            await arr.step(0.13)
            if arr[j] <= pivot:
                i += 1
                if i != j:
                    arr[i], arr[j] = arr[j], arr[i]
                    arr.highlighted_indices = {"red": [i, j], "purple": [high]}
                    arr.side_elements = [["swap", f"{arr[i]} <-> {arr[j]}", "red"]]
                    await arr.step(0.13)
        if i + 1 != high:
            arr[i + 1], arr[high] = arr[high], arr[i + 1]
        arr.highlighted_indices = {"green": [i + 1]}
        arr.side_elements = [["pivot index", i + 1, "green"]]
        await arr.step(0.16)
        return i + 1

    async def quick(low, high):
        if low >= high:
            return
        p = await partition(low, high)
        await quick(low, p - 1)
        await quick(p + 1, high)

    await quick(0, len(arr) - 1)
    arr.highlighted_indices = {}
    arr.side_elements = []
    await arr.step(0.1)


async def merge_sort(arr):
    buffer = list(arr)

    async def merge(low, mid, high):
        i, j, k = low, mid + 1, low
        while i <= mid and j <= high:
            arr.highlighted_indices = {
                "orange": [i, j],
                "purple": list(range(low, high + 1)),
            }
            arr.side_elements = [
                ["left", arr[i], "orange"],
                ["right", arr[j], "orange"],
                ["merge", f"{low}:{high}", "purple"],
            ]
            await arr.step(0.12)
            if arr[i] <= arr[j]:
                buffer[k] = arr[i]
                i += 1
            else:
                buffer[k] = arr[j]
                j += 1
            k += 1

        while i <= mid:
            buffer[k] = arr[i]
            i += 1
            k += 1

        while j <= high:
            buffer[k] = arr[j]
            j += 1
            k += 1

        for idx in range(low, high + 1):
            arr[idx] = buffer[idx]
            arr.highlighted_indices = {
                "green": [idx],
                "purple": list(range(low, high + 1)),
            }
            arr.side_elements = [["write", arr[idx], "green"]]
            await arr.step(0.09)

    async def sort(low, high):
        if low >= high:
            return
        mid = (low + high) // 2
        await sort(low, mid)
        await sort(mid + 1, high)
        await merge(low, mid, high)

    await sort(0, len(arr) - 1)
    arr.highlighted_indices = {}
    arr.side_elements = []
    await arr.step(0.1)


async def linear_search(arr, target=None):
    if target is None:
        target = arr.target
    for i in range(len(arr)):
        arr.highlighted_indices = {"orange": [i]}
        arr.side_elements = [
            ["target", target, "purple"],
            ["checking index", i, "orange"],
        ]
        await arr.step(0.18)
        if arr[i] == target:
            arr.highlighted_indices = {"green": [i]}
            arr.side_elements = [
                ["found", f"index {i}", "green"],
                ["value", target, "green"],
            ]
            await arr.step(0.25)
            return

    arr.highlighted_indices = {}
    arr.side_elements = [["result", "not found", "red"]]
    await arr.step(0.2)


async def binary_search(arr, target=None):
    if target is None:
        target = arr.target
    if len(arr) == 0:
        arr.side_elements = [["result", "empty array", "red"]]
        await arr.step(0.2)
        return

    # Binary search needs sorted data for meaningful visualization.
    arr.sort()
    arr.step(0.1)

    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        arr.highlighted_indices = {
            "purple": list(range(left, right + 1)),
            "orange": [mid],
        }
        arr.side_elements = [
            ["target", target, "red"],
            ["mid", arr[mid], "orange"],
            ["window", f"{left}:{right}", "purple"],
        ]
        await arr.step(0.22)

        if arr[mid] == target:
            arr.highlighted_indices = {"green": [mid]}
            arr.side_elements = [
                ["found", f"index {mid}", "green"],
                ["value", target, "green"],
            ]
            await arr.step(0.25)
            return
        if target < arr[mid]:
            right = mid - 1
        else:
            left = mid + 1

    arr.highlighted_indices = {}
    arr.side_elements = [["result", "not found", "red"]]
    await arr.step(0.2)


async def default_algo(arr):
    pass


def read_algorithm(algo_methodname):
    return getsource(globals()[algo_methodname])
