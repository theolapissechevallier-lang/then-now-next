import { cn } from '@/lib/utils';

// ============================================
// PIXEL ART DESIGN SYSTEM
// ============================================
// Minimalist 16x16 base sprites
// Inspired by Stardew Valley, Terraria, Forager
// Clean, readable, cozy, charming

// Color palette - consistent across all sprites
export const PALETTE = {
  // Skin tones
  skinLight: '#fde8d9',
  skinMedium: '#e8d5c4',
  skinTan: '#d4a574',
  skinBrown: '#8b6914',
  skinDark: '#5d4e37',

  // Hair colors
  hairBlack: '#1a1a1f',
  hairBrown: '#4a3728',
  hairBlonde: '#d4a574',
  hairRed: '#c44536',
  hairGreen: '#5e7a6b',
  hairBlue: '#3d5a80',
  hairPink: '#ff8aa8',

  // Eye colors
  eyeBlue: '#3d5a80',
  eyeGreen: '#2d6a4f',
  eyeBrown: '#5d4037',
  eyeBlack: '#1a1a1f',

  // Outfit colors
  outfitBlue: '#3d5a80',
  outfitGreen: '#2d6a4f',
  outfitRed: '#c44536',
  outfitPurple: '#7c3aed',
  outfitGray: '#4a5568',
  outfitGold: '#d69e2e',

  // Pet colors
  petCyan: '#5be1c4',
  petOrange: '#ffb380',
  petGold: '#c4a35a',
  petPink: '#ff8aa8',
  petPurple: '#9f7aea',

  // UI colors
  white: '#ffffff',
  black: '#1a1a1f',
  shadow: '#00000040',
  highlight: '#ffffff80',
} as const;

// ============================================
// BASE SPRITE COMPONENT
// ============================================

type SpriteProps = {
  size?: number;
  className?: string;
  children: React.ReactNode;
};

export function PixelSprite({ size = 64, className, children }: SpriteProps) {
  return (
    <div
      className={cn('relative', className)}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
      }}
    >
      <svg
        viewBox="0 0 16 16"
        width="100%"
        height="100%"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {children}
      </svg>
    </div>
  );
}

// ============================================
// AVATAR SPRITES
// ============================================

type AvatarSpriteProps = {
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  outfit: string;
  outfitColor: string;
  accessory: string;
  size?: number;
  className?: string;
};

export function AvatarSprite({
  hairStyle,
  hairColor,
  eyeColor,
  skinTone,
  outfit,
  outfitColor,
  accessory,
  size = 64,
  className,
}: AvatarSpriteProps) {
  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
    >
      <svg viewBox="0 0 16 16" width="100%" height="100%" style={{ shapeRendering: 'crispEdges' }}>
        {/* Background (outfit area) */}
        <rect x="5" y="11" width="6" height="5" fill={outfitColor} />

        {/* Outfit details based on style */}
        {outfit === 'hoodie' && (
          <>
            <rect x="4" y="11" width="8" height="5" fill={outfitColor} />
            <rect x="6" y="11" width="4" height="2" fill={shadeColor(outfitColor, -20)} />
          </>
        )}
        {outfit === 'formal' && (
          <>
            <rect x="5" y="11" width="6" height="5" fill={outfitColor} />
            <rect x="7" y="11" width="2" height="5" fill="#c44536" />
            <rect x="6" y="10" width="1" height="2" fill={PALETTE.white} />
            <rect x="9" y="10" width="1" height="2" fill={PALETTE.white} />
          </>
        )}
        {outfit === 'armor' && (
          <>
            <rect x="5" y="11" width="6" height="5" fill={outfitColor} />
            <rect x="5" y="11" width="1" height="5" fill={shadeColor(outfitColor, -30)} />
            <rect x="10" y="11" width="1" height="5" fill={shadeColor(outfitColor, 20)} />
            <rect x="7" y="12" width="2" height="2" fill={shadeColor(outfitColor, 30)} />
          </>
        )}
        {outfit === 'casual' && (
          <>
            <rect x="5" y="11" width="6" height="5" fill={outfitColor} />
            <rect x="7" y="11" width="2" height="1" fill={shadeColor(outfitColor, -15)} />
          </>
        )}

        {/* Head */}
        <rect x="5" y="4" width="6" height="7" fill={skinTone} />
        <rect x="4" y="5" width="1" height="5" fill={skinTone} />
        <rect x="11" y="5" width="1" height="5" fill={skinTone} />

        {/* Hair */}
        {renderHair(hairStyle, hairColor)}

        {/* Eyes */}
        <rect x="6" y="7" width="2" height="2" fill={PALETTE.white} />
        <rect x="8" y="7" width="2" height="2" fill={PALETTE.white} />
        <rect x="7" y="8" width="1" height="1" fill={eyeColor} />
        <rect x="9" y="8" width="1" height="1" fill={eyeColor} />

        {/* Mouth */}
        <rect x="7" y="10" width="2" height="1" fill={shadeColor(skinTone, -40)} />

        {/* Accessory */}
        {renderAccessory(accessory)}

        {/* Shadow under chin */}
        <rect x="5" y="10" width="6" height="1" fill={shadeColor(skinTone, -10)} opacity="0.3" />
      </svg>
    </div>
  );
}

