export const dummyBoxContent = {
    html: "<div class='flex flex-col items-center justify-center w-full h-full'><div id='elapsed-time' class='text-4xl font-bold mb-4'>0:00:00</div><div class='space-x-2'><button id='start-btn' class='bg-green-500 text-white px-4 py-2 rounded'>Start</button><button id='stop-btn' class='bg-red-500 text-white px-4 py-2 rounded'>Stop</button><button id='reset-btn' class='bg-blue-500 text-white px-4 py-2 rounded'>Reset</button></div></div>",
    initialState: { isRunning: false, elapsedTime: 0, intervalId: null },
    js:
        "const elapsedTimeDisplay = document.getElementById('elapsed-time');\n" +
        "const startBtn = document.getElementById('start-btn');\n" +
        "const stopBtn = document.getElementById('stop-btn');\n" +
        "const resetBtn = document.getElementById('reset-btn');\n" +
        "\n" +
        "function updateDisplay() {\n" +
        "  const hours = Math.floor(state.elapsedTime / 3600000);\n" +
        "  const minutes = Math.floor((state.elapsedTime % 3600000) / 60000);\n" +
        "  const seconds = Math.floor((state.elapsedTime % 60000) / 1000);\n" +
        "  elapsedTimeDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;\n" +
        "}\n" +
        "\n" +
        "startBtn.onclick = () => {\n" +
        "  if (!state.isRunning) {\n" +
        "    const intervalId = setInterval(() => {\n" +
        "      mergeState({ elapsedTime: state.elapsedTime + 1000 });\n" +
        "      updateDisplay();\n" +
        "    }, 1000);\n" +
        "    mergeState({ isRunning: true, intervalId });\n" +
        "  }\n" +
        "};\n" +
        "\n" +
        "stopBtn.onclick = () => {\n" +
        "  if (state.isRunning && state.intervalId) {\n" +
        "    clearInterval(state.intervalId);\n" +
        "    mergeState({ isRunning: false, intervalId: null });\n" +
        "  }\n" +
        "};\n" +
        "\n" +
        "resetBtn.onclick = () => {\n" +
        "  clearInterval(state.intervalId);\n" +
        "  mergeState({ isRunning: false, elapsedTime: 0, intervalId: null });\n" +
        "  updateDisplay();\n" +
        "};\n" +
        "\n" +
        "updateDisplay();",
    description: "A stopwatch component",
    spec: "A stopwatch component that displays the elapsed time and allows the user to start, stop, and reset the timer.",
};
