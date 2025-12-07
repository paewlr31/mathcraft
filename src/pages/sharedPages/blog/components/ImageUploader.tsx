// src/pages/sharedPages/blog/components/ImageUploader.tsx
import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

type Props = {
  onUpload: (url: string) => void;
  currentImage: string | null;
};

export default function ImageUploader({ onUpload, currentImage }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `blog-thumbnails/${fileName}`;

    setUploading(true);

    const { error } = await supabase.storage
      .from('images') // Upewnij się, że masz bucket "images" w Supabase Storage
      .upload(filePath, file);

    if (error) {
      alert('Błąd uploadu: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    onUpload(publicUrl);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="relative inline-block">
          <img src={currentImage} alt="Miniaturka" className="w-full max-w-md h-64 object-cover rounded-lg shadow-lg" />
          <button
            onClick={() => onUpload('')}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
          >
            Usuń
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-400 rounded-xl p-12 text-center hover:border-purple-500 transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id="thumbnail-upload"
          />
          <label htmlFor="thumbnail-upload" className="cursor-pointer">
            {uploading ? (
              <p className="text-purple-600">Uploaduję...</p>
            ) : (
              <>
                <div className="text-6xl mb-4">Zdjęcie</div>
                <p className="text-gray-600">Kliknij aby dodać zdjęcie główne</p>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG do 5MB</p>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}