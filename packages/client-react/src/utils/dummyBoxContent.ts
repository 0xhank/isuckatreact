export const dummyBoxContent = null;
export const _dummyBoxContent = {
    spec: "A stopwatch component with dynamic styling capabilities",
    html: `<div class='w-full h-full flex flex-col items-center justify-center bg-blue-100 p-8 rounded-xl shadow-lg'>
        <div id='stopwatch' class='text-3xl font-bold text-blue-600 mb-4'>00:00:00</div>
        <div class='space-x-2'>
            <button id='start' class='bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors'>Start</button>
            <button id='stop' class='bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors'>Stop</button>
            <button id='reset' class='bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors'>Reset</button>
            <button id='change-style' class='bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors'>Change Style</button>
        </div>
    </div>`,
    initialState: {
        time: 0,
        isRunning: false,
        intervalId: null,
    },
    js: `
        const stopwatchDisplay = document.getElementById('stopwatch');
        const startButton = document.getElementById('start');
        const stopButton = document.getElementById('stop');
        const resetButton = document.getElementById('reset');
        const changeStyleButton = document.getElementById('change-style');

        function updateDisplay() {
            const hours = Math.floor(state.time / 3600);
            const minutes = Math.floor((state.time % 3600) / 60);
            const seconds = state.time % 60;
            stopwatchDisplay.textContent = \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;
        }

        startButton.onclick = () => {
            if (!state.isRunning) {
                const intervalId = setInterval(() => {
                    mergeState({ time: state.time + 1 });
                    updateDisplay();
                }, 1000);
                mergeState({ isRunning: true, intervalId });
            }
        };

        stopButton.onclick = () => {
            if (state.isRunning) {
                clearInterval(state.intervalId);
                mergeState({ isRunning: false, intervalId: null });
            }
        };

        resetButton.onclick = () => {
            clearInterval(state.intervalId);
            mergeState({ time: 0, isRunning: false, intervalId: null });
            updateDisplay();
        };

        changeStyleButton.onclick = () => {
            console.log("changeStyleButton clicked");
            // Send command to update styles while preserving state and logic
            window.parent.postMessage({
                type: 'COMMAND',
                command: 'update the styles of the stopwatch to a random fun design',
            }, '*');
        };

        updateDisplay();
    `,
    description: "A stopwatch with dynamic styling capabilities",
    type: '"GEN"',
};
