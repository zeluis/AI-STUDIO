import { WallpaperName } from '../types';
import heroImg from '../assets/images/highsierra_hero_1786885798633.jpg';
import sunsetImg from '../assets/images/highsierra_sunset_1786885811360.jpg';
import graniteImg from '../assets/images/yosemite_granite_1786885826660.jpg';
import snowImg from '../assets/images/alpine_snow_1786885839714.jpg';
import midnightImg from '../assets/images/midnight_stars_1786885853679.jpg';

export interface WallpaperItem {
  id: WallpaperName;
  name: string;
  category: 'nature' | 'dynamic' | 'texture' | 'custom';
  description: string;
  imageSrc?: string;
  gradientFallback: string;
  iconName: string;
  tag?: string;
}

export const WALLPAPER_LIST: WallpaperItem[] = [
  // 1. Native Apple High Sierra Nature & California Landscapes
  {
    id: 'highsierra',
    name: 'macOS High Sierra (Default Hero)',
    category: 'nature',
    description: 'Lake Tenaya and Mount Dana in the High Sierra mountain range with golden-hour alpine glow.',
    imageSrc: heroImg,
    gradientFallback: 'linear-gradient(135deg, #0284C7 0%, #1D4ED8 50%, #0F172A 100%)',
    iconName: 'landscape',
    tag: 'Default',
  },
  {
    id: 'sunset',
    name: 'High Sierra Sunset & Alpine Glow',
    category: 'nature',
    description: 'Fiery magenta, orange, and purple sunset light reflecting off mountain ridges.',
    imageSrc: sunsetImg,
    gradientFallback: 'linear-gradient(135deg, #F59E0B 0%, #E11D48 50%, #3B0764 100%)',
    iconName: 'wb_twilight',
    tag: 'Sunset',
  },
  {
    id: 'granite',
    name: 'Yosemite & Sierra Granite',
    category: 'nature',
    description: 'El Capitan monolith rising over the pine valley under the deep blue California sky.',
    imageSrc: graniteImg,
    gradientFallback: 'linear-gradient(135deg, #52525B 0%, #3F3F46 50%, #0F172A 100%)',
    iconName: 'terrain',
    tag: 'Yosemite',
  },
  {
    id: 'snow',
    name: 'Alpine Snow & Winter Ridge',
    category: 'nature',
    description: 'Snow-covered mountain crags under crisp winter morning light.',
    imageSrc: snowImg,
    gradientFallback: 'linear-gradient(135deg, #CBD5E1 0%, #BAE6FD 50%, #3B82F6 100%)',
    iconName: 'ac_unit',
    tag: 'Winter',
  },
  {
    id: 'space',
    name: 'High Sierra Midnight Stars',
    category: 'nature',
    description: 'Mountain silhouettes under a starry night sky and Milky Way galaxy dust.',
    imageSrc: midnightImg,
    gradientFallback: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #000000 100%)',
    iconName: 'nights_stay',
    tag: 'Night',
  },

  // 2. Dynamic Time-of-Day Mode
  {
    id: 'dynamic',
    name: 'Dynamic Time-of-Day (Auto Shift)',
    category: 'dynamic',
    description: 'Automatically transitions wallpapers matching the real-world clock (Morning Dawn, Daylight, Golden Sunset, Midnight Stars).',
    gradientFallback: 'linear-gradient(135deg, #1E5799 0%, #2989D8 50%, #207CCA 100%)',
    iconName: 'schedule',
    tag: '24-Hour Auto',
  },

  // 3. Classic Apple Textures
  {
    id: 'aqua',
    name: 'Apple Aqua Blue Waves',
    category: 'texture',
    description: 'Liquid glass blue wave gradient from classic Mac OS X Aqua interface.',
    gradientFallback: 'radial-gradient(circle at 50% 30%, #38bdf8 0%, #0284c7 40%, #0369a1 70%, #082f49 100%)',
    iconName: 'waves',
    tag: 'Aqua',
  },
  {
    id: 'brushed_metal',
    name: 'Brushed Aluminum Texture',
    category: 'texture',
    description: 'Retro brushed aluminum metal texture inspired by classic PowerBook and QuickTime.',
    gradientFallback: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 30%, #94A3B8 70%, #475569 100%)',
    iconName: 'layers',
    tag: 'Metal',
  },
  {
    id: 'nebula',
    name: 'Deep Space Dark Nebula',
    category: 'texture',
    description: 'Atmospheric cosmic dark nebula with rich magenta and violet starry dust clouds.',
    gradientFallback: 'radial-gradient(circle at 70% 30%, #7e22ce 0%, #4c1d95 40%, #1e1b4b 70%, #030712 100%)',
    iconName: 'blur_on',
    tag: 'Cosmic',
  },
];

export const getDynamicWallpaperForHour = (hour: number): {
  imageSrc: string;
  name: string;
  periodName: string;
  gradientFallback: string;
} => {
  if (hour >= 5 && hour < 11) {
    return {
      imageSrc: snowImg,
      name: 'Alpine Snow & Winter Ridge',
      periodName: 'Morning Dawn (5:00 - 11:00)',
      gradientFallback: 'linear-gradient(135deg, #CBD5E1 0%, #BAE6FD 50%, #3B82F6 100%)',
    };
  } else if (hour >= 11 && hour < 17) {
    return {
      imageSrc: heroImg,
      name: 'macOS High Sierra (Default Hero)',
      periodName: 'Daylight High Sierra (11:00 - 17:00)',
      gradientFallback: 'linear-gradient(135deg, #0284C7 0%, #1D4ED8 50%, #0F172A 100%)',
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      imageSrc: sunsetImg,
      name: 'High Sierra Sunset & Alpine Glow',
      periodName: 'Golden Sunset & Alpine Glow (17:00 - 21:00)',
      gradientFallback: 'linear-gradient(135deg, #F59E0B 0%, #E11D48 50%, #3B0764 100%)',
    };
  } else {
    return {
      imageSrc: midnightImg,
      name: 'High Sierra Midnight Stars',
      periodName: 'Midnight Stars & Milky Way (21:00 - 5:00)',
      gradientFallback: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #000000 100%)',
    };
  }
};
