import sharp from 'sharp';
import { mkdirSync } from 'fs';

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0D0D0F"/>
  <rect x="128" y="128" width="256" height="256" rx="64" fill="#4A6C6F" opacity="0.8"/>
  <circle cx="256" cy="256" r="64" fill="#5A9E7A"/>
  <text x="256" y="276" font-family="monospace" font-size="64" font-weight="bold" fill="#0D0D0F" text-anchor="middle">GN</text>
</svg>
`;

try {
  mkdirSync('./public/icons', { recursive: true });
  
  sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile('./public/icons/icon-192x192.png')
    .then(() => console.log('Generated 192x192 icon'))
    .catch(err => console.error(err));
    
  sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile('./public/icons/icon-512x512.png')
    .then(() => console.log('Generated 512x512 icon'))
    .catch(err => console.error(err));
} catch (e) {
  console.error(e);
}
