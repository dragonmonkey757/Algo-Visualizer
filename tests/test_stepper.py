"""
Tests for ArrayMonitor (stepper.py) and insertion_sort / entry_point (default.py).

Stubs out js, pyodide.ffi so tests run without a browser or Pyodide runtime.
"""

import sys
import types
import asyncio
import numpy as np
from stepper import ArrayMonitor
from default import entry_point, insertion_sort

# ---------------------------------------------------------------------------
# Stubs for browser-only modules
# ---------------------------------------------------------------------------

# stub: js
js_mod = types.ModuleType("js")


class _GlobalThis:
    def updateDisplay(self, *args):
        pass


js_mod.globalThis = _GlobalThis()
sys.modules.setdefault("js", js_mod)

# stub: pyodide.ffi
pyodide_mod = types.ModuleType("pyodide")
ffi_mod = types.ModuleType("pyodide.ffi")
ffi_mod.to_js = lambda x: x
pyodide_mod.ffi = ffi_mod
sys.modules.setdefault("pyodide", pyodide_mod)
sys.modules.setdefault("pyodide.ffi", ffi_mod)

from stepper import ArrayMonitor  # noqa: E402
from default import (  # noqa: E402
    RuntimeControl,
    StepperStoppedError,
    StepperLimitError,
    entry_point,
    insertion_sort,
    pause_stepper,
    resume_stepper,
    stop_stepper,
    CONTROL,
)


# ===========================================================================
# Helpers
# ===========================================================================


def make_monitor(lst, control=None):
    """Create an ArrayMonitor with a fresh RuntimeControl by default."""
    ctrl = control or RuntimeControl()
    return ArrayMonitor(np.array(lst, dtype=float), ctrl), ctrl


# ===========================================================================
# RuntimeControl tests
# ===========================================================================


class TestRuntimeControl:
    def test_initial_state(self):
        ctrl = RuntimeControl()
        assert ctrl.paused is False
        assert ctrl.stopped is False

    def test_reset_clears_state(self):
        ctrl = RuntimeControl()
        ctrl.paused = True
        ctrl.stopped = True
        ctrl.reset()
        assert ctrl.paused is False
        assert ctrl.stopped is False

    @pytest.mark.asyncio
    async def test_checkpoint_passes_when_running(self):
        ctrl = RuntimeControl()
        await ctrl.checkpoint()  # should not raise

    @pytest.mark.asyncio
    async def test_checkpoint_raises_when_stopped(self):
        ctrl = RuntimeControl()
        ctrl.stopped = True
        with pytest.raises(StepperStoppedError):
            await ctrl.checkpoint()

    @pytest.mark.asyncio
    async def test_checkpoint_raises_when_stopped_while_paused(self):
        ctrl = RuntimeControl()
        ctrl.paused = True
        ctrl.stopped = True
        with pytest.raises(StepperStoppedError):
            await ctrl.checkpoint()


class TestStepperControls:
    def test_pause_stepper(self):
        CONTROL.reset()
        pause_stepper()
        assert CONTROL.paused is True

    def test_resume_stepper(self):
        CONTROL.reset()
        pause_stepper()
        resume_stepper()
        assert CONTROL.paused is False

    def test_stop_stepper(self):
        CONTROL.reset()
        stop_stepper()
        assert CONTROL.stopped is True
        assert CONTROL.paused is False


# ===========================================================================
# ArrayMonitor unit tests
# ===========================================================================


class TestArrayMonitorInit:
    def test_stores_array(self):
        arr = np.array([3, 1, 2])
        m, _ = make_monitor([3, 1, 2])
        np.testing.assert_array_equal(m.array, arr)

    def test_initial_highlights_empty_dict(self):
        m, _ = make_monitor([1, 2, 3])
        assert m.highlighted_indices == {}

    def test_initial_side_elements_empty(self):
        m, _ = make_monitor([1, 2, 3])
        assert m.side_elements == []

    def test_control_stored(self):
        ctrl = RuntimeControl()
        m = ArrayMonitor(np.array([1, 2, 3]), ctrl)
        assert m.control is ctrl

    def test_control_defaults_to_none(self):
        m = ArrayMonitor(np.array([1, 2, 3]))
        assert m.control is None


class TestArrayMonitorGetItem:
    def test_returns_correct_value(self):
        m, _ = make_monitor([10, 20, 30])
        assert m[1] == 20

    def test_returns_first_element(self):
        m, _ = make_monitor([99, 2, 3])
        assert m[0] == 99

    def test_returns_last_element(self):
        m, _ = make_monitor([1, 2, 99])
        assert m[2] == 99


class TestArrayMonitorSetItem:
    def test_sets_value(self):
        m, _ = make_monitor([1, 2, 3])
        m[0] = 99
        assert m.array[0] == 99

    def test_sets_middle_value(self):
        m, _ = make_monitor([1, 2, 3])
        m[1] = 42
        assert m.array[1] == 42

    def test_sets_last_value(self):
        m, _ = make_monitor([1, 2, 3])
        m[2] = 55
        assert m.array[2] == 55


