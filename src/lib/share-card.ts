// Generates a 1080x1920 story-format share image on canvas. Returns a Blob.
// No external libraries. Pure Canvas 2D API.

import type { AchievementRarity } from "./achievements";

const RARITY_PALETTE: Record<
  AchievementRarity,
  { bg: [string, string]; primary: string; secondary: string; accent: string; ribbon: string }
> = {
  common: {
    bg: ["#022c22", "#064e3b"],
    primary: "#34d399",
    secondary: "#065f46",
    accent: "#a7f3d0",
    ribbon: "COMMON",
  },
  rare: {
    bg: ["#082f49", "#0c4a6e"],
    primary: "#38bdf8",
    secondary: "#075985",
    accent: "#bae6fd",
    ribbon: "RARE",
  },
  epic: {
    bg: ["#2d0a4e", "#581c87"],
    primary: "#e879f9",
    secondary: "#86198f",
    accent: "#f5d0fe",
    ribbon: "EPIC",
  },
  legendary: {
    bg: ["#3f1d04", "#92400e"],
    primary: "#fbbf24",
    secondary: "#a16207",
    accent: "#fde68a",
    ribbon: "LEGENDARY",
  },
};

export interface ShareCardInput {
  title: string;
  subtitle: string;
  rarity: AchievementRarity;
  // Optional stat chips at the bottom (e.g. "+120 coins", "+40 XP")
  chips?: string[];
  // Optional app name in bottom-right footer
  appName?: string;
  // Optional handle/footer line
  footer?: string;
}

const W = 1080;
const H = 1920;
const PIXEL = 24; // size of a "pixel" for trophy art

function drawPixelTrophy(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rarity: AchievementRarity,
) {
  const c = RARITY_PALETTE[rarity];
  const grid: number[][] = [
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 2, 1, 4, 4, 1, 1, 1, 1, 1, 1, 4, 4, 1, 2, 0],
    [2, 2, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 2, 2],
    [2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
    [2, 2, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 2, 2],
    [2, 2, 1, 1, 1, 5, 5, 5, 5, 5, 5, 1, 1, 1, 2, 2],
    [0, 2, 1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 2, 0],
    [0, 0, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0],
    [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0],
    [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
  ];
  const startX = cx - (16 * PIXEL) / 2;
  const startY = cy - (16 * PIXEL) / 2;
  const colorFor = (v: number) => {
    if (v === 0) return null;
    if (v === 1) return c.primary;
    if (v === 2) return c.secondary;
    if (v === 3) return c.secondary;
    if (v === 4) return c.accent;
    if (v === 5) return c.secondary;
    return null;
  };
  // Soft glow under trophy
  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 380);
  glow.addColorStop(0, `${c.accent}55`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 380, 0, Math.PI * 2);
  ctx.fill();
  // Pixels
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y]!.length; x++) {
      const fill = colorFor(grid[y]![x]!);
      if (!fill) continue;
      ctx.fillStyle = fill;
      ctx.fillRect(startX + x * PIXEL, startY + y * PIXEL, PIXEL, PIXEL);
    }
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(/\s+/);
  let line = "";
  let lineCount = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount++;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y + lineCount * lineHeight);
  return (lineCount + 1) * lineHeight;
}

export async function generateShareCard(input: ShareCardInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");

  const palette = RARITY_PALETTE[input.rarity];

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, palette.bg[0]);
  bg.addColorStop(1, "#020617");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid overlay
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Top banner — "ACHIEVEMENT UNLOCKED"
  ctx.fillStyle = palette.accent;
  ctx.font = "bold 56px ui-monospace, 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("ACHIEVEMENT UNLOCKED", W / 2, 220);

  // Ribbon with rarity
  const ribW = 520;
  const ribH = 90;
  const ribX = (W - ribW) / 2;
  const ribY = 260;
  ctx.fillStyle = palette.secondary;
  ctx.fillRect(ribX, ribY, ribW, ribH);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(ribX, ribY, ribW, 6);
  ctx.fillRect(ribX, ribY + ribH - 6, ribW, 6);
  ctx.fillStyle = palette.accent;
  ctx.font = "bold 56px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(palette.ribbon, W / 2, ribY + 64);

  // Trophy
  drawPixelTrophy(ctx, W / 2, 760, input.rarity);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 96px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  const titleHeight = wrapText(ctx, input.title, W / 2, 1240, W - 160, 110);

  // Subtitle
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "44px ui-sans-serif, system-ui, sans-serif";
  wrapText(ctx, input.subtitle, W / 2, 1240 + titleHeight + 30, W - 200, 60);

  // Chips
  if (input.chips && input.chips.length > 0) {
    const chipY = 1640;
    ctx.font = "bold 40px ui-sans-serif, system-ui, sans-serif";
    const padding = 30;
    const gap = 24;
    const measured = input.chips.map((c) => ctx.measureText(c).width + padding * 2);
    const total = measured.reduce((s, w) => s + w, 0) + gap * (input.chips.length - 1);
    let x = (W - total) / 2;
    for (let i = 0; i < input.chips.length; i++) {
      const w = measured[i]!;
      ctx.fillStyle = palette.secondary;
      ctx.fillRect(x, chipY, w, 80);
      ctx.fillStyle = palette.accent;
      ctx.fillRect(x, chipY, w, 4);
      ctx.fillStyle = palette.accent;
      ctx.textAlign = "center";
      ctx.fillText(input.chips[i]!, x + w / 2, chipY + 52);
      x += w + gap;
    }
  }

  // Footer — app name + handle
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "bold 36px ui-monospace, 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(input.appName ?? "THEN · NOW · NEXT", W / 2, H - 140);
  if (input.footer) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "32px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(input.footer, W / 2, H - 90);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode share card"));
          return;
        }
        resolve(blob);
      },
      "image/png",
      0.92,
    );
  });
}

// Tries to use Web Share API with files; falls back to downloading the image.
export async function shareCard(
  input: ShareCardInput,
  filename = "achievement.png",
): Promise<"shared" | "downloaded" | "copied"> {
  const blob = await generateShareCard(input);
  const file = new File([blob], filename, { type: "image/png" });

  type NavigatorWithCanShare = Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
  };
  const nav = navigator as NavigatorWithCanShare;

  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: input.title,
        text: `${input.title} — ${input.subtitle}`,
      });
      return "shared";
    } catch (err) {
      // user cancelled or share failed — fall through to download
      console.warn("share cancelled", err);
    }
  }

  // Fallback: trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded";
}