function renderHair(style: string, color: string) {
  const darkColor = shadeColor(color, -25);
  const lightColor = shadeColor(color, 15);

  switch (style) {
    case 'long':
      return (
        <>
          <rect x="4" y="2" width="8" height="4" fill={color} />
          <rect x="3" y="5" width="1" height="6" fill={color} />
          <rect x="12" y="5" width="1" height="6" fill={color} />
          <rect x="4" y="2" width="1" height="1" fill={lightColor} />
          <rect x="3" y="6" width="1" height="1" fill={darkColor} />
          <rect x="12" y="6" width="1" height="1" fill={darkColor} />
        </>
      );
    case 'curly':
      return (
        <>
          <rect x="3" y="1" width="4" height="3" fill={color} />
          <rect x="9" y="1" width="4" height="3" fill={color} />
          <rect x="5" y="0" width="6" height="4" fill={color} />
          <rect x="4" y="3" width="8" height="2" fill={color} />
          <rect x="4" y="1" width="1" height="1" fill={lightColor} />
          <rect x="10" y="1" width="1" height="1" fill={lightColor} />
        </>
      );
    case 'spiky':
      return (
        <>
          <rect x="5" y="1" width="6" height="1" fill={color} />
          <rect x="7" y="0" width="2" height="1" fill={color} />
          <rect x="4" y="2" width="8" height="3" fill={color} />
          <rect x="4" y="1" width="1" height="1" fill={lightColor} />
          <rect x="11" y="2" width="1" height="1" fill={darkColor} />
        </>
      );
    case 'mohawk':
      return (
        <>
          <rect x="7" y="0" width="2" height="5" fill={color} />
          <rect x="6" y="1" width="1" height="1" fill={lightColor} />
          <rect x="9" y="1" width="1" height="1" fill={darkColor} />
        </>
      );
    case 'short':
    default:
      return (
        <>
          <rect x="5" y="2" width="6" height="3" fill={color} />
          <rect x="4" y="3" width="8" height="2" fill={color} />
          <rect x="5" y="2" width="1" height="1" fill={lightColor} />
          <rect x="10" y="3" width="1" height="1" fill={darkColor} />
        </>
      );
  }
}

function renderAccessory(accessory: string) {
  switch (accessory) {
    case 'glasses':
      return (
        <>
          <rect x="5" y="7" width="3" height="2" fill="none" stroke={PALETTE.black} strokeWidth="0.5" />
          <rect x="8" y="7" width="3" height="2" fill="none" stroke={PALETTE.black} strokeWidth="0.5" />
          <rect x="8" y="8" width="1" height="0.5" fill={PALETTE.black} />
        </>
      );
    case 'sunglasses':
      return (
        <>
          <rect x="5" y="7" width="3" height="2" fill={PALETTE.black} />
          <rect x="8" y="7" width="3" height="2" fill={PALETTE.black} />
          <rect x="8" y="8" width="1" height="0.5" fill={PALETTE.black} />
          <rect x="5" y="7" width="1" height="0.5" fill={PALETTE.white} opacity="0.3" />
          <rect x="8" y="7" width="1" height="0.5" fill={PALETTE.white} opacity="0.3" />
        </>
      );
    case 'headphones':
      return (
        <>
          <rect x="3" y="2" width="1" height="4" fill={PALETTE.black} />
          <rect x="12" y="2" width="1" height="4" fill={PALETTE.black} />
          <rect x="3" y="5" width="2" height="3" fill={PALETTE.black} />
          <rect x="11" y="5" width="2" height="3" fill={PALETTE.black} />
          <rect x="7" y="1" width="2" height="1" fill={PALETTE.black} />
          <rect x="4" y="5" width="1" height="1" fill={shadeColor(PALETTE.black, 30)} />
          <rect x="11" y="5" width="1" height="1" fill={shadeColor(PALETTE.black, 30)} />
        </>
      );
    case 'crown':
      return (
        <>
          <rect x="4" y="1" width="8" height="2" fill="#ffd700" />
          <rect x="4" y="0" width="2" height="1" fill="#ffd700" />
          <rect x="10" y="0" width="2" height="1" fill="#ffd700" />
          <rect x="7" y="0" width="2" height="1" fill="#ffd700" />
          <rect x="5" y="1" width="1" height="1" fill="#ff4444" />
          <rect x="10" y="1" width="1" height="1" fill="#44ff44" />
          <rect x="7" y="1" width="2" height="1" fill="#4444ff" />
        </>
      );
    case 'none':
    default:
      return null;
  }
}

// ============================================
// PET SPRITES - Chibi/Cute Style
// ============================================
// Design principles:
// - Large expressive eyes (take up ~1/3 of head)
// - Rounded, soft shapes
// - Small body, big head
// - Visible emotions
// - Adorable and collectible

type PetSpriteProps = {
  species: string;
  stage: string;
  mood: string;
  size?: number;
  className?: string;
  animate?: boolean;
};

export function PetSprite({ species, stage, mood, size = 64, className, animate = true }: PetSpriteProps) {
  // Scale based on evolution stage
  const scale = stage === 'egg' ? 0.85 : stage === 'baby' ? 0.95 : stage === 'teen' ? 1.05 : stage === 'adult' ? 1.15 : 1.25;
  const actualSize = Math.round(size * scale);

  return (
    <div
      className={cn('relative', className)}
      style={{ width: actualSize, height: actualSize, imageRendering: 'pixelated' }}
    >
      <svg viewBox="0 0 16 16" width="100%" height="100%" style={{ shapeRendering: 'crispEdges' }}>
        {renderCutePetBody(species, stage)}
        {renderCutePetFace(species, stage, mood)}
      </svg>
    </div>
  );
}

