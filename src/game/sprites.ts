/**
 * High-definition procedural pixel-art rendering engine for Kosmos.
 * Draws pixel-perfect ships, planets, stations, celestial bodies, and hazards.
 */

import { Asteroid, Enemy, Planet, PlayerShip, ResourceDrop, SpaceStation, SurfaceDeposit } from '../types/game';

// Draw pixel helper for pristine retro art
export function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = 2) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
}

// 1. Draw Player Starfighter
export function drawPlayerShip(
  ctx: CanvasRenderingContext2D,
  player: PlayerShip,
  time: number
) {
  const { pos, angle, isBoosting, isShooting, isMining, invulnerableTime, stats } = player;
  const isThrusting = player.vel.x * player.vel.x + player.vel.y * player.vel.y > 0.05;

  ctx.save();
  ctx.translate(Math.floor(pos.x), Math.floor(pos.y));
  ctx.rotate(angle);

  // Invulnerability flicker
  if (invulnerableTime > 0 && Math.floor(time * 20) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  const pSize = 2; // Pixel unit size
  const tier = stats.blasterLevel >= 3 ? 3 : stats.blasterLevel >= 2 ? 2 : 1;

  // Thruster animation
  if (isThrusting || isBoosting) {
    const flameLen = isBoosting ? 26 + Math.sin(time * 30) * 8 : 14 + Math.sin(time * 25) * 5;
    const flameColorInner = isBoosting ? '#ffffff' : '#67e8f9';
    const flameColorOuter = isBoosting ? '#06b6d4' : '#2563eb';

    // Outer flame
    ctx.fillStyle = flameColorOuter;
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(-10 - flameLen, 0);
    ctx.lineTo(-10, 6);
    ctx.fill();

    // Inner flame
    ctx.fillStyle = flameColorInner;
    ctx.beginPath();
    ctx.moveTo(-10, -3);
    ctx.lineTo(-10 - flameLen * 0.65, 0);
    ctx.lineTo(-10, 3);
    ctx.fill();

    // Side booster thrusters for Tier 2/3
    if (tier >= 2) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-12, -12, -flameLen * 0.4, 3);
      ctx.fillRect(-12, 9, -flameLen * 0.4, 3);
    }
  }

  // Hull Body - Tier-based design
  if (tier === 1) {
    // Vanguard Scout: sleek interceptor wedge
    // Main fuselage
    ctx.fillStyle = '#1e293b'; // Dark metal base
    ctx.fillRect(-10, -8, 22, 16);

    // Nose cone
    ctx.fillStyle = '#38bdf8'; // Cyan accent tip
    ctx.beginPath();
    ctx.moveTo(12, -6);
    ctx.lineTo(22, 0);
    ctx.lineTo(12, 6);
    ctx.closePath();
    ctx.fill();

    // Wings
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-4, -14);
    ctx.lineTo(8, -8);
    ctx.lineTo(-10, -8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-4, 14);
    ctx.lineTo(8, 8);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();

    // Wing highlights
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-6, -14, 4, 3);
    ctx.fillRect(-6, 11, 4, 3);

    // Cockpit canopy (cyan glowing glass)
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(0, -3, 8, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, -2, 3, 2);

  } else if (tier === 2) {
    // Nova Interceptor: heavier wings and dual stabilizer nacelles
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14, -10, 26, 20);

    // Forward armor
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(12, -8);
    ctx.lineTo(24, 0);
    ctx.lineTo(12, 8);
    ctx.closePath();
    ctx.fill();

    // Swept wings
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-8, -18);
    ctx.lineTo(10, -10);
    ctx.lineTo(-14, -10);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-8, 18);
    ctx.lineTo(10, 10);
    ctx.lineTo(-14, 10);
    ctx.closePath();
    ctx.fill();

    // Dual plasma barrels
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(10, -14, 8, 3);
    ctx.fillRect(10, 11, 8, 3);

    // Cockpit
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, -4, 10, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, -2, 4, 3);

  } else {
    // Void Dreadnought (Tier 3): Golden accents & heavy cruiser prow
    ctx.fillStyle = '#020617';
    ctx.fillRect(-16, -12, 30, 24);

    // Golden vanguard armor
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(14, -10);
    ctx.lineTo(28, 0);
    ctx.lineTo(14, 10);
    ctx.closePath();
    ctx.fill();

    // Wings
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-10, -22);
    ctx.lineTo(12, -12);
    ctx.lineTo(-16, -12);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-10, 22);
    ctx.lineTo(12, 12);
    ctx.lineTo(-16, 12);
    ctx.closePath();
    ctx.fill();

    // Triple energy rails
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(12, -18, 10, 3);
    ctx.fillRect(12, 15, 10, 3);
    ctx.fillRect(18, -2, 8, 4);

    // Glowing cockpit core
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(0, -4, 12, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, -2, 5, 4);
  }

  // Active Mining Laser Beam emitter effect
  if (isMining) {
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(95 + Math.sin(time * 35) * 5, (Math.random() - 0.5) * 6);
    ctx.stroke();

    ctx.strokeStyle = '#f3e8ff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Shield bubble if shields are up and taking active recharge or recent hit
  if (stats.shield > 0) {
    const shieldPct = stats.shield / stats.maxShield;
    const shieldRadius = 26;
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 + shieldPct * 0.35 + Math.sin(time * 8) * 0.1})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(2, 0, shieldRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Hexagonal pixel shield markers
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + time * 0.5;
      const px = Math.cos(a) * shieldRadius;
      const py = Math.sin(a) * shieldRadius;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px - 1, py - 1, 3, 3);
    }
  }

  ctx.restore();
}

