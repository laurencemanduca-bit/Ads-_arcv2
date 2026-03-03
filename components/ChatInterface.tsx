
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, MessageSquare, Plus, Trash2, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Chat, GenerateContentResponse } from '@google/genai';
import { createAdSpecialistChat, ensureApiKey } from '../services/gemini';

interface Attachment {
  type: 'image' | 'file';
  mimeType: string;
  data: string; // Base64
  name: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  attachment?: Attachment;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "I'm your Elite Ad Strategist. Upload a past campaign report (PDF), an ad creative (Image), or a dashboard screenshot. I'll analyze it and generate optimized improvements." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size (e.g. 4MB) for browser performance
    if (file.size > 4 * 1024 * 1024) {
      alert("File is too large. Please upload files under 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      const isImage = file.type.startsWith('image/');
      
      setAttachment({
        type: isImage ? 'image' : 'file',
        mimeType: file.type,
        data: base64Data,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachment) || !chatSessionRef.current || isLoading) return;

    const currentAttachment = attachment;
    const currentInput = input;

    // Construct user message for UI
    const userMsg: Message = { 
      role: 'user', 
      text: currentInput,
      attachment: currentAttachment ? { ...currentAttachment } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
        await ensureApiKey();
        
        // Optimistic UI for model response
        setMessages(prev => [...prev, { role: 'model', text: '' }]);
        
        let result;
        
        if (currentAttachment) {
            // Multimodal Request
            // Gemini expects parts array for mixed content
            const parts: any[] = [];
            
            // Add file part
            parts.push({
                inlineData: {
                    mimeType: currentAttachment.mimeType,
                    data: currentAttachment.data
                }
            });

            // Add text part if exists, otherwise add a default prompt for the file
            if (currentInput.trim()) {
                parts.push({ text: currentInput });
            } else {
                parts.push({ text: "Analyze this file and provide strategic recommendations." });
            }

            // Send parts
            result = await chatSessionRef.current.sendMessageStream({ message: parts as any });
        } else {
            // Text-only Request
            result = await chatSessionRef.current.sendMessageStream({ message: currentInput });
        }
        
        let fullText = '';
        for await (const chunk of result) {
            const c = chunk as GenerateContentResponse;
            const text = c.text || '';
            fullText += text;
            
            setMessages(prev => {
                const newArr = [...prev];
                const lastMsg = newArr[newArr.length - 1];
                if (lastMsg.role === 'model') {
                    lastMsg.text = fullText;
                }
                return newArr;
            });
        }
    } catch (error) {
        console.error("Chat Error", error);
        setMessages(prev => [...prev, { role: 'model', text: "I encountered an error processing that request. If you sent a file, it might be too complex or an unsupported format." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleReset = () => {
      setMessages([{ role: 'model', text: "Session reset. I'm ready to analyze your new campaign assets." }]);
      setAttachment(null);
      chatSessionRef.current = createAdSpecialistChat();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up ring-8 ring-slate-50 relative">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg leading-tight">Elite Ad Strategist</h3>
                    <p className="text-blue-200 text-xs font-medium">Multimodal Campaign Analysis</p>
                </div>
            </div>
            <button onClick={handleReset} className="text-slate-400 hover:text-white p-2 transition" title="Reset Chat">
                <Trash2 className="w-5 h-5" />
            </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-blue-100'}`}>
                        {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-blue-600" />}
                    </div>
                    
                    <div className="flex flex-col gap-2 max-w-[80%]">
                        {/* Attachment Display */}
                        {msg.attachment && (
                            <div className={`rounded-xl overflow-hidden border ${msg.role === 'user' ? 'border-slate-300 ml-auto' : 'border-slate-200'}`}>
                                {msg.attachment.type === 'image' ? (
                                    <img 
                                        src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} 
                                        alt="Uploaded content" 
                                        className="max-w-xs max-h-60 object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 bg-white p-4 max-w-xs">
                                        <div className="bg-red-50 p-2 rounded-lg text-red-500">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-bold text-slate-700 truncate">{msg.attachment.name}</div>
                                            <div className="text-xs text-slate-400 uppercase">Document</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Text Message */}
                        {(msg.text || isLoading && idx === messages.length - 1) && (
                            <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === 'user' 
                                    ? 'bg-slate-900 text-white shadow-md rounded-tr-sm' 
                                    : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm'
                            }`}>
                                {msg.text || (isLoading && idx === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : '')}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 relative">
            
            {/* Attachment Preview */}
            {attachment && (
                <div className="absolute bottom-full left-4 mb-2 bg-white border border-slate-200 p-2 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-up z-10">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center relative">
                        {attachment.type === 'image' ? (
                            <img src={`data:${attachment.mimeType};base64,${attachment.data}`} className="w-full h-full object-cover" />
                        ) : (
                            <FileText className="w-5 h-5 text-slate-500" />
                        )}
                    </div>
                    <div className="max-w-[150px]">
                        <div className="text-xs font-bold text-slate-700 truncate">{attachment.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase">Ready to send</div>
                    </div>
                    <button onClick={handleRemoveAttachment} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex gap-3">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                />
                
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 p-4 rounded-xl transition flex items-center justify-center"
                    title="Upload Image or PDF"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Upload a campaign screenshot, PDF, or ask a question..."
                        className="w-full pl-5 pr-12 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-medium text-slate-800"
                        disabled={isLoading}
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={(!input.trim() && !attachment) || isLoading}
                    className="bg-blue-600 text-white p-4 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 disabled:scale-100"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </form>
            <div className="text-center mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Supports Images (PNG, JPG) & PDFs. AI verify results.
            </div>
        </div>
    </div>
  );
};

export default ChatInterface;