// Cute chibi pet bodies - rounded and friendly
function renderCutePetBody(species: string, stage: string) {
  const color = getPetColor(species);
  const dark = shadeColor(color, -15);
  const light = shadeColor(color, 20);

  if (stage === 'egg') {
    return (
      <>
        {/* Egg - round with a crack line */}
        <rect x="6" y="4" width="4" height="8" fill={color} />
        <rect x="5" y="5" width="6" height="6" fill={color} />
        <rect x="6" y="3" width="4" height="1" fill={light} />
        <rect x="7" y="4" width="2" height="1" fill={light} opacity="0.7" />
        {/* Cute crack */}
        <rect x="7" y="6" width="1" height="1" fill={dark} />
        <rect x="8" y="7" width="1" height="1" fill={dark} />
        <rect x="7" y="8" width="1" height="1" fill={dark} />
        {/* Shine */}
        <rect x="5" y="5" width="1" height="2" fill={PALETTE.white} opacity="0.4" />
      </>
    );
  }

  switch (species) {
    // ============================================
    // FOX - Playful and mischievous
    // ============================================
    case 'fox':
      return (
        <>
          {/* Big round body */}
          <rect x="5" y="8" width="6" height="6" fill={color} />
          <rect x="4" y="9" width="8" height="4" fill={color} />
          {/* White belly */}
          <rect x="6" y="10" width="4" height="3" fill={PALETTE.white} />
          {/* Big round head */}
          <rect x="5" y="3" width="6" height="6" fill={color} />
          <rect x="4" y="4" width="8" height="4" fill={color} />
          {/* Fluffy ears */}
          <rect x="4" y="1" width="2" height="3" fill={color} />
          <rect x="10" y="1" width="2" height="3" fill={color} />
          {/* Inner ear */}
          <rect x="5" y="2" width="1" height="1" fill={PALETTE.white} />
          <rect x="10" y="2" width="1" height="1" fill={PALETTE.white} />
          {/* White snout */}
          <rect x="6" y="7" width="4" height="2" fill={PALETTE.white} />
          {/* Big fluffy tail */}
          <rect x="11" y="8" width="4" height="4" fill={color} />
          <rect x="12" y="7" width="2" height="1" fill={color} />
          <rect x="12" y="10" width="2" height="2" fill={PALETTE.white} />
          {/* Shine */}
          <rect x="5" y="3" width="1" height="1" fill={light} />
          <rect x="11" y="8" width="1" height="1" fill={light} />
          {/* Blush */}
          <rect x="4" y="6" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          <rect x="11" y="6" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          {/* Paws */}
          <rect x="4" y="12" width="2" height="2" fill={color} />
          <rect x="10" y="12" width="2" height="2" fill={color} />
        </>
      );

    // ============================================
    // BUNNY - Adorable and gentle
    // ============================================
    case 'bunny':
      return (
        <>
          {/* Round body */}
          <rect x="5" y="8" width="6" height="6" fill={color} />
          <rect x="4" y="9" width="8" height="4" fill={color} />
          {/* Fluffy tail */}
          <rect x="11" y="10" width="3" height="3" fill={PALETTE.white} />
          <rect x="12" y="9" width="2" height="1" fill={PALETTE.white} />
          {/* Big round head */}
          <rect x="5" y="3" width="6" height="6" fill={color} />
          <rect x="4" y="4" width="8" height="4" fill={color} />
          {/* LONG FLOPPY EARS - signature feature */}
          <rect x="2" y="0" width="3" height="6" fill={color} />
          <rect x="11" y="0" width="3" height="6" fill={color} />
          <rect x="3" y="1" width="1" height="4" fill={light} />
          <rect x="12" y="1" width="1" height="4" fill={light} />
          {/* Inner ear pink */}
          <rect x="3" y="2" width="1" height="2" fill="#ffb6c1" />
          <rect x="12" y="2" width="1" height="2" fill="#ffb6c1" />
          {/* Whisker marks */}
          <rect x="2" y="6" width="2" height="1" fill={light} opacity="0.5" />
          <rect x="12" y="6" width="2" height="1" fill={light} opacity="0.5" />
          {/* Shine */}
          <rect x="5" y="3" width="1" height="1" fill={light} />
          {/* Blush */}
          <rect x="4" y="6" width="1" height="1" fill="#ff8aa8" opacity="0.5" />
          <rect x="11" y="6" width="1" height="1" fill="#ff8aa8" opacity="0.5" />
          {/* Paws */}
          <rect x="4" y="12" width="2" height="2" fill={color} />
          <rect x="10" y="12" width="2" height="2" fill={color} />
        </>
      );

    // ============================================
    // CAT - Sleek but cute
    // ============================================
    case 'cat':
      return (
        <>
          {/* Round body */}
          <rect x="5" y="8" width="6" height="6" fill={color} />
          <rect x="4" y="9" width="8" height="4" fill={color} />
          {/* Chest fluff */}
          <rect x="6" y="9" width="4" height="2" fill={light} />
          {/* Big round head */}
          <rect x="5" y="3" width="6" height="6" fill={color} />
          <rect x="4" y="4" width="8" height="4" fill={color} />
          {/* Pointy ears */}
          <rect x="4" y="1" width="2" height="3" fill={color} />
          <rect x="10" y="1" width="2" height="3" fill={color} />
          <rect x="4" y="0" width="1" height="2" fill={color} />
          <rect x="11" y="0" width="1" height="2" fill={color} />
          {/* Inner ear */}
          <rect x="5" y="2" width="1" height="1" fill="#ffb6c1" />
          <rect x="10" y="2" width="1" height="1" fill="#ffb6c1" />
          {/* Tail - curvy and expressive */}
          <rect x="11" y="9" width="3" height="2" fill={color} />
          <rect x="13" y="8" width="2" height="2" fill={color} />
          <rect x="14" y="7" width="1" height="2" fill={color} />
          {/* Shine */}
          <rect x="5" y="3" width="1" height="1" fill={light} />
          <rect x="13" y="8" width="1" height="1" fill={light} />
          {/* Blush */}
          <rect x="4" y="6" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          <rect x="11" y="6" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          {/* Paws */}
          <rect x="4" y="12" width="2" height="2" fill={color} />
          <rect x="10" y="12" width="2" height="2" fill={color} />
        </>
      );

    // ============================================
    // OWL - Wise and cozy
    // ============================================
    case 'owl':
      return (
        <>
          {/* Round body */}
          <rect x="4" y="7" width="8" height="7" fill={color} />
          <rect x="5" y="6" width="6" height="1" fill={color} />
          {/* Belly pattern */}
          <rect x="6" y="9" width="4" height="4" fill={light} />
          <rect x="7" y="8" width="2" height="1" fill={light} />
          {/* Wing spots */}
          <rect x="4" y="8" width="2" height="3" fill={dark} />
          <rect x="10" y="8" width="2" height="3" fill={dark} />
          {/* Big round head */}
          <rect x="5" y="2" width="6" height="5" fill={color} />
          <rect x="4" y="3" width="8" height="3" fill={color} />
          {/* Ear tufts */}
          <rect x="4" y="0" width="2" height="2" fill={color} />
          <rect x="10" y="0" width="2" height="2" fill={color} />
          <rect x="4" y="0" width="1" height="3" fill={color} />
          <rect x="11" y="0" width="1" height="3" fill={color} />
          {/* Beak */}
          <rect x="7" y="5" width="2" height="2" fill="#ffa500" />
          <rect x="7" y="4" width="2" height="1" fill="#ffa500" />
          {/* Shine */}
          <rect x="5" y="2" width="1" height="1" fill={light} />
          {/* Blush */}
          <rect x="3" y="5" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          <rect x="12" y="5" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          {/* Feet */}
          <rect x="5" y="13" width="2" height="1" fill={dark} />
          <rect x="9" y="13" width="2" height="1" fill={dark} />
        </>
      );

    // ============================================
    // DRAGON - Cute but fiery
    // ============================================
    case 'dragon':
      return (
        <>
          {/* Round body */}
          <rect x="5" y="8" width="6" height="6" fill={color} />
          <rect x="4" y="9" width="8" height="4" fill={color} />
          {/* Belly scales */}
          <rect x="6" y="10" width="4" height="3" fill={light} />
          {/* Big head */}
          <rect x="5" y="3" width="6" height="5" fill={color} />
          <rect x="4" y="4" width="8" height="3" fill={color} />
          {/* Little nubby horns */}
          <rect x="4" y="1" width="2" height="3" fill={dark} />
          <rect x="10" y="1" width="2" height="3" fill={dark} />
          {/* Spikes along back */}
          <rect x="7" y="2" width="2" height="1" fill={dark} />
          {/* Tiny wings */}
          <rect x="2" y="9" width="2" height="3" fill={shadeColor(color, -25)} opacity="0.8" />
          <rect x="12" y="9" width="2" height="3" fill={shadeColor(color, -25)} opacity="0.8" />
          {/* Tail with fire tip */}
          <rect x="11" y="10" width="3" height="2" fill={color} />
          <rect x="13" y="9" width="2" height="2" fill="#ff6b6b" />
          <rect x="14" y="10" width="1" height="1" fill="#ffd700" />
          {/* Shine */}
          <rect x="5" y="3" width="1" height="1" fill={light} />
          {/* Blush */}
          <rect x="4" y="6" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          <rect x="11" y="6" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          {/* Paws */}
          <rect x="4" y="12" width="2" height="2" fill={color} />
          <rect x="10" y="12" width="2" height="2" fill={color} />
        </>
      );

    // ============================================
    // BEAR - Round and huggable
    // ============================================
    case 'bear':
      return (
        <>
          {/* Big round body */}
          <rect x="4" y="8" width="8" height="6" fill={color} />
          <rect x="3" y="9" width="10" height="4" fill={color} />
          {/* Belly */}
          <rect x="6" y="10" width="4" height="3" fill={light} />
          {/* Big round head */}
          <rect x="5" y="2" width="6" height="6" fill={color} />
          <rect x="4" y="3" width="8" height="4" fill={color} />
          {/* Round ears */}
          <rect x="3" y="1" width="3" height="3" fill={color} />
          <rect x="10" y="1" width="3" height="3" fill={color} />
          <rect x="4" y="2" width="1" height="1" fill={dark} />
          <rect x="11" y="2" width="1" height="1" fill={dark} />
          {/* Snout */}
          <rect x="6" y="6" width="4" height="2" fill={light} />
          <rect x="7" y="7" width="2" height="1" fill="#4a3728" />
          {/* Shine */}
          <rect x="5" y="2" width="1" height="1" fill={light} />
          {/* Blush */}
          <rect x="3" y="5" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          <rect x="12" y="5" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          {/* Big paws */}
          <rect x="3" y="12" width="3" height="2" fill={color} />
          <rect x="10" y="12" width="3" height="2" fill={color} />
          <rect x="4" y="13" width="1" height="1" fill={dark} />
          <rect x="11" y="13" width="1" height="1" fill={dark} />
        </>
      );

    // ============================================
    // WOLF - Loyal and fluffy
    // ============================================
    case 'wolf':
      return (
        <>
          {/* Body */}
          <rect x="5" y="8" width="6" height="6" fill={color} />
          <rect x="4" y="9" width="8" height="4" fill={color} />
          {/* Chest */}
          <rect x="6" y="9" width="4" height="3" fill={light} />
          {/* Big head */}
          <rect x="5" y="3" width="6" height="5" fill={color} />
          <rect x="4" y="4" width="8" height="3" fill={color} />
          {/* Fluffy mane/neck */}
          <rect x="3" y="5" width="2" height="4" fill={dark} />
          <rect x="11" y="5" width="2" height="4" fill={dark} />
          {/* Pointy ears */}
          <rect x="4" y="0" width="2" height="3" fill={color} />
          <rect x="10" y="0" width="2" height="3" fill={color} />
          <rect x="4" y="0" width="1" height="2" fill={color} />
          <rect x="11" y="0" width="1" height="2" fill={color} />
          {/* Inner ear */}
          <rect x="5" y="1" width="1" height="1" fill={light} />
          <rect x="10" y="1" width="1" height="1" fill={light} />
          {/* Snout */}
          <rect x="6" y="6" width="4" height="2" fill={light} />
          <rect x="7" y="7" width="2" height="1" fill="#4a3728" />
          {/* Fluffy tail */}
          <rect x="11" y="8" width="4" height="3" fill={color} />
          <rect x="13" y="7" width="2" height="1" fill={color} />
          <rect x="12" y="10" width="2" height="1" fill={light} />
          {/* Shine */}
          <rect x="5" y="3" width="1" height="1" fill={light} />
          {/* Blush */}
          <rect x="4" y="5" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          <rect x="11" y="5" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          {/* Paws */}
          <rect x="4" y="12" width="2" height="2" fill={color} />
          <rect x="10" y="12" width="2" height="2" fill={color} />
        </>
      );

    default:
      return (
        <>
          {/* Default blob creature - jelly-like and adorable */}
          <rect x="5" y="6" width="6" height="8" fill={color} />
          <rect x="4" y="7" width="8" height="5" fill={color} />
          <rect x="5" y="5" width="6" height="1" fill={color} />
          {/* Little nubby limbs */}
          <rect x="3" y="12" width="2" height="1" fill={color} />
          <rect x="11" y="12" width="2" height="1" fill={color} />
          {/* Shine */}
          <rect x="5" y="6" width="1" height="1" fill={light} />
          {/* Blush */}
          <rect x="4" y="9" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
          <rect x="11" y="9" width="1" height="1" fill="#ff8aa8" opacity="0.4" />
        </>
      );
  }
}