// 2. Draw Pixel Planet
export function drawPlanet(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  time: number
) {
  const { x, y, radius, type, primaryColor, secondaryColor, atmosphereColor, hasRings, ringColor } = planet;

  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  // Outer atmospheric haze
  const grad = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 1.3);
  grad.addColorStop(0, atmosphereColor + '66');
  grad.addColorStop(0.7, atmosphereColor + '22');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.35, 0, Math.PI * 2);
  ctx.fill();

  // Planet body
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();

  // Base spherical fill
  ctx.fillStyle = primaryColor;
  ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

  // Pixel surface features depending on planet type
  const pixelStep = 4;
  const rotOffset = (time * 0.08) % 1;

  if (type === 'verdant') {
    // Lush green continents & ocean bands
    ctx.fillStyle = secondaryColor;
    for (let py = -radius; py < radius; py += pixelStep) {
      for (let px = -radius; px < radius; px += pixelStep) {
        const dist = Math.sqrt(px * px + py * py);
        if (dist <= radius) {
          const noise = Math.sin((px + rotOffset * radius * 4) * 0.04) * Math.cos(py * 0.05);
          if (noise > 0.15) {
            ctx.fillRect(px, py, pixelStep, pixelStep);
          }
        }
      }
    }
    // White cloud swirls
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 4; i++) {
      const cy = -radius * 0.5 + i * (radius * 0.35);
      const cx = (Math.sin(time * 0.2 + i * 2) * radius * 0.4);
      ctx.fillRect(cx - radius * 0.4, cy, radius * 0.8, 6);
    }
  } else if (type === 'volcanic') {
    // Magma fissures and scorched crust
    ctx.fillStyle = secondaryColor;
    for (let py = -radius; py < radius; py += pixelStep) {
      for (let px = -radius; px < radius; px += pixelStep) {
        const dist = Math.sqrt(px * px + py * py);
        if (dist <= radius) {
          const fissure = Math.abs(Math.sin((px + py * 0.5 + rotOffset * 100) * 0.08));
          if (fissure < 0.18) {
            ctx.fillRect(px, py, pixelStep, pixelStep);
          }
        }
      }
    }
  } else if (type === 'cryo') {
    // Ice sheets & glacier chasms
    ctx.fillStyle = secondaryColor;
    for (let py = -radius; py < radius; py += pixelStep) {
      for (let px = -radius; px < radius; px += pixelStep) {
        const dist = Math.sqrt(px * px + py * py);
        if (dist <= radius) {
          const ice = Math.cos((px * 0.06) + (py * 0.03));
          if (ice > 0.2) {
            ctx.fillRect(px, py, pixelStep, pixelStep);
          }
        }
      }
    }
  } else if (type === 'ancient') {
    // Geometric alien circuit lines / ruins visible from orbit
    ctx.fillStyle = '#a855f7';
    for (let i = -radius + 10; i < radius - 10; i += 18) {
      ctx.fillRect(-radius, i, radius * 2, 3);
      ctx.fillRect(i, -radius, 3, radius * 2);
    }
  } else if (type === 'gas_giant') {
    // Horizontal turbulent atmospheric bands
    ctx.fillStyle = secondaryColor;
    for (let py = -radius; py < radius; py += 8) {
      if (Math.sin(py * 0.1 + time * 0.3) > 0) {
        ctx.fillRect(-radius, py, radius * 2, 6);
      }
    }
    // Great eye storm
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(radius * 0.25, radius * 0.15, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spherical shadow (terminator)
  const shadowGrad = ctx.createRadialGradient(
    -radius * 0.3,
    -radius * 0.3,
    radius * 0.2,
    0,
    0,
    radius
  );
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  shadowGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.45)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

  ctx.restore();

  // Planetary Rings (if present)
  if (hasRings && ringColor) {
    ctx.save();
    ctx.rotate(0.35);
    ctx.scale(1, 0.28);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Planet Name Tag
  ctx.font = '10px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(planet.name, 0, radius + 22);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '8px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(planet.indonesianSubtitle, 0, radius + 34);

  ctx.restore();
}

// 3. Draw Space Station / Outpost
export function drawSpaceStation(
  ctx: CanvasRenderingContext2D,
  station: SpaceStation,
  time: number
) {
  const { x, y, name, type } = station;

  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  // Central hub
  ctx.fillStyle = '#334155';
  ctx.fillRect(-16, -16, 32, 32);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-12, -12, 24, 24);

  // Core reactor light
  const corePulse = (Math.sin(time * 6) + 1) * 0.5;
  ctx.fillStyle = type === 'warp_gate' ? `rgba(168, 85, 247, ${0.5 + corePulse * 0.5})` : `rgba(56, 189, 248, ${0.5 + corePulse * 0.5})`;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  // Solar Arrays
  const pWidth = 38;
  const pHeight = 12;

  // Left array
  ctx.fillStyle = '#475569';
  ctx.fillRect(-16 - pWidth, -6, pWidth, 12);
  ctx.fillStyle = '#0284c7';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-16 - pWidth + i * 9 + 2, -4, 7, 8);
  }

  // Right array
  ctx.fillStyle = '#475569';
  ctx.fillRect(16, -6, pWidth, 12);
  ctx.fillStyle = '#0284c7';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(16 + i * 9 + 2, -4, 7, 8);
  }

  // Docking beacon flashing lights
  const blink = Math.floor(time * 3) % 2 === 0;
  ctx.fillStyle = blink ? '#ef4444' : '#22c55e';
  ctx.fillRect(-16 - pWidth, -8, 4, 4);
  ctx.fillRect(12 + pWidth, -8, 4, 4);

  // Rotating Radar Dish
  const radarAngle = time * 1.5;
  ctx.save();
  ctx.translate(0, -22);
  ctx.rotate(radarAngle);
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(0, 0, 7, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-1, -6, 2, 6);
  ctx.restore();

  // Station label
  ctx.font = '10px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(name, 0, 36);

  ctx.restore();
}

