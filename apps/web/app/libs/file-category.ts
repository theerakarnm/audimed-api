export type BackendFileType =
  | 'DOCUMENT'
  | 'SHEET'
  | 'PRESENTATION'
  | 'TEXT'
  | 'CODE'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'OTHER'

import type { FileCategory } from "~/types/file-system";

export function mapFileTypeToCategory(type: BackendFileType): FileCategory {
  switch (type) {
    case 'IMAGE':
      return 'images';
    case 'VIDEO':
      return 'videos';
    case 'AUDIO':
      return 'audio';
    case 'DOCUMENT':
    case 'SHEET':
    case 'PRESENTATION':
    case 'TEXT':
    case 'CODE':
      return 'documents';
    case 'OTHER':
    default:
      return 'archives';
  }
}