class TestArrayMonitorLen:
    def test_len(self):
        m, _ = make_monitor([5, 6, 7, 8])
        assert len(m) == 4

    def test_len_single(self):
        m, _ = make_monitor([1])
        assert len(m) == 1

    def test_len_empty(self):
        m, _ = make_monitor([])
        assert len(m) == 0


class TestArrayMonitorStr:
    def test_str(self):
        arr = np.array([1, 2, 3])
        m = ArrayMonitor(np.array([1, 2, 3]), RuntimeControl())
        assert str(m) == str(arr)


class TestArrayMonitorHighlightedIndices:
    def test_can_set_highlighted_indices(self):
        m, _ = make_monitor([1, 2, 3])
        m.highlighted_indices = {0: "red", 1: "orange"}
        assert m.highlighted_indices[0] == "red"
        assert m.highlighted_indices[1] == "orange"

    def test_can_clear_highlighted_indices(self):
        m, _ = make_monitor([1, 2, 3])
        m.highlighted_indices = {0: "red"}
        m.highlighted_indices.clear()
        assert m.highlighted_indices == {}

    def test_highlighted_indices_is_dict(self):
        m, _ = make_monitor([1, 2, 3])
        assert isinstance(m.highlighted_indices, dict)


class TestArrayMonitorSideElements:
    def test_can_set_side_elements(self):
        m, _ = make_monitor([1, 2, 3])
        m.side_elements = [["key", 5, "red"]]
        assert m.side_elements == [["key", 5, "red"]]

    def test_can_clear_side_elements(self):
        m, _ = make_monitor([1, 2, 3])
        m.side_elements = [["key", 5, "red"]]
        m.side_elements = []
        assert m.side_elements == []


# ===========================================================================
# insertion_sort async tests
# ===========================================================================


@pytest.mark.asyncio
class TestInsertionSort:
    async def _run(self, lst):
        CONTROL.reset()
        ctrl = RuntimeControl()
        m = ArrayMonitor(np.array(lst, dtype=float), ctrl)
        await insertion_sort(m)
        return m.array.tolist()

    async def test_sorted_output_random(self):
        assert await self._run([3, 1, 4, 1, 5, 9, 2, 6]) == sorted(
            [3, 1, 4, 1, 5, 9, 2, 6]
        )

    async def test_already_sorted(self):
        assert await self._run([1, 2, 3, 4, 5]) == [1, 2, 3, 4, 5]

    async def test_reverse_sorted(self):
        assert await self._run([5, 4, 3, 2, 1]) == [1, 2, 3, 4, 5]

    async def test_single_element(self):
        assert await self._run([42]) == [42]

    async def test_two_elements_swapped(self):
        assert await self._run([2, 1]) == [1, 2]

    async def test_duplicates(self):
        assert await self._run([3, 3, 1, 1]) == [1, 1, 3, 3]

    async def test_negative_numbers(self):
        assert await self._run([-3, -1, -2]) == [-3, -2, -1]

    async def test_mixed_positive_negative(self):
        assert await self._run([0, -1, 5, -3, 2]) == sorted([0, -1, 5, -3, 2])

    async def test_side_elements_cleared_after_sort(self):
        ctrl = RuntimeControl()
        m = ArrayMonitor(np.array([3, 1, 2], dtype=float), ctrl)
        await insertion_sort(m)
        assert m.side_elements == []

    async def test_highlights_cleared_after_sort(self):
        ctrl = RuntimeControl()
        m = ArrayMonitor(np.array([3, 1, 2], dtype=float), ctrl)
        await insertion_sort(m)
        assert m.highlighted_indices == {}

    async def test_stop_raises_error(self):
        ctrl = RuntimeControl()
        m = ArrayMonitor(np.array([5, 4, 3, 2, 1], dtype=float), ctrl)
        ctrl.stopped = True
        with pytest.raises(StepperStoppedError):
            await insertion_sort(m)


# ===========================================================================
# entry_point async tests
# ===========================================================================


@pytest.mark.asyncio
class TestEntryPoint:
    async def test_runs_insertion_sort_by_default(self):
        await entry_point([4, 2, 7, 1])

    async def test_empty_array(self):
        await entry_point([])

    async def test_single_element(self):
        await entry_point([1])

    async def test_already_sorted(self):
        await entry_point([1, 2, 3])

    async def test_control_reset_after_run(self):
        await entry_point([3, 1, 2])
        assert CONTROL.paused is False

    async def test_user_code_runs(self):
        user_code = """
async def algorithm(arr):
    pass
"""
        await entry_point([3, 1, 2], user_code=user_code)

    async def test_invalid_user_code_raises(self):
        user_code = """
def algorithm(arr):
    pass
"""
        with pytest.raises(ValueError, match="async"):
            await entry_point([3, 1, 2], user_code=user_code)

    async def test_missing_function_raises(self):
        user_code = """
x = 1
"""
        with pytest.raises(ValueError, match="Define a function"):
            await entry_point([3, 1, 2], user_code=user_code)
