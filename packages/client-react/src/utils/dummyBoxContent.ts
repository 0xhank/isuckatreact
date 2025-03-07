const initialState = {
    time: 0,
    isRunning: false,
    intervalId: null,
};

export const dummyBoxContent = {
    spec: "A simple React stopwatch component for testing",
    initialState,
    jsx: `
    function Stopwatch() {
      const initialState = ${JSON.stringify(initialState)};
      const [state, setState] = React.useState(initialState);
      const intervalRef = React.useRef(null);

      // Cleanup interval on unmount
      React.useEffect(() => {
        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
      }, []);

      React.useEffect(() => {
        window.mergeState(state);
      }, [state]);

      const startTimer = () => {
        if (!state.isRunning) {
          const intervalId = setInterval(() => {
            setState(prevState => ({
              ...prevState,
              time: prevState.time + 1
            }));
          }, 1000);
          intervalRef.current = intervalId;
          setState(prevState => ({
            ...prevState,
            isRunning: true,
            intervalId
          }));
        }
      };

      const stopTimer = () => {
        if (state.isRunning) {
          clearInterval(intervalRef.current);
          setState(prevState => ({
            ...prevState,
            isRunning: false,
            intervalId: null
          }));
        }
      };

      const resetTimer = () => {
        clearInterval(intervalRef.current);
        setState({
          time: 0,
          isRunning: false,
          intervalId: null
        });
      };

      const formatTime = () => {
        const hours = Math.floor(state.time / 3600);
        const minutes = Math.floor((state.time % 3600) / 60);
        const seconds = state.time % 60;
        return \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;
      };

      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-blue-100 p-8 rounded-xl shadow-lg">
          <div className="text-3xl font-bold text-blue-600 mb-4">
            {formatTime()}
          </div>
          <div className="space-x-2">
            <button 
              className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors"
              onClick={startTimer}
            >
              Start
            </button>
            <button 
              className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors"
              onClick={stopTimer}
            >
              Stop
            </button>
            <button 
              className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors"
              onClick={resetTimer}
            >
              Reset
            </button>
          </div>
        </div>
      );
    }
  `,
    description: "A React stopwatch component using JSX directly",
    type: '"GEN"',
};
