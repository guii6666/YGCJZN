
import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Navigation, Map as MapIcon, Compass, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askMapAgent } from '../services/geminiService';
import { ChatMessage } from '../types';

// Declare Leaflet global
declare const L: any;

// PRECISE LOCAL DATA FOR INSTANT RESPONSE
const QUICK_LOCATIONS = [
  { 
    name: "科纳克里机场 (CKY)", 
    query: "科纳克里机场简介", 
    coords: [9.5769, -13.6120],
    description: "几内亚主要国际机场 (Ahmed Sékou Touré International Airport)。<br/>位于科纳克里市区，是抵达几内亚的第一站。"
  },
  { 
    name: "中国驻几内亚大使馆", 
    query: "中国驻几内亚大使馆简介", 
    coords: [9.5422, -13.6844],
    description: "Embassy of the People's Republic of China.<br/>位于科纳克里 Donka 地区，紧邻 28 Septembre 体育场。"
  },
  { 
    name: "维嘉营地 (Vega Camp)", 
    query: "维嘉营地简介", 
    coords: [10.232, -14.426],
    description: "博法项目核心生活营地。<br/>坐标：10.232, -14.426。<br/>实行封闭式管理，设施齐全。" 
  },
  {
    name: "维嘉港口 (Vega Port)",
    query: "维嘉港口简介",
    coords: [10.2000, -14.4500], // 10°12′N, 14°27′W
    description: "SPIC 专用运矿港口。<br/>坐标：10°12′N, 14°27′W。<br/>几内亚铝土矿出口的关键节点。"
  },
  {
    name: "高丽亚矿山 (Kolia Mine)",
    query: "高丽亚矿山简介",
    coords: [10.8333, -14.0833], // 10°50′N, 14°05′W
    description: "核心矿区作业面。<br/>坐标：10°50′N, 14°05′W。<br/>主要的铝土矿开采区域。"
  }
];

