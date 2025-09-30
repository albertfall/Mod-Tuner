
export interface UploadedImage {
  file: File;
  url: string;
  base64: string;
  mimeType: string;
}

export interface AppliedMod {
  part: string;
  prompt: string;
  cost: number;
}
