/** File type helpers */


export const ACCEPTED_TYPES = [
  "application/pdf",
];


export const ACCEPTED_EXTENSIONS = [
  ".pdf",
];


export function getFileExtension(
  filename: string
): string {

  const lastDot =
    filename.lastIndexOf(".");


  if (lastDot === -1) {
    return "";
  }


  return filename
    .slice(lastDot)
    .toLowerCase();

}


export function isAcceptedFile(
  file: File
): boolean {

  return (
    ACCEPTED_TYPES.includes(
      file.type
    ) ||
    ACCEPTED_EXTENSIONS.includes(
      getFileExtension(
        file.name
      )
    )
  );

}


export function getFileIcon(
  filename: string
): "pdf" | "doc" | "txt" | "md" {

  const extension =
    getFileExtension(
      filename
    );


  if (
    extension === ".pdf"
  ) {

    return "pdf";

  }


  if (
    extension === ".doc" ||
    extension === ".docx"
  ) {

    return "doc";

  }


  if (
    extension === ".md"
  ) {

    return "md";

  }


  return "txt";

}


export function generateId(): string {

  return (
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`
  );

}