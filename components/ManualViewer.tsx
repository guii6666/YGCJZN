
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { MANUAL_CHAPTERS, EMERGENCY_CONTACTS, FLIGHT_ROUTES } from '../constants';
import { Chapter } from '../types';
import { BookOpen, Menu, ChevronRight, Phone, ShieldAlert, User, HeartPulse, ShieldCheck, Briefcase, Plane, PlaneTakeoff, MoveRight, FileText, Download, ExternalLink, ImageOff } from 'lucide-react';

// Custom Image Component with Error Handling
const MarkdownImage = ({ src, alt, ...props }: any) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 my-6">
        <ImageOff className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-sm font-medium">图片加载失败</p>
        <p className="text-xs mt-1 text-slate-400">{alt || 'Image not found'}</p>
      </div>
    );
  }

  return (
    <figure className="my-8 group">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          onError={() => setError(true)}
          {...props}
        />
      </div>
      {alt && (
        <figcaption className="mt-3 text-center text-sm text-slate-500 font-medium px-4">
          {alt}
        </figcaption>
      )}
    </figure>
  );
};

const ManualViewer: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<Chapter>(MANUAL_CHAPTERS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAerialPhoto, setShowAerialPhoto] = useState(false);

  // Helper to get icon based on contact role
  const getContactIcon = (name: string) => {
    if (name.includes("大使馆") || name.includes("外交部")) return <ShieldAlert className="text-red-500" size={20} />;
    if (name.includes("应急办") || name.includes("安环")) return <ShieldCheck className="text-orange-500" size={20} />;
    if (name.includes("医务室")) return <HeartPulse className="text-rose-500" size={20} />;
    if (name.includes("人力") || name.includes("综合")) return <Briefcase className="text-blue-500" size={20} />;
    return <User className="text-slate-500" size={20} />;
  };

  // Helper for background colors
  const getIconBg = (name: string) => {
    if (name.includes("大使馆") || name.includes("外交部")) return "bg-red-50 border-red-100";
    if (name.includes("应急办") || name.includes("安环")) return "bg-orange-50 border-orange-100";
    if (name.includes("医务室")) return "bg-rose-50 border-rose-100";
    if (name.includes("人力") || name.includes("综合")) return "bg-blue-50 border-blue-100";
    return "bg-slate-50 border-slate-100";
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        className={`md:hidden absolute top-4 left-4 z-40 p-2.5 bg-white/90 backdrop-blur text-slate-700 border border-slate-200 rounded-full shadow-lg transition-all ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col shadow-xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex justify-between items-center mb-1">
             <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Guidebook</span>
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <h2 className="font-bold text-slate-800 text-xl flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            启航指南目录
          </h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {MANUAL_CHAPTERS.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => {
                setActiveChapter(chapter);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all duration-200 flex justify-between items-center group
                ${activeChapter.id === chapter.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                }`}
            >
              <span className="line-clamp-2 font-medium">{chapter.title}</span>
              {activeChapter.id === chapter.id && <ChevronRight className="w-4 h-4 text-white/80 flex-shrink-0 ml-2" />}
            </button>
          ))}
          
          {/* Special Sidebar Item: Aerial Photo */}
          <button
            onClick={() => {
              setShowAerialPhoto(true);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className="w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all duration-200 flex justify-between items-center group text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
          >
            <div className="flex items-center">
               <Plane className="w-4 h-4 mr-2" />
               <span className="font-medium">维嘉基地航拍图</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 overflow-y-auto bg-slate-50/50 p-0 md:p-8 scroll-smooth relative"
        id="content-scroll-container"
      >
        <div className="max-w-4xl mx-auto bg-white min-h-full md:min-h-[calc(100%-2rem)] shadow-sm border border-slate-100 rounded-none md:rounded-2xl p-6 md:p-12 animate-fade-in-up">
          
          {/* Chapter Header */}
          <div className="mb-8 pb-6 border-b border-slate-100">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {activeChapter.title}
            </h1>
          </div>

          {/* SPECIAL SECTION: Flight Routes for Chapter 3 (ID: ch3) */}
          {activeChapter.id === 'ch3' && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                2.1 常用航线 (主流推荐)
              </h2>
              <div className="grid grid-cols-1 gap-5">
                {FLIGHT_ROUTES.map((flight, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    {/* Color Strip */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${flight.color}`}></div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Airline Info */}
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${flight.color.replace('bg-', 'bg-opacity-10 text-')} flex items-center justify-center flex-shrink-0`}>
                          <PlaneTakeoff size={24} className={flight.color.replace('bg-', 'text-')} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-800">{flight.airline}</h3>
                          <div className="flex items-center text-sm text-slate-500 mt-1">
                            {flight.route.split('→').map((loc, i, arr) => (
                              <React.Fragment key={i}>
                                <span className={i === arr.length - 1 ? "text-blue-700 font-semibold" : ""}>{loc.trim()}</span>
                                {i < arr.length - 1 && <MoveRight size={12} className="mx-2 text-slate-300" />}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Tags */}
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        {flight.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full border border-slate-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="prose prose-slate prose-lg max-w-none text-slate-600">
            {/* Custom renderer styling via prose class */}
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h2 className="text-3xl md:text-4xl font-extrabold text-blue-800 mt-10 mb-5 tracking-tight" {...props} />,
                h2: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3 pl-4 border-l-4 border-indigo-600" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-2 my-4 text-slate-600" {...props} />,
                li: ({node, ...props}) => <li className="pl-1 leading-relaxed text-slate-700" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-indigo-700 bg-indigo-50 px-1.5 rounded" {...props} />,
                p: ({node, ...props}) => <p className="leading-7 mb-4 text-slate-700" {...props} />,
                table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200" {...props} /></div>,
                thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" {...props} />,
                td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 border-t border-slate-100" {...props} />,
                blockquote: ({node, ...props}) => <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg my-6 text-slate-700 italic flex items-start"><span className="text-yellow-400 text-2xl mr-2 leading-none">❝</span><div {...props}/></div>,
                a: ({node, href, children, ...props}) => {
                  const isFile = href?.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z)$/i) || href?.startsWith('/files/');
                  const isExternal = href?.startsWith('http');
                
                  if (isFile) {
                    return (
                      <a 
                        href={href}
                        className="inline-flex items-center gap-2 px-4 py-2 my-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors no-underline group"
                        download
                        {...props}
                      >
                        <FileText size={16} className="text-slate-500 group-hover:text-blue-500" />
                        <span className="font-medium">{children}</span>
                        <Download size={14} className="text-slate-400 group-hover:text-blue-400 ml-auto" />
                      </a>
                    );
                  }
                  
                  return (
                    <a 
                      href={href} 
                      className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      {...props}
                    >
                      {children}
                      {isExternal && <ExternalLink size={12} className="opacity-70" />}
                    </a>
                  );
                },
                img: MarkdownImage
              }}
            >
              {activeChapter.content}
            </ReactMarkdown>

            {/* SPECIAL SECTION: Signature for Chapter 1 (ID: ch1) */}
            {activeChapter.id === 'ch1' && (
              <div className="mt-12 flex flex-col items-end not-prose">
                <div className="flex flex-col items-center font-bold text-slate-800 text-lg space-y-1">
                  <p>人力资源部</p>
                  <p>2025年12月</p>
                </div>
              </div>
            )}

            {/* SPECIAL SECTION: Emergency Contacts for Chapter 7 (ID: ch7) */}
            {activeChapter.id === 'ch7' && (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 not-prose">
                {EMERGENCY_CONTACTS.map((contact, index) => (
                  <div key={index} className="flex flex-row items-center p-3 sm:p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 group">
                    
                    {/* Left: Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 border ${getIconBg(contact.name)}`}>
                      {getContactIcon(contact.name)}
                    </div>
                    
                    {/* Middle: Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                          {contact.name}
                        </h3>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-500 font-medium flex flex-wrap items-center mt-1">
                         <span className="mr-2 text-slate-600">{contact.note}</span>
                         <span className="text-slate-300 hidden sm:inline mr-2">|</span>
                         <span className="font-mono text-blue-600/80">{contact.phone}</span>
                      </div>
                    </div>

                    {/* Right: Call Button */}
                    <a 
                      href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} 
                      className="flex-shrink-0 ml-2 flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-600 text-xs sm:text-sm font-bold rounded-full border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Phone size={14} className="mr-1.5" />
                      <span className="whitespace-nowrap">呼叫</span>
                    </a>

                  </div>
                ))}
              </div>
            )}
            

          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-100 flex justify-center">
            <div className="w-16 h-1 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Aerial Photo Modal */}
      {showAerialPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowAerialPhoto(false)}>
           <div className="relative max-w-5xl w-full bg-white rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setShowAerialPhoto(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="w-full h-auto max-h-[80vh] bg-slate-100 flex items-center justify-center overflow-auto">
                 <img 
                   src={`/photos/weijia_aerial.jpg?v=${new Date().getTime()}`} 
                   alt="维嘉基地航拍图" 
                   className="max-w-full max-h-[80vh] object-contain"
                   onError={(e) => {
                     console.error("Image load failed:", e.currentTarget.src);
                     // Fallback if image not found
                     e.currentTarget.style.display = 'none';
                     const parent = e.currentTarget.parentElement;
                     if (parent) {
                        parent.innerHTML = `
                          <div class="flex flex-col items-center justify-center p-12 text-slate-400">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                             </svg>
                             <p class="text-lg font-medium">图片暂未上传</p>
                             <p class="text-sm mt-2">请将航拍图命名为 <code class="bg-slate-200 px-1 rounded text-slate-600">weijia_aerial.jpg</code> 并放入 <code class="bg-slate-200 px-1 rounded text-slate-600">public/photos</code> 目录</p>
                          </div>
                        `;
                     }
                   }}
                 />
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">维嘉基地航拍全景</h3>
                <p className="text-slate-500 text-sm">拍摄于几内亚维嘉基地上空，展示了完善的营地设施与周边环境。</p>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ManualViewer;
