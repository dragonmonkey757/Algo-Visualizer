"""
Tests for ArrayMonitor (stepper.py) and insertion_sort (default.py).

Stubs out js.console and pyodide.ffi so tests run without a browser.
"""

import sys
import types
import numpy as np
import pytest

js_mod = types.ModuleType("js")
class _Console:
    def log(self, *args): pass
js_mod.console = _Console()
sys.modules.setdefault("js", js_mod)

pyodide_mod = types.ModuleType("pyodide")
ffi_mod = types.ModuleType("pyodide.ffi")
ffi_mod.to_js = lambda x: x
pyodide_mod.ffi = ffi_mod
sys.modules.setdefault("pyodide", pyodide_mod)
sys.modules.setdefault("pyodide.ffi", ffi_mod)

from stepper import ArrayMonitor
from default import entry_point, insertion_sort

# ArrayMonitor tests

class TestArrayMonitorInit:
    def test_stores_array(self):
        arr = np.array([3, 1, 2])
        m = ArrayMonitor(arr)
        np.testing.assert_array_equal(m.array, arr)

    def test_initial_highlights_empty(self):
        m = ArrayMonitor(np.array([1, 2, 3]))
        assert m.highlighted_indices == set()

    def test_initial_side_elements_empty(self):
        m = ArrayMonitor(np.array([1, 2, 3]))
        assert m.side_elements == []

    def test_auto_highlight_on_by_default(self):
        m = ArrayMonitor(np.array([1, 2, 3]))
        assert m.auto_highlight is True

    def test_auto_highlight_can_be_disabled(self):
        m = ArrayMonitor(np.array([1, 2, 3]), auto_highlight=False)
        assert m.auto_highlight is False


class TestArrayMonitorGetItem:
    def test_returns_correct_value(self):
        m = ArrayMonitor(np.array([10, 20, 30]))
        assert m[1] == 20

    def test_auto_highlight_adds_index(self):
        m = ArrayMonitor(np.array([10, 20, 30]))
        m.highlighted_indices.clear()
        _ = m[2]
        assert 2 in m.highlighted_indices

    def test_no_highlight_when_disabled(self):
        m = ArrayMonitor(np.array([10, 20, 30]), auto_highlight=False)
        _ = m[0]
        assert 0 not in m.highlighted_indices


class TestArrayMonitorSetItem:
    def test_sets_value(self):
        m = ArrayMonitor(np.array([1, 2, 3]))
        m[0] = 99
        assert m.array[0] == 99

    def test_auto_highlight_on_set(self):
        m = ArrayMonitor(np.array([1, 2, 3]))
        m.highlighted_indices.clear()
        m[1] = 42
        assert 1 in m.highlighted_indices

    def test_no_highlight_on_set_when_disabled(self):
        m = ArrayMonitor(np.array([1, 2, 3]), auto_highlight=False)
        m[1] = 42
        assert 1 not in m.highlighted_indices


class TestArrayMonitorLen:
    def test_len(self):
        m = ArrayMonitor(np.array([5, 6, 7, 8]))
        assert len(m) == 4

    def test_len_empty(self):
        m = ArrayMonitor(np.array([]))
        assert len(m) == 0


class TestArrayMonitorHighlight:
    def test_highlight_sets_indices(self):
        m = ArrayMonitor(np.array([1, 2, 3]))
        m.highlight(0, 2)
        assert m.highlighted_indices == {0, 2}

    def test_highlight_replaces_previous(self):
        m = ArrayMonitor(np.array([1, 2, 3]))
        m.highlight(0)
        m.highlight(1, 2)
        assert m.highlighted_indices == {1, 2}

    def test_clear_highlight(self):
        m = ArrayMonitor(np.array([1, 2, 3]))
        m.highlight(0, 1, 2)
        m.clear_highlight()
        assert m.highlighted_indices == set()


class TestArrayMonitorStr:
    def test_str(self):
        arr = np.array([1, 2, 3])
        m = ArrayMonitor(arr)
        assert str(m) == str(arr)


# insertion_sort tests

class TestInsertionSort:
    def _run(self, lst):
        m = ArrayMonitor(np.array(lst, dtype=float))
        insertion_sort(m)
        return m.array.tolist()

    def test_sorted_output_random(self):
        assert self._run([3, 1, 4, 1, 5, 9, 2, 6]) == sorted([3, 1, 4, 1, 5, 9, 2, 6])

    def test_already_sorted(self):
        assert self._run([1, 2, 3, 4, 5]) == [1, 2, 3, 4, 5]

    def test_reverse_sorted(self):
        assert self._run([5, 4, 3, 2, 1]) == [1, 2, 3, 4, 5]

    def test_single_element(self):
        assert self._run([42]) == [42]

    def test_two_elements_swapped(self):
        assert self._run([2, 1]) == [1, 2]

    def test_duplicates(self):
        assert self._run([3, 3, 1, 1]) == [1, 1, 3, 3]

    def test_negative_numbers(self):
        assert self._run([-3, -1, -2]) == [-3, -2, -1]

    def test_mixed_positive_negative(self):
        assert self._run([0, -1, 5, -3, 2]) == sorted([0, -1, 5, -3, 2])

    def test_side_elements_cleared_after_sort(self):
        m = ArrayMonitor(np.array([3, 1, 2], dtype=float))
        insertion_sort(m)
        assert m.side_elements == []


class TestEntryPoint:
    def test_entry_point_runs_without_error(self):
        entry_point([4, 2, 7, 1])

    def test_entry_point_empty_array(self):
        entry_point([])