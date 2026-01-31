
import React, { useState, useRef } from 'react';
import { generateIUGFlyer, TextPosition } from './services/geminiService';
import { LoadingOverlay } from './components/LoadingOverlay';

const App: React.FC = () => {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'English' | 'French'>('French');
  const [backgroundColor, setBackgroundColor] = useState('Blue and White');
  const [textPosition, setTextPosition] = useState<TextPosition>('Bottom (below images)');
  const [additionalPhones, setAdditionalPhones] = useState('');
  const [userImages, setUserImages] = useState<{ data: string; mimeType: string }[]>([]);
  const [logoImage, setLogoImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const PRESET_COLORS = [
    { name: 'Institutional', value: 'Blue and White' },
    { name: 'Navy & Gold', value: 'Navy Blue and Gold' },
    { name: 'Professional Grey', value: 'Dark Grey and Silver' },
    { name: 'Academic Green', value: 'Deep Green and White' },
  ];

  const TEXT_POSITIONS: TextPosition[] = [
    'Top (above images)',
    'Bottom (below images)',
    'Left of images',
    'Right of images',
    'Overlay - Left',
    'Overlay - Center',
    'Overlay - Right'
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'logo') => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files) as File[];
    const converted = await Promise.all(
      fileArray.map(async (file) => {
        return new Promise<{ data: string; mimeType: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ data: base64, mimeType: file.type });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    if (type === 'user') {
      setUserImages((prev) => [...prev, ...converted]);
    } else {
      setLogoImage(converted[0]);
    }
  };

  const removeUserImage = (index: number) => {
    setUserImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please provide a description of the flyer.");
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateIUGFlyer(
        description,
        userImages,
        logoImage,
        additionalPhones,
        language,
        backgroundColor,
        textPosition
      );
      setGeneratedImage(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while generating the flyer. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `IUG_Flyer_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-12 bg-[#fdfdfd]">
      {isGenerating && <LoadingOverlay />}
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#0047AB] p-2 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">IUG Flyer AI</h1>
              <p className="text-xs font-semibold text-[#0047AB] uppercase tracking-widest">PRECISION MODE</p>
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !description}
            className="hidden md:flex items-center gap-2 bg-[#0047AB] hover:bg-[#003580] disabled:bg-slate-300 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md active:scale-95"
          >
            Generate Flyer
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-slate-100 flex items-center justify-center rounded-full text-xs font-bold">1</span>
              Configuration
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Language</label>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setLanguage('French')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${language === 'French' ? 'bg-white shadow-sm text-[#0047AB]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Français
                    </button>
                    <button
                      onClick={() => setLanguage('English')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${language === 'English' ? 'bg-white shadow-sm text-[#0047AB]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      English
                    </button>
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-600 mb-2">Text Position</label>
                   <select 
                    value={textPosition}
                    onChange={(e) => setTextPosition(e.target.value as TextPosition)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-[#0047AB] outline-none"
                   >
                     {TEXT_POSITIONS.map(pos => (
                       <option key={pos} value={pos}>{pos}</option>
                     ))}
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Background Style / Colors</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setBackgroundColor(preset.value)}
                      className={`text-xs px-3 py-2 rounded-lg border transition-all ${backgroundColor === preset.value ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="Ex: Blue and Gold, Deep Navy..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0047AB] transition-all outline-none text-slate-700 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Flyer Content / Goal</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'French' ? "Ex: Admissions ouvertes 2024-2025, Master en Gestion..." : "e.g., Admissions Open 2024-2025, Master's in Management..."}
                  className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-all outline-none resize-none text-slate-700 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Extra Phone Numbers (Optional)</label>
                <input
                  type="text"
                  value={additionalPhones}
                  onChange={(e) => setAdditionalPhones(e.target.value)}
                  placeholder="+229..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0047AB] transition-all outline-none text-slate-700 bg-slate-50"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-slate-100 flex items-center justify-center rounded-full text-xs font-bold">2</span>
              Visual Assets
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Official University Logo</label>
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer text-center ${logoImage ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-[#0047AB] hover:bg-slate-50'}`}
                >
                  {logoImage ? (
                    <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Logo Registered
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      <span className="text-[#0047AB] font-semibold">Upload IUG Logo</span>
                    </div>
                  )}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">User Images (Exactly {userImages.length} to use)</label>
                <div className="grid grid-cols-3 gap-3">
                  {userImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img src={`data:${img.mimeType};base64,${img.data}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeUserImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-[#0047AB] hover:bg-blue-50 flex flex-col items-center justify-center text-slate-400 transition-all"
                  >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-xs font-medium">Add Photo</span>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'user')} />
                <p className="text-[10px] text-slate-400 mt-2 italic">* The generator will use ONLY these images.</p>
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !description}
            className="w-full md:hidden items-center justify-center gap-2 bg-[#0047AB] hover:bg-[#003580] disabled:bg-slate-300 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg"
          >
            {isGenerating ? 'Generating...' : 'Generate Flyer'}
          </button>
        </div>

        {/* Output Section */}
        <div className="relative">
          <div className={`sticky top-24 transition-all duration-500 ${generatedImage ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-4'}`}>
            <div className="bg-slate-100 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex items-center justify-center">
              {generatedImage ? (
                <img src={generatedImage} alt="Generated Flyer" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h3 className="text-slate-500 font-semibold mb-1">Canvas Preview</h3>
                  <p className="text-slate-400 text-sm">Your professional university flyer will be rendered here.</p>
                </div>
              )}
            </div>

            {generatedImage && (
              <div className="mt-6 flex gap-4">
                <button 
                  onClick={downloadImage}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download PNG
                </button>
                <button 
                  onClick={() => setGeneratedImage(null)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:bg-white transition-all text-slate-400 hover:text-red-500"
                  title="Discard"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto px-4 mt-20 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Institut Universitaire La Grâce (IUG). Strictly Institutional.</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <a href="https://www.iuguniversity.org" target="_blank" className="hover:text-[#0047AB] transition-colors">www.iuguniversity.org</a>
          <span className="text-slate-300">•</span>
          <span>info@iuguniversity.org</span>
        </div>
      </footer>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;
