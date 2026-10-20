/**
 * High-Converting Ad Creative Canvas Generator
 * Preserves 100% of the merchant's actual uploaded product image
 * and composites professional e-commerce ad banners, badges, price tags, and COD trust guarantees.
 */

export interface AdCanvasOptions {
  productImageSrc: string; // The user's exact uploaded image (data URL)
  productName: string;
  heroHeadline: string;
  benefits?: string[];
  price?: string;
  showPrice?: boolean;
  dimension: '1:1' | '9:16' | '9:32';
  language?: string;
  style?: 'dark_luxury' | 'vibrant_brand' | 'studio_clean';
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1 && n < words.length - 1) {
        // truncate with ellipsis
        const remaining = words.slice(n).join(' ');
        let truncated = remaining;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1);
        }
        ctx.fillText((truncated + '...').trim(), x, currentY);
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateAdPoster(options: AdCanvasOptions): Promise<string> {
  const {
    productImageSrc,
    productName,
    heroHeadline,
    benefits = [],
    price = '4500',
    showPrice = true,
    dimension = '1:1',
    language = 'الدارجة الجزائرية'
  } = options;

  let width = 1080;
  let height = 1080;

  if (dimension === '9:16') {
    width = 1080;
    height = 1920;
  } else if (dimension === '9:32') {
    width = 1080;
    height = 3200;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Load the merchant's exact product image
  const productImg = await loadImage(productImageSrc);

  const isFrench = language === 'Français';
  const isEnglish = language === 'English';

  // 1. Draw Luxury Dark Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0A0D14');
  bgGrad.addColorStop(0.3, '#121826');
  bgGrad.addColorStop(0.7, '#1A101C');
  bgGrad.addColorStop(1, '#0A0D14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Center Ambient Glow behind product
  const glowX = width / 2;
  const glowY = dimension === '1:1' ? 460 : dimension === '9:16' ? 780 : 950;
  const glowRadius = Math.min(width, height) * 0.42;

  const radialGlow = ctx.createRadialGradient(glowX, glowY, 40, glowX, glowY, glowRadius);
  radialGlow.addColorStop(0, 'rgba(233, 30, 99, 0.35)');
  radialGlow.addColorStop(0.5, 'rgba(124, 58, 237, 0.18)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // Decorative subtle grid / accent ring
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(glowX, glowY, glowRadius * 0.85, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 3. Top Banner / Badge
  const topBadgeY = 60;
  const topBadgeText = isFrench
    ? '🔥 N°1 DES VENTES EN ALGÉRIE • QUALITÉ 100% GARANTIE'
    : isEnglish
    ? '🔥 TOP SELLER IN ALGERIA • 100% PREMIUM QUALITY'
    : '🔥 الأكثر طلباً في الجزائر • جودة أصلية ومضمونة 100%';

  ctx.save();
  ctx.font = 'bold 24px "Cairo", "Inter", sans-serif';
  const badgeMetrics = ctx.measureText(topBadgeText);
  const badgeW = badgeMetrics.width + 60;
  const badgeH = 50;
  const badgeX = (width - badgeW) / 2;

  // Badge background
  ctx.fillStyle = 'rgba(233, 30, 99, 0.15)';
  ctx.strokeStyle = 'rgba(233, 30, 99, 0.4)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, badgeX, topBadgeY, badgeW, badgeH, 25);
  ctx.fill();
  ctx.stroke();

  // Badge text
  ctx.fillStyle = '#FF4081';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(topBadgeText, width / 2, topBadgeY + badgeH / 2);
  ctx.restore();

  // 4. Hero Section: The Merchant's Actual Product
  let prodMaxW = 680;
  let prodMaxH = 520;
  let prodY = 160;

  if (dimension === '9:16') {
    prodMaxW = 760;
    prodMaxH = 680;
    prodY = 240;
  } else if (dimension === '9:32') {
    prodMaxW = 820;
    prodMaxH = 820;
    prodY = 280;
  }

  // Calculate aspect-ratio-fitted dimensions for the product
  const imgAspect = productImg.width / productImg.height;
  let drawW = prodMaxW;
  let drawH = prodMaxW / imgAspect;

  if (drawH > prodMaxH) {
    drawH = prodMaxH;
    drawW = prodMaxH * imgAspect;
  }

  const prodX = (width - drawW) / 2;
  const actualProdY = prodY + (prodMaxH - drawH) / 2;

  // Soft Pedestal Shadow under the product
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(width / 2, actualProdY + drawH + 15, drawW * 0.42, 24, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.filter = 'blur(16px)';
  ctx.fill();
  ctx.restore();

  // Draw the product container card with rounded corners and drop shadow
  ctx.save();
  const cardPadding = 14;
  const cardX = prodX - cardPadding;
  const cardY = actualProdY - cardPadding;
  const cardW = drawW + cardPadding * 2;
  const cardH = drawH + cardPadding * 2;
  const cardRadius = 32;

  // Outer shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 15;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fill();
  ctx.stroke();

  // Clip and draw the user's exact photo
  ctx.save();
  drawRoundedRect(ctx, prodX, actualProdY, drawW, drawH, cardRadius - 6);
  ctx.clip();
  ctx.drawImage(productImg, prodX, actualProdY, drawW, drawH);
  ctx.restore();

  ctx.restore();

  // 5. Floating Price Badge (if showPrice is true)
  if (showPrice && price) {
    ctx.save();
    const priceText = isFrench ? `${price} DA` : isEnglish ? `${price} DZD` : `${price} د.ج`;
    const labelText = isFrench ? 'PRIX SPÉCIAL' : isEnglish ? 'SPECIAL PRICE' : 'السعر الخاص';

    ctx.font = 'bold 34px "Cairo", "Inter", sans-serif';
    const pWidth = Math.max(220, ctx.measureText(priceText).width + 50);
    const pHeight = 84;
    const px = Math.max(40, cardX - 20);
    const py = Math.max(130, cardY - 20);

    // Glowing badge background
    ctx.shadowColor = 'rgba(233, 30, 99, 0.6)';
    ctx.shadowBlur = 25;
    const priceGrad = ctx.createLinearGradient(px, py, px + pWidth, py + pHeight);
    priceGrad.addColorStop(0, '#E91E63');
    priceGrad.addColorStop(1, '#9C27B0');
    ctx.fillStyle = priceGrad;
    drawRoundedRect(ctx, px, py, pWidth, pHeight, 22);
    ctx.fill();

    ctx.shadowBlur = 0;
    // Subtitle label
    ctx.font = 'bold 13px "Cairo", "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, px + pWidth / 2, py + 26);

    // Main Price
    ctx.font = '900 32px "Cairo", "Inter", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(priceText, px + pWidth / 2, py + 62);
    ctx.restore();
  }

  // 6. Marketing Headline Section
  let textStartY = actualProdY + drawH + 55;
  ctx.save();
  ctx.textAlign = 'center';

  // Product Name
  if (productName) {
    ctx.font = 'bold 24px "Cairo", "Inter", sans-serif';
    ctx.fillStyle = '#FF80AB';
    ctx.fillText(productName, width / 2, textStartY);
    textStartY += 45;
  }

  // Main Catchy Headline
  const cleanHeadline = (heroHeadline || 'الحل الذكي والعملي لحياتك اليومية').replace(/["״]/g, '');
  ctx.font = '900 38px "Cairo", "Inter", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 12;
  textStartY = wrapText(ctx, cleanHeadline, width / 2, textStartY, width - 120, 50, 2);
  ctx.restore();

  textStartY += 10;

  // 7. Benefits / Selling Points
  const finalBenefits = benefits && benefits.length > 0
    ? benefits.slice(0, 3)
    : [
        '✔️ تصميم عصري وجودة عالية تدوم طويلاً',
        '✔️ سهل الاستعمال ويوفر وقتك ومجهودك',
        '✔️ توصيل سريع حتى باب المنزل مع الدفع عند الاستلام'
      ];

  ctx.save();
  const benefitBoxW = width - 160;
  const benefitBoxH = finalBenefits.length * 48 + 24;
  const benefitBoxX = 80;
  const benefitBoxY = textStartY;

  // Translucent card for benefits
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, benefitBoxX, benefitBoxY, benefitBoxW, benefitBoxH, 20);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 22px "Cairo", "Inter", sans-serif';
  ctx.fillStyle = '#E2E8F0';
  ctx.textAlign = isFrench || isEnglish ? 'left' : 'right';

  const textPaddingX = isFrench || isEnglish ? benefitBoxX + 30 : benefitBoxX + benefitBoxW - 30;

  finalBenefits.forEach((b, idx) => {
    const rowY = benefitBoxY + 36 + idx * 46;
    ctx.fillText(b.trim(), textPaddingX, rowY);
  });
  ctx.restore();

  textStartY += benefitBoxH + 30;

  // 8. Footer Section: COD Guarantees & Huge CTA Button
  const footerY = Math.max(textStartY, height - (dimension === '1:1' ? 140 : 200));

  // Stars & Reviews Trust Line
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px "Cairo", "Inter", sans-serif';
  ctx.fillStyle = '#FBBF24'; // Gold stars
  const ratingText = isFrench
    ? '★★★★★ 4.9/5 (Plus de 1 200 avis clients satisfaits)'
    : isEnglish
    ? '★★★★★ 4.9/5 (Over 1,200 satisfied customer reviews)'
    : '★★★★★ 4.9/5 (أكثر من 1,200 زبون راضٍ في الجزائر)';
  ctx.fillText(ratingText, width / 2, footerY - 15);
  ctx.restore();

  // CTA Button
  const ctaBtnW = width - 180;
  const ctaBtnH = 75;
  const ctaBtnX = (width - ctaBtnW) / 2;
  const ctaBtnY = footerY + 15;

  ctx.save();
  // Glowing green/yellow gradient for high conversion COD CTA
  ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 8;

  const ctaGrad = ctx.createLinearGradient(ctaBtnX, ctaBtnY, ctaBtnX + ctaBtnW, ctaBtnY + ctaBtnH);
  ctaGrad.addColorStop(0, '#10B981');
  ctaGrad.addColorStop(1, '#059669');
  ctx.fillStyle = ctaGrad;
  drawRoundedRect(ctx, ctaBtnX, ctaBtnY, ctaBtnW, ctaBtnH, 24);
  ctx.fill();

  // CTA Text
  ctx.shadowBlur = 0;
  ctx.font = '900 28px "Cairo", "Inter", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const ctaText = isFrench
    ? '🛒 COMMANDER MAINTENANT - PAIEMENT À LA LIVRAISON'
    : isEnglish
    ? '🛒 ORDER NOW - CASH ON DELIVERY'
    : '🛒 اطلب الآن والدفع عند الاستلام لباب دارك';

  ctx.fillText(ctaText, width / 2, ctaBtnY + ctaBtnH / 2);
  ctx.restore();

  // Return full high quality JPEG base64
  return canvas.toDataURL('image/jpeg', 0.95);
}
