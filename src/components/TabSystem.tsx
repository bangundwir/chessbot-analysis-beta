import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBot } from './ChessBot';

interface ChessTab {
  id: string;
  name: string;
  gameState: {
    fen: string;
    pgn: string;
    moveHistory: string[];
    settings: any;
    lastMove: string | null;
  };
  timestamp: number;
}

export function TabSystem() {
  const [tabs, setTabs] = useState<ChessTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const TABS_STORAGE_KEY = 'chessbot-tabs';

  // Load tabs from localStorage on mount
  useEffect(() => {
    try {
      const savedTabs = localStorage.getItem(TABS_STORAGE_KEY);
      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        setTabs(parsedTabs);
        if (parsedTabs.length > 0) {
          setActiveTabId(parsedTabs[0].id);
        }
      } else {
        // Create initial tab
        createNewTab();
      }
    } catch (error) {
      console.error('Error loading tabs:', error);
      createNewTab();
    }
  }, []);

  // Save tabs to localStorage whenever tabs change
  useEffect(() => {
    if (tabs.length > 0) {
      try {
        localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
      } catch (error) {
        console.error('Error saving tabs:', error);
      }
    }
  }, [tabs]);

  const generateTabId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  const createNewTab = useCallback(() => {
    const newId = generateTabId();
    const chess = new Chess();
    const newTab: ChessTab = {
      id: newId,
      name: `Game ${tabs.length + 1}`,
      gameState: {
        fen: chess.fen(),
        pgn: chess.pgn(),
        moveHistory: [],
        settings: {
          mode: 'human-vs-ai',
          boardOrientation: 'white',
          humanColor: 'white',
          aiColor: 'black',
          aiDepth: 10,
          showAnalysisArrows: true,
          autoAnalysis: false,
          analysisMode: false,
        },
        lastMove: null,
      },
      timestamp: Date.now(),
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  }, [tabs.length, generateTabId]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      
      // If closing active tab, switch to another tab
      if (tabId === activeTabId) {
        if (filtered.length > 0) {
          setActiveTabId(filtered[0].id);
        } else {
          // If no tabs left, create a new one
          setTimeout(createNewTab, 0);
        }
      }
      
      return filtered;
    });
  }, [activeTabId, createNewTab]);

  const renameTab = useCallback((tabId: string, newName: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, name: newName } : tab
    ));
  }, []);

  const updateTabGameState = useCallback((tabId: string, gameState: Partial<ChessTab['gameState']>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { 
            ...tab, 
            gameState: { ...tab.gameState, ...gameState },
            timestamp: Date.now() 
          } 
        : tab
    ));
  }, []);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Tab Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
                <div className="flex items-center gap-2 overflow-x-auto tab-container">
           {tabs.map((tab) => (
             <div
               key={tab.id}
               className={`tab-item flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer group min-w-fit whitespace-nowrap ${
                 tab.id === activeTabId
                   ? 'tab-item active bg-gray-700 text-white border-b-2 border-blue-500'
                   : 'bg-gray-600 text-gray-300'
               }`}
               onClick={() => setActiveTabId(tab.id)}
             >
               <span className="text-sm font-medium">{tab.name}</span>
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   closeTab(tab.id);
                 }}
                 className="tab-close-button text-gray-400 hover:text-red-400 transition-opacity"
                 title="Close tab"
               >
                 ✕
               </button>
             </div>
           ))}
          
          {/* New Tab Button */}
          <button
            onClick={createNewTab}
            className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
            title="New tab"
          >
            +
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab && (
                     <ChessBot
             key={activeTab.id}
             tabId={activeTab.id}
             tabName={activeTab.name}
             initialGameState={activeTab.gameState}
             onGameStateChange={(gameState) => updateTabGameState(activeTab.id, gameState)}
             onRename={(newName) => renameTab(activeTab.id, newName)}
           />
        )}
      </div>
    </div>
  );
} 