/**
 * Type definitions for Kosmos: Odisea Piksel Antariksa
 */

export type GameMode = 'TITLE' | 'SPACE' | 'PLANET_SURFACE' | 'UPGRADES' | 'CODEX' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerStats {
  maxHull: number;
  hull: number;
  maxShield: number;
  shield: number;
  energy: number;
  maxEnergy: number;
  speed: number;
  turnSpeed: number;
  blasterPower: number;
  blasterLevel: number;
  shieldRegen: number;
  miningPower: number;
  cargoCapacity: number;
  boostMultiplier: number;
}

export interface Inventory {
  stardust: number;
  hyperCrystal: number;
  darkMatter: number;
  titanium: number;
  alienArtifacts: number;
}

export interface PlayerShip {
  pos: Vector2D;
  vel: Vector2D;
  angle: number;
  targetAngle: number;
  stats: PlayerStats;
  inventory: Inventory;
  isBoosting: boolean;
  isShooting: boolean;
  isMining: boolean;
  invulnerableTime: number;
  trail: { x: number; y: number; alpha: number; color: string }[];
}

export interface Projectile {
  id: string;
  pos: Vector2D;
  vel: Vector2D;
  angle: number;
  damage: number;
  range: number;
  distanceTraveled: number;
  isEnemy: boolean;
  color: string;
  radius: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'square' | 'spark' | 'smoke';
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  size?: number;
}

export interface ResourceDrop {
  id: string;
  type: 'stardust' | 'hyperCrystal' | 'darkMatter' | 'titanium' | 'alienArtifact';
  x: number;
  y: number;
  vx: number;
  vy: number;
  amount: number;
  magnetized: boolean;
  rotation: number;
}

export interface Asteroid {
  id: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  mineralType: 'stardust' | 'titanium' | 'hyperCrystal';
  palette: string[];
  seed: number;
}

export type PlanetType = 'verdant' | 'volcanic' | 'cryo' | 'ancient' | 'gas_giant';

export interface Planet {
  id: string;
  name: string;
  indonesianSubtitle: string;
  type: PlanetType;
  x: number;
  y: number;
  radius: number;
  orbitRadius?: number;
  hasRings?: boolean;
  ringColor?: string;
  primaryColor: string;
  secondaryColor: string;
  atmosphereColor: string;
  discovered: boolean;
  landable: boolean;
  visited: boolean;
  description: string;
  resourcesAvailable: string[];
  ruinsCount: number;
}

export interface SpaceStation {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'outpost' | 'research_lab' | 'warp_gate' | 'ancient_shrine';
  interactRadius: number;
  isRepaired?: boolean;
}

export type EnemyType = 'pirate_drone' | 'pirate_cruiser' | 'sentinel_eye' | 'void_boss';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  hp: number;
  maxHp: number;
  radius: number;
  speed: number;
  fireCooldown: number;
  fireRate: number;
  telegraphCooldown: number;
  isTelegraphing: boolean;
  attackPatternTime: number;
  color: string;
  name: string;
}

export interface Mission {
  id: string;
  title: string;
  objective: string;
  type: 'collect' | 'discover' | 'defeat' | 'land' | 'boss';
  targetCount: number;
  currentCount: number;
  rewardStardust: number;
  rewardCrystal: number;
  completed: boolean;
  unlocked: boolean;
  loreText: string;
}

export interface UpgradeItem {
  id: string;
  name: string;
  category: 'weapons' | 'defense' | 'engine' | 'mining';
  description: string;
  level: number;
  maxLevel: number;
  costStardust: number;
  costTitanium: number;
  costCrystal: number;
  statBonusText: string;
}

export interface SurfaceRover {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  grounded: boolean;
  fuel: number;
  maxFuel: number;
  miningHeat: number;
  maxMiningHeat: number;
  samplesGathered: number;
}

export interface SurfaceDeposit {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  type: 'stardust' | 'hyperCrystal' | 'titanium' | 'ancientRelic';
}

export interface SurfaceRuin {
  id: string;
  x: number;
  name: string;
  analyzed: boolean;
  lore: string;
}

export type WeatherType = 'CLEAR' | 'DUST_STORM' | 'METEOR_SHOWER' | 'ION_BLIZZARD' | 'PYRO_RAIN';

export interface PlanetaryWeather {
  type: WeatherType;
  name: string;
  description: string;
  intensity: number; // 0 to 1
  windForce: number; // horizontal wind acceleration applied to rover
  tractionMultiplier: number; // 1 = normal, 0.4 = icy drift
  visibility: number; // 0 to 1
  duration: number;
  colorOverlay: string;
  hazardLevel: 'AMAN' | 'WASPADA' | 'BAHAYA';
}

export interface FallingMeteor {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  tailLength: number;
  targetGroundX: number;
  targetGroundY: number;
}
