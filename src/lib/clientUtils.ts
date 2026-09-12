/**
 * Client-side safe utilities for Client entity and normalization.
 * NO Mongoose or Node server dependencies here so it can be safely imported by 'use client' components.
 */

export function normalizeClientName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