// Expressive chibi faces with large eyes
function renderCutePetFace(species: string, stage: string, mood: string) {
  if (stage === 'egg') {
    // Eyes peeking out from egg
    return (
      <>
        <rect x="5" y="6" width="2" height="2" fill={PALETTE.white} />
        <rect x="9" y="6" width="2" height="2" fill={PALETTE.white} />
        <rect x="5" y="7" width="1" height="1" fill={PALETTE.black} />
        <rect x="9" y="7" width="1" height="1" fill={PALETTE.black} />
        <rect x="5" y="6" width="1" height="1" fill={PALETTE.white} opacity="0.5" />
        <rect x="9" y="6" width="1" height="1" fill={PALETTE.white} opacity="0.5" />
      </>
    );
  }

  // Eye positions vary slightly by species
  const leftEyeX = 5;
  const rightEyeX = 9;
  const eyeY = species === 'owl' ? 4 : 4;
  const eyeSize = 2; // Big eyes!

  switch (mood) {
    case 'happy':
      return (
        <>
          {/* Happy curved eyes (closed from joy) */}
          <rect x={leftEyeX} y={eyeY} width="1" height="1" fill={PALETTE.black} />
          <rect x={leftEyeX + 1} y={eyeY + 1} width="1" height="1" fill={PALETTE.black} />
          <rect x={rightEyeX} y={eyeY} width="1" height="1" fill={PALETTE.black} />
          <rect x={rightEyeX - 1} y={eyeY + 1} width="1" height="1" fill={PALETTE.black} />
          {/* Big happy smile */}
          <rect x="7" y="7" width="3" height="1" fill={PALETTE.black} />
          <rect x="6" y="6" width="1" height="1" fill={PALETTE.black} />
          {/* Big blush marks */}
          <rect x="3" y="5" width="1" height="1" fill="#ff8aa8" opacity="0.6" />
          <rect x="12" y="5" width="1" height="1" fill="#ff8aa8" opacity="0.6" />
        </>
      );

    case 'excited':
      return (
        <>
          {/* Star eyes / sparkly */}
          <rect x={leftEyeX} y={eyeY} width={eyeSize} height={eyeSize} fill="#ffd700" />
          <rect x={rightEyeX} y={eyeY} width={eyeSize} height={eyeSize} fill="#ffd700" />
          <rect x={leftEyeX} y={eyeY} width="1" height="1" fill="#ffff00" />
          <rect x={rightEyeX + 1} y={eyeY} width="1" height="1" fill="#ffff00" />
          {/* Open happy mouth */}
          <rect x="7" y="7" width="2" height="1" fill={PALETTE.black} />
          <rect x="6" y="8" width="4" height="1" fill={PALETTE.black} />
          {/* Extra blush */}
          <rect x="3" y="5" width="1" height="1" fill="#ff8aa8" opacity="0.7" />
          <rect x="12" y="5" width="1" height="1" fill="#ff8aa8" opacity="0.7" />
          {/* Sparkle near head */}
          <rect x="3" y="2" width="1" height="1" fill="#ffff00" />
          <rect x="12" y="2" width="1" height="1" fill="#ffff00" />
        </>
      );

    case 'sad':
      return (
        <>
          {/* Big sad eyes with tears */}
          <rect x={leftEyeX} y={eyeY} width={eyeSize} height={eyeSize} fill={PALETTE.white} />
          <rect x={rightEyeX} y={eyeY} width={eyeSize} height={eyeSize} fill={PALETTE.white} />
          <rect x={leftEyeX} y={eyeY + 1} width="1" height="1" fill={PALETTE.black} />
          <rect x={rightEyeX + 1} y={eyeY + 1} width="1" height="1" fill={PALETTE.black} />
          {/* Tear drops */}
          <rect x={leftEyeX - 1} y={eyeY + 1} width="1" height="2" fill="#87ceeb" />
          <rect x={rightEyeX + eyeSize} y={eyeY + 1} width="1" height="2" fill="#87ceeb" />
          {/* Frown */}
          <rect x="6" y="8" width="1" height="1" fill={PALETTE.black} />
          <rect x="9" y="8" width="1" height="1" fill={PALETTE.black} />
        </>
      );

    case 'hungry':
      return (
        <>
          {/* Wide eyes looking at food */}
          <rect x={leftEyeX} y={eyeY} width={eyeSize} height={eyeSize} fill={PALETTE.white} />
          <rect x={rightEyeX} y={eyeY} width={eyeSize} height={eyeSize} fill={PALETTE.white} />
          <rect x={leftEyeX} y={eyeY + 1} width="1" height="1" fill={PALETTE.black} />
          <rect x={rightEyeX + 1} y={eyeY + 1} width="1" height="1" fill={PALETTE.black} />
          {/* Highlight */}
          <rect x={leftEyeX} y={eyeY} width="1" height="1" fill={PALETTE.white} opacity="0.8" />
          <rect x={rightEyeX} y={eyeY} width="1" height="1" fill={PALETTE.white} opacity="0.8" />
          {/* Open mouth (wanting food) */}
          <rect x="7" y="7" width="2" height="2" fill={PALETTE.black} />
          {/* Little drool */}
          <rect x="8" y="9" width="1" height="1" fill="#87ceeb" opacity="0.7" />
        </>
      );

    case 'tired':
      return (
        <>
          {/* Sleepy closed eyes */}
          <rect x={leftEyeX} y={eyeY + 1} width={eyeSize} height="1" fill={PALETTE.black} />
          <rect x={rightEyeX} y={eyeY + 1} width={eyeSize} height="1" fill={PALETTE.black} />
          {/* Small yawn mouth */}
          <rect x="7" y="7" width="2" height="1" fill={PALETTE.black} />
          {/* Zzz */}
          <rect x="12" y="1" width="1" height="2" fill="#87ceeb" />
          <rect x="13" y="2" width="1" height="1" fill="#87ceeb" />
        </>
      );

    case 'proud':
      return (
        <>
          {/* Confident closed eyes */}
          <rect x={leftEyeX} y={eyeY} width="1" height="1" fill={PALETTE.black} />
          <rect x={leftEyeX + 1} y={eyeY + 1} width="1" height="1" fill={PALETTE.black} />
          <rect x={rightEyeX + 1} y={eyeY} width="1" height="1" fill={PALETTE.black} />
          <rect x={rightEyeX} y={eyeY + 1} width="1" height="1" fill={PALETTE.black} />
          {/* Smug smile */}
          <rect x="7" y="7" width="3" height="1" fill={PALETTE.black} />
          <rect x="9" y="6" width="1" height="1" fill={PALETTE.black} />
          {/* Sparkle */}
          <rect x="3" y="3" width="1" height="1" fill="#ffd700" />
        </>
      );

    case 'neutral':
    default:
      return (
        <>
          {/* Big cute expressive eyes */}
          <rect x={leftEyeX} y={eyeY} width={eyeSize} height={eyeSize} fill={PALETTE.white} />
          <rect x={rightEyeX} y={eyeY} width={eyeSize} height={eyeSize} fill={PALETTE.white} />
          {/* Pupils - slightly lower for cuteness */}
          <rect x={leftEyeX} y={eyeY + 1} width="1" height="1" fill={PALETTE.black} />
          <rect x={rightEyeX + 1} y={eyeY + 1} width="1" height="1" fill={PALETTE.black} />
          {/* Eye shine - makes them look alive */}
          <rect x={leftEyeX} y={eyeY} width="1" height="1" fill={PALETTE.white} opacity="0.8" />
          <rect x={rightEyeX} y={eyeY} width="1" height="1" fill={PALETTE.white} opacity="0.8" />
          {/* Small cute smile */}
          <rect x="7" y="7" width="2" height="1" fill={PALETTE.black} />
          <rect x="6" y="7" width="1" height="1" fill={PALETTE.black} />
          <rect x="9" y="7" width="1" height="1" fill={PALETTE.black} />
        </>
      );
  }
}