const MapExplorer: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '欢迎使用 **几内亚地图探索**。\n\n已为您加载 **科纳克里** 及 **博法项目区** 的关键坐标。\n点击下方按钮可快速定位，或输入查询其他地点。',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current && typeof L !== 'undefined') {
      // Default center: Zoomed out to show relationship between Conakry and Boffa
      const map = L.map(mapContainerRef.current).setView([10.2000, -14.1000], 9);

      // CartoDB Voyager Tile Layer (Clean, Corporate look)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      
      // -- RESIZE OBSERVER LOGIC --
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
      
      // -- INITIAL MARKERS FOR ALL QUICK LOCATIONS --
      // This provides an immediate "dashboard" view of all key project sites
      QUICK_LOCATIONS.forEach(loc => {
        addMarker(loc.coords as [number, number], loc.name, loc.description);
      });

      // Cleanup function
      return () => {
        resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanMarkdown = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Keep bold
      .replace(/\*(.*?)\*/g, '<i>$1</i>')     // Keep italic
      .replace(/#+\s/g, '')                   // Remove headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')     // Remove links but keep text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('<br/>');                         // Newlines to BR
  };

  const addMarker = (coords: [number, number], title: string, description?: string) => {
    if (!mapInstanceRef.current) return;
    
    // Custom Div Icon
    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class='marker-pin'></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -35]
    });

    const cleanDesc = description ? cleanMarkdown(description) : '正在分析详细信息...';
    
    // Modern HTML for Popup with refined styling
    const popupContent = `
      <div style="min-width: 220px; max-width: 280px; font-family: 'Noto Sans SC', sans-serif;">
        <div style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; background: linear-gradient(to right, #f8fafc, #ffffff); display: flex; align-items: center; gap: 10px; border-radius: 12px 12px 0 0;">
           <div style="width: 8px; height: 8px; border-radius: 50%; background: #2563eb; box-shadow: 0 0 0 2px #dbeafe;"></div>
           <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.2;">${title}</h3>
        </div>
        <div style="padding: 14px 16px; font-size: 13px; color: #475569; line-height: 1.6; max-height: 200px; overflow-y: auto; background: #fff; border-radius: 0 0 12px 12px;">
           ${cleanDesc}
        </div>
      </div>
    `;

    const marker = L.marker(coords, { icon }).addTo(mapInstanceRef.current);
    marker.bindPopup(popupContent); // Bind popup
    
    // Add click listener to ensure popup opens cleanly
    marker.on('click', () => {
      marker.openPopup();
    });

    markersRef.current.push(marker);
  };

  const clearMarkers = () => {
    // We clear markers to keep the view clean when searching for specific new locations.
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input, overrideCoords?: [number, number], locationName?: string, localDescription?: string) => {
    if ((!text.trim() && !overrideCoords) || isLoading) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const markerTitle = locationName || text;

    // 2. INSTANT LOCAL ACTION (Fast Response for Quick Buttons)
    if (overrideCoords && mapInstanceRef.current) {
      // Clear markers to focus on selection
      clearMarkers(); 
      
      // Fly to location immediately
      mapInstanceRef.current.flyTo(overrideCoords, 14, { duration: 1.5 });
      
      const descToShow = localDescription || "正在查询详细信息...";
      addMarker(overrideCoords, markerTitle, descToShow);

      // If we have a local description, we skip AI entirely for instant feedback
      if (localDescription) {
        // Sanitize <br/> tags specifically for the chat (convert to newline for Markdown)
        const cleanChatText = localDescription.replace(/<br\s*\/?>/gi, '\n');
        
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: `已为您定位到 **${locationName}**。\n\n${cleanChatText}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMsg]);
          return; // EXIT EARLY - NO AI CALL
      }
    }

    // 3. AI ACTION (Fallback for generic search)
    setIsLoading(true);

    try {
      const result = await askMapAgent(text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text,
        timestamp: new Date(),
        groundingMetadata: result.groundingChunks
      };

      setMessages(prev => [...prev, botMsg]);

      // Determine coords: use override (if localDesc was missing but coords present) or AI result
      const finalCoords = overrideCoords || (result.location ? [result.location.lat, result.location.lng] as [number, number] : null);

      if (finalCoords && mapInstanceRef.current) {
         // Only move map/add marker if we haven't done it yet (i.e., AI search)
         if (!overrideCoords) {
             clearMarkers();
             mapInstanceRef.current.flyTo(finalCoords, 14, { duration: 1.5 });
             const summary = result.text.length > 300 ? result.text.substring(0, 300) + "..." : result.text;
             addMarker(finalCoords, markerTitle, summary);
         }
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "地图服务连接失败。",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-50 relative overflow-hidden">
      
      {/* Map Panel */}
      <div className="h-[40vh] md:h-full md:w-1/2 relative shadow-2xl z-20 border-b md:border-b-0 md:border-r border-slate-200">
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-200" />
        
        {/* Map Overlay Badge */}
        <div className="absolute top-4 left-4 z-[400] glass-panel px-4 py-2 rounded-xl shadow-lg flex items-center animate-fade-in-up">
           <MapIcon size={16} className="text-blue-600 mr-2" />
           <span className="text-xs font-bold text-slate-800 tracking-wide">几内亚 · 实时地图</span>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col h-[60vh] md:h-full bg-slate-50 relative z-10">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
           <div className="flex items-center">
             <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl mr-3 shadow-md shadow-blue-500/20">
               <Navigation size={18}/>
             </div>
             <div>
               <h2 className="font-bold text-slate-800 text-base">智能向导</h2>
               <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Interactive Map Guide</p>
             </div>
           </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full animate-slide-in-right ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[90%] md:max-w-[85%] items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1 ${msg.role === 'user' ? 'bg-slate-800' : 'bg-white border border-slate-100'}`}>
                  {msg.role === 'user' ? <Navigation size={14} className="text-white" /> : <Compass size={16} className="text-blue-600" />}
                </div>

                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  
                  {msg.groundingMetadata && msg.groundingMetadata.length > 0 && (
                     <div className="mt-3 pt-2 border-t border-slate-100/50 flex flex-wrap gap-1">
                        <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-200 font-medium">Source: Google Maps</span>
                     </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start w-full px-11">
               <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-30">
          
          {/* Quick Buttons - Now Instant */}
          <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
            {QUICK_LOCATIONS.map(loc => (
              <button
                key={loc.name}
                onClick={() => handleSend(loc.query, loc.coords as [number, number], loc.name, loc.description)}
                className="flex-shrink-0 flex items-center px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
              >
                <MapPin size={12} className="mr-1.5 text-blue-500" />
                {loc.name}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={16} />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="搜索地点 (如: 科纳克里港口)..."
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-inner transition-all group-hover:bg-white"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`p-3.5 rounded-xl transition-all shadow-lg ${
                !input.trim() || isLoading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 hover:shadow-blue-500/30'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MapExplorer;
