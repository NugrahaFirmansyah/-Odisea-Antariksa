/**
 * Main 60 FPS Game Engine for Kosmos: Odisea Antariksa.
 * Manages physics, input buffering, hitstop, camera shake, combat, and sector navigation.
 */

import { soundManager } from '../audio/soundManager';
import {
  Asteroid,
  Enemy,
  FloatingText,
  GameMode,
  Particle,
  Planet,
  PlayerShip,
  Projectile,
  ResourceDrop,
  SpaceStation,
  UpgradeItem,
  Mission,
  PlanetaryWeather,
} from '../types/game';
import { drawAsteroid, drawEnemy, drawPlanet, drawPlayerShip, drawResourceDrop, drawSpaceStation } from './sprites';
import { generateAsteroidBelt, INITIAL_PLANETS, INITIAL_STATIONS, INITIAL_MISSIONS, INITIAL_UPGRADES } from './world';
import { PlanetarySurfaceScene } from './planetarySurface';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public width: number = 1280;
  public height: number = 720;

  // Game State Machine
  public mode: GameMode = 'TITLE';
  public isRunning: boolean = false;
  public lastFrameTime: number = 0;
  public gameTime: number = 0;

  // Game Feel (Hitstop & Screen Shake)
  public hitstopTimer: number = 0;
  public cameraShake: number = 0;
  public cameraX: number = 0;
  public cameraY: number = 0;

  // Starfield background layers
  private starsLayer1: { x: number; y: number; size: number; alpha: number; color: string }[] = [];
  private starsLayer2: { x: number; y: number; size: number; alpha: number; color: string }[] = [];
  private nebulae: { x: number; y: number; radius: number; color: string }[] = [];

  // Entities
  public player: PlayerShip;
  public planets: Planet[] = [];
  public stations: SpaceStation[] = [];
  public asteroids: Asteroid[] = [];
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public resourceDrops: ResourceDrop[] = [];
  public floatingTexts: FloatingText[] = [];
  public missions: Mission[] = [];
  public upgrades: UpgradeItem[] = [];

  // Surface Exploration instance
  public surfaceScene: PlanetarySurfaceScene | null = null;
  public currentLandedPlanet: Planet | null = null;
  public spaceWeather: PlanetaryWeather | null = null;

  // Active interaction prompt
  public interactionPrompt: string | null = null;
  public interactionAction: (() => void) | null = null;

  // Input Handling
  public keysHeld: Record<string, boolean> = {};
  public keysJustPressed: Record<string, boolean> = {};

  // External UI callback hooks (for state changes)
  public onStateChange?: (mode: GameMode) => void;
  public onHUDUpdate?: (data: {
    hull: number;
    maxHull: number;
    shield: number;
    maxShield: number;
    energy: number;
    maxEnergy: number;
    inventory: PlayerShip['inventory'];
    activeMission: Mission | null;
    radarTargets: { angle: number; dist: number; type: string; name: string }[];
    currentZone: string;
    prompt: string | null;
    weather: PlanetaryWeather | null;
  }) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.player = this.createDefaultPlayer();
    this.planets = [...INITIAL_PLANETS];
    this.stations = [...INITIAL_STATIONS];
    this.missions = JSON.parse(JSON.stringify(INITIAL_MISSIONS));
    this.upgrades = JSON.parse(JSON.stringify(INITIAL_UPGRADES));
    this.asteroids = generateAsteroidBelt(65);

    this.initStarfield();
    this.initEnemies();
    this.setupInputListeners();
    this.resizeCanvas();
  }

  private createDefaultPlayer(): PlayerShip {
    return {
      pos: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      angle: -Math.PI / 2,
      targetAngle: -Math.PI / 2,
      stats: {
        maxHull: 100,
        hull: 100,
        maxShield: 80,
        shield: 80,
        energy: 100,
        maxEnergy: 100,
        speed: 380,
        turnSpeed: 4.5,
        blasterPower: 25,
        blasterLevel: 1,
        shieldRegen: 8,
        miningPower: 30,
        cargoCapacity: 200,
        boostMultiplier: 1.8,
      },
      inventory: {
        stardust: 0,
        hyperCrystal: 0,
        darkMatter: 0,
        titanium: 0,
        alienArtifacts: 0,
      },
      isBoosting: false,
      isShooting: false,
      isMining: false,
      invulnerableTime: 0,
      trail: [],
    };
  }

  private initStarfield() {
    this.starsLayer1 = [];
    this.starsLayer2 = [];
    this.nebulae = [];

    // Dense distant stars
    for (let i = 0; i < 400; i++) {
      this.starsLayer1.push({
        x: (Math.random() - 0.5) * 6000,
        y: (Math.random() - 0.5) * 6000,
        size: Math.random() > 0.85 ? 2 : 1,
        alpha: 0.3 + Math.random() * 0.7,
        color: Math.random() > 0.7 ? '#67e8f9' : Math.random() > 0.4 ? '#fef08a' : '#ffffff',
      });
    }

    // Closer parallax stars
    for (let i = 0; i < 200; i++) {
      this.starsLayer2.push({
        x: (Math.random() - 0.5) * 6000,
        y: (Math.random() - 0.5) * 6000,
        size: Math.random() > 0.6 ? 3 : 2,
        alpha: 0.5 + Math.random() * 0.5,
        color: Math.random() > 0.5 ? '#93c5fd' : '#fbcfe8',
      });
    }

    // Atmospheric color nebulae
    this.nebulae = [
      { x: -1200, y: -800, radius: 450, color: 'rgba(30, 58, 138, 0.16)' },
      { x: 1400, y: -600, radius: 550, color: 'rgba(88, 28, 135, 0.18)' },
      { x: -900, y: 1100, radius: 400, color: 'rgba(153, 27, 27, 0.14)' },
      { x: 1200, y: 1300, radius: 500, color: 'rgba(67, 56, 202, 0.15)' },
    ];
  }

  private initEnemies() {
    this.enemies = [
      {
        id: 'drone_1',
        name: 'Pirate Drone Alpha',
        type: 'pirate_drone',
        x: -450,
        y: -400,
        vx: 0,
        vy: 0,
        angle: 0,
        hp: 40,
        maxHp: 40,
        radius: 14,
        speed: 160,
        fireCooldown: 0,
        fireRate: 2.2,
        telegraphCooldown: 0,
        isTelegraphing: false,
        attackPatternTime: 0,
        color: '#ef4444',
      },
      {
        id: 'drone_2',
        name: 'Pirate Drone Beta',
        type: 'pirate_drone',
        x: 600,
        y: -350,
        vx: 0,
        vy: 0,
        angle: 0,
        hp: 40,
        maxHp: 40,
        radius: 14,
        speed: 160,
        fireCooldown: 1.0,
        fireRate: 2.2,
        telegraphCooldown: 0,
        isTelegraphing: false,
        attackPatternTime: 0,
        color: '#ef4444',
      },
      {
        id: 'cruiser_1',
        name: 'Kapal Tempur Bajak Laut',
        type: 'pirate_cruiser',
        x: 800,
        y: 400,
        vx: 0,
        vy: 0,
        angle: 0,
        hp: 120,
        maxHp: 120,
        radius: 24,
        speed: 110,
        fireCooldown: 0,
        fireRate: 2.8,
        telegraphCooldown: 0,
        isTelegraphing: false,
        attackPatternTime: 0,
        color: '#b91c1c',
      },
      {
        id: 'sentinel_1',
        name: 'Sentinel Mata Kuno',
        type: 'sentinel_eye',
        x: 1400,
        y: -1000,
        vx: 0,
        vy: 0,
        angle: 0,
        hp: 160,
        maxHp: 160,
        radius: 28,
        speed: 80,
        fireCooldown: 0,
        fireRate: 3.5,
        telegraphCooldown: 0,
        isTelegraphing: false,
        attackPatternTime: 0,
        color: '#a855f7',
      },
      {
        id: 'void_titan_boss',
        name: 'Titan Kehampaan: Penjaga Gerbang',
        type: 'void_boss',
        x: 1700,
        y: -1200,
        vx: 0,
        vy: 0,
        angle: 0,
        hp: 450,
        maxHp: 450,
        radius: 46,
        speed: 65,
        fireCooldown: 0,
        fireRate: 1.8,
        telegraphCooldown: 0,
        isTelegraphing: false,
        attackPatternTime: 0,
        color: '#6366f1',
      },
    ];
  }

  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.keysHeld[e.code] = true;
      this.keysJustPressed[e.code] = true;

      // Global key actions
      if (e.code === 'KeyM' || e.code === 'Tab') {
        e.preventDefault();
        if (this.mode === 'SPACE') {
          this.setMode('CODEX');
        } else if (this.mode === 'CODEX') {
          this.setMode('SPACE');
        }
      }

      if (e.code === 'Escape') {
        e.preventDefault();
        if (this.mode === 'SPACE' || this.mode === 'PLANET_SURFACE') {
          this.setMode('PAUSED');
        } else if (this.mode === 'PAUSED' || this.mode === 'UPGRADES' || this.mode === 'CODEX') {
          this.setMode(this.surfaceScene ? 'PLANET_SURFACE' : 'SPACE');
        }
      }

      if (e.code === 'KeyE') {
        if (this.interactionAction) {
          this.interactionAction();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keysHeld = {};
      this.keysJustPressed = {};
      soundManager.setThruster(false);
    });

    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  public resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.width = parent.clientWidth;
      this.height = parent.clientHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }

  public start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }
  }

  public setMode(newMode: GameMode) {
    this.mode = newMode;
    if (this.onStateChange) {
      this.onStateChange(newMode);
    }
  }

  public startGame() {
    soundManager.resume();
    soundManager.playWarp();
    this.setMode('SPACE');
  }

  public restartGame() {
    this.player = this.createDefaultPlayer();
    this.planets = [...INITIAL_PLANETS];
    this.stations = [...INITIAL_STATIONS];
    this.missions = JSON.parse(JSON.stringify(INITIAL_MISSIONS));
    this.upgrades = JSON.parse(JSON.stringify(INITIAL_UPGRADES));
    this.asteroids = generateAsteroidBelt(65);
    this.initEnemies();
    this.surfaceScene = null;
    this.currentLandedPlanet = null;
    this.projectiles = [];
    this.particles = [];
    this.resourceDrops = [];
    this.floatingTexts = [];
    this.cameraShake = 0;
    this.setMode('SPACE');
  }

  // Upgrade Purchase Handler
  public purchaseUpgrade(upgradeId: string): boolean {
    const upg = this.upgrades.find((u) => u.id === upgradeId);
    if (!upg || upg.level >= upg.maxLevel) return false;

    const { stardust, titanium, hyperCrystal } = this.player.inventory;
    if (stardust >= upg.costStardust && titanium >= upg.costTitanium && hyperCrystal >= upg.costCrystal) {
      this.player.inventory.stardust -= upg.costStardust;
      this.player.inventory.titanium -= upg.costTitanium;
      this.player.inventory.hyperCrystal -= upg.costCrystal;

      upg.level++;
      upg.costStardust = Math.floor(upg.costStardust * 1.6);
      upg.costTitanium = Math.floor(upg.costTitanium * 1.5);
      upg.costCrystal = Math.floor(upg.costCrystal * 1.5);

      // Apply stat bonuses
      if (upg.id === 'upg_hull') {
        this.player.stats.maxHull += 40;
        this.player.stats.hull = this.player.stats.maxHull;
      } else if (upg.id === 'upg_shield') {
        this.player.stats.maxShield += 30;
        this.player.stats.shield = this.player.stats.maxShield;
        this.player.stats.shieldRegen += 4;
      } else if (upg.id === 'upg_blaster') {
        this.player.stats.blasterPower += 15;
        this.player.stats.blasterLevel++;
      } else if (upg.id === 'upg_engine') {
        this.player.stats.speed += 50;
        this.player.stats.boostMultiplier += 0.25;
      } else if (upg.id === 'upg_mining') {
        this.player.stats.miningPower += 20;
      }

      soundManager.playMissionSuccess();
      return true;
    }
    return false;
  }

  // Surface Landing and Return
  public landOnPlanet(planet: Planet) {
    if (!planet.landable) return;
    soundManager.playWarp();
    planet.visited = true;
    this.currentLandedPlanet = planet;
    this.surfaceScene = new PlanetarySurfaceScene(planet);
    this.setMode('PLANET_SURFACE');

    // Update mission progression
    const landMission = this.missions.find((m) => m.id === 'm3_land_planet');
    if (landMission && !landMission.completed) {
      landMission.currentCount = 1;
      this.completeMission(landMission);
    }
  }

  public returnToOrbit() {
    soundManager.playWarp();
    this.surfaceScene = null;
    this.currentLandedPlanet = null;
    this.setMode('SPACE');
  }

  private completeMission(mission: Mission) {
    if (mission.completed) return;
    mission.completed = true;
    this.player.inventory.stardust += mission.rewardStardust;
    this.player.inventory.hyperCrystal += mission.rewardCrystal;
    soundManager.playMissionSuccess();

    this.floatingTexts.push({
      x: this.player.pos.x,
      y: this.player.pos.y - 40,
      text: `MISI SELESAI: ${mission.title}!`,
      color: '#fbbf24',
      alpha: 1,
      vy: -35,
    });

    // Check unlocking boss mission
    if (mission.id === 'm4_patrol') {
      const bossMission = this.missions.find((m) => m.id === 'm5_boss');
      if (bossMission) bossMission.unlocked = true;
    }

    // Check victory condition
    if (mission.id === 'm5_boss') {
      setTimeout(() => {
        this.setMode('VICTORY');
      }, 1500);
    }
  }

  private loop(currentTime: number) {
    if (!this.isRunning) return;

    const rawDt = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    const dt = Math.min(rawDt, 0.05); // Clamped delta time

    // Simulation hitstop pause
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
    } else {
      this.update(dt);
    }

    this.render();

    // Clear edge-triggered keys after frame
    this.keysJustPressed = {};

    requestAnimationFrame(this.loop.bind(this));
  }

  private update(dt: number) {
    this.gameTime += dt;

    if (this.mode === 'SPACE') {
      this.updateSpace(dt);
    } else if (this.mode === 'PLANET_SURFACE' && this.surfaceScene) {
      this.updateSurface(dt);
    }

    // Decay camera shake
    this.cameraShake *= Math.pow(0.04, dt);
    if (this.cameraShake < 0.2) this.cameraShake = 0;
  }

  // --- Space Flight Simulation ---
  private updateSpace(dt: number) {
    const { player } = this;

    // Movement Input
    const up = this.keysHeld['KeyW'] || this.keysHeld['ArrowUp'];
    const down = this.keysHeld['KeyS'] || this.keysHeld['ArrowDown'];
    const left = this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft'];
    const right = this.keysHeld['KeyD'] || this.keysHeld['ArrowRight'];
    const boost = (this.keysHeld['ShiftLeft'] || this.keysHeld['ShiftRight']) && player.stats.energy > 10;
    const fire = this.keysHeld['Space'];

    // Turning Angle
    if (left) player.angle -= player.stats.turnSpeed * dt;
    if (right) player.angle += player.stats.turnSpeed * dt;

    // Forward Thrust
    let isThrusting = false;
    if (up) {
      isThrusting = true;
      const effectiveSpeed = player.stats.speed * (boost ? player.stats.boostMultiplier : 1);
      const ax = Math.cos(player.angle) * effectiveSpeed * 1.5;
      const ay = Math.sin(player.angle) * effectiveSpeed * 1.5;
      player.vel.x += ax * dt;
      player.vel.y += ay * dt;

      if (boost) {
        player.stats.energy = Math.max(0, player.stats.energy - 35 * dt);
        player.isBoosting = true;
      } else {
        player.isBoosting = false;
      }

      // Add Thruster Trail
      if (Math.random() > 0.3) {
        player.trail.push({
          x: player.pos.x - Math.cos(player.angle) * 16,
          y: player.pos.y - Math.sin(player.angle) * 16,
          alpha: 1,
          color: boost ? '#38bdf8' : '#0284c7',
        });
      }
    } else if (down) {
      // Retro thrusters / brake
      player.vel.x *= 0.94;
      player.vel.y *= 0.94;
    } else {
      player.isBoosting = false;
      // Space inertia drag
      player.vel.x *= 0.985;
      player.vel.y *= 0.985;
    }

    // Audio feedback for thrusters
    soundManager.setThruster(isThrusting, player.isBoosting);

    // Speed clamp
    const maxV = player.stats.speed * (player.isBoosting ? player.stats.boostMultiplier : 1);
    const curSpeed = Math.sqrt(player.vel.x * player.vel.x + player.vel.y * player.vel.y);
    if (curSpeed > maxV) {
      player.vel.x = (player.vel.x / curSpeed) * maxV;
      player.vel.y = (player.vel.y / curSpeed) * maxV;
    }

    // Planetary Gravity & Atmospheric Weather Influence in Orbit
    this.spaceWeather = null;
    for (const planet of this.planets) {
      const dx = planet.x - player.pos.x;
      const dy = planet.y - player.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const atmoRadius = planet.radius + 180;

      if (dist < atmoRadius) {
        // Gravitational pull towards planet center
        const pull = (1 - dist / atmoRadius) * 110;
        player.vel.x += (dx / dist) * pull * dt;
        player.vel.y += (dy / dist) * pull * dt;

        // Atmospheric friction
        player.vel.x *= 0.99;
        player.vel.y *= 0.99;

        // Atmospheric entry friction particles
        if (Math.random() < 0.25) {
          this.particles.push({
            x: player.pos.x + (Math.random() - 0.5) * 20,
            y: player.pos.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 50 - player.vel.x * 0.2,
            vy: (Math.random() - 0.5) * 50 - player.vel.y * 0.2,
            size: 2,
            color: planet.atmosphereColor,
            alpha: 0.8,
            decay: 2.5,
          });
        }

        // Set orbit weather state
        this.spaceWeather = {
          type:
            planet.type === 'cryo'
              ? 'ION_BLIZZARD'
              : planet.type === 'volcanic'
              ? 'PYRO_RAIN'
              : planet.type === 'gas_giant'
              ? 'DUST_STORM'
              : 'CLEAR',
          name: `Atmosfer Orbit ${planet.name}`,
          description: `Medan gravitasi dan gesekan ion atmosfer mempengaruhi kemudi wahana.`,
          intensity: 0.65,
          windForce: Math.sin(this.gameTime * 2) * 18,
          tractionMultiplier: 0.85,
          visibility: 0.75,
          duration: 999,
          colorOverlay: 'transparent',
          hazardLevel: dist < planet.radius + 40 ? 'BAHAYA' : 'WASPADA',
        };
        break;
      }
    }

    player.pos.x += player.vel.x * dt;
    player.pos.y += player.vel.y * dt;

    // Energy & Shield Regeneration
    if (!player.isBoosting) {
      player.stats.energy = Math.min(player.stats.maxEnergy, player.stats.energy + 25 * dt);
    }
    if (player.invulnerableTime > 0) {
      player.invulnerableTime -= dt;
    } else {
      player.stats.shield = Math.min(player.stats.maxShield, player.stats.shield + player.stats.shieldRegen * dt);
    }

    // Weapons Firing
    if (fire) {
      this.firePlayerWeapon();
    }

    // Update Player Trail
    for (let i = player.trail.length - 1; i >= 0; i--) {
      const t = player.trail[i];
      t.alpha -= 3.5 * dt;
      if (t.alpha <= 0) player.trail.splice(i, 1);
    }

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Asteroids
    this.updateAsteroids(dt);

    // Update Enemies & Boss
    this.updateEnemies(dt);

    // Update Resource Drops & Tractor Magnet
    this.updateResources(dt);

    // Update Particles & Floating Text
    this.updateEffects(dt);

    // Check Sector Interactions (Stations, Planets, Gates)
    this.checkInteractions();

    // Camera follow player smoothly
    const targetCamX = player.pos.x - this.width / 2;
    const targetCamY = player.pos.y - this.height / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraY += (targetCamY - this.cameraY) * 0.12;

    // Broadcast HUD updates to React
    this.broadcastHUD();
  }

  // --- Planetary Surface Simulation ---
  private updateSurface(dt: number) {
    if (!this.surfaceScene) return;

    const left = this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft'];
    const right = this.keysHeld['KeyD'] || this.keysHeld['ArrowRight'];
    const jump = this.keysHeld['KeyW'] || this.keysHeld['ArrowUp'] || this.keysHeld['Space'];
    const interact = this.keysJustPressed['KeyE'];
    const action = this.keysHeld['KeyF'] || this.keysHeld['KeyE'] || this.keysHeld['Space'];

    this.surfaceScene.update(
      dt,
      { left, right, jump, interact, action },
      (type, amount) => {
        if (type === 'stardust') this.player.inventory.stardust += amount;
        else if (type === 'hyperCrystal') this.player.inventory.hyperCrystal += amount;
        else if (type === 'titanium') this.player.inventory.titanium += amount;
        else if (type === 'ancientRelic') this.player.inventory.alienArtifacts += amount;

        // Check collect mission progress
        const colMission = this.missions.find((m) => m.id === 'm1_stardust');
        if (colMission && !colMission.completed && type === 'stardust') {
          colMission.currentCount = Math.min(colMission.targetCount, colMission.currentCount + amount);
          if (colMission.currentCount >= colMission.targetCount) {
            this.completeMission(colMission);
          }
        }
      }
    );

    // Check return to orbit prompt near shuttle
    if (Math.abs(this.surfaceScene.rover.x - this.surfaceScene.shuttleX) < 70) {
      this.interactionPrompt = '[E] Kembali Ke Wahana Induk & Masuk Orbit';
      this.interactionAction = () => {
        this.returnToOrbit();
      };
    } else {
      this.interactionPrompt = null;
      this.interactionAction = null;
    }

    this.broadcastHUD();
  }

  private firePlayerWeapon() {
    const { player } = this;
    const fireInterval = 0.18;
    if (this.gameTime - (this as unknown as { lastFireTime?: number }).lastFireTime! < fireInterval) {
      return;
    }
    (this as unknown as { lastFireTime: number }).lastFireTime = this.gameTime;

    soundManager.playLaser();
    const speed = 750;
    const tier = player.stats.blasterLevel;

    if (tier === 1) {
      // Single center plasma bolt
      this.projectiles.push({
        id: `p_${Date.now()}`,
        pos: {
          x: player.pos.x + Math.cos(player.angle) * 18,
          y: player.pos.y + Math.sin(player.angle) * 18,
        },
        vel: {
          x: Math.cos(player.angle) * speed + player.vel.x * 0.5,
          y: Math.sin(player.angle) * speed + player.vel.y * 0.5,
        },
        angle: player.angle,
        damage: player.stats.blasterPower,
        range: 650,
        distanceTraveled: 0,
        isEnemy: false,
        color: '#38bdf8',
        radius: 3,
      });
    } else if (tier === 2) {
      // Twin wing cannons
      const offsets = [-10, 10];
      offsets.forEach((off) => {
        const perp = player.angle + Math.PI / 2;
        const sx = player.pos.x + Math.cos(player.angle) * 14 + Math.cos(perp) * off;
        const sy = player.pos.y + Math.sin(player.angle) * 14 + Math.sin(perp) * off;
        this.projectiles.push({
          id: `p_${Date.now()}_${off}`,
          pos: { x: sx, y: sy },
          vel: {
            x: Math.cos(player.angle) * speed + player.vel.x * 0.5,
            y: Math.sin(player.angle) * speed + player.vel.y * 0.5,
          },
          angle: player.angle,
          damage: player.stats.blasterPower * 0.75,
          range: 700,
          distanceTraveled: 0,
          isEnemy: false,
          color: '#38bdf8',
          radius: 3,
        });
      });
    } else {
      // Triple spread railgun (Tier 3)
      [-0.1, 0, 0.1].forEach((spread, i) => {
        const a = player.angle + spread;
        this.projectiles.push({
          id: `p_${Date.now()}_${i}`,
          pos: {
            x: player.pos.x + Math.cos(player.angle) * 18,
            y: player.pos.y + Math.sin(player.angle) * 18,
          },
          vel: {
            x: Math.cos(a) * speed + player.vel.x * 0.5,
            y: Math.sin(a) * speed + player.vel.y * 0.5,
          },
          angle: a,
          damage: player.stats.blasterPower * 0.7,
          range: 800,
          distanceTraveled: 0,
          isEnemy: false,
          color: '#f59e0b',
          radius: 4,
        });
      });
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const stepX = p.vel.x * dt;
      const stepY = p.vel.y * dt;
      p.pos.x += stepX;
      p.pos.y += stepY;
      p.distanceTraveled += Math.sqrt(stepX * stepX + stepY * stepY);

      if (p.distanceTraveled >= p.range) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Projectile collision with player
      if (p.isEnemy) {
        const pdx = p.pos.x - this.player.pos.x;
        const pdy = p.pos.y - this.player.pos.y;
        if (Math.sqrt(pdx * pdx + pdy * pdy) < 18 && this.player.invulnerableTime <= 0) {
          this.applyDamageToPlayer(p.damage);
          this.createHitParticles(p.pos.x, p.pos.y, '#ef4444');
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Player projectile hitting Asteroids
        let hitAsteroid = false;
        for (const ast of this.asteroids) {
          const adx = p.pos.x - ast.x;
          const ady = p.pos.y - ast.y;
          if (Math.sqrt(adx * adx + ady * ady) < ast.radius) {
            ast.hp -= p.damage;
            soundManager.playShieldHit();
            this.createHitParticles(p.pos.x, p.pos.y, '#bae6fd');
            if (ast.hp <= 0) {
              this.destroyAsteroid(ast);
            }
            this.projectiles.splice(i, 1);
            hitAsteroid = true;
            break;
          }
        }
        if (hitAsteroid) continue;

        // Player projectile hitting Enemies
        let hitEnemy = false;
        for (const en of this.enemies) {
          const edx = p.pos.x - en.x;
          const edy = p.pos.y - en.y;
          if (Math.sqrt(edx * edx + edy * edy) < en.radius) {
            en.hp -= p.damage;
            soundManager.playShieldHit();
            this.createHitParticles(p.pos.x, p.pos.y, '#fca5a5');

            if (en.hp <= 0) {
              this.destroyEnemy(en);
            }
            this.projectiles.splice(i, 1);
            hitEnemy = true;
            break;
          }
        }
        if (hitEnemy) continue;
      }
    }
  }

  private updateAsteroids(dt: number) {
    for (const ast of this.asteroids) {
      ast.x += ast.vx * 60 * dt;
      ast.y += ast.vy * 60 * dt;
      ast.rotation += ast.vRot * 60 * dt;

      // Player collision with Asteroid
      const dx = ast.x - this.player.pos.x;
      const dy = ast.y - this.player.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ast.radius + 14 && this.player.invulnerableTime <= 0) {
        this.applyDamageToPlayer(18);
        this.cameraShake = Math.max(this.cameraShake, 14);
        this.hitstopTimer = 0.05;
        // Bounce player
        this.player.vel.x = -dx * 2;
        this.player.vel.y = -dy * 2;
      }
    }
  }

  private updateEnemies(dt: number) {
    for (const en of this.enemies) {
      const dx = this.player.pos.x - en.x;
      const dy = this.player.pos.y - en.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Aggro Range: 900 units
      if (dist < 900) {
        // Face player
        const targetAngle = Math.atan2(dy, dx);
        en.angle += (targetAngle - en.angle) * 0.08;

        // Movement towards player (keep distance if shooter)
        const desiredDist = en.type === 'void_boss' ? 300 : en.type === 'sentinel_eye' ? 240 : 180;
        if (dist > desiredDist) {
          en.vx += Math.cos(en.angle) * en.speed * dt;
          en.vy += Math.sin(en.angle) * en.speed * dt;
        } else {
          // Circle player
          const strafe = en.angle + Math.PI / 2;
          en.vx += Math.cos(strafe) * (en.speed * 0.7) * dt;
          en.vy += Math.sin(strafe) * (en.speed * 0.7) * dt;
        }

        // Apply friction
        en.vx *= 0.94;
        en.vy *= 0.94;
        en.x += en.vx * 60 * dt;
        en.y += en.vy * 60 * dt;

        // Enemy weapons & Telegraph
        en.fireCooldown += dt;

        // Sentinel Eye telegraph line before beam
        if (en.type === 'sentinel_eye' || en.type === 'void_boss') {
          if (en.fireCooldown > en.fireRate - 1.2) {
            en.isTelegraphing = true;
          }
        }

        if (en.fireCooldown >= en.fireRate) {
          en.fireCooldown = 0;
          en.isTelegraphing = false;
          soundManager.playEnemyLaser();

          if (en.type === 'pirate_drone') {
            this.projectiles.push({
              id: `ep_${Date.now()}`,
              pos: { x: en.x, y: en.y },
              vel: { x: Math.cos(en.angle) * 450, y: Math.sin(en.angle) * 450 },
              angle: en.angle,
              damage: 16,
              range: 550,
              distanceTraveled: 0,
              isEnemy: true,
              color: '#ef4444',
              radius: 4,
            });
          } else if (en.type === 'pirate_cruiser') {
            [-0.15, 0.15].forEach((off) => {
              this.projectiles.push({
                id: `ep_${Date.now()}_${off}`,
                pos: { x: en.x, y: en.y },
                vel: { x: Math.cos(en.angle + off) * 420, y: Math.sin(en.angle + off) * 420 },
                angle: en.angle + off,
                damage: 22,
                range: 650,
                distanceTraveled: 0,
                isEnemy: true,
                color: '#f87171',
                radius: 4,
              });
            });
          } else if (en.type === 'sentinel_eye') {
            // High damage focused beam projectile
            this.projectiles.push({
              id: `ep_beam_${Date.now()}`,
              pos: { x: en.x, y: en.y },
              vel: { x: Math.cos(en.angle) * 700, y: Math.sin(en.angle) * 700 },
              angle: en.angle,
              damage: 32,
              range: 800,
              distanceTraveled: 0,
              isEnemy: true,
              color: '#c084fc',
              radius: 6,
            });
          } else if (en.type === 'void_boss') {
            // Boss 6-way radial spiral volley
            for (let i = 0; i < 6; i++) {
              const a = (i * Math.PI) / 3 + this.gameTime;
              this.projectiles.push({
                id: `boss_p_${Date.now()}_${i}`,
                pos: { x: en.x, y: en.y },
                vel: { x: Math.cos(a) * 360, y: Math.sin(a) * 360 },
                angle: a,
                damage: 20,
                range: 750,
                distanceTraveled: 0,
                isEnemy: true,
                color: '#a855f7',
                radius: 5,
              });
            }
          }
        }
      }
    }
  }

  private updateResources(dt: number) {
    const magnetRange = 180 + this.player.stats.miningPower * 2;
    for (let i = this.resourceDrops.length - 1; i >= 0; i--) {
      const drop = this.resourceDrops[i];
      const dx = this.player.pos.x - drop.x;
      const dy = this.player.pos.y - drop.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < magnetRange) {
        // Accelerate towards player
        const speed = 400 * dt;
        drop.vx += (dx / dist) * speed;
        drop.vy += (dy / dist) * speed;
      }

      drop.x += drop.vx * 60 * dt;
      drop.y += drop.vy * 60 * dt;
      drop.vx *= 0.96;
      drop.vy *= 0.96;

      // Pickup
      if (dist < 26) {
        soundManager.playPickup();
        if (drop.type === 'stardust') this.player.inventory.stardust += drop.amount;
        else if (drop.type === 'hyperCrystal') this.player.inventory.hyperCrystal += drop.amount;
        else if (drop.type === 'titanium') this.player.inventory.titanium += drop.amount;
        else if (drop.type === 'darkMatter') this.player.inventory.darkMatter += drop.amount;
        else if (drop.type === 'alienArtifact') this.player.inventory.alienArtifacts += drop.amount;

        this.floatingTexts.push({
          x: drop.x,
          y: drop.y - 12,
          text: `+${drop.amount} ${drop.type.toUpperCase()}`,
          color: '#38bdf8',
          alpha: 1,
          vy: -25,
        });

        // Update collect mission
        const colMission = this.missions.find((m) => m.id === 'm1_stardust');
        if (colMission && !colMission.completed && drop.type === 'stardust') {
          colMission.currentCount = Math.min(colMission.targetCount, colMission.currentCount + drop.amount);
          if (colMission.currentCount >= colMission.targetCount) {
            this.completeMission(colMission);
          }
        }

        this.resourceDrops.splice(i, 1);
      }
    }
  }

  private updateEffects(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= 0.9 * dt;
      if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  private checkInteractions() {
    this.interactionPrompt = null;
    this.interactionAction = null;

    // Check Planets
    for (const planet of this.planets) {
      const dx = planet.x - this.player.pos.x;
      const dy = planet.y - this.player.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < planet.radius + 120) {
        if (planet.landable) {
          this.interactionPrompt = `[E] Mendarat di ${planet.name} (${planet.indonesianSubtitle})`;
          this.interactionAction = () => {
            this.landOnPlanet(planet);
          };
          break;
        } else {
          this.interactionPrompt = `[Info] ${planet.name} - Medan Gravitasi Terlalu Kuat Untuk Pendaratan`;
        }
      }
    }

    // Check Space Stations
    if (!this.interactionPrompt) {
      for (const st of this.stations) {
        const dx = st.x - this.player.pos.x;
        const dy = st.y - this.player.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < st.interactRadius) {
          if (st.type === 'research_lab' || st.type === 'outpost') {
            this.interactionPrompt = `[E] Masuk Dok Bengkel: ${st.name}`;
            this.interactionAction = () => {
              this.setMode('UPGRADES');
              // Station quest complete
              const stationMission = this.missions.find((m) => m.id === 'm2_station');
              if (stationMission && !stationMission.completed) {
                stationMission.currentCount = 1;
                this.completeMission(stationMission);
              }
            };
          } else if (st.type === 'warp_gate') {
            const bossMission = this.missions.find((m) => m.id === 'm5_boss');
            if (bossMission && bossMission.completed) {
              this.interactionPrompt = `[E] Lompat Gerbang Warp Singularitas (Selesai Misi Galaksi)`;
              this.interactionAction = () => {
                this.setMode('VICTORY');
              };
            } else {
              this.interactionPrompt = `[Terkunci] Gerbang Warp Dijaga Titan Kehampaan! Kalahkan Penjaga Dahulu.`;
            }
          }
          break;
        }
      }
    }
  }

  private applyDamageToPlayer(amount: number) {
    if (this.player.invulnerableTime > 0) return;

    soundManager.playShieldHit();
    this.cameraShake = Math.max(this.cameraShake, 16);
    this.player.invulnerableTime = 0.6; // Invulnerability window

    // Shield takes damage first
    if (this.player.stats.shield > 0) {
      if (this.player.stats.shield >= amount) {
        this.player.stats.shield -= amount;
        amount = 0;
      } else {
        amount -= this.player.stats.shield;
        this.player.stats.shield = 0;
      }
    }

    // Hull damage
    if (amount > 0) {
      this.player.stats.hull -= amount;
      soundManager.playExplosion(false);
      if (this.player.stats.hull <= 0) {
        this.player.stats.hull = 0;
        this.triggerGameOver();
      }
    }
  }

  private triggerGameOver() {
    soundManager.playExplosion(true);
    this.createHitParticles(this.player.pos.x, this.player.pos.y, '#f97316', 40);
    this.setMode('GAME_OVER');
  }

  private destroyAsteroid(ast: Asteroid) {
    soundManager.playExplosion(false);
    this.cameraShake = Math.max(this.cameraShake, 10);
    this.hitstopTimer = 0.04;

    // Spawn mineral crystals
    const count = Math.floor(Math.random() * 3 + 2);
    for (let i = 0; i < count; i++) {
      this.resourceDrops.push({
        id: `drop_${Date.now()}_${i}`,
        type: ast.mineralType,
        x: ast.x + (Math.random() - 0.5) * ast.radius,
        y: ast.y + (Math.random() - 0.5) * ast.radius,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        amount: ast.mineralType === 'hyperCrystal' ? 2 : 5,
        magnetized: false,
        rotation: Math.random() * Math.PI * 2,
      });
    }

    this.createHitParticles(ast.x, ast.y, ast.palette[0], 25);
    this.asteroids = this.asteroids.filter((a) => a.id !== ast.id);
  }

  private destroyEnemy(enemy: Enemy) {
    soundManager.playExplosion(true);
    this.cameraShake = Math.max(this.cameraShake, enemy.type === 'void_boss' ? 28 : 15);
    this.hitstopTimer = 0.07;

    // Drop loot
    const stardustDrop = enemy.type === 'void_boss' ? 80 : 20;
    this.resourceDrops.push({
      id: `edrop_${Date.now()}`,
      type: 'stardust',
      x: enemy.x,
      y: enemy.y,
      vx: 0,
      vy: 0,
      amount: stardustDrop,
      magnetized: false,
      rotation: 0,
    });

    if (enemy.type === 'void_boss') {
      this.resourceDrops.push({
        id: `boss_relic_${Date.now()}`,
        type: 'alienArtifact',
        x: enemy.x + 20,
        y: enemy.y,
        vx: 0,
        vy: 0,
        amount: 3,
        magnetized: false,
        rotation: 0,
      });
    }

    this.createHitParticles(enemy.x, enemy.y, enemy.color, 35);
    this.enemies = this.enemies.filter((e) => e.id !== enemy.id);

    // Update patrol defeat mission
    const patrolMission = this.missions.find((m) => m.id === 'm4_patrol');
    if (patrolMission && !patrolMission.completed) {
      patrolMission.currentCount++;
      if (patrolMission.currentCount >= patrolMission.targetCount) {
        this.completeMission(patrolMission);
      }
    }

    // Boss defeat mission
    if (enemy.type === 'void_boss') {
      const bossMission = this.missions.find((m) => m.id === 'm5_boss');
      if (bossMission) {
        bossMission.currentCount = 1;
        this.completeMission(bossMission);
      }
    }
  }

  private createHitParticles(x: number, y: number, color: string, count = 14) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        size: Math.random() > 0.5 ? 3 : 2,
        color,
        alpha: 1,
        decay: 1.5 + Math.random() * 1.5,
      });
    }
  }

  private broadcastHUD() {
    if (!this.onHUDUpdate) return;

    // Active Mission
    const activeMission = this.missions.find((m) => !m.completed && m.unlocked) || null;

    // Radar compass targets (Planets & Stations)
    const radarTargets: { angle: number; dist: number; type: string; name: string }[] = [];
    if (this.mode === 'SPACE') {
      for (const p of this.planets) {
        const dx = p.x - this.player.pos.x;
        const dy = p.y - this.player.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        radarTargets.push({
          angle: Math.atan2(dy, dx),
          dist,
          type: 'planet',
          name: p.name,
        });
      }
      for (const s of this.stations) {
        const dx = s.x - this.player.pos.x;
        const dy = s.y - this.player.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        radarTargets.push({
          angle: Math.atan2(dy, dx),
          dist,
          type: 'station',
          name: s.name,
        });
      }
    }

    this.onHUDUpdate({
      hull: Math.floor(this.player.stats.hull),
      maxHull: this.player.stats.maxHull,
      shield: Math.floor(this.player.stats.shield),
      maxShield: this.player.stats.maxShield,
      energy: Math.floor(this.player.stats.energy),
      maxEnergy: this.player.stats.maxEnergy,
      inventory: this.player.inventory,
      activeMission,
      radarTargets,
      currentZone: this.currentLandedPlanet
        ? `Permukaan ${this.currentLandedPlanet.name}`
        : 'Sektor Luar Alpha (Sistem Aethel)',
      prompt: this.interactionPrompt,
      weather: this.surfaceScene ? this.surfaceScene.weather : this.spaceWeather,
    });
  }

  public render() {
    const { ctx, width, height } = this;

    // Reset transform & clear screen
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (this.mode === 'PLANET_SURFACE' && this.surfaceScene) {
      this.surfaceScene.render(ctx, width, height);
      return;
    }

    // Space Rendering
    ctx.save();

    // Camera Shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.cameraShake > 0) {
      shakeX = (Math.random() - 0.5) * this.cameraShake;
      shakeY = (Math.random() - 0.5) * this.cameraShake;
    }

    // Background deep void
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Parallax Starfields
    const camOffset1X = (this.cameraX * 0.15) % width;
    const camOffset1Y = (this.cameraY * 0.15) % height;
    ctx.save();
    for (const star of this.starsLayer1) {
      const sx = ((star.x - camOffset1X) % width + width) % width;
      const sy = ((star.y - camOffset1Y) % height + height) % height;
      ctx.fillStyle = star.color;
      ctx.globalAlpha = star.alpha;
      ctx.fillRect(Math.floor(sx), Math.floor(sy), star.size, star.size);
    }
    ctx.restore();

    // Nebulae Clouds
    ctx.save();
    ctx.translate(-this.cameraX * 0.3 + shakeX, -this.cameraY * 0.3 + shakeY);
    for (const neb of this.nebulae) {
      const grad = ctx.createRadialGradient(neb.x, neb.y, 10, neb.x, neb.y, neb.radius);
      grad.addColorStop(0, neb.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // World Space Viewport
    ctx.save();
    ctx.translate(-Math.floor(this.cameraX) + shakeX, -Math.floor(this.cameraY) + shakeY);

    // 1. Draw Space Stations
    for (const st of this.stations) {
      drawSpaceStation(ctx, st, this.gameTime);
    }

    // 2. Draw Celestial Planets
    for (const pl of this.planets) {
      drawPlanet(ctx, pl, this.gameTime);
    }

    // 3. Draw Asteroids
    for (const ast of this.asteroids) {
      drawAsteroid(ctx, ast);
    }

    // 4. Draw Floating Resource Crystals
    for (const drop of this.resourceDrops) {
      drawResourceDrop(ctx, drop, this.gameTime);
    }

    // 5. Draw Enemies & Boss
    for (const en of this.enemies) {
      drawEnemy(ctx, en, this.gameTime);
    }

    // 6. Draw Player Starfighter & Thruster Trails
    for (const t of this.player.trail) {
      ctx.fillStyle = t.color;
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillRect(Math.floor(t.x) - 2, Math.floor(t.y) - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    drawPlayerShip(ctx, this.player, this.gameTime);

    // 7. Draw Projectiles
    for (const p of this.projectiles) {
      ctx.save();
      ctx.translate(p.pos.x, p.pos.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.radius * 2, -p.radius, p.radius * 4, p.radius * 2);

      // Core white line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-p.radius, -1, p.radius * 2, 2);
      ctx.restore();
    }

    // 8. Draw Explosions & Hit Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // 9. Draw Floating Text Messages
    for (const ft of this.floatingTexts) {
      ctx.font = 'bold 12px "Space Mono", monospace';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;

    ctx.restore(); // Restore world translation
    ctx.restore(); // Restore root space
  }
}
