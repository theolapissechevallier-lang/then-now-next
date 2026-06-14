import { cn } from '@/lib/utils';
import type { AvatarState } from '@/lib/avatar-types';
import { AvatarSprite, getBackgroundGradient } from './pixel-sprites';

// Main avatar display component
type PixelAvatarProps = {
  avatar: AvatarState;
  size?: number;
  className?: string;
  showTitle?: boolean;
};

export function PixelAvatar({ avatar, size = 180, className, showTitle = false }: PixelAvatarProps) {
  const bgGradient = getBackgroundGradient(avatar.background);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl",
        className
      )}
      style={{
        width: size,
        height: size,
        background: bgGradient !== 'transparent'
          ? bgGradient
          : 'var(--color-secondary)',
      }}
    >
      {/* Title display above avatar */}
      {showTitle && avatar.title && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: '#fbbf24',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            {avatar.title}
          </span>
        </div>
      )}

      {/* The avatar sprite */}
      <div className="relative" style={{ marginTop: showTitle ? '12px' : '0' }}>
        <AvatarSprite
          hairStyle={avatar.hairStyle}
          hairColor={avatar.hairColor}
          eyeColor={avatar.eyeColor}
          skinTone={avatar.skinTone}
          outfit={avatar.outfit}
          outfitColor={avatar.outfitColor}
          accessory={avatar.accessory}
          size={size * 0.6}
        />

        {/* Shadow under avatar */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/20"
          style={{
            width: size * 0.35,
            height: size * 0.05,
            filter: 'blur(2px)',
          }}
        />
      </div>

      {/* Decorative elements based on background */}
      {avatar.background === 'night' && (
        <>
          <div className="absolute top-4 left-4 w-1 h-1 bg-white/80 rounded-full" />
          <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-white/60 rounded-full" />
          <div className="absolute top-12 left-8 w-1 h-1 bg-white/40 rounded-full" />
          <div className="absolute top-6 right-10 w-0.5 h-0.5 bg-white/90 rounded-full" />
        </>
      )}

      {avatar.background === 'cosmic' && (
        <>
          <div className="absolute top-3 left-5 w-1.5 h-1.5 bg-purple-300/60 rounded-full" />
          <div className="absolute top-10 right-4 w-2 h-2 bg-pink-300/40 rounded-full" />
          <div className="absolute bottom-16 left-6 w-1 h-1 bg-blue-300/70 rounded-full" />
        </>
      )}

      {avatar.background === 'sunset' && (
        <>
          <div
            className="absolute bottom-0 left-0 right-0 h-8 opacity-30"
            style={{
              background: 'linear-gradient(to top, #000, transparent)',
            }}
          />
        </>
      )}

      {avatar.background === 'forest' && (
        <>
          <div
            className="absolute bottom-0 left-0 h-12 w-4"
            style={{
              background: 'linear-gradient(to top, #162719, transparent)',
            }}
          />
          <div
            className="absolute bottom-0 right-0 h-16 w-5"
            style={{
              background: 'linear-gradient(to top, #1a3020, transparent)',
            }}
          />
        </>
      )}
    </div>
  );
}

// Preview component for customization UI
export function AvatarPreview({
  avatar,
  size = 120,
  className,
}: {
  avatar: AvatarState;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-secondary/50",
        className
      )}
      style={{ width: size, height: size }}
    >
      <AvatarSprite
        hairStyle={avatar.hairStyle}
        hairColor={avatar.hairColor}
        eyeColor={avatar.eyeColor}
        skinTone={avatar.skinTone}
        outfit={avatar.outfit}
        outfitColor={avatar.outfitColor}
        accessory={avatar.accessory}
        size={size * 0.75}
      />
    </div>
  );
}
