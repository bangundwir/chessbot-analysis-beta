import { ChessBot } from './components/ChessBot';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <ChessBot />
      </div>
    </ErrorBoundary>
  );
}

export default App;
