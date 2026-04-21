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
