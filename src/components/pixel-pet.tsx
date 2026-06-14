import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { PetMood, PetStage } from '@/lib/pet-types';
import { PetSprite, PixelStatBar, getBackgroundGradient } from './pixel-sprites';

// ============================================
// PIXEL PET COMPONENT - Minimalist Style
// ============================================

type PixelPetProps = {
  species: string;
  stage: PetStage;
  mood: PetMood;
  size?: number;
  className?: string;
};

export function PixelPet({ species, stage, mood, size = 180, className }: PixelPetProps) {
  const [bounce, setBounce] = useState(false);

  // Bounce animation when happy
  useEffect(() => {
    if (mood === 'happy' || mood === 'excited') {
      const interval = setInterval(() => {
        setBounce(true);
        setTimeout(() => setBounce(false), 200);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [mood]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Pet container with animation */}
      <div
        className={cn(
          "relative transition-transform duration-200",
          bounce && "-translate-y-2"
        )}
      >
        <PetSprite
          species={species}
          stage={stage}
          mood={mood}
          size={size * 0.7}
        />

        {/* Shadow */}
        <div
          className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/20 transition-all",
            bounce && "scale-75 opacity-50"
          )}
          style={{
            width: size * 0.25,
            height: size * 0.06,
            filter: 'blur(3px)',
          }}
        />

        {/* Mood indicator */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <MoodIndicator mood={mood} />
        </div>
      </div>
    </div>
  );
}

// Mood indicator below pet
function MoodIndicator({ mood }: { mood: PetMood }) {
  const label = getMoodLabel(mood);
  const color = getMoodColor(mood);

  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider",
      )}
      style={{
        backgroundColor: `${color}20`,
        color,
      }}
    >
      {label}
    </span>
  );
}

function getMoodLabel(mood: PetMood): string {
  switch (mood) {
    case 'happy': return 'Happy';
    case 'excited': return 'Excited!';
    case 'sad': return 'Sad';
    case 'hungry': return 'Hungry';
    case 'tired': return 'Tired';
    default: return 'Content';
  }
}

function getMoodColor(mood: PetMood): string {
  switch (mood) {
    case 'happy': return '#4ade80';
    case 'excited': return '#fbbf24';
    case 'sad': return '#60a5fa';
    case 'hungry': return '#f87171';
    case 'tired': return '#a78bfa';
    default: return '#9ca3af';
  }
}

// ============================================
// PET STATS DISPLAY
// ============================================

export function PetStats({
  hunger,
  happiness,
  energy,
  xp,
  level,
  stage,
  size = 'md',
}: {
  hunger: number;
  happiness: number;
  energy: number;
  xp: number;
  level: number;
  stage: PetStage;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="space-y-3">
      <PixelStatBar
        label="Hunger"
        value={hunger}
        color={hunger < 30 ? '#ef4444' : hunger < 60 ? '#f59e0b' : '#22c55e'}
        size={size}
      />
      <PixelStatBar
        label="Happiness"
        value={happiness}
        color={happiness < 30 ? '#ef4444' : happiness < 60 ? '#f59e0b' : '#ec4899'}
        size={size}
      />
      <PixelStatBar
        label="Energy"
        value={energy}
        color={energy < 30 ? '#ef4444' : energy < 60 ? '#f59e0b' : '#3b82f6'}
        size={size}
      />

      {/* Level and stage info */}
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pt-1">
        <span>Lv.{level}</span>
        <span className="capitalize">{stage}</span>
        <span className="tabular-nums">{xp} XP</span>
      </div>
    </div>
  );
}

// ============================================
// PET WITH BACKGROUND
// ============================================

export function PetWithBackground({
  species,
  stage,
  mood,
  background,
  size = 200,
  className,
}: {
  species: string;
  stage: PetStage;
  mood: PetMood;
  background?: string;
  size?: number;
  className?: string;
}) {
  const bgGradient = getBackgroundGradient(background || 'none');

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl",
        className
      )}
      style={{
        width: size,
        height: size,
        background: bgGradient !== 'transparent' ? bgGradient : 'var(--color-secondary)',
      }}
    >
      <PixelPet
        species={species}
        stage={stage}
        mood={mood}
        size={size * 0.85}
      />

      {/* Sparkle effects for happy pets */}
      {(mood === 'happy' || mood === 'excited') && (
        <>
          <div
            className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
            style={{ opacity: 0.6 }}
          />
          <div
            className="absolute top-6 right-5 w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse"
            style={{ opacity: 0.5, animationDelay: '0.3s' }}
          />
          <div
            className="absolute bottom-8 left-6 w-1 h-1 bg-blue-300 rounded-full animate-pulse"
            style={{ opacity: 0.4, animationDelay: '0.6s' }}
          />
        </>
      )}
    </div>
  );
}

// ============================================
// PET STAT BAR (Legacy compatibility)
// ============================================

export function PetStatBar({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <PixelStatBar
      label={label}
      value={value}
      color={color}
      icon={icon}
    />
  );
}
