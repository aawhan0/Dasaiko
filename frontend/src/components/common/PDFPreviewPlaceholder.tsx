import { FileText, ExternalLink } from 'lucide-react';

interface PDFPreviewProps {
  documentName: string;
  pageNumber?: number;
}

export function PDFPreviewPlaceholder({ documentName, pageNumber }: PDFPreviewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 bg-surface rounded-xl border border-white/[0.06] p-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <FileText className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white mb-1 line-clamp-2">{documentName}</p>
        {pageNumber && (
          <p className="text-xs text-zinc-500 font-mono">Page {pageNumber}</p>
        )}
      </div>
      <p className="text-xs text-zinc-600 text-center max-w-48">
        PDF viewer will be available after connecting the FastAPI backend.
      </p>
      <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
        <ExternalLink className="w-3.5 h-3.5" />
        Open Document
      </button>
    </div>
  );
}