// Species-appropriate colors - all warm and friendly
function getPetColor(species: string): string {
  switch (species) {
    case 'fox': return '#ff8c42';     // Warm orange
    case 'bunny': return '#f8b4b4';   // Soft pink cream
    case 'cat': return '#c4956a';     // Tabby brown
    case 'owl': return '#8b7355';     // Warm brown
    case 'dragon': return '#9370db';  // Soft purple
    case 'bear': return '#a0826d';    // Teddy bear brown
    case 'wolf': return '#6b7b8c';    // Slate grey-blue
    default: return '#88c0d0';        // Default soft teal
  }
}

// ============================================
// FOOD/ITEM SPRITES
// ============================================

export function FoodSprite({ id, size = 32 }: { id: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, imageRendering: 'pixelated' }}>
      <svg viewBox="0 0 16 16" width="100%" height="100%" style={{ shapeRendering: 'crispEdges' }}>
        {renderFood(id)}
      </svg>
    </div>
  );
}

function renderFood(id: string) {
  switch (id) {
    case 'apple':
      return (
        <>
          <rect x="5" y="5" width="6" height="7" fill="#ff6b6b" />
          <rect x="6" y="4" width="4" height="1" fill="#ff6b6b" />
          <rect x="7" y="3" width="2" height="1" fill="#4a3728" />
          <rect x="6" y="6" width="1" height="1" fill="#ffaaaa" />
          <rect x="5" y="8" width="1" height="1" fill="#cc4444" />
        </>
      );
    case 'bread':
      return (
        <>
          <rect x="4" y="6" width="8" height="6" fill="#d4a574" />
          <rect x="5" y="5" width="6" height="1" fill="#c49566" />
          <rect x="5" y="7" width="6" height="1" fill="#e8c5a0" />
          <rect x="5" y="6" width="1" height="1" fill="#e8c5a0" />
        </>
      );
    case 'carrot':
      return (
        <>
          <rect x="7" y="4" width="2" height="8" fill="#ff8a50" />
          <rect x="6" y="5" width="1" height="6" fill="#ff8a50" />
          <rect x="9" y="5" width="1" height="6" fill="#ff8a50" />
          <rect x="7" y="3" width="2" height="2" fill="#4a9c4a" />
          <rect x="7" y="4" width="1" height="1" fill="#ffaa70" />
        </>
      );
    case 'salad':
      return (
        <>
          <rect x="4" y="5" width="8" height="6" fill="#6bcf6b" />
          <rect x="5" y="4" width="6" height="1" fill="#6bcf6b" />
          <rect x="6" y="6" width="4" height="4" fill="#9fdf9f" />
          <rect x="7" y="7" width="2" height="2" fill="#ff6b6b" />
          <rect x="5" y="5" width="1" height="1" fill="#8fdf8f" />
        </>
      );
    case 'berries':
      return (
        <>
          <rect x="5" y="6" width="2" height="2" fill="#8b5a8b" />
          <rect x="7" y="5" width="2" height="2" fill="#8b5a8b" />
          <rect x="9" y="6" width="2" height="2" fill="#8b5a8b" />
          <rect x="6" y="8" width="2" height="2" fill="#8b5a8b" />
          <rect x="8" y="8" width="2" height="2" fill="#8b5a8b" />
          <rect x="7" y="3" width="2" height="2" fill="#4a9c4a" />
          <rect x="5" y="6" width="1" height="1" fill="#9b6a9b" />
          <rect x="7" y="5" width="1" height="1" fill="#9b6a9b" />
        </>
      );
    case 'smoothie':
      return (
        <>
          <rect x="5" y="5" width="6" height="8" fill="#ffb347" />
          <rect x="6" y="4" width="4" height="1" fill="#ffb347" />
          <rect x="6" y="6" width="4" height="4" fill="#ff8a50" />
          <rect x="3" y="6" width="1" height="4" fill="#1a1a1f" />
          <rect x="5" y="5" width="1" height="1" fill="#ffc357" />
          {/* Strawberry on top */}
          <rect x="7" y="4" width="2" height="2" fill="#ff6b6b" />
        </>
      );
    case 'coffee':
      return (
        <>
          <rect x="5" y="5" width="6" height="7" fill="#e8d5c4" />
          <rect x="6" y="6" width="4" height="4" fill="#4a3728" />
          <rect x="11" y="7" width="2" height="1" fill="#e8d5c4" />
          <rect x="11" y="8" width="2" height="1" fill="#d4c4b4" />
          {/* Steam */}
          <rect x="7" y="3" width="1" height="2" fill="#ffffff" opacity="0.5" />
          <rect x="9" y="2" width="1" height="2" fill="#ffffff" opacity="0.5" />
        </>
      );
    case 'energy_bar':
      return (
        <>
          <rect x="4" y="6" width="8" height="5" fill="#5d4e37" />
          <rect x="5" y="7" width="6" height="3" fill="#8b7355" />
          <rect x="6" y="8" width="4" height="1" fill="#d4a574" />
          <rect x="4" y="6" width="1" height="1" fill="#6d5e47" />
        </>
      );
    case 'potion':
      return (
        <>
          <rect x="6" y="3" width="4" height="2" fill="#3d5a80" />
          <rect x="5" y="5" width="6" height="6" fill="#3d5a80" />
          <rect x="6" y="6" width="4" height="4" fill="#00ff88" />
          <rect x="7" y="2" width="2" height="1" fill="#4a5568" />
          <rect x="6" y="6" width="1" height="1" fill="#88ffaa" />
          {/* Bubbles */}
          <rect x="7" y="8" width="1" height="1" fill="#ffffff" opacity="0.5" />
          <rect x="9" y="7" width="1" height="1" fill="#ffffff" opacity="0.3" />
        </>
      );
    default:
      return (
        <>
          <rect x="5" y="5" width="6" height="6" fill="#9ca3af" />
          <rect x="5" y="5" width="1" height="1" fill="#d1d5db" />
        </>
      );
  }
}

