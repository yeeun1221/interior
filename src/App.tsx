import { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { CompareSlider } from './components/CompareSlider';
import { StyleCarousel, STYLES } from './components/StyleCarousel';
import { ChatInterface, Message } from './components/ChatInterface';
import { generateRoomDesign, ai, chatModel, chatSystemInstruction, generateNewDesignDecl } from './lib/gemini';
import { Loader2, RefreshCcw } from 'lucide-react';

type Design = {
  id: string;
  styleId: string;
  imageUrl: string;
  prompt: string;
};

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  const activeDesign = designs.find(d => d.id === activeDesignId);

  const handleUpload = (base64: string, mimeType: string) => {
    setOriginalImage(`data:${mimeType};base64,${base64}`);
    setOriginalMimeType(mimeType);
    setDesigns([]);
    setActiveDesignId(null);
    setDisplayMessages([]);
    setChatHistory([]);
  };

  const handleSelectStyle = async (styleId: string) => {
    const existingDesign = designs.find(d => d.styleId === styleId);
    if (existingDesign) {
      setActiveDesignId(existingDesign.id);
      return;
    }

    if (!originalImage) return;

    const styleDef = STYLES.find(s => s.id === styleId);
    if (!styleDef) return;

    setIsGenerating(true);
    try {
      const base64Data = originalImage.split(',')[1];
      const newImageUrl = await generateRoomDesign(base64Data, originalMimeType, styleDef.prompt);
      
      const newDesign: Design = {
        id: Date.now().toString(),
        styleId: styleId,
        imageUrl: newImageUrl,
        prompt: styleDef.prompt
      };
      
      setDesigns(prev => [...prev, newDesign]);
      setActiveDesignId(newDesign.id);
    } catch (error) {
      console.error("Failed to generate design:", error);
      alert("Failed to generate design. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setDisplayMessages(prev => [...prev, userMsg]);
    setIsChatTyping(true);

    const newHistory = [...chatHistory, { role: 'user', parts: [{ text }] }];

    try {
      let currentHistory = [...newHistory];
      let finalResponseText = '';
      
      // We will loop in case of function calls
      let keepCalling = true;
      let maxLoops = 3;
      let loopCount = 0;

      while (keepCalling && loopCount < maxLoops) {
        loopCount++;
        
        const response = await ai.models.generateContent({
          model: chatModel,
          contents: currentHistory,
          config: {
            systemInstruction: chatSystemInstruction + (activeDesign ? `\n\nThe user is currently looking at a design generated with this prompt: "${activeDesign.prompt}".` : ''),
            tools: [
              { googleSearch: {} },
              { functionDeclarations: [generateNewDesignDecl] }
            ],
            toolConfig: { includeServerSideToolInvocations: true }
          }
        });

        const responseContent = response.candidates?.[0]?.content;
        if (!responseContent) break;

        currentHistory.push(responseContent);

        if (response.functionCalls && response.functionCalls.length > 0) {
          const call = response.functionCalls[0];
          
          if (call.name === 'generateNewDesign') {
            const args = call.args as { prompt: string };
            
            // Show generating message in UI
            const genMsgId = Date.now().toString();
            setDisplayMessages(prev => [...prev, { id: genMsgId, role: 'model', text: '', isGeneratingImage: true }]);
            
            try {
              const base64Data = originalImage!.split(',')[1];
              const newImageUrl = await generateRoomDesign(base64Data, originalMimeType, args.prompt);
              
              const newDesign: Design = {
                id: Date.now().toString(),
                styleId: 'custom',
                imageUrl: newImageUrl,
                prompt: args.prompt
              };
              
              setDesigns(prev => [...prev, newDesign]);
              setActiveDesignId(newDesign.id);
              
              // Remove the generating message
              setDisplayMessages(prev => prev.filter(m => m.id !== genMsgId));
              
              currentHistory.push({
                role: 'user',
                parts: [{
                  functionResponse: {
                    name: 'generateNewDesign',
                    response: { success: true, message: "New design generated and displayed to the user." }
                  }
                }]
              });
            } catch (err) {
              console.error(err);
              setDisplayMessages(prev => prev.filter(m => m.id !== genMsgId));
              currentHistory.push({
                role: 'user',
                parts: [{
                  functionResponse: {
                    name: 'generateNewDesign',
                    response: { success: false, error: "Failed to generate image." }
                  }
                }]
              });
            }
          }
        } else {
          // No function call, just text
          finalResponseText = response.text || '';
          keepCalling = false;
        }
      }

      if (finalResponseText) {
        setDisplayMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: finalResponseText }]);
      }
      
      setChatHistory(currentHistory);

    } catch (error) {
      console.error("Chat error:", error);
      setDisplayMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error while processing your request." }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setDesigns([]);
    setActiveDesignId(null);
    setDisplayMessages([]);
    setChatHistory([]);
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-semibold tracking-tight">AI Interior Consultant</h1>
          {originalImage && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-ink transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        {!originalImage ? (
          <div className="max-w-2xl mx-auto mt-20">
            <ImageUploader onUpload={handleUpload} />
          </div>
        ) : (
          <div className="flex flex-col gap-12 max-w-4xl mx-auto">
            
            {/* Top: Visualization */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-serif font-medium">1. Choose a Style</h2>
                <StyleCarousel 
                  activeStyleId={activeDesign?.styleId || null} 
                  onSelectStyle={handleSelectStyle} 
                />
              </div>

              <div className="relative">
                {isGenerating ? (
                  <div className="w-full aspect-[4/3] bg-gray-100 rounded-[32px] flex flex-col items-center justify-center text-accent">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-medium">Reimagining your space...</p>
                  </div>
                ) : activeDesign ? (
                  <CompareSlider 
                    original={originalImage} 
                    generated={activeDesign.imageUrl} 
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-gray-100 rounded-[32px] flex items-center justify-center">
                    <img src={originalImage} className="w-full h-full object-cover rounded-[32px] opacity-50" alt="Original" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full font-medium text-gray-600 shadow-sm">
                        Select a style above to begin
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Chat */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-serif font-medium">2. Refine & Shop</h2>
              <ChatInterface 
                messages={displayMessages} 
                onSendMessage={handleSendMessage} 
                isTyping={isChatTyping} 
              />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
