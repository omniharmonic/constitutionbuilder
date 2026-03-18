import { nanoid } from 'nanoid';
import slugify from 'slugify';

export function generateSessionSlug(name: string): string {
  const base = slugify(name, { lower: true, strict: true }).slice(0, 20);
  const id = nanoid(7);
  return `${base}-${id}`;
}