// 4. Draw Asteroid Chunk
export function drawAsteroid(
  ctx: CanvasRenderingContext2D,
  asteroid: Asteroid
) {
  const { x, y, radius, rotation, mineralType, palette, seed } = asteroid;

  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  ctx.rotate(rotation);

  // Jagged procedural polygon
  const steps = 8;
  ctx.beginPath();
  for (let i = 0; i < steps; i++) {
    const a = (i * Math.PI * 2) / steps;
    const offset = Math.sin(seed + i * 3.7) * (radius * 0.25);
    const r = radius + offset;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  // Base stone fill
  ctx.fillStyle = palette[0] || '#475569';
  ctx.fill();

  // Shading edge
  ctx.fillStyle = palette[1] || '#1e293b';
  ctx.beginPath();
  ctx.arc(-radius * 0.2, -radius * 0.2, radius * 0.75, 0, Math.PI);
  ctx.fill();

  // Embedded glowing mineral veins
  let crystalColor = '#38bdf8';
  if (mineralType === 'hyperCrystal') crystalColor = '#c084fc';
  if (mineralType === 'titanium') crystalColor = '#fbbf24';

  ctx.fillStyle = crystalColor;
  ctx.fillRect(-radius * 0.3, -radius * 0.2, 5, 5);
  ctx.fillRect(radius * 0.2, radius * 0.1, 4, 4);

  ctx.restore();
}

// 5. Draw Enemies
export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number
) {
  const { x, y, angle, type, hp, maxHp, radius, isTelegraphing } = enemy;

  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  ctx.rotate(angle);

  // Telegraph warning targeting beam
  if (isTelegraphing) {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(240, 0);
    ctx.stroke();
    ctx.restore();
  }

  if (type === 'pirate_drone') {
    // Fast angular crimson drone
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fill();

    // Dark core
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(-4, -4, 8, 8);

    // Glowing menacing eye
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(2, -2, 4, 4);

  } else if (type === 'pirate_cruiser') {
    // Heavy pirate assault cruiser
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-16, -12, 32, 24);

    ctx.fillStyle = '#450a0a';
    ctx.fillRect(-12, -8, 24, 16);

    // Front ram prow
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(16, -10);
    ctx.lineTo(24, 0);
    ctx.lineTo(16, 10);
    ctx.closePath();
    ctx.fill();

    // Twin laser turrets
    ctx.fillStyle = '#f87171';
    ctx.fillRect(8, -14, 8, 4);
    ctx.fillRect(8, 10, 8, 4);

  } else if (type === 'sentinel_eye') {
    // Alien Sentinel Eye with rotating glyph ring
    ctx.fillStyle = '#6b21a8';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Rotating mechanical ring
    ctx.save();
    ctx.rotate(time * 3);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.strokeRect(-radius * 0.9, -radius * 0.9, radius * 1.8, radius * 1.8);
    ctx.restore();

    // Iris eye
    ctx.fillStyle = '#fae8ff';
    ctx.beginPath();
    ctx.arc(4, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c026d3';
    ctx.fillRect(3, -2, 4, 4);

  } else if (type === 'void_boss') {
    // Void Boss Leviathan: colossus with pulsating energy core
    const pulse = Math.sin(time * 6) * 4;

    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4338ca';
    ctx.fillRect(-radius * 0.8, -radius * 0.8, radius * 1.6, radius * 1.6);

    // Glowing core
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Spikes / Cannons
    ctx.fillStyle = '#6366f1';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + time * 0.8;
      const sx = Math.cos(a) * (radius + 8);
      const sy = Math.sin(a) * (radius + 8);
      ctx.fillRect(sx - 3, sy - 3, 6, 6);
    }
  }

  // Health bar above enemy
  ctx.restore();

  // Draw unrotated HP bar
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  const barW = Math.max(28, radius * 1.6);
  const hpPct = Math.max(0, hp / maxHp);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(-barW / 2, -radius - 12, barW, 4);

  ctx.fillStyle = type === 'void_boss' ? '#c084fc' : '#ef4444';
  ctx.fillRect(-barW / 2, -radius - 12, barW * hpPct, 4);
  ctx.restore();
}

