/** File type helpers */

export const ACCEPTED_TYPES = ['application/pdf', 'text/plain', 'text/markdown', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const ACCEPTED_EXTENSIONS = ['.pdf', '.txt', '.md', '.doc', '.docx'];

export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

export function isAcceptedFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type) ||
    ACCEPTED_EXTENSIONS.includes(getFileExtension(file.name));
}

export function getFileIcon(filename: string): 'pdf' | 'doc' | 'txt' | 'md' {
  const ext = getFileExtension(filename);
  if (ext === '.pdf') return 'pdf';
  if (ext === '.doc' || ext === '.docx') return 'doc';
  if (ext === '.md') return 'md';
  return 'txt';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
