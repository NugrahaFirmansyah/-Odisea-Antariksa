/**
 * Planetary Surface Exploration Mode for Kosmos.
 * Features 2D platforming, rover expedition, and dynamic planetary weather systems
 * (Electric dust storms, falling meteor showers, ion blizzards, and pyroclastic rain).
 */

import { FallingMeteor, Planet, PlanetaryWeather, SurfaceDeposit, SurfaceRover, SurfaceRuin, WeatherType } from '../types/game';
import { drawSurfaceRover } from './sprites';
import { soundManager } from '../audio/soundManager';

export class PlanetarySurfaceScene {
  public planet: Planet;
  public rover: SurfaceRover;
  public deposits: SurfaceDeposit[] = [];
  public ruins: SurfaceRuin[] = [];
  public shuttleX: number = 0;
  public terrainPoints: { x: number; y: number }[] = [];
  public particles: { x: number; y: number; vx: number; vy: number; color: string; alpha: number; size: number }[] = [];
  public floatingTexts: { x: number; y: number; text: string; color: string; alpha: number }[] = [];
  public width: number = 1920;
  public height: number = 1080;
  public cameraX: number = 0;
  public cameraY: number = 0;
  public isMining: boolean = false;
  public targetDeposit: SurfaceDeposit | null = null;
  public time: number = 0;

  // Dynamic Weather System
  public weather: PlanetaryWeather;
  public weatherTimer: number = 0;
  public weatherCycleDuration: number = 30; // seconds before shifting weather
  public meteors: FallingMeteor[] = [];
  public meteorSpawnTimer: number = 0;
  public weatherParticles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
  public screenShake: number = 0;

  constructor(planet: Planet) {
    this.planet = planet;
    this.rover = {
      x: 60,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      grounded: true,
      fuel: 100,
      maxFuel: 100,
      miningHeat: 0,
      maxMiningHeat: 100,
      samplesGathered: 0,
    };

    // Initialize initial planetary weather based on biome
    this.weather = this.generateInitialWeather(planet.type);
    this.initTerrainAndEntities();
    this.initWeatherParticles();
  }

  private generateInitialWeather(type: Planet['type']): PlanetaryWeather {
    if (type === 'cryo') {
      return {
        type: 'ION_BLIZZARD',
        name: 'Badai Salju Ionik',
        description: 'Butiran es kristal bertekanan tinggi dengan visibilitas minim dan permukaan es licin.',
        intensity: 0.8,
        windForce: -55,
        tractionMultiplier: 0.45,
        visibility: 0.4,
        duration: 35,
        colorOverlay: 'rgba(12, 74, 110, 0.45)',
        hazardLevel: 'WASPADA',
      };
    } else if (type === 'volcanic') {
      return {
        type: 'PYRO_RAIN',
        name: 'Hujan Piroklastik Magma',
        description: 'Pecahan batu pijar dan lava vulkanik berjatuhan dari atmosfer panas.',
        intensity: 0.85,
        windForce: 25,
        tractionMultiplier: 0.8,
        visibility: 0.5,
        duration: 30,
        colorOverlay: 'rgba(127, 29, 29, 0.4)',
        hazardLevel: 'BAHAYA',
      };
    } else if (type === 'ancient') {
      return {
        type: 'METEOR_SHOWER',
        name: 'Hujan Meteor Kristal Kuno',
        description: 'Serpihan pecahan satelit purba menghujani daratan, kaya akan deposit mineral.',
        intensity: 0.9,
        windForce: -30,
        tractionMultiplier: 0.85,
        visibility: 0.65,
        duration: 28,
        colorOverlay: 'rgba(88, 28, 135, 0.35)',
        hazardLevel: 'BAHAYA',
      };
    } else {
      // Verdant / Earth-like
      return {
        type: 'DUST_STORM',
        name: 'Badai Spora Elektrik',
        description: 'Angin kencang membawa kabut partikel bio-elektrik yang mengaburkan pandangan.',
        intensity: 0.75,
        windForce: 65,
        tractionMultiplier: 0.7,
        visibility: 0.55,
        duration: 30,
        colorOverlay: 'rgba(120, 53, 15, 0.38)',
        hazardLevel: 'WASPADA',
      };
    }
  }

