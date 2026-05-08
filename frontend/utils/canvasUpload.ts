/**
 * Canvas asset upload utilities.
 *
 * Handles client-side WebP conversion, Supabase Storage upload/list/delete
 * for canvas stickers and images in the `canvas-assets` bucket.
 */

import { createClient } from './supabase/client';
import { v4 as uuidv4 } from 'uuid';

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET = 'canvas-assets';
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const WEBP_QUALITY = 0.85;

export type AssetType = 'sticker' | 'image';

export interface UploadedAsset {
  /** Public URL of the uploaded asset. */
  url: string;
  /** Storage path within the bucket (e.g. "stickers/abc.webp"). */
  path: string;
}

export interface StoredAsset {
  name: string;
  path: string;
  url: string;
  /** Size in bytes (from Supabase metadata). */
  size: number;
  createdAt: string;
}

// ─── WebP Conversion ─────────────────────────────────────────────────────────

/**
 * Convert any browser-supported image File to a WebP Blob.
 * Uses an off-screen <canvas> to decode → re-encode.
 * Preserves alpha transparency for stickers (PNG → WebP with alpha).
 */
export async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas 2D context for WebP conversion.'));
        return;
      }

      // Transparent background (important for stickers)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('WebP conversion produced an empty blob.'));
            return;
          }
          resolve(blob);
        },
        'image/webp',
        WEBP_QUALITY,
      );
    };
    img.onerror = () => reject(new Error('Failed to load image for WebP conversion.'));
    img.src = URL.createObjectURL(file);
  });
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Validate, convert to WebP, and upload a canvas asset to Supabase Storage.
 *
 * @param file   The raw File from the file input.
 * @param type   'sticker' or 'image' — determines the storage folder.
 * @returns      The public URL and storage path of the uploaded asset.
 * @throws       If the file exceeds 1 MB or the upload fails.
 */
export async function uploadCanvasAsset(
  file: File,
  type: AssetType,
): Promise<UploadedAsset> {
  // ── Size gate (check original file first) ──
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum allowed size is 1 MB.`,
    );
  }

  // ── Convert to WebP ──
  const webpBlob = await convertToWebP(file);

  // ── Re-check size after conversion ──
  if (webpBlob.size > MAX_FILE_SIZE) {
    throw new Error(
      `Converted WebP is too large (${(webpBlob.size / 1024 / 1024).toFixed(2)} MB). Try a smaller or lower-resolution image.`,
    );
  }

  const folder = type === 'sticker' ? 'stickers' : 'images';
  const filename = `${uuidv4()}.webp`;
  const storagePath = `${folder}/${filename}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, webpBlob, {
      contentType: 'image/webp',
      cacheControl: '31536000', // 1 year (immutable asset)
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return {
    url: urlData.publicUrl,
    path: storagePath,
  };
}

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * List all uploaded assets of a given type from Supabase Storage.
 */
export async function listCanvasAssets(type: AssetType): Promise<StoredAsset[]> {
  const folder = type === 'sticker' ? 'stickers' : 'images';
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    throw new Error(`Failed to list ${type}s: ${error.message}`);
  }

  if (!data) return [];

  return data
    .filter((f) => f.name !== '.emptyFolderPlaceholder')
    .map((f) => {
      const path = `${folder}/${f.name}`;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return {
        name: f.name,
        path,
        url: urlData.publicUrl,
        size: f.metadata?.size ?? 0,
        createdAt: f.created_at ?? '',
      };
    });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete an asset from Supabase Storage by its storage path.
 */
export async function deleteCanvasAsset(path: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    throw new Error(`Failed to delete asset: ${error.message}`);
  }
}
