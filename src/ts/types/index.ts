export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacitySpeed: number;
}

export interface TypewriterConfig {
  element: HTMLElement;
  words: string[];
  typingSpeed: number;
  deletingSpeed: number;
  pauseTime: number;
}

export interface ExperienceModalData {
  title: string;
  company: string;
  period: string;
  role: string;
  details: string[];
  achievements?: string[];
  tags: string[];
}
