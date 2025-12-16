import React, { useState } from 'react';
import Cover from './components/Cover';
import ManualViewer from './components/ManualViewer';
import AiAssistant from './components/AiAssistant';
import MapExplorer from './components/MapExplorer';
import { AppView } from './types';
import { Book, MessageSquareText, Home, Map } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.COVER);

  const renderContent = () => {
    // We wrap content in a div with a key to force re-render and trigger animations
    return (
      <div key={currentView} className="h-full w-full animate-fade-in">
        {(() => {
          switch (currentView) {
            case AppView.COVER:
              return <Cover onStart={() => setCurrentView(AppView.MANUAL)} />;
            case AppView.MANUAL:
              return <ManualViewer />;
            case AppView.AI_ASSISTANT:
              return <AiAssistant />;
            case AppView.MAP_EXPLORER:
              return <MapExplorer />;
            default:
              return <Cover onStart={() => setCurrentView(AppView.MANUAL)} />;
          }
        })()}
      </div>
    );
  };

  if (currentView === AppView.COVER) {
    return renderContent();
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar (Desktop) / Bottom Tab Bar (Mobile) */}
      <nav className="bg-white/90 backdrop-blur-md md:w-20 w-full md:h-full h-16 fixed md:static bottom-0 left-0 border-t md:border-t-0 md:border-r border-slate-200 z-50 flex md:flex-col justify-around md:justify-start md:pt-10 items-center md:space-y-8 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] md:shadow-none transition-all">
        
        <NavButton 
          active={currentView === AppView.COVER} 
          onClick={() => setCurrentView(AppView.COVER)}
          icon={<Home size={22} />}
          label="封面"
        />

        <NavButton 
          active={currentView === AppView.MANUAL} 
          onClick={() => setCurrentView(AppView.MANUAL)}
          icon={<Book size={22} />}
          label="手册"
        />

        <NavButton 
          active={currentView === AppView.MAP_EXPLORER} 
          onClick={() => setCurrentView(AppView.MAP_EXPLORER)}
          icon={<Map size={22} />}
          label="地图"
        />

        <NavButton 
          active={currentView === AppView.AI_ASSISTANT} 
          onClick={() => setCurrentView(AppView.AI_ASSISTANT)}
          icon={<MessageSquareText size={22} />}
          label="AI助手"
        />

      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-full w-full overflow-hidden pb-16 md:pb-0 relative bg-slate-50">
        {renderContent()}
      </main>
    </div>
  );
};

// Reusable Nav Button Component with improved active states
const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`group flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative ${
      active 
        ? 'text-blue-600 bg-blue-50 shadow-sm translate-y-[-2px]' 
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
    }`}
    title={label}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
    <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${active ? 'opacity-100 font-bold' : 'opacity-70 group-hover:opacity-100'}`}>
      {label}
    </span>
    {active && <div className="absolute -right-[1px] md:right-auto md:-left-[1px] md:top-1/2 md:-translate-y-1/2 w-1 h-8 rounded-full bg-blue-600 hidden md:block"></div>}
  </button>
);

export default App;