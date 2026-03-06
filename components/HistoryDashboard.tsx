
import React, { useState, useEffect } from 'react';
import { ClientRecord, ProjectFile, TeamMember } from '../types';
import { getClients, addClient, deleteClient, updateClient, getFiles, deleteFile, updateFile, getTeamMembers, addTeamMember, deleteTeamMember, uploadProjectFile } from '../services/firebase';
import { Users, Briefcase, Folder, Trash2, Plus, LayoutGrid, FileText, Loader2, X, AlertCircle, Building, Search, UserPlus, Image as ImageIcon, Activity, Filter, Upload, DownloadCloud, File, Sparkles, Lock, ChevronRight, ArrowLeft, Edit, Check, MoreVertical } from 'lucide-react';

interface HistoryDashboardProps {
  onLoadCampaign: (campaign: any) => void;
  onLoadAudit: (audit: any) => void;
}

// --- Generic Modal Component ---
const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Toast Component ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[200] animate-fade-in-up border ${type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-red-50 text-red-700 border-red-100'}`}>
      {type === 'success' ? <Check className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

// --- File Type Icon Helper ---
const FileTypeIcon = ({ type }: { type: string }) => {
    if (type.includes('google')) return <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm"><Search className="w-5 h-5" /></div>;
    if (type.includes('meta')) return <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm"><LayoutGrid className="w-5 h-5" /></div>;
    if (type === 'audit') return <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl shadow-sm"><Activity className="w-5 h-5" /></div>;
    if (type.includes('image')) return <div className="p-2.5 bg-pink-100 text-pink-600 rounded-xl shadow-sm"><ImageIcon className="w-5 h-5" /></div>;
    if (type.includes('video')) return <div className="p-2.5 bg-red-100 text-red-600 rounded-xl shadow-sm"><FileText className="w-5 h-5" /></div>;
    return <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl shadow-sm"><File className="w-5 h-5" /></div>;
};

const InternalDashboard: React.FC<HistoryDashboardProps> = ({ onLoadCampaign, onLoadAudit }) => {
  // Navigation State
  const [view, setView] = useState<'overview' | 'folder'>('overview');
  const [activeTab, setActiveTab] = useState<'portfolios' | 'team'>('portfolios'); // Sub-tabs in overview
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  // UI State
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalState, setModalState] = useState<{ type: 'client' | 'team' | 'upload' | 'upgrade' | 'rename' | null, targetId?: string, targetType?: 'client' | 'file', currentName?: string }>({ type: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Forms
  const [formData, setFormData] = useState({ name: '', role: '', email: '', industry: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const FREE_PLAN_LIMIT = 5;
  const isLimitReached = files.length >= FREE_PLAN_LIMIT;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
      setLoading(true);
      try {
          const [cData, fData, tData] = await Promise.all([getClients(), getFiles(), getTeamMembers()]);
          setClients(cData as ClientRecord[]);
          setFiles(fData as ProjectFile[]);
          setTeam(tData as TeamMember[]);
      } catch (e) {
          console.error(e);
          showToast("Failed to sync data", 'error');
      }
      setLoading(false);
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  // --- Actions ---

  const handleCreateClient = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          const newClient = await addClient(formData.name, formData.industry || 'General');
          setClients([newClient as ClientRecord, ...clients]);
          setModalState({ type: null });
          setFormData({ name: '', role: '', email: '', industry: '' });
          showToast("Client Portfolio Created", 'success');
      } catch (e) { showToast("Failed to create client", 'error'); }
      setIsSubmitting(false);
  };

  const handleRename = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!modalState.targetId || !formData.name.trim()) return;
      setIsSubmitting(true);
      try {
          if (modalState.targetType === 'client') {
              // Update client name in state (optimistic)
              setClients(prev => prev.map(c => c.id === modalState.targetId ? { ...c, name: formData.name } : c));
              await updateClient(modalState.targetId, { name: formData.name });
              showToast("Client Renamed", 'success');
          } else if (modalState.targetType === 'file') {
              // Update file name in state (optimistic)
              setFiles(prev => prev.map(f => f.id === modalState.targetId ? { ...f, name: formData.name } : f));
              await updateFile(modalState.targetId, { name: formData.name });
              showToast("File Renamed", 'success');
          }
          setModalState({ type: null });
          setFormData({ name: '', role: '', email: '', industry: '' });
      } catch (e) {
          showToast("Failed to rename", 'error');
      }
      setIsSubmitting(false);
  };

  const handleDeleteClient = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm("Delete this client and all associated files?")) return;
      
      const clientFiles = files.filter(f => f.folderId === id);
      const previousClients = [...clients];
      const previousFiles = [...files];

      // Optimistic delete
      setClients(prev => prev.filter(c => c.id !== id));
      setFiles(prev => prev.filter(f => f.folderId !== id));
      
      try {
          await deleteClient(id);
          await Promise.all(clientFiles.map(f => deleteFile(f.id, f.storagePath)));
          showToast("Client Deleted", 'success');
      } catch (err) {
          console.error("Failed to delete client:", err);
          setClients(previousClients);
          setFiles(previousFiles);
          showToast("Failed to delete client", 'error');
      }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          const newMember = await addTeamMember(formData.name, formData.role || 'Viewer', formData.email);
          setTeam([newMember as TeamMember, ...team]);
          setModalState({ type: null });
          setFormData({ name: '', role: '', email: '', industry: '' });
          showToast("Invitation Sent", 'success');
      } catch (e) { showToast("Failed to add member", 'error'); }
      setIsSubmitting(false);
  };

  const handleDeleteTeam = async (id: string) => {
      setTeam(prev => prev.filter(t => t.id !== id));
      await deleteTeamMember(id);
      showToast("Member Removed", 'success');
  };

  const handleDeleteFile = async (file: ProjectFile, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm("Delete this file permanently?")) return;
      
      // Optimistic update
      const previousFiles = [...files];
      setFiles(prev => prev.filter(f => f.id !== file.id));
      
      try {
          await deleteFile(file.id, file.storagePath);
          showToast("File Deleted", 'success');
      } catch (err) {
          console.error("Failed to delete file:", err);
          setFiles(previousFiles); // Revert on failure
          showToast("Failed to delete file", 'error');
      }
  };

  const handleUpload = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!uploadFile) return;
      setIsSubmitting(true);
      try {
          const newFile = await uploadProjectFile(uploadFile, currentFolderId || undefined);
          setFiles([newFile as ProjectFile, ...files]);
          setModalState({ type: null });
          setUploadFile(null);
          showToast("Asset Uploaded Successfully", 'success');
      } catch (e) { showToast("Upload failed", 'error'); }
      setIsSubmitting(false);
  };

  const handleOpenFolder = (clientId: string) => {
      setCurrentFolderId(clientId);
      setView('folder');
  };

  // --- Render Helpers ---

  const currentFolder = currentFolderId ? clients.find(c => c.id === currentFolderId) : null;
  const filteredFiles = currentFolderId 
      ? files.filter(f => f.folderId === currentFolderId) 
      : files; // Show all if no folder (though typically we filter in folder view)

  // Search filtering
  const displayFiles = filteredFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="animate-fade-in relative min-h-[600px]">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

        {/* --- VIEW: OVERVIEW --- */}
        {view === 'overview' && (
            <>
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Agency Dashboard</h2>
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                            <button 
                                onClick={() => setActiveTab('portfolios')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'portfolios' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <Briefcase className="w-4 h-4" /> Portfolios
                            </button>
                            <button 
                                onClick={() => setActiveTab('team')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'team' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <Users className="w-4 h-4" /> Team
                            </button>
                        </div>
                    </div>
                    
                    {activeTab === 'portfolios' && (
                        <button onClick={() => setModalState({ type: 'client' })} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition flex items-center gap-2 hover:scale-105 transform">
                            <Plus className="w-4 h-4" /> New Client
                        </button>
                    )}
                    {activeTab === 'team' && (
                        <button onClick={() => setModalState({ type: 'team' })} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-purple-700 transition flex items-center gap-2 hover:scale-105 transform">
                            <UserPlus className="w-4 h-4" /> Invite Member
                        </button>
                    )}
                </div>

                {activeTab === 'portfolios' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Summary Stats Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10"><LayoutGrid className="w-32 h-32" /></div>
                            <div>
                                <div className="text-blue-200 font-bold uppercase text-xs tracking-widest mb-1">Total Assets</div>
                                <div className="text-4xl font-black">{files.length} <span className="text-lg text-blue-300 font-medium">/ {FREE_PLAN_LIMIT}</span></div>
                            </div>
                            
                            <div className="mt-4">
                                <div className="w-full bg-blue-900/30 rounded-full h-2 mb-2">
                                    <div className={`h-2 rounded-full transition-all duration-500 ${isLimitReached ? 'bg-red-400' : 'bg-blue-400'}`} style={{ width: `${Math.min((files.length / FREE_PLAN_LIMIT) * 100, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-blue-200">
                                    <span>{isLimitReached ? 'Limit Reached' : 'Free Plan Usage'}</span>
                                    {isLimitReached && <button onClick={() => showToast("Upgrade to Pro for unlimited assets", 'error')} className="text-white hover:underline">Upgrade Now</button>}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10">
                                <button onClick={() => showToast("Upgrade flow coming soon", 'success')} className="w-full py-2 bg-white text-blue-700 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-blue-50 transition shadow-sm flex items-center justify-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Upgrade to Pro
                                </button>
                            </div>
                        </div>

                        {clients.map(client => {
                            const clientFileCount = files.filter(f => f.folderId === client.id).length;
                            return (
                                <div key={client.id} onClick={() => handleOpenFolder(client.id)} className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer relative flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-bold text-slate-700 shadow-sm group-hover:scale-110 transition-transform">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, name: client.name }); setModalState({ type: 'rename', targetId: client.id, targetType: 'client', currentName: client.name }); }} className="text-slate-300 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={(e) => handleDeleteClient(client.id, e)} className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-1">{client.name}</h3>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-6">{client.industry}</div>
                                    
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Folder className="w-3 h-3" /> {clientFileCount} Files
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                            Open Folder <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <button onClick={() => setModalState({ type: 'client' })} className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all gap-3 min-h-[200px]">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-sm">Add New Client</span>
                        </button>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {team.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{member.name}</h4>
                                        <div className="text-sm text-slate-500">{member.email}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <div className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-1 inline-block tracking-widest">{member.role}</div>
                                     <button onClick={() => handleDeleteTeam(member.id)} className="block ml-auto text-slate-300 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}

        {/* --- VIEW: FOLDER --- */}
        {view === 'folder' && currentFolder && (
            <div className="animate-fade-in-right">
                <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => setView('overview')} className="text-slate-400 hover:text-slate-700 transition flex items-center gap-1 text-sm font-bold uppercase tracking-wide">
                        <ArrowLeft className="w-4 h-4" /> Portfolios
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 font-bold">{currentFolder.name}</span>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                    {/* Folder Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl font-bold text-slate-800 shadow-sm">
                                {currentFolder.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-900">{currentFolder.name}</h1>
                                <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                    <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {currentFolder.industry}</span>
                                    <span>•</span>
                                    <span>{filteredFiles.length} Assets</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search files..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white"
                                />
                            </div>
                            <button 
                                onClick={() => isLimitReached ? showToast("Free plan limit reached. Upgrade to upload more.", 'error') : setModalState({ type: 'upload' })} 
                                className={`bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition flex items-center gap-2 ${isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Upload className="w-4 h-4" /> Upload
                            </button>
                        </div>
                    </div>

                    {/* File List */}
                    <div className="flex-1 p-6">
                        {displayFiles.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 text-slate-300">
                                    <Folder className="w-10 h-10" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2">This folder is empty</h3>
                                <p className="text-slate-500 text-sm mb-6 max-w-xs">Start by generating a new campaign or uploading existing assets.</p>
                                <button onClick={() => isLimitReached ? showToast("Free plan limit reached", 'error') : setModalState({ type: 'upload' })} className={`text-blue-600 font-bold text-sm hover:underline ${isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}`}>Upload First Asset</button>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                                        <tr>
                                            <th className="px-6 py-4 pl-8">Asset Name</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right pr-8">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {displayFiles.map(file => (
                                            <tr key={file.id} className="hover:bg-blue-50/30 transition group">
                                                <td className="px-6 py-4 pl-8">
                                                    <div className="flex items-center gap-4">
                                                        <FileTypeIcon type={file.type} />
                                                        <div>
                                                            <div className="font-bold text-slate-900">{file.name}</div>
                                                            <div className="text-xs text-slate-400 font-mono mt-0.5">{new Date(file.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wide">{file.type.replace('campaign_', '').replace('_', ' ')}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Active</span>
                                                </td>
                                                <td className="px-6 py-4 text-right pr-8">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!file.downloadUrl ? (
                                                            <button 
                                                                onClick={() => onLoadCampaign(file)}
                                                                className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition shadow-sm"
                                                            >
                                                                <Edit className="w-3 h-3" /> Edit
                                                            </button>
                                                        ) : (
                                                            <a 
                                                                href={file.downloadUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition shadow-sm"
                                                            >
                                                                <DownloadCloud className="w-3 h-3" /> Download
                                                            </a>
                                                        )}
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, name: file.name }); setModalState({ type: 'rename', targetId: file.id, targetType: 'file', currentName: file.name }); }}
                                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                            title="Rename"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleDeleteFile(file, e)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- MODALS --- */}

        <Modal isOpen={modalState.type === 'client'} onClose={() => setModalState({ type: null })} title="New Client Portfolio">
            <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Business Name</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required autoFocus placeholder="e.g. Acme Corp" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Industry</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                        value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} placeholder="e.g. Retail" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition mt-2 flex justify-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Portfolio"}
                </button>
            </form>
        </Modal>

        <Modal isOpen={modalState.type === 'team'} onClose={() => setModalState({ type: null })} title="Invite Team Member">
            <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                    <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-white" 
                        value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                        <option value="Viewer">Viewer</option>
                        <option value="Editor">Editor</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition mt-2 flex justify-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Invite"}
                </button>
            </form>
        </Modal>

        <Modal isOpen={modalState.type === 'upload'} onClose={() => setModalState({ type: null })} title="Upload Asset">
            <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Target Folder</label>
                    <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center gap-2">
                        <Folder className="w-4 h-4 text-slate-400" />
                        {currentFolder ? currentFolder.name : "Unassigned"}
                    </div>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    {uploadFile ? <div className="font-bold text-slate-800">{uploadFile.name}</div> : <div className="text-sm text-slate-500">Click to Browse</div>}
                </div>
                <button type="submit" disabled={isSubmitting || !uploadFile} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition mt-2 flex justify-center disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Upload"}
                </button>
            </form>
        </Modal>

        <Modal isOpen={modalState.type === 'rename'} onClose={() => setModalState({ type: null })} title={`Rename ${modalState.targetType === 'client' ? 'Client' : 'Asset'}`}>
            <form onSubmit={handleRename} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">New Name</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required autoFocus />
                </div>
                <button type="submit" disabled={isSubmitting || !formData.name.trim() || formData.name === modalState.currentName} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition mt-2 flex justify-center disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </button>
            </form>
        </Modal>

    </div>
  );
};

export default InternalDashboard;
