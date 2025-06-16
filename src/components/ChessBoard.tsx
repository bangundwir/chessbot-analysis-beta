import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { useState, useEffect, useCallback } from 'react';
import { AnalysisArrow as AnalysisArrowType } from '../types/chess';

interface ChessBoardProps {
  chess: Chess;
  onSquareClick: (square: Square) => void;
  onPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean;
  selectedSquare: Square | null;
  availableMoves: Square[];
  isFlipped: boolean;
  analysisArrows: AnalysisArrowType[];
  arePiecesDraggable: boolean;
}

export function ChessBoard({ 
  chess, 
  onSquareClick, 
  onPieceDrop,
  selectedSquare, 
  availableMoves, 
  isFlipped, 
  analysisArrows,
  arePiecesDraggable
}: ChessBoardProps) {
  
  const [boardSize, setBoardSize] = useState(400);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [lastTouchTime, setLastTouchTime] = useState(0);

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    setIsTouchDevice(checkTouchDevice());
  }, []);

  // Calculate responsive board size
  useEffect(() => {
    const calculateBoardSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Mobile portrait (very small)
      if (screenWidth < 480) {
        return Math.min(screenWidth * 0.95, 340);
      }
      // Mobile landscape or small tablet
      else if (screenWidth < 768) {
        return Math.min(screenWidth * 0.6, screenHeight * 0.7, 420);
      }
      // Tablet
      else if (screenWidth < 1024) {
        return Math.min(screenWidth * 0.5, 520);
      }
      // Desktop
      else {
        return Math.min(screenWidth * 0.4, 600);
      }
    };

    setBoardSize(calculateBoardSize());

    const handleResize = () => {
      setBoardSize(calculateBoardSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Convert our analysis arrows to react-chessboard format
  const customArrows = analysisArrows.map(arrow => [
    arrow.from as Square,
    arrow.to as Square
  ] as [Square, Square]);

  // Custom square styles for selected square and available moves
  const customSquareStyles: { [square: string]: React.CSSProperties } = {};
  
  // Highlight selected square
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)',
      border: '3px solid #f1c40f',
      boxSizing: 'border-box'
    };
  }
  
  // Highlight available moves
  availableMoves.forEach(square => {
    const piece = chess.get(square);
    if (piece) {
      // Square with piece (capture)
      customSquareStyles[square] = {
        background: 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)',
        backgroundColor: 'rgba(255, 0, 0, 0.3)'
      };
    } else {
      // Empty square
      customSquareStyles[square] = {
        background: 'radial-gradient(circle, #7fb069 25%, transparent 25%)',
        backgroundColor: 'transparent'
      };
    }
  });

  // Enhanced square click handler for mobile
  const handleSquareClick = useCallback((square: Square) => {
    if (isTouchDevice) {
      const now = Date.now();
      // Prevent double-tap issues on mobile
      if (now - lastTouchTime < 100) {
        return;
      }
      setLastTouchTime(now);
    }
    
    console.log('Square clicked:', square, 'Touch device:', isTouchDevice);
    onSquareClick(square);
  }, [onSquareClick, isTouchDevice, lastTouchTime]);

  // Enhanced piece drop handler
  const handlePieceDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    console.log('Piece dropped from', sourceSquare, 'to', targetSquare, 'Touch device:', isTouchDevice);
    
    // Add small delay for mobile to ensure proper state updates
    if (isTouchDevice) {
      setTimeout(() => {
        const moveSuccessful = onPieceDrop(sourceSquare as Square, targetSquare as Square);
        console.log('Mobile drop result:', moveSuccessful);
      }, 50);
      return true; // Return true immediately for mobile to prevent snap-back
    }
    
    // Desktop behavior
    const moveSuccessful = onPieceDrop(sourceSquare as Square, targetSquare as Square);
    return moveSuccessful;
  }, [onPieceDrop, isTouchDevice]);

  // Check if a piece can be dragged
  const isDraggablePiece = useCallback(({ piece }: { piece: string; sourceSquare: string }) => {
    if (!arePiecesDraggable) return false;
    
    // On touch devices, be more permissive to allow easier interaction
    if (isTouchDevice) {
      return true; // Allow dragging any piece, validation will happen in drop handler
    }
    
    // Desktop behavior: only allow dragging pieces of the current player
    const pieceColor = piece[0]; // 'w' or 'b'
    const currentTurn = chess.turn();
    
    return pieceColor === currentTurn;
  }, [arePiecesDraggable, isTouchDevice, chess]);

  // Handle piece drag begin
  const handlePieceDragBegin = useCallback((piece: string, sourceSquare: string) => {
    console.log('Drag begin:', piece, 'from', sourceSquare, 'Touch device:', isTouchDevice);
    
    // For mobile, immediately show available moves
    if (isTouchDevice) {
      onSquareClick(sourceSquare as Square);
    }
  }, [onSquareClick, isTouchDevice]);

  // Handle piece drag end
  const handlePieceDragEnd = useCallback((piece: string, sourceSquare: string) => {
    console.log('Drag end:', piece, 'from', sourceSquare);
  }, []);

  // Calculate notation font size based on board size
  const notationFontSize = boardSize < 340 ? '8px' : boardSize < 420 ? '10px' : '12px';

  // Mobile-specific board styles
  const mobileBoardStyle: Record<string, string | number> = {
    borderRadius: boardSize < 400 ? '6px' : '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '2px solid #8b7355',
    ...(isTouchDevice && { touchAction: 'none' }) // Prevent scrolling while interacting with board
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Mobile Instructions */}
      {isTouchDevice && (
        <div className="mb-2 text-center">
          <div className="text-xs text-gray-400 bg-gray-800/50 rounded px-2 py-1">
            📱 Tap piece → Tap destination or Drag & Drop
          </div>
        </div>
      )}

      {/* React Chessboard */}
      <div className="chess-board-container w-full flex justify-center">
        <Chessboard
          id="chess-board"
          position={chess.fen()}
          onSquareClick={handleSquareClick}
          onPieceDrop={handlePieceDrop}
          onPieceDragBegin={handlePieceDragBegin}
          onPieceDragEnd={handlePieceDragEnd}
          isDraggablePiece={isDraggablePiece}
          boardOrientation={isFlipped ? 'black' : 'white'}
          customSquareStyles={customSquareStyles}
          customArrows={customArrows}
          customArrowColor="#7fb069"
          boardWidth={boardSize}
          animationDuration={isTouchDevice ? 150 : 200}
          arePiecesDraggable={arePiecesDraggable}
          showBoardNotation={boardSize > 300}
          snapToCursor={true}
          customBoardStyle={mobileBoardStyle}
          customDarkSquareStyle={{
            backgroundColor: '#b58863'
          }}
          customLightSquareStyle={{
            backgroundColor: '#f0d9b5'
          }}
          customNotationStyle={{
            fontSize: notationFontSize,
            fontWeight: '600',
            color: '#5a5a5a'
          }}
        />
      </div>

      {/* Player indicators */}
      <div className="flex justify-between items-center mt-3 md:mt-4 px-2 w-full" style={{ maxWidth: `${boardSize}px` }}>
        <div className="flex items-center space-x-2">
          <div 
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${chess.turn() === (isFlipped ? 'b' : 'w') ? 'animate-pulse' : ''}`}
            style={{ 
              backgroundColor: chess.turn() === (isFlipped ? 'b' : 'w') ? 'var(--chess-com-green)' : '#404040'
            }}
          />
          <span className="text-xs md:text-sm font-medium" style={{ color: 'var(--text-light)' }}>
            {isFlipped ? 'Black' : 'White'}
            {chess.turn() === (isFlipped ? 'b' : 'w') && (
              <span className="ml-1 text-green-400">•</span>
            )}
          </span>
        </div>
        
        <div className="text-center flex-1">
          <div className="text-xs md:text-sm text-gray-400">
            Turn: {chess.moveNumber()}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs md:text-sm font-medium" style={{ color: 'var(--text-light)' }}>
            {chess.turn() === (isFlipped ? 'w' : 'b') && (
              <span className="mr-1 text-green-400">•</span>
            )}
            {isFlipped ? 'White' : 'Black'}
          </span>
          <div 
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${chess.turn() === (isFlipped ? 'w' : 'b') ? 'animate-pulse' : ''}`}
            style={{ 
              backgroundColor: chess.turn() === (isFlipped ? 'w' : 'b') ? 'var(--chess-com-green)' : '#404040'
            }}
          />
        </div>
      </div>

      {/* Game Status */}
      <div className="text-center mt-2 md:mt-3 w-full">
        {chess.isGameOver() && (
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-900/20 border border-red-500/30 rounded-lg">
            {chess.isCheckmate() && (
              <>
                <span className="text-lg">🏁</span>
                <span className="text-red-400 font-semibold text-sm md:text-base">
                  Checkmate! {chess.turn() === 'w' ? 'Black' : 'White'} wins
                </span>
              </>
            )}
            {chess.isDraw() && (
              <>
                <span className="text-lg">🤝</span>
                <span className="text-yellow-400 font-semibold text-sm md:text-base">Draw</span>
              </>
            )}
            {chess.isStalemate() && (
              <>
                <span className="text-lg">😐</span>
                <span className="text-yellow-400 font-semibold text-sm md:text-base">Stalemate</span>
              </>
            )}
          </div>
        )}
        
        {!chess.isGameOver() && chess.inCheck() && (
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-900/20 border border-red-500/30 rounded-lg">
            <span className="text-lg animate-pulse">⚠️</span>
            <span className="text-red-400 font-semibold text-sm md:text-base">
              {chess.turn() === 'w' ? 'White' : 'Black'} is in Check!
            </span>
          </div>
        )}
        
        {!chess.isGameOver() && !chess.inCheck() && (
          <div className="text-gray-400 text-xs md:text-sm">
            {chess.turn() === 'w' ? 'White' : 'Black'} to move
          </div>
        )}
      </div>

      {/* Selected piece indicator for mobile */}
      {isTouchDevice && selectedSquare && (
        <div className="mt-2 text-center">
          <div className="text-xs text-yellow-400 bg-gray-800/50 rounded px-2 py-1">
            Selected: {selectedSquare} • Tap destination to move
          </div>
        </div>
      )}

      {/* Board Size Indicator (for debugging, can be removed) */}
      {import.meta.env.DEV && (
        <div className="text-xs text-gray-500 mt-2">
          Board: {boardSize}px | Touch: {isTouchDevice ? 'Yes' : 'No'} | Screen: {window.innerWidth}x{window.innerHeight}
        </div>
      )}
    </div>
  );
} 