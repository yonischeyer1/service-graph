import { BadRequestException } from '@nestjs/common';

export function parseFilterIds(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const parts = (Array.isArray(raw) ? raw : [raw]).flatMap((value) => value.split(','));
  const ids: string[] = [];
  for (const part of parts) {
    const id = part.trim();
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

export function parseMaxRoutes(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === '') return undefined;
  if (!/^[1-9]\d*$/.test(raw.trim())) {
    throw new BadRequestException('maxRoutes must be a positive integer');
  }
  return Number(raw.trim());
}
