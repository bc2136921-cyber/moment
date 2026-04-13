export type LayoutStyle = 
  | 'polaroid' 
  | 'cinema' 
  | 'split' 
  | 'minimal' 
  | 'film-strip' 
  | 'magazine' 
  | 'overlap' 
  | 'blur-bg' 
  | 'duotone' 
  | 'retro' 
  | 'stamp' 
  | 'scrapbook' 
  | 'circles' 
  | 'neon';

export const LAYOUTS: LayoutStyle[] = [
  'polaroid', 'cinema', 'split', 'minimal', 'film-strip', 
  'magazine', 'overlap', 'blur-bg', 'duotone', 'retro', 
  'stamp', 'scrapbook', 'circles', 'neon'
];

const drawCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
};

const drawShadowText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, align: CanvasTextAlign, baseline: CanvasTextBaseline = 'alphabetic', color = 'rgba(255, 255, 255, 0.9)', shadowColor = 'rgba(0, 0, 0, 0.8)', blur = 8) => {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillStyle = color;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = blur ? 2 : 0;
  ctx.shadowOffsetY = blur ? 2 : 0;
  ctx.fillText(text, x, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const renderLayout = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  img1: HTMLImageElement,
  img2: HTMLImageElement,
  t1: string,
  t2: string,
  time1: number,
  time2: number,
  style: LayoutStyle
) => {
  const width = 1080;
  const height = 1920; 
  canvas.width = width;
  canvas.height = height;

  const date1Str = formatDate(time1);
  const date2Str = formatDate(time2);

  // Common font setup
  const timeFont = '42px "Inter", sans-serif'; // Bigger time font

  // Default Watermark function
  const drawWatermark = () => {
    ctx.font = '30px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Created with Moment', width / 2, height - 20);
  };

  if (style === 'polaroid') {
    const padding = 40;
    const innerWidth = width - padding * 2;
    const innerHeight = (height - padding * 3) / 2;

    ctx.fillStyle = '#0f0f11';
    ctx.fillRect(0, 0, width, height);

    drawCover(ctx, img1, padding, padding, innerWidth, innerHeight);
    drawCover(ctx, img2, padding, padding * 2 + innerHeight, innerWidth, innerHeight);

    // Text Overlays background (we don't need the bottom bar anymore since text is on top)
    // Removed

    // Status
    drawShadowText(ctx, t1, padding + 20, padding + 90, '50px "Caveat", cursive', 'left', 'top');
    drawShadowText(ctx, t2, padding + 20, padding * 2 + innerHeight + 90, '50px "Caveat", cursive', 'left', 'top');

    // Individual Timestamps in top-left
    drawShadowText(ctx, date1Str, padding + 20, padding + 40, timeFont, 'left', 'top');
    drawShadowText(ctx, date2Str, padding + 20, padding * 2 + innerHeight + 40, timeFont, 'left', 'top');

    drawWatermark();

  } else if (style === 'cinema') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    const cinemaHeight = height * 0.35;
    const gap = 20;
    const startY = (height - (cinemaHeight * 2 + gap)) / 2;

    drawCover(ctx, img1, 0, startY, width, cinemaHeight);
    drawCover(ctx, img2, 0, startY + cinemaHeight + gap, width, cinemaHeight);

    drawShadowText(ctx, t1, 20, startY + 80, '40px "Inter", sans-serif', 'left', 'top');
    drawShadowText(ctx, t2, 20, startY + cinemaHeight + gap + 80, '40px "Inter", sans-serif', 'left', 'top');

    // Timestamps in top-left of each frame
    drawShadowText(ctx, date1Str, 20, startY + 30, '36px "Inter", sans-serif', 'left', 'top', 'rgba(255,255,255,0.7)', 'rgba(0,0,0,0.5)', 4);
    drawShadowText(ctx, date2Str, 20, startY + cinemaHeight + gap + 30, '36px "Inter", sans-serif', 'left', 'top', 'rgba(255,255,255,0.7)', 'rgba(0,0,0,0.5)', 4);

    ctx.font = '32px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('MOMENT', width / 2, height - 60);

  } else if (style === 'split') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCtx.beginPath();
    tempCtx.moveTo(0, 0);
    tempCtx.lineTo(width, 0);
    tempCtx.lineTo(0, height);
    tempCtx.closePath();
    tempCtx.clip();
    drawCover(tempCtx, img1, 0, 0, width, height);
    ctx.drawImage(tempCanvas, 0, 0);

    tempCanvas.width = width;
    tempCtx.beginPath();
    tempCtx.moveTo(width, 0);
    tempCtx.lineTo(width, height);
    tempCtx.lineTo(0, height);
    tempCtx.closePath();
    tempCtx.clip();
    drawCover(tempCtx, img2, 0, 0, width, height);
    ctx.drawImage(tempCanvas, 0, 0);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    // Top-left image (img1)
    drawShadowText(ctx, date1Str, 40, 60, timeFont, 'left', 'top');
    drawShadowText(ctx, t1, 40, 110, '80px "Caveat", cursive', 'left', 'top');

    // Bottom-right image (img2)
    drawShadowText(ctx, date2Str, width / 2 + 60, height / 2 + 60, timeFont, 'left', 'top');
    drawShadowText(ctx, t2, width / 2 + 60, height / 2 + 110, '80px "Caveat", cursive', 'left', 'top');

  } else if (style === 'minimal') {
    ctx.fillStyle = '#fcfcfc'; 
    ctx.fillRect(0, 0, width, height);
    
    const sqSize = 440;
    const gap = 120;
    const startY = (height - (sqSize * 2 + gap)) / 2 - 80;

    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((width - sqSize)/2, startY, sqSize, sqSize);
    ctx.fillRect((width - sqSize)/2, startY + sqSize + gap, sqSize, sqSize);
    ctx.shadowColor = 'transparent';

    drawCover(ctx, img1, (width - sqSize)/2, startY, sqSize, sqSize);
    drawCover(ctx, img2, (width - sqSize)/2, startY + sqSize + gap, sqSize, sqSize);

    ctx.font = timeFont;
    ctx.fillStyle = '#888888';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(date1Str, (width - sqSize)/2, startY - 80);

    ctx.fillStyle = '#222222';
    ctx.textAlign = 'left';
    ctx.font = '50px "Caveat", cursive';
    ctx.fillText(t1, (width - sqSize)/2, startY - 30);

    ctx.font = timeFont;
    ctx.fillStyle = '#888888';
    ctx.textAlign = 'left';
    ctx.fillText(date2Str, (width - sqSize)/2, startY + sqSize + gap - 80);

    ctx.fillStyle = '#222222';
    ctx.textAlign = 'left';
    ctx.font = '50px "Caveat", cursive';
    ctx.fillText(t2, (width - sqSize)/2, startY + sqSize + gap - 30);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '28px "Inter", sans-serif';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('Moment', width / 2, height - 40);

  } else if (style === 'film-strip') {
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, width, height);

    // Draw film holes
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<height; i+=60) {
      ctx.beginPath();
      ctx.roundRect(20, i + 10, 30, 40, 8);
      ctx.roundRect(width - 50, i + 10, 30, 40, 8);
      ctx.fill();
    }

    const padding = 100;
    const innerWidth = width - padding * 2;
    const innerHeight = (height - padding * 3) / 2;

    drawCover(ctx, img1, padding, padding, innerWidth, innerHeight);
    drawCover(ctx, img2, padding, padding * 2 + innerHeight, innerWidth, innerHeight);

    // Text with warm yellow color like vintage film
    const filmColor = '#FFB800';
    drawShadowText(ctx, date1Str, padding + 20, padding + 40, timeFont, 'left', 'top', filmColor, 'black', 4);
    drawShadowText(ctx, t1, padding + 20, padding + 90, '50px "Caveat", cursive', 'left', 'top', filmColor, 'black', 4);

    drawShadowText(ctx, date2Str, padding + 20, padding * 2 + innerHeight + 40, timeFont, 'left', 'top', filmColor, 'black', 4);
    drawShadowText(ctx, t2, padding + 20, padding * 2 + innerHeight + 90, '50px "Caveat", cursive', 'left', 'top', filmColor, 'black', 4);

  } else if (style === 'magazine') {
    ctx.fillStyle = '#E8E6E1';
    ctx.fillRect(0, 0, width, height);

    drawCover(ctx, img1, 0, 0, width, height * 0.65);
    
    // Overlapping smaller image
    const img2Width = width * 0.6;
    const img2Height = img2Width * 1.2;
    
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    drawCover(ctx, img2, width - img2Width - 40, height * 0.55, img2Width, img2Height);
    ctx.shadowColor = 'transparent';

    drawShadowText(ctx, date1Str, 40, height * 0.65 + 40, '36px "Inter", sans-serif', 'left', 'top', '#666', 'transparent', 0);
    drawShadowText(ctx, `"${t1}"`, 40, height * 0.65 + 90, 'italic 50px "Georgia", serif', 'left', 'top', '#222', 'transparent', 0);

    drawShadowText(ctx, date2Str, width - img2Width - 20, height * 0.55 + img2Height + 20, '30px "Inter", sans-serif', 'left', 'top', '#666', 'transparent', 0);
    drawShadowText(ctx, `"${t2}"`, width - img2Width - 20, height * 0.55 + img2Height + 70, 'italic 40px "Georgia", serif', 'left', 'top', '#222', 'transparent', 0);

  } else if (style === 'overlap') {
    ctx.fillStyle = '#2C2E33';
    ctx.fillRect(0, 0, width, height);

    const w = 700;
    const h = 900;

    const drawRotated = (img: HTMLImageElement, x: number, y: number, angle: number, text: string, timeStr: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);
      
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#fff';
      ctx.fillRect(-w/2 - 20, -h/2 - 20, w + 40, h + 140);
      ctx.shadowColor = 'transparent';

      drawCover(ctx, img, -w/2, -h/2, w, h);
      
      ctx.fillStyle = '#666';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = '32px "Inter", sans-serif';
      ctx.fillText(timeStr, -w/2 + 20, -h/2 + 20);
      
      ctx.fillStyle = '#111';
      ctx.font = '50px "Caveat", cursive';
      ctx.fillText(text, -w/2 + 20, -h/2 + 80);
      
      ctx.restore();
    };

    drawRotated(img1, width/2 - 60, height/2 - 300, -6, t1, date1Str);
    drawRotated(img2, width/2 + 60, height/2 + 300, 8, t2, date2Str);

  } else if (style === 'blur-bg') {
    // Draw heavily blurred background (faked via scaling)
    ctx.filter = 'blur(40px)';
    drawCover(ctx, img1, 0, 0, width, height/2);
    drawCover(ctx, img2, 0, height/2, width, height/2);
    ctx.filter = 'none';

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, width, height);

    const w = 800;
    const h = 800;
    drawCover(ctx, img1, (width-w)/2, 100, w, h);
    drawCover(ctx, img2, (width-w)/2, height - h - 100, w, h);

    drawShadowText(ctx, date1Str, (width-w)/2 + 20, 100 + 20, timeFont, 'left', 'top');
    drawShadowText(ctx, t1, (width-w)/2 + 20, 100 + 80, '50px "Caveat", cursive', 'left', 'top');

    drawShadowText(ctx, date2Str, (width-w)/2 + 20, height - h - 100 + 20, timeFont, 'left', 'top');
    drawShadowText(ctx, t2, (width-w)/2 + 20, height - h - 100 + 80, '50px "Caveat", cursive', 'left', 'top');

  } else if (style === 'duotone') {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Top image with red tint
    drawCover(ctx, img1, 0, 0, width, height/2);
    ctx.fillStyle = 'rgba(255, 0, 85, 0.4)';
    ctx.globalCompositeOperation = 'color';
    ctx.fillRect(0, 0, width, height/2);
    ctx.globalCompositeOperation = 'source-over';

    // Bottom image with blue tint
    drawCover(ctx, img2, 0, height/2, width, height/2);
    ctx.fillStyle = 'rgba(0, 85, 255, 0.4)';
    ctx.globalCompositeOperation = 'color';
    ctx.fillRect(0, height/2, width, height/2);
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, height/2 - 5, width, 10);

    drawShadowText(ctx, date1Str, 50, 50, timeFont, 'left', 'top');
    drawShadowText(ctx, t1, 50, 100, 'bold 50px "Inter", sans-serif', 'left', 'top');

    drawShadowText(ctx, date2Str, 50, height/2 + 50, timeFont, 'left', 'top');
    drawShadowText(ctx, t2, 50, height/2 + 100, 'bold 50px "Inter", sans-serif', 'left', 'top');

  } else if (style === 'retro') {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    drawCover(ctx, img1, 40, 40, width - 80, height/2 - 60);
    drawCover(ctx, img2, 40, height/2 + 20, width - 80, height/2 - 60);

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for(let i=0; i<height; i+=4) {
      ctx.fillRect(0, i, width, 2);
    }

    const retroFont = 'bold 36px "Courier New", monospace';
    const retroColor = '#00FF41';
    
    drawShadowText(ctx, `[${date1Str}]`, 60, 60, timeFont, 'left', 'top', retroColor, retroColor, 10);
    drawShadowText(ctx, `> ${t1}`, 60, 110, retroFont, 'left', 'top', retroColor, retroColor, 10);

    drawShadowText(ctx, `[${date2Str}]`, 60, height/2 + 60, timeFont, 'left', 'top', retroColor, retroColor, 10);
    drawShadowText(ctx, `> ${t2}`, 60, height/2 + 110, retroFont, 'left', 'top', retroColor, retroColor, 10);

  } else if (style === 'stamp') {
    ctx.fillStyle = '#eAE5D9';
    ctx.fillRect(0, 0, width, height);

    const drawStamp = (img: HTMLImageElement, y: number, text: string, dateStr: string) => {
      const stampW = 800;
      const stampH = 800;
      const x = (width - stampW) / 2;
      
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 20;
      ctx.fillRect(x, y, stampW, stampH);
      ctx.shadowColor = 'transparent';

      // Fake perforation
      ctx.fillStyle = '#eAE5D9';
      for(let i=0; i<=stampW; i+=40) {
        ctx.beginPath(); ctx.arc(x + i, y, 10, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + i, y + stampH, 10, 0, Math.PI*2); ctx.fill();
      }
      for(let i=0; i<=stampH; i+=40) {
        ctx.beginPath(); ctx.arc(x, y + i, 10, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + stampW, y + i, 10, 0, Math.PI*2); ctx.fill();
      }

      drawCover(ctx, img, x + 40, y + 40, stampW - 80, stampH - 80);

      ctx.fillStyle = '#4A4A4A';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = timeFont;
      ctx.fillText(dateStr, x + 60, y + 60);
      ctx.font = '50px "Caveat", cursive';
      ctx.fillText(text, x + 60, y + 110);
    };

    drawStamp(img1, 100, t1, date1Str);
    drawStamp(img2, height - 100 - 800, t2, date2Str);

  } else if (style === 'scrapbook') {
    ctx.fillStyle = '#D9D0C1';
    ctx.fillRect(0, 0, width, height);

    const drawTapedPhoto = (img: HTMLImageElement, y: number, text: string, dateStr: string) => {
      const w = 750;
      const h = 750;
      const x = (width - w) / 2;

      // Photo background
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 15, y - 15, w + 30, h + 120);

      drawCover(ctx, img, x, y, w, h);

      // Tape
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.save();
      ctx.translate(x + w/2, y - 20);
      ctx.rotate(-0.05);
      ctx.fillRect(-150, -30, 300, 60);
      ctx.restore();

      ctx.fillStyle = '#eee';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = '32px "Inter", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(dateStr, x + 40, y + 40);

      ctx.fillStyle = '#fff';
      ctx.font = '40px "Caveat", cursive';
      ctx.fillText(text, x + 40, y + 100);
      ctx.shadowColor = 'transparent';
    };

    drawTapedPhoto(img1, 120, t1, date1Str);
    drawTapedPhoto(img2, 120 + 750 + 160, t2, date2Str);

  } else if (style === 'circles') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#FFE5E5');
    grad.addColorStop(1, '#E5F0FF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const drawCirclePhoto = (img: HTMLImageElement, y: number, text: string, dateStr: string) => {
      const r = 350;
      const x = width / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      ctx.clip();
      drawCover(ctx, img, x - r, y - r, r*2, r*2);
      ctx.restore();

      ctx.fillStyle = '#eee';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = timeFont;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(dateStr, x - r + 60, y - r + 60);
      
      ctx.fillStyle = '#fff';
      ctx.font = '50px "Caveat", cursive';
      ctx.fillText(text, x - r + 60, y - r + 110);
      ctx.shadowColor = 'transparent';
    };

    drawCirclePhoto(img1, 450, t1, date1Str);
    drawCirclePhoto(img2, height - 450 - 100, t2, date2Str);

  } else if (style === 'neon') {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    const drawNeon = (img: HTMLImageElement, y: number, color: string, text: string, dateStr: string) => {
      const w = 800;
      const h = 700;
      const x = (width - w) / 2;

      ctx.shadowColor = color;
      ctx.shadowBlur = 30;
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.strokeRect(x, y, w, h);
      ctx.shadowBlur = 0;

      drawCover(ctx, img, x, y, w, h);

      drawShadowText(ctx, dateStr, x + 30, y + 30, '36px "Inter", sans-serif', 'left', 'top', '#aaa', color, 10);
      drawShadowText(ctx, text, x + 30, y + 80, 'bold 40px "Inter", sans-serif', 'left', 'top', '#fff', color, 20);
    };

    drawNeon(img1, 100, '#FF00FF', t1, date1Str);
    drawNeon(img2, height - 700 - 200, '#00FFFF', t2, date2Str);
  }
};