// 6. Draw Floating Resource Crystals
export function drawResourceDrop(
  ctx: CanvasRenderingContext2D,
  drop: ResourceDrop,
  time: number
) {
  const { x, y, type, rotation } = drop;

  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  ctx.rotate(rotation + time * 2);

  if (type === 'stardust') {
    // 4-point glowing star
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-3, -3, 6, 6);
    ctx.fillRect(-6, -1, 12, 2);
    ctx.fillRect(-1, -6, 2, 12);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -1, 2, 2);
  } else if (type === 'hyperCrystal') {
    // Hexagonal purple gem
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(5, -3);
    ctx.lineTo(5, 3);
    ctx.lineTo(0, 6);
    ctx.lineTo(-5, 3);
    ctx.lineTo(-5, -3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -2, 2, 4);
  } else if (type === 'titanium') {
    // Golden alloy ingot
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-5, -4, 10, 8);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-4, -3, 8, 2);
  } else if (type === 'alienArtifact') {
    // Glowing strange prism
    ctx.fillStyle = '#34d399';
    ctx.fillRect(-4, -4, 8, 8);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(-2, -2, 4, 4);
  }

  ctx.restore();
}

// 7. Draw Surface Rover for Planetary Exploration
export function drawSurfaceRover(
  ctx: CanvasRenderingContext2D,
  rover: { x: number; y: number; vx: number; vy: number; angle: number; grounded: boolean },
  time: number
) {
  const { x, y, angle, grounded } = rover;

  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  ctx.rotate(angle);

  // Rover Chassis
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-14, -10, 28, 12);

  // Cabin
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-6, -16, 16, 7);

  // Cyan Visor
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(2, -14, 6, 4);

  // Wheels (4 big all-terrain rover wheels)
  const wheelSpin = time * (rover.vx * 3);
  ctx.fillStyle = '#334155';
  [-10, 8].forEach((wx) => {
    ctx.beginPath();
    ctx.arc(wx, 4, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.fillRect(wx - 2, 2, 4, 4);
    ctx.fillStyle = '#334155';
  });

  // Headlight beam
  ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
  ctx.beginPath();
  ctx.moveTo(14, -8);
  ctx.lineTo(80, -22);
  ctx.lineTo(80, 8);
  ctx.closePath();
  ctx.fill();

  // Jump thruster flame if airborne and ascending
  if (!grounded && rover.vy < 0) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-4, 2, 8, 10 + Math.sin(time * 30) * 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, 2, 4, 6);
  }

  ctx.restore();
}