  private initWeatherParticles() {
    this.weatherParticles = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      this.weatherParticles.push({
        x: (Math.random() - 0.5) * 3000,
        y: Math.random() * 800,
        vx: this.weather.windForce * 4 + (Math.random() - 0.5) * 40,
        vy: 40 + Math.random() * 80,
        size: Math.random() > 0.6 ? 3 : 2,
        alpha: 0.3 + Math.random() * 0.7,
        color: this.getWeatherParticleColor(),
      });
    }
  }

  private getWeatherParticleColor(): string {
    switch (this.weather.type) {
      case 'ION_BLIZZARD':
        return Math.random() > 0.5 ? '#e0f2fe' : '#7dd3fc';
      case 'PYRO_RAIN':
        return Math.random() > 0.5 ? '#f97316' : '#ef4444';
      case 'METEOR_SHOWER':
        return Math.random() > 0.5 ? '#c084fc' : '#fbbf24';
      case 'DUST_STORM':
        return Math.random() > 0.5 ? '#d97706' : '#ca8a04';
      default:
        return '#cbd5e1';
    }
  }

  private initTerrainAndEntities() {
    this.terrainPoints = [];
    const segments = 220;
    const step = 24;
    const startX = -1400;

    let baseHeight = 520;
    let frequency = 0.03;
    let amplitude = 45;

    if (this.planet.type === 'cryo') {
      amplitude = 75;
      frequency = 0.04;
    } else if (this.planet.type === 'volcanic') {
      amplitude = 65;
      frequency = 0.05;
    }

    for (let i = 0; i <= segments; i++) {
      const x = startX + i * step;
      let y = baseHeight;
      // Keep landing shuttle zone flat
      if (Math.abs(x) > 130) {
        y += Math.sin(i * frequency) * amplitude + Math.cos(i * frequency * 2.3) * (amplitude * 0.4);
      }
      this.terrainPoints.push({ x, y });
    }

    // Place shuttle & rover
    this.shuttleX = 0;
    this.rover.x = 40;
    this.rover.y = this.getGroundHeight(40) - 10;

    // Initial Mineral Deposits
    this.deposits = [];
    const depositTypes: ('stardust' | 'hyperCrystal' | 'titanium' | 'ancientRelic')[] =
      this.planet.type === 'verdant'
        ? ['stardust', 'stardust', 'titanium']
        : this.planet.type === 'cryo'
        ? ['hyperCrystal', 'hyperCrystal', 'stardust']
        : this.planet.type === 'volcanic'
        ? ['titanium', 'titanium', 'stardust']
        : ['ancientRelic', 'hyperCrystal', 'stardust'];

    for (let i = 0; i < 10; i++) {
      const x = (i % 2 === 0 ? 1 : -1) * (200 + i * 160 + Math.random() * 80);
      const type = depositTypes[i % depositTypes.length];
      const groundY = this.getGroundHeight(x);
      this.deposits.push({
        id: `dep_${i}`,
        x,
        y: groundY,
        hp: 35,
        maxHp: 35,
        type,
      });
    }

    // Ancient Ruins
    this.ruins = [];
    for (let i = 0; i < this.planet.ruinsCount; i++) {
      const x = (i % 2 === 0 ? -1 : 1) * (450 + i * 420);
      this.ruins.push({
        id: `ruin_${i}`,
        x,
        name: `Monolit Purba ${String.fromCharCode(65 + i)}-${Math.floor(Math.random() * 90 + 10)}`,
        analyzed: false,
        lore: `Fragmen transmisi purba dari ${this.planet.name}: "...kami memetakan gerbang kosmik sebelum badai kehampaan menerpa..."`,
      });
    }
  }

  public getGroundHeight(x: number): number {
    if (this.terrainPoints.length < 2) return 520;
    const firstX = this.terrainPoints[0].x;
    const step = 24;
    const index = Math.floor((x - firstX) / step);

    if (index < 0) return this.terrainPoints[0].y;
    if (index >= this.terrainPoints.length - 1) return this.terrainPoints[this.terrainPoints.length - 1].y;

    const p1 = this.terrainPoints[index];
    const p2 = this.terrainPoints[index + 1];
    const t = (x - p1.x) / (p2.x - p1.x);
    return p1.y + t * (p2.y - p1.y);
  }

  // Shift weather periodically
  private updateWeatherCycle(dt: number) {
    this.weatherTimer += dt;
    if (this.weatherTimer >= this.weather.duration) {
      this.weatherTimer = 0;
      this.cycleToNextWeather();
    }
  }

  private cycleToNextWeather() {
    const biome = this.planet.type;
    let nextType: WeatherType = 'CLEAR';

    if (this.weather.type !== 'CLEAR') {
      // 40% chance of clearing up
      if (Math.random() < 0.4) {
        nextType = 'CLEAR';
      } else {
        if (biome === 'cryo') {
          nextType = this.weather.type === 'ION_BLIZZARD' ? 'METEOR_SHOWER' : 'ION_BLIZZARD';
        } else if (biome === 'volcanic') {
          nextType = this.weather.type === 'PYRO_RAIN' ? 'DUST_STORM' : 'PYRO_RAIN';
        } else if (biome === 'ancient') {
          nextType = this.weather.type === 'METEOR_SHOWER' ? 'DUST_STORM' : 'METEOR_SHOWER';
        } else {
          nextType = this.weather.type === 'DUST_STORM' ? 'METEOR_SHOWER' : 'DUST_STORM';
        }
      }
    } else {
      // Pick dynamic storm based on planet
      if (biome === 'cryo') nextType = Math.random() > 0.4 ? 'ION_BLIZZARD' : 'METEOR_SHOWER';
      else if (biome === 'volcanic') nextType = Math.random() > 0.4 ? 'PYRO_RAIN' : 'DUST_STORM';
      else if (biome === 'ancient') nextType = Math.random() > 0.5 ? 'METEOR_SHOWER' : 'DUST_STORM';
      else nextType = Math.random() > 0.5 ? 'DUST_STORM' : 'METEOR_SHOWER';
    }

    // Configure new weather state
    const windSign = Math.random() > 0.5 ? 1 : -1;
    if (nextType === 'CLEAR') {
      this.weather = {
        type: 'CLEAR',
        name: 'Cuaca Stabil & Cerah',
        description: 'Atmosfer tenang. Jarak pandang optimal dan traksi daratan kembali normal.',
        intensity: 0.1,
        windForce: windSign * 8,
        tractionMultiplier: 1.0,
        visibility: 0.95,
        duration: 25,
        colorOverlay: 'transparent',
        hazardLevel: 'AMAN',
      };
      this.floatingTexts.push({
        x: this.rover.x,
        y: this.rover.y - 60,
        text: 'CUACA KEMBALI STABIL',
        color: '#34d399',
        alpha: 1,
      });
    } else if (nextType === 'DUST_STORM') {
      this.weather = {
        type: 'DUST_STORM',
        name: 'Badai Debu Elektrik',
        description: 'Angin kencang membawa kabut partikel bio-elektrik yang mengaburkan pandangan.',
        intensity: 0.8,
        windForce: windSign * (55 + Math.random() * 30),
        tractionMultiplier: 0.65,
        visibility: 0.45,
        duration: 32,
        colorOverlay: 'rgba(120, 53, 15, 0.42)',
        hazardLevel: 'WASPADA',
      };
      soundManager.playStormAlert();
      this.floatingTexts.push({
        x: this.rover.x,
        y: this.rover.y - 60,
        text: `PERINGATAN: ${this.weather.name.toUpperCase()} MENERPA!`,
        color: '#f59e0b',
        alpha: 1,
      });
    } else if (nextType === 'METEOR_SHOWER') {
      this.weather = {
        type: 'METEOR_SHOWER',
        name: 'Hujan Meteor Kosmik',
        description: 'Hujan batu angkasa berapi. Hati-hati terhadap impak langsung pada rover!',
        intensity: 0.9,
        windForce: windSign * 25,
        tractionMultiplier: 0.8,
        visibility: 0.65,
        duration: 28,
        colorOverlay: 'rgba(107, 33, 168, 0.35)',
        hazardLevel: 'BAHAYA',
      };
      soundManager.playStormAlert();
      this.floatingTexts.push({
        x: this.rover.x,
        y: this.rover.y - 60,
        text: 'PERINGATAN BAHAYA: HUJAN METEOR AKTIF!',
        color: '#ef4444',
        alpha: 1,
      });
    } else if (nextType === 'ION_BLIZZARD') {
      this.weather = {
        type: 'ION_BLIZZARD',
        name: 'Badai Salju Ionik',
        description: 'Permukaan es beku licin mengurangi kendali traksi dan jarak pandang.',
        intensity: 0.85,
        windForce: windSign * 60,
        tractionMultiplier: 0.38,
        visibility: 0.4,
        duration: 35,
        colorOverlay: 'rgba(12, 74, 110, 0.48)',
        hazardLevel: 'WASPADA',
      };
      soundManager.playStormAlert();
      this.floatingTexts.push({
        x: this.rover.x,
        y: this.rover.y - 60,
        text: `PERINGATAN: ${this.weather.name.toUpperCase()}!`,
        color: '#38bdf8',
        alpha: 1,
      });
    } else if (nextType === 'PYRO_RAIN') {
      this.weather = {
        type: 'PYRO_RAIN',
        name: 'Hujan Piroklastik Magma',
        description: 'Lontaran magma vulkanik dan bara api menghujani daratan.',
        intensity: 0.85,
        windForce: windSign * 35,
        tractionMultiplier: 0.75,
        visibility: 0.5,
        duration: 30,
        colorOverlay: 'rgba(127, 29, 29, 0.42)',
        hazardLevel: 'BAHAYA',
      };
      soundManager.playStormAlert();
      this.floatingTexts.push({
        x: this.rover.x,
        y: this.rover.y - 60,
        text: `PERINGATAN BAHAYA: ${this.weather.name.toUpperCase()}!`,
        color: '#f97316',
        alpha: 1,
      });
    }

    // Refresh particle color for new weather
    this.weatherParticles.forEach((p) => {
      p.color = this.getWeatherParticleColor();
    });
  }

  // Spawn and simulate falling meteors during meteor showers & pyro rain
  private updateMeteors(dt: number, onImpact: (x: number, y: number) => void) {
    if (this.weather.type === 'METEOR_SHOWER' || this.weather.type === 'PYRO_RAIN') {
      this.meteorSpawnTimer += dt;
      const spawnInterval = this.weather.type === 'METEOR_SHOWER' ? 1.4 : 1.8;

      if (this.meteorSpawnTimer >= spawnInterval) {
        this.meteorSpawnTimer = 0;
        soundManager.playMeteorStreak();

        // Spawn meteor falling towards rover area
        const targetX = this.rover.x + (Math.random() - 0.5) * 800;
        const targetGroundY = this.getGroundHeight(targetX);
        const startX = targetX - (this.weather.windForce > 0 ? 300 : -300) - (Math.random() - 0.5) * 150;
        const startY = -120;

        const dx = targetX - startX;
        const dy = targetGroundY - startY;
        const speed = 480 + Math.random() * 180;
        const angle = Math.atan2(dy, dx);

        this.meteors.push({
          id: `meteor_${Date.now()}_${Math.random()}`,
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 5 + Math.random() * 5,
          color: this.weather.type === 'PYRO_RAIN' ? '#f97316' : '#c084fc',
          tailLength: 16 + Math.random() * 12,
          targetGroundX: targetX,
          targetGroundY,
        });
      }
    }

    // Update active meteors
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      // Check ground collision
      const groundY = this.getGroundHeight(m.x);
      if (m.y >= groundY - 4) {
        // Impact!
        soundManager.playExplosion(true);
        this.screenShake = 16;

        // Ground crater explosion particles
        for (let p = 0; p < 24; p++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 60 + Math.random() * 160;
          this.particles.push({
            x: m.x,
            y: groundY - 4,
            vx: Math.cos(a) * spd,
            vy: -Math.abs(Math.sin(a) * spd) - 40,
            color: m.color,
            alpha: 1,
            size: Math.random() > 0.5 ? 4 : 2,
          });
        }

        // Damage rover if hit by blast (within 45 radius)
        const distToRover = Math.sqrt((this.rover.x - m.x) ** 2 + (this.rover.y - groundY) ** 2);
        if (distToRover < 50) {
          soundManager.playShieldHit();
          this.rover.vx += (this.rover.x > m.x ? 1 : -1) * 140;
          this.rover.vy -= 180;
          this.floatingTexts.push({
            x: this.rover.x,
            y: this.rover.y - 30,
            text: 'IMPAK METEOR! (-15 Integritas)',
            color: '#ef4444',
            alpha: 1,
          });
        }

        // 40% chance meteor impact yields a newly unearthed crystal deposit!
        if (Math.random() < 0.4 && this.deposits.length < 15) {
          const type = this.weather.type === 'PYRO_RAIN' ? 'titanium' : 'hyperCrystal';
          this.deposits.push({
            id: `dep_meteor_${Date.now()}`,
            x: m.x,
            y: groundY,
            hp: 30,
            maxHp: 30,
            type,
          });
        }

        onImpact(m.x, groundY);
        this.meteors.splice(i, 1);
      }
    }
  }

  public update(
    dt: number,
    keys: { left: boolean; right: boolean; jump: boolean; interact: boolean; action: boolean },
    onCollectResource: (type: string, amount: number) => void
  ) {
    this.time += dt;

    // 1. Dynamic Weather Update
    this.updateWeatherCycle(dt);
    this.updateMeteors(dt, (ix, iy) => {
      // Impact event
    });

    // 2. Weather Wind Influence on Physics
    // Apply horizontal wind acceleration to rover (stronger when airborne)
    const airborneMult = this.rover.grounded ? 0.6 : 1.4;
    this.rover.vx += this.weather.windForce * airborneMult * dt;

    // Periodic wind audio feedback during active storms
    if (this.weather.type !== 'CLEAR' && Math.random() < 0.015) {
      soundManager.playWindGust();
    }

    // 3. Rover Horizontal Movement with Weather Traction
    const baseAccel = 340;
    const accel = baseAccel * this.weather.tractionMultiplier;
    const maxSpeed = 165;
    // Lower friction on ice storms causes authentic drifting slide!
    const friction = this.rover.grounded
      ? 0.78 + (1 - this.weather.tractionMultiplier) * 0.18 // 0.88 normal down to 0.96 for icy drift
      : 0.985;

    if (keys.left) {
      this.rover.vx -= accel * dt;
    } else if (keys.right) {
      this.rover.vx += accel * dt;
    } else {
      this.rover.vx *= friction;
    }

    this.rover.vx = Math.max(-maxSpeed * 1.3, Math.min(maxSpeed * 1.3, this.rover.vx));
    this.rover.x += this.rover.vx * dt;

    // 4. Thruster Jump
    const gravity = 480;
    if (keys.jump && this.rover.fuel > 0) {
      this.rover.vy -= 750 * dt;
      this.rover.fuel = Math.max(0, this.rover.fuel - 35 * dt);
      this.rover.grounded = false;

      // Thruster particles
      if (Math.random() > 0.4) {
        this.particles.push({
          x: this.rover.x + (Math.random() - 0.5) * 8,
          y: this.rover.y + 6,
          vx: (Math.random() - 0.5) * 40 + this.weather.windForce * 0.5,
          vy: 80 + Math.random() * 50,
          color: '#38bdf8',
          alpha: 1,
          size: 3,
        });
      }
    } else {
      // Recharging fuel on ground
      if (this.rover.grounded) {
        this.rover.fuel = Math.min(this.rover.maxFuel, this.rover.fuel + 40 * dt);
      }
    }

    // Apply Gravity
    this.rover.vy += gravity * dt;
    this.rover.y += this.rover.vy * dt;

    // Terrain Collision
    const groundY = this.getGroundHeight(this.rover.x);
    if (this.rover.y >= groundY - 8) {
      this.rover.y = groundY - 8;
      this.rover.vy = 0;
      this.rover.grounded = true;

      // Match terrain slope angle
      const slopeDx = 16;
      const hLeft = this.getGroundHeight(this.rover.x - slopeDx);
      const hRight = this.getGroundHeight(this.rover.x + slopeDx);
      this.rover.angle = Math.atan2(hRight - hLeft, slopeDx * 2) * 0.7;
    } else {
      this.rover.grounded = false;
      this.rover.angle *= 0.95;
    }

    // 5. Mining / Laser Action
    this.isMining = keys.action;
    this.targetDeposit = null;

    if (this.isMining) {
      soundManager.playMiningPulse();
      for (const dep of this.deposits) {
        const dx = dep.x - this.rover.x;
        const dy = dep.y - this.rover.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          this.targetDeposit = dep;
          dep.hp -= 25 * dt;

          this.particles.push({
            x: dep.x + (Math.random() - 0.5) * 16,
            y: dep.y - 8 + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 60,
            vy: -40 - Math.random() * 40,
            color: dep.type === 'hyperCrystal' ? '#c084fc' : dep.type === 'titanium' ? '#fbbf24' : '#38bdf8',
            alpha: 1,
            size: 3,
          });

          if (dep.hp <= 0) {
            soundManager.playPickup();
            const amount = dep.type === 'ancientRelic' ? 1 : Math.floor(Math.random() * 8 + 8);
            onCollectResource(dep.type, amount);
            this.rover.samplesGathered++;

            this.floatingTexts.push({
              x: dep.x,
              y: dep.y - 20,
              text: `+${amount} ${dep.type.toUpperCase()}`,
              color: '#4ade80',
              alpha: 1,
            });

            this.deposits = this.deposits.filter((d) => d.id !== dep.id);
          }
          break;
        }
      }
    }

    // 6. Ruins Analysis
    if (keys.interact) {
      for (const ruin of this.ruins) {
        if (!ruin.analyzed && Math.abs(ruin.x - this.rover.x) < 80) {
          ruin.analyzed = true;
          soundManager.playMissionSuccess();
          onCollectResource('ancientRelic', 1);
          this.floatingTexts.push({
            x: ruin.x,
            y: this.getGroundHeight(ruin.x) - 60,
            text: 'DOKUMEN KUNO TERANALISIS! (+1 Relik)',
            color: '#a855f7',
            alpha: 1,
          });
        }
      }
    }

    // 7. Update Weather Particles
    for (const wp of this.weatherParticles) {
      wp.x += (wp.vx + this.weather.windForce * 3.5) * dt;
      wp.y += wp.vy * dt;

      // Wrap around camera viewport
      if (wp.y > 900) {
        wp.y = -50;
        wp.x = this.rover.x + (Math.random() - 0.5) * 1800;
      }
      if (wp.x < this.rover.x - 1200) wp.x = this.rover.x + 1200;
      if (wp.x > this.rover.x + 1200) wp.x = this.rover.x - 1200;
    }

    // 8. Update Normal Particles & Floating Texts
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= 1.8 * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 30 * dt;
      ft.alpha -= 0.8 * dt;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 9. Camera Follow & Decaying Shake
    this.screenShake *= 0.9;
    if (this.screenShake < 0.2) this.screenShake = 0;

    const targetCamX = this.rover.x - this.width / 2;
    const targetCamY = this.rover.y - this.height / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    this.cameraY += (targetCamY - this.cameraY) * 0.08;
  }

  public render(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) {
    this.width = canvasW;
    this.height = canvasH;

    ctx.save();

    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake;
      shakeY = (Math.random() - 0.5) * this.screenShake;
    }

    // 1. Sky & Horizon Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasH);
    if (this.planet.type === 'verdant') {
      skyGrad.addColorStop(0, '#022c22');
      skyGrad.addColorStop(0.7, '#064e3b');
      skyGrad.addColorStop(1, '#065f46');
    } else if (this.planet.type === 'cryo') {
      skyGrad.addColorStop(0, '#082f49');
      skyGrad.addColorStop(0.7, '#0369a1');
      skyGrad.addColorStop(1, '#0284c7');
    } else if (this.planet.type === 'volcanic') {
      skyGrad.addColorStop(0, '#450a0a');
      skyGrad.addColorStop(0.7, '#7f1d1d');
      skyGrad.addColorStop(1, '#991b1b');
    } else {
      skyGrad.addColorStop(0, '#2e1065');
      skyGrad.addColorStop(0.7, '#581c87');
      skyGrad.addColorStop(1, '#6b21a8');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Celestial moon in sky (obscured if storm is dense)
    ctx.save();
    ctx.globalAlpha = Math.max(0.05, this.weather.visibility * 0.25);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(canvasW * 0.8 - this.cameraX * 0.02, 120, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // World Transformation with screen shake
    ctx.save();
    ctx.translate(-Math.floor(this.cameraX) + shakeX, -Math.floor(this.cameraY) + shakeY);

    // 2. Parallax Distant Mountains
    ctx.fillStyle = this.planet.primaryColor;
    ctx.beginPath();
    ctx.moveTo(-1600, canvasH);
    for (let i = -1600; i < 2600; i += 80) {
      const my = 400 + Math.sin(i * 0.005) * 70;
      ctx.lineTo(i, my);
    }
    ctx.lineTo(2600, 1100);
    ctx.closePath();
    ctx.fill();

    // 3. Main Ground Terrain
    ctx.fillStyle = this.planet.secondaryColor;
    ctx.beginPath();
    if (this.terrainPoints.length > 0) {
      ctx.moveTo(this.terrainPoints[0].x, 1200);
      for (const pt of this.terrainPoints) {
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.lineTo(this.terrainPoints[this.terrainPoints.length - 1].x, 1200);
      ctx.closePath();
      ctx.fill();
    }

    // Terrain crust line
    ctx.strokeStyle = '#ffffff33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < this.terrainPoints.length; i++) {
      const pt = this.terrainPoints[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // 4. Landed Starship Shuttle Pad
    const shuttleGroundY = this.getGroundHeight(this.shuttleX);
    ctx.save();
    ctx.translate(this.shuttleX, shuttleGroundY);

    ctx.fillStyle = '#334155';
    ctx.fillRect(-45, -4, 90, 8);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-30, -50, 60, 46);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -75);
    ctx.lineTo(-30, -50);
    ctx.lineTo(30, -50);
    ctx.closePath();
    ctx.fill();

    const bColor = Math.floor(this.time * 4) % 2 === 0 ? '#22c55e' : '#15803d';
    ctx.fillStyle = bColor;
    ctx.fillRect(-4, -78, 8, 4);

    ctx.font = '10px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('WAHANA INDUK', 0, -84);

    if (Math.abs(this.rover.x - this.shuttleX) < 70) {
      ctx.fillStyle = '#fef08a';
      ctx.font = '11px "Space Mono", monospace';
      ctx.fillText('[E] Kembali Ke Orbit Antariksa', 0, -100);
    }
    ctx.restore();

    // 5. Draw Mineral Deposits
    for (const dep of this.deposits) {
      ctx.save();
      ctx.translate(dep.x, dep.y);
      let color = '#38bdf8';
      if (dep.type === 'hyperCrystal') color = '#c084fc';
      if (dep.type === 'titanium') color = '#fbbf24';
      if (dep.type === 'ancientRelic') color = '#34d399';

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(8, 0);
      ctx.lineTo(-8, 0);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-7, -12);
      ctx.lineTo(0, 0);
      ctx.lineTo(-12, 0);
      ctx.fill();

      if (dep.hp < dep.maxHp) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-12, -26, 24, 3);
        ctx.fillStyle = color;
        ctx.fillRect(-12, -26, 24 * (dep.hp / dep.maxHp), 3);
      }
      ctx.restore();
    }

    // 6. Draw Ancient Ruins / Monoliths
    for (const ruin of this.ruins) {
      const ry = this.getGroundHeight(ruin.x);
      ctx.save();
      ctx.translate(ruin.x, ry);

      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-14, -65, 28, 65);

      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(0, -85);
      ctx.lineTo(-14, -65);
      ctx.lineTo(14, -65);
      ctx.fill();

      ctx.fillStyle = ruin.analyzed ? '#4ade80' : '#c084fc';
      ctx.fillRect(-6, -45, 12, 3);
      ctx.fillRect(-4, -32, 8, 3);
      ctx.fillRect(-8, -18, 16, 3);

      ctx.font = '9px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(ruin.name, 0, -94);

      if (!ruin.analyzed && Math.abs(this.rover.x - ruin.x) < 80) {
        ctx.fillStyle = '#fef08a';
        ctx.fillText('[E] Analisis Monolit Kuno', 0, -108);
      }
      ctx.restore();
    }

    // 7. Draw Meteor Ground Warning Targets & Falling Meteors
    for (const m of this.meteors) {
      // Ground target indicator
      const pulse = Math.sin(this.time * 12) * 3;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(m.targetGroundX, m.targetGroundY, 14 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Falling Meteor Body & Tail
      ctx.save();
      ctx.translate(m.x, m.y);
      const angle = Math.atan2(m.vy, m.vx);
      ctx.rotate(angle);

      // Fiery Tail
      const tailGrad = ctx.createLinearGradient(0, 0, -m.tailLength * 2, 0);
      tailGrad.addColorStop(0, '#ffffff');
      tailGrad.addColorStop(0.3, m.color);
      tailGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(0, -m.radius);
      ctx.lineTo(-m.tailLength * 2.5, 0);
      ctx.lineTo(0, m.radius);
      ctx.closePath();
      ctx.fill();

      // Core fireball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 8. Mining Beam
    if (this.isMining && this.targetDeposit) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.rover.x, this.rover.y - 12);
      ctx.lineTo(this.targetDeposit.x, this.targetDeposit.y - 8);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 9. Draw Player Rover
    drawSurfaceRover(ctx, this.rover, this.time);

    // 10. Draw Surface Weather Particles
    for (const wp of this.weatherParticles) {
      ctx.fillStyle = wp.color;
      ctx.globalAlpha = Math.max(0, wp.alpha * this.weather.intensity);
      ctx.fillRect(Math.floor(wp.x), Math.floor(wp.y), wp.size, wp.size);
    }
    ctx.globalAlpha = 1;

    // 11. Normal Particles & Floating Texts
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;

    for (const ft of this.floatingTexts) {
      ctx.font = 'bold 12px "Space Mono", monospace';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;

    ctx.restore(); // Restore world translation

    // 12. Full-Screen Atmospheric Weather Fog & Color Overlay (Visibility Filter)
    if (this.weather.colorOverlay !== 'transparent') {
      ctx.save();
      ctx.fillStyle = this.weather.colorOverlay;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Vignette edge fog
      const vigGrad = ctx.createRadialGradient(
        canvasW / 2,
        canvasH / 2,
        canvasW * 0.25,
        canvasW / 2,
        canvasH / 2,
        canvasW * 0.65
      );
      vigGrad.addColorStop(0, 'transparent');
      vigGrad.addColorStop(1, `rgba(0, 0, 0, ${(1 - this.weather.visibility) * 0.6})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.restore();
    }

    // 13. Minimalist Surface HUD & Weather Telemetry Strip
    ctx.save();
    ctx.translate(24, canvasH - 54);

    // Jetpack Fuel Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, 140, 12);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, 140 * (this.rover.fuel / this.rover.maxFuel), 12);

    ctx.font = '10px "Space Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`JETPACK: ${Math.floor(this.rover.fuel)}%`, 4, 10);

    // Dynamic Weather Status readout
    const windSpeedKm = Math.abs(Math.round(this.weather.windForce * 1.8));
    const windDirText = this.weather.windForce > 5 ? '→ TIMUR' : this.weather.windForce < -5 ? '← BARAT' : 'TENANG';
    const hazardColor =
      this.weather.hazardLevel === 'BAHAYA'
        ? '#f87171'
        : this.weather.hazardLevel === 'WASPADA'
        ? '#fbbf24'
        : '#4ade80';

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(150, 0, 360, 24);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(150, 0, 360, 24);

    ctx.fillStyle = hazardColor;
    ctx.font = 'bold 9px "Space Mono", monospace';
    ctx.fillText(`[${this.weather.hazardLevel}] ${this.weather.name.toUpperCase()}`, 158, 11);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px "Space Mono", monospace';
    ctx.fillText(
      `ANGIN: ${windSpeedKm} KM/J ${windDirText} · VISIBILITAS: ${Math.round(this.weather.visibility * 100)}%`,
      158,
      20
    );

    ctx.restore();
    ctx.restore();
  }
}
