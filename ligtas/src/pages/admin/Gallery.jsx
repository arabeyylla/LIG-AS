import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Image, Plus, Trash2, Loader2, Upload, X, ImagePlus, Eye } from 'lucide-react';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchImages(); }, []);

  async function fetchImages() {
    if (!supabase) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      console.error('Failed to fetch gallery:', err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB.'); return; }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile || !supabase) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, selectedFile);
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      // Save metadata to DB
      const { error: insertError } = await supabase.from('gallery').insert({
        url: publicUrl,
        caption: caption.trim() || null,
        file_name: selectedFile.name,
        storage_path: fileName,
      });
      if (insertError) throw insertError;

      setSelectedFile(null);
      setPreview(null);
      setCaption('');
      setShowUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchImages();
    } catch (err) {
      console.error('Upload failed:', err.message);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(image) {
    if (!confirm(`Delete "${image.caption || image.file_name}"?`)) return;
    setDeletingId(image.id);
    try {
      // Delete from storage
      if (image.storage_path) {
        await supabase.storage.from('gallery').remove([image.storage_path]);
      }
      // Delete from DB
      const { error } = await supabase.from('gallery').delete().eq('id', image.id);
      if (error) throw error;
      setImages(prev => prev.filter(i => i.id !== image.id));
    } catch (err) {
      console.error('Delete failed:', err.message);
      alert('Delete failed: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  function cancelUpload() {
    setShowUpload(false); setSelectedFile(null); setPreview(null); setCaption('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter">Gallery</h1>
            <p className="text-slate-400 font-bold mt-2">Manage game screenshots displayed on the public site.</p>
          </div>
          {!showUpload && (
            <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20">
              <Plus size={18} /> Upload Image
            </button>
          )}
        </div>

        {showUpload && (
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3"><ImagePlus className="text-orange-500" size={24} /><h3 className="font-black text-slate-800 text-lg">Upload New Image</h3></div>
              <button onClick={cancelUpload} className="text-slate-400 hover:text-slate-800 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image File</label>
                {preview ? (
                  <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setSelectedFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors"><X size={16} /></button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-all">
                    <Upload className="text-slate-300 mb-3" size={32} />
                    <p className="text-sm font-bold text-slate-400">Click to select an image</p>
                    <p className="text-xs text-slate-300 mt-1">JPG, PNG, WebP (max 5MB)</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Caption (optional)</label>
                <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Describe this screenshot..." className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-xl font-bold text-slate-800 outline-none transition-all" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading || !selectedFile} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button type="button" onClick={cancelUpload} className="px-8 py-3 border-2 border-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-20 text-slate-400 gap-4"><Loader2 className="animate-spin" size={40} /><p className="font-bold">Loading gallery...</p></div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <Image className="text-slate-200 mx-auto mb-4" size={48} />
            <p className="text-slate-400 font-bold">No images yet.</p>
            <p className="text-slate-300 text-sm mt-1">Upload game screenshots to display on the public site.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img src={image.url} alt={image.caption || 'Gallery image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <a href={image.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 bg-white/90 p-3 rounded-xl transition-opacity"><Eye size={18} className="text-slate-700" /></a>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{image.caption || image.file_name || 'Untitled'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{image.uploaded_at ? new Date(image.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}</p>
                  </div>
                  <button onClick={() => handleDelete(image)} disabled={deletingId === image.id} className="p-2.5 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0 ml-3" title="Delete">
                    {deletingId === image.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && images.length > 0 && <p className="text-center text-sm text-slate-400 mt-8">{images.length} image{images.length !== 1 ? 's' : ''} in gallery</p>}
      </div>
    </AdminLayout>
  );
}
