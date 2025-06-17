import { ChessBoard } from './ChessBoard';
import { GameControls } from './GameControls';
import { SettingsModal } from './SettingsModal';
import { FenDisplay } from './FenDisplay';
import { MoveNotation } from './MoveNotation';
import { PgnLoadModal } from './PgnLoadModal';
import { useChessBot } from '../hooks/useChessBot';
import { useState, useEffect } from 'react';

export function ChessBot() {
  const [isMobile, setIsMobile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPgnModal, setShowPgnModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      return window.innerWidth < 768 || 'ontouchstart' in window;
    };
    setIsMobile(checkMobile());

    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    chess,
    selectedSquare,
    availableMoves,
    settings,
    gameStatus,
    isThinking,
    analysis,
    moveHistory,
    analysisArrows,
    hintMove,
    handleSquareClick,
    handlePieceDrop,
    handleSettingsChange,
    handleNewGame,
    handleStartAsWhite,
    handleStartAsBlack,
    handleUndo,
    handleFlipBoard,
    handleAnalyzePosition,
    handleGetHint,
    handleBotMove,
    handleLoadFen,
    handleCopyFen,
    handleLoadPGN,
  } = useChessBot();

  // Determine if pieces should be draggable
  const arePiecesDraggable = settings.analysisMode || 
    (settings.mode === 'human-vs-human') ||
    (settings.mode === 'human-vs-ai' && chess.turn() === settings.humanColor[0]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-4xl">♔</span>
              <div className="text-center md:text-left">
                <h1 className="text-xl md:text-3xl font-bold text-white">Chess Bot Analysis</h1>
                <p className="text-gray-300 text-xs md:text-sm">Advanced Chess Analysis with AI • Drag & Drop Enabled</p>
              </div>
              <span className="text-2xl md:text-4xl">♚</span>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setShowPgnModal(true)}
                className="chess-button secondary p-2"
                title="Load PGN Game"
              >
                📝
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="chess-button secondary p-2"
                title="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Quick Tips */}
      {isMobile && (
        <div className="bg-blue-900/20 border-b border-blue-500/30 px-3 py-2">
          <div className="text-center">
            <p className="text-blue-300 text-xs">
              💡 <strong>Mobile Tips:</strong> Tap piece → Tap destination or Drag & Drop pieces to move
            </p>
            {selectedSquare && (
              <p className="text-yellow-300 text-xs mt-1">
                ✨ Selected: <strong>{selectedSquare}</strong> → Tap any green highlighted square to move
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-2 py-4 md:px-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Chess Board - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <div className="game-card p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2 flex-wrap">
                  <span>🏁</span>
                  <span className="hidden sm:inline">Chess Board</span>
                  <span className="sm:hidden">Board</span>
                  {settings.analysisMode && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      ANALYSIS
                    </span>
                  )}
                  {arePiecesDraggable && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                      DRAG & DROP
                    </span>
                  )}
                  {isMobile && (
                    <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                      MOBILE
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 text-xs md:text-sm" style={{ color: 'var(--text-light)' }}>
                  <div className="flex items-center gap-2">
                    <span>Human:</span>
                    <span className={`font-medium px-2 py-1 rounded text-xs ${settings.humanColor === 'white' ? 'bg-gray-100 text-black' : 'bg-gray-800 text-white'}`}>
                      {settings.humanColor === 'white' ? '♔' : '♚'} {settings.humanColor}
                    </span>
                  </div>
                  {settings.mode === 'human-vs-ai' && (
                    <div className="flex items-center gap-2">
                      <span>AI:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${settings.aiColor === 'white' ? 'bg-gray-100 text-black' : 'bg-gray-800 text-white'}`}>
                        {settings.aiColor === 'white' ? '♔' : '♚'} {settings.aiColor}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <ChessBoard
                chess={chess}
                onSquareClick={handleSquareClick}
                onPieceDrop={handlePieceDrop}
                selectedSquare={selectedSquare}
                availableMoves={availableMoves}
                isFlipped={settings.boardOrientation === 'black'}
                analysisArrows={settings.showAnalysisArrows ? analysisArrows : []}
                arePiecesDraggable={arePiecesDraggable}
                humanColor={settings.humanColor}
                aiColor={settings.aiColor}
                gameMode={settings.mode}
              />

              {/* Quick Actions */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={handleGetHint} 
                  className="chess-button flex-1 sm:flex-none"
                  disabled={isThinking}
                >
                  <span className="hidden sm:inline">💡 Get Hint</span>
                  <span className="sm:hidden">💡 Hint</span>
                </button>
                <button 
                  onClick={handleAnalyzePosition} 
                  className="chess-button flex-1 sm:flex-none"
                  disabled={isThinking}
                >
                  <span className="hidden sm:inline">📊 Analyze</span>
                  <span className="sm:hidden">📊 Analyze</span>
                </button>
                <button onClick={handleFlipBoard} className="chess-button secondary flex-1 sm:flex-none">
                  <span className="hidden sm:inline">🔄 Flip</span>
                  <span className="sm:hidden">🔄</span>
                </button>
                <button onClick={handleUndo} className="chess-button secondary flex-1 sm:flex-none">
                  <span className="hidden sm:inline">↩️ Undo</span>
                  <span className="sm:hidden">↩️</span>
                </button>
              </div>

              {/* Mobile Status */}
              {isMobile && (
                <div className="mt-3 text-center">
                  <div className="text-xs text-gray-400">
                    {selectedSquare ? (
                      <span className="text-yellow-300">
                        📍 Selected: {selectedSquare} • Available moves: {availableMoves.length}
                      </span>
                    ) : (
                      <span>
                        🎯 Tap any piece to see available moves
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Move Notation and FEN Display */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <MoveNotation 
                  lastMove={moveHistory[moveHistory.length - 1] || null}
                  moveNumber={chess.moveNumber()}
                  currentTurn={chess.turn()}
                />
                <FenDisplay 
                  fen={chess.fen()} 
                  showLabel={!isMobile}
                />
              </div>

              {/* Analysis Display */}
              {(analysis || hintMove) && (
                <div className="mt-4 p-3 md:p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {analysis && (
                      <div>
                        <h4 className="text-xs md:text-sm font-medium text-gray-300 mb-2">Position Analysis</h4>
                        <div className="text-base md:text-lg font-bold text-white">
                          {analysis.mate !== null && analysis.mate !== undefined 
                            ? `M${Math.abs(analysis.mate)}` 
                            : analysis.evaluation !== null && analysis.evaluation !== undefined
                            ? `${analysis.evaluation > 0 ? '+' : ''}${(analysis.evaluation / 100).toFixed(2)}`
                            : '—'
                          }
                        </div>
                        {analysis.bestmove && (
                          <div className="text-xs md:text-sm text-gray-300 mt-1">
                            Best: <span className="font-mono text-green-400">{analysis.bestmove}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {hintMove && (
                      <div>
                        <h4 className="text-xs md:text-sm font-medium text-gray-300 mb-2">Hint</h4>
                        <div className="text-base md:text-lg font-bold text-yellow-400">
                          {hintMove}
                        </div>
                        <div className="text-xs md:text-sm text-gray-300 mt-1">
                          Suggested move for current position
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Controls - Takes up 1 column */}
          <div className="lg:col-span-1 order-2 lg:order-2">
            <GameControls
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onNewGame={handleNewGame}
              onStartAsWhite={handleStartAsWhite}
              onStartAsBlack={handleStartAsBlack}
              onUndo={handleUndo}
              onFlipBoard={handleFlipBoard}
              onAnalyzePosition={handleAnalyzePosition}
              onGetHint={handleGetHint}
              onBotMove={handleBotMove}
              onLoadFen={handleLoadFen}
              onCopyFen={handleCopyFen}
              gameStatus={gameStatus}
              isThinking={isThinking}
              currentFen={chess.fen()}
              moveHistory={moveHistory}
              evaluation={analysis?.evaluation}
              mate={analysis?.mate}
              bestMove={analysis?.bestmove}
              hintMove={hintMove || undefined}
              isAnalysisMode={settings.analysisMode}
              boardOrientation={settings.boardOrientation}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 mt-8 md:mt-12">
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-6">
          <div className="text-center">
            <p className="text-gray-400 text-xs md:text-sm">
              Chess Bot Analysis • Powered by Stockfish • Built with React & TypeScript
            </p>
            <div className="flex justify-center items-center gap-2 md:gap-4 mt-2 flex-wrap">
              <span className="text-xs text-gray-500">Features:</span>
              <span className="text-xs text-gray-400">AI Analysis</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">Drag & Drop</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">Mobile Responsive</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentSettings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* PGN Load Modal */}
      <PgnLoadModal
        isOpen={showPgnModal}
        onClose={() => setShowPgnModal(false)}
        onLoadGame={handleLoadPGN}
      />
    </div>
  );
} 