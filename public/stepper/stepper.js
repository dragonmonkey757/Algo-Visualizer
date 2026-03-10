let runAlgoProxy = null;

async function getRunAlgoProxy() {
    while (!window.pyscript?.ready) {
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await window.pyscript.ready;

    if (!runAlgoProxy) 
    {
        const pyFunc = pyscript.interpreter.globals.get("entry_point");
        runAlgoProxy = (arr) => pyFunc(arr);
    }

    return runAlgoProxy;
}

async function triggerStepper(arr) 
{
    let runAlgoProxy = await getRunAlgoProxy();
    await runAlgoProxy(arr);
}