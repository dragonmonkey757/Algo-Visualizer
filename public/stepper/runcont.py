import asyncio

class StepperStoppedError(RuntimeError):
    pass


class StepperLimitError(RuntimeError):
    pass

class RuntimeControl:
    def __init__(self):
        self.reset()

    def reset(self, max_steps=1000):
        self.paused = False
        self.stopped = False
        self.max_steps = max_steps
        self.current_steps = 0       
        
    async def sleep(self, seconds=0.15):
        self.current_steps += 1
        remaining = max(0.0, float(seconds))
        if self.current_steps >= self.max_steps:
            raise StepperLimitError(
                f"Step limit of {self.max_steps} exceeded. Possible infinite loop?"
            )
        while remaining > 0:
            # loop here to allow for responsive pausing/stopping during the sleep period
            await self.check_state()
            slice_duration = min(0.05, remaining)
            await asyncio.sleep(slice_duration)
            remaining -= slice_duration
    
    async def check_state(self):
        if self.stopped:
            raise StepperStoppedError("Execution stopped by user.")
        while self.paused:
            await asyncio.sleep(0.05)


CONTROL = RuntimeControl()


def pause_stepper():
    CONTROL.paused = True


def resume_stepper():
    CONTROL.paused = False


def stop_stepper():
    CONTROL.stopped = True
    CONTROL.paused = False