// ============================================
// COSMETIC ICON SPRITES
// ============================================

export function CosmeticSprite({ type, style, color, size = 32 }: {
  type: string;
  style: string;
  color?: string;
  size?: number;
}) {
  return (
    <div style={{ width: size, height: size, imageRendering: 'pixelated' }}>
      <svg viewBox="0 0 16 16" width="100%" height="100%" style={{ shapeRendering: 'crispEdges' }}>
        {renderCosmeticIcon(type, style, color)}
      </svg>
    </div>
  );
}

function renderCosmeticIcon(type: string, style: string, color?: string) {
  const mainColor = color || '#9ca3af';

  switch (type) {
    case 'hair':
      return (
        <>
          <rect x="5" y="3" width="6" height="4" fill={mainColor} />
          <rect x="4" y="4" width="1" height="2" fill={mainColor} />
          <rect x="5" y="3" width="1" height="1" fill={shadeColor(mainColor, 20)} />
        </>
      );
    case 'eyes':
      return (
        <>
          <rect x="5" y="6" width="2" height="2" fill={PALETTE.white} />
          <rect x="9" y="6" width="2" height="2" fill={PALETTE.white} />
          <rect x="6" y="7" width="1" height="1" fill={mainColor} />
          <rect x="9" y="7" width="1" height="1" fill={mainColor} />
        </>
      );
    case 'outfit':
      return (
        <>
          <rect x="5" y="3" width="6" height="10" fill={mainColor} />
          <rect x="7" y="3" width="2" height="2" fill={PALETTE.white} />
          <rect x="6" y="6" width="4" height="2" fill={shadeColor(mainColor, -15)} />
          <rect x="5" y="3" width="1" height="1" fill={shadeColor(mainColor, 15)} />
        </>
      );
    case 'accessory':
      if (style === 'none') {
        return <rect x="6" y="6" width="4" height="4" fill="#374151" opacity="0.3" />;
      }
      return (
        <>
          <rect x="4" y="6" width="8" height="3" fill={shadeColor(mainColor, -20)} />
          <rect x="5" y="5" width="2" height="1" fill={mainColor} />
          <rect x="9" y="5" width="2" height="1" fill={mainColor} />
          <rect x="5" y="6" width="1" height="1" fill={shadeColor(mainColor, 20)} />
          <rect x="10" y="6" width="1" height="1" fill={shadeColor(mainColor, 20)} />
        </>
      );
    case 'background':
      if (style === 'none') {
        return (
          <>
            <rect x="1" y="1" width="14" height="14" fill="#1a1a1f" opacity="0.1" />
            <line x1="1" y1="1" x2="15" y2="15" stroke="#1a1a1f" strokeWidth="0.5" opacity="0.2" />
            <line x1="15" y1="1" x2="1" y2="15" stroke="#1a1a1f" strokeWidth="0.5" opacity="0.2" />
          </>
        );
      }
      return (
        <>
          <rect x="1" y="1" width="14" height="14" fill={mainColor} />
          <rect x="1" y="1" width="14" height="3" fill={shadeColor(mainColor, 20)} />
          <rect x="1" y="12" width="14" height="3" fill={shadeColor(mainColor, -20)} />
        </>
      );
    case 'title':
      return (
        <>
          <rect x="3" y="6" width="10" height="4" fill="none" stroke={mainColor} strokeWidth="1" />
          <rect x="4" y="7" width="2" height="2" fill={shadeColor(mainColor, 15)} />
          <rect x="10" y="7" width="2" height="2" fill={shadeColor(mainColor, 15)} />
        </>
      );
    default:
      return <rect x="4" y="4" width="8" height="8" fill={mainColor} />;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function shadeColor(color: string, percent: number): string {
  // Remove alpha if present
  const hex = color.replace('#', '').slice(0, 6);
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

export function getBackgroundGradient(bgId: string): string {
  switch (bgId) {
    case 'sunset': return 'linear-gradient(to bottom, #ff6b6b 0%, #ffd93d 100%)';
    case 'night': return 'linear-gradient(to bottom, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)';
    case 'forest': return 'linear-gradient(to bottom, #134e4a 0%, #1e3a2f 100%)';
    case 'cosmic': return 'linear-gradient(to bottom, #1a0033 0%, #330066 50%, #4d0099 100%)';
    default: return 'transparent';
  }
}

// ============================================
// STAT BAR COMPONENT
// ============================================

export function PixelStatBar({
  label,
  value,
  color,
  icon,
  size = 'md',
}: {
  label: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}) {
  const percentage = Math.max(0, Math.min(100, value));
  const height = size === 'sm' ? 2 : 3;

  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1 text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="tabular-nums text-foreground">{Math.round(percentage)}%</span>
      </div>
      <div
        className="mt-1 overflow-hidden rounded-sm bg-muted"
        style={{ height }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
