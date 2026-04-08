import { UploadCloud } from 'lucide-react';

export function ImageUploader({ onUpload }: { onUpload: (base64: string, mimeType: string) => void }) {
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      onUpload(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-[32px] p-16 flex flex-col items-center justify-center text-center hover:border-accent transition-colors cursor-pointer bg-white shadow-sm"
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
    >
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <UploadCloud className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-3xl font-serif font-medium mb-3">Upload your space</h3>
      <p className="text-gray-500 text-base max-w-md">
        Drag and drop a photo of your room, or click to browse. We'll reimagine it in seconds.
      </p>
    </div>
  );
}
