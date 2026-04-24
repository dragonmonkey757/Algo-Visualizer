from inspect import getsource

async def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        arr.highlighted_indices = {i: "red"}
        arr.side_elements = [["key", key, "red"]]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr.highlighted_indices = {i: "red", j: "orange", j + 1: "orange"}
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
            arr.highlighted_indices = {j: "orange", j + 1: "orange"}
            arr.side_elements = [["compare", f"{arr[j]} vs {arr[j + 1]}", "orange"]]
            await arr.step(0.18)

            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                arr.highlighted_indices = {j: "red", j + 1: "red"}
                arr.side_elements = [["swap", f"{arr[j]} <-> {arr[j + 1]}", "red"]]
                await arr.step(0.18)

    arr.highlighted_indices = {}
    arr.side_elements = []
    await arr.step(0.1)

async def stalin_sort(arr):
    i = 0
    while i < len(arr):
        arr.highlighted_indices = {i: "orange"}
        if arr[i] < arr[i - 1]:
            arr.pop(i)
        else:
            i += 1
        await arr.step(0.5)


def read_algorithm(algo_methodname):
    return getsource(globals()[algo_methodname]) 
    # takes in string and gets method name by that string

