const initialState = {
    time: 0,
    isRunning: false,
    intervalId: null,
};

export const dummyBoxContent = {
    spec: "I will create a React stopwatch component with start, stop, and reset functionality using useState and useEffect hooks. I'll use Material UI components like Typography, Button, Paper, and Box for styling and layout.",
    initialState: initialState,
    jsx: `function Stopwatch() {
  const initialState = {
    time: 0,
    isRunning: false,
    intervalId: null,
  };
  const [state, setState] = React.useState(initialState);
  const intervalRef = React.useRef(null);

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
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" color="primary" gutterBottom>
          {formatTime()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button 
            variant="contained" 
            color="success" 
            onClick={startTimer}
            disabled={state.isRunning}
          >
            Start
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={stopTimer}
            disabled={!state.isRunning}
          >
            Stop
          </Button>
          <Button 
             
            color="primary" 
            onClick={resetTimer}
          >
            Reset
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}`,
    description:
        "A Material UI stopwatch component with start, stop, and reset functionality that displays hours, minutes, and seconds in a Paper container with styled buttons.",
};
