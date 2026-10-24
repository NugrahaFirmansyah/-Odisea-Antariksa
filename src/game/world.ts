/**
 * Galaxy generation and world state for Kosmos Space Adventure.
 */

import { Asteroid, Mission, Planet, SpaceStation, UpgradeItem } from '../types/game';

export const INITIAL_PLANETS: Planet[] = [
  {
    id: 'planet_verdia',
    name: 'Verdia IV',
    indonesianSubtitle: 'Biosfer Eksotis & Hutan Zamrud',
    type: 'verdant',
    x: -850,
    y: -600,
    radius: 95,
    primaryColor: '#064e3b',
    secondaryColor: '#10b981',
    atmosphereColor: '#34d399',
    discovered: true,
    landable: true,
    visited: false,
    description: 'Dunia bervegetasi tinggi dengan kandungan oksigen murni dan cadangan Debu Bintang cair di lembah zamrud.',
    resourcesAvailable: ['Debu Bintang (Stardust)', 'Titanium Murni', 'Fosil Pra-Sejarah'],
    ruinsCount: 2,
  },
  {
    id: 'planet_kryos',
    name: 'Kryos-7',
    indonesianSubtitle: 'Gurun Es Abadi & Gletser Metana',
    type: 'cryo',
    x: 950,
    y: -750,
    radius: 80,
    primaryColor: '#1e3a8a',
    secondaryColor: '#93c5fd',
    atmosphereColor: '#60a5fa',
    discovered: false,
    landable: true,
    visited: false,
    description: 'Planet es beku dengan suhu ekstrem -180°C. Struktur kristal hyperion memancar dari celah ngarai es purba.',
    resourcesAvailable: ['Hyper-Crystal', 'Es Polimer', 'Batu Meteor'],
    ruinsCount: 3,
  },
  {
    id: 'planet_pyros',
    name: 'Pyros Caldera',
    indonesianSubtitle: 'Inti Vulkanik & Lautan Magma',
    type: 'volcanic',
    x: -1100,
    y: 800,
    radius: 90,
    primaryColor: '#7c2d12',
    secondaryColor: '#f97316',
    atmosphereColor: '#fb923c',
    discovered: false,
    landable: true,
    visited: false,
    description: 'Aktivitas lempeng tektonik liar menghasilkan urat Titanium kelas tinggi dan medan magnetik kuat.',
    resourcesAvailable: ['Titanium Murni', 'Materi Vulkanik', 'Kristal Panas'],
    ruinsCount: 1,
  },
  {
    id: 'planet_aethelgard',
    name: 'Aethelgard Prime',
    indonesianSubtitle: 'Puing Monolit Peradaban Kuno',
    type: 'ancient',
    x: 1250,
    y: 850,
    radius: 85,
    primaryColor: '#4c1d95',
    secondaryColor: '#c084fc',
    atmosphereColor: '#a855f7',
    discovered: false,
    landable: true,
    visited: false,
    description: 'Pusat kebudayaan arsitektur kosmik yang telah punah jutaan tahun lalu. Monolit misterius masih memancarkan sinyal aktif.',
    resourcesAvailable: ['Relik Kuno', 'Materi Gelap', 'Hyper-Crystal'],
    ruinsCount: 4,
  },
  {
    id: 'planet_cronus',
    name: 'Cronus Titan',
    indonesianSubtitle: 'Raksasa Gas & Cincin Badai Ion',
    type: 'gas_giant',
    x: 0,
    y: 1550,
    radius: 140,
    hasRings: true,
    ringColor: 'rgba(217, 119, 6, 0.75)',
    primaryColor: '#b45309',
    secondaryColor: '#fde68a',
    atmosphereColor: '#f59e0b',
    discovered: false,
    landable: false,
    visited: false,
    description: 'Raksasa gas kolosal dengan gravitasi masif. Cincin debu partikelnya kaya akan unsur materi gelap terionisasi.',
    resourcesAvailable: ['Materi Gelap', 'Gas Helium-3'],
    ruinsCount: 0,
  },
];

export const INITIAL_STATIONS: SpaceStation[] = [
  {
    id: 'station_orion',
    name: 'Stasiun Riset Orion-9',
    x: -250,
    y: -300,
    type: 'research_lab',
    interactRadius: 140,
    isRepaired: false,
  },
  {
    id: 'station_outpost',
    name: 'Pos Pengawas Valis',
    x: 550,
    y: 200,
    type: 'outpost',
    interactRadius: 130,
    isRepaired: true,
  },
  {
    id: 'station_warp',
    name: 'Gerbang Warp Singularitas',
    x: 1700,
    y: -1200,
    type: 'warp_gate',
    interactRadius: 180,
    isRepaired: false,
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1_stardust',
    title: 'Inisiasi Navigasi & Bahan Bakar',
    objective: 'Tambang atau kumpulkan 35 Debu Bintang (Stardust) dari asteroid',
    type: 'collect',
    targetCount: 35,
    currentCount: 0,
    rewardStardust: 50,
    rewardCrystal: 5,
    completed: false,
    unlocked: true,
    loreText: 'Reaktor utama pesawat membutuhkan partikel Debu Bintang untuk stabilisasi fusi plasma sub-cahaya.',
  },
  {
    id: 'm2_station',
    title: 'Sinyal Terbengkalai Orion-9',
    objective: 'Dekati Stasiun Riset Orion-9 dan periksa terminal data (Tekan [E])',
    type: 'discover',
    targetCount: 1,
    currentCount: 0,
    rewardStardust: 80,
    rewardCrystal: 10,
    completed: false,
    unlocked: true,
    loreText: 'Sebuah sinyal darurat otomatis berfrekuensi usang terdeteksi dari pos penelitian astronomi Orion-9.',
  },
  {
    id: 'm3_land_planet',
    title: 'Pendaratan di Dunia Asing',
    objective: 'Dekati Planet Verdia IV atau Kryos-7 dan lakukan pendaratan Rover (Tekan [E])',
    type: 'land',
    targetCount: 1,
    currentCount: 0,
    rewardStardust: 120,
    rewardCrystal: 15,
    completed: false,
    unlocked: true,
    loreText: 'Modul pendaratan permukaan telah disiapkan. Jelajahi daratan alien untuk mengambil sampel geologis murni.',
  },
  {
    id: 'm4_patrol',
    title: 'Pembersihan Armada Perompak',
    objective: 'Musnahkan 5 drone tempur bajak laut antariksa',
    type: 'defeat',
    targetCount: 5,
    currentCount: 0,
    rewardStardust: 150,
    rewardCrystal: 20,
    completed: false,
    unlocked: true,
    loreText: 'Kawanan perompak bintang mengincar kapal pedagang yang melintasi koridor sabuk asteroid.',
  },
  {
    id: 'm5_boss',
    title: 'Penjaga Gerbang Singularitas',
    objective: 'Kalahkan Titan Kehampaan (Void Boss) di dekat Gerbang Warp',
    type: 'boss',
    targetCount: 1,
    currentCount: 0,
    rewardStardust: 300,
    rewardCrystal: 50,
    completed: false,
    unlocked: false,
    loreText: 'Sebuah entitas biomekanik kuno telah bangkit dan menjaga portal menuju galaksi berikutnya!',
  },
];

export const INITIAL_UPGRADES: UpgradeItem[] = [
  {
    id: 'upg_hull',
    name: 'Pelat Lambung Titanium',
    category: 'defense',
    description: 'Mempertebal lambung kapal dengan campuran titanium kedap radiasi.',
    level: 1,
    maxLevel: 4,
    costStardust: 30,
    costTitanium: 5,
    costCrystal: 0,
    statBonusText: '+40 Integritas Lambung (Hull)',
  },
  {
    id: 'upg_shield',
    name: 'Generator Perisai Polaron',
    category: 'defense',
    description: 'Meningkatkan kapasitas medan perisai energi dan kecepatan regenerasi.',
    level: 1,
    maxLevel: 4,
    costStardust: 45,
    costTitanium: 10,
    costCrystal: 5,
    statBonusText: '+30 Kapasitas Perisai & +1.5x Regen',
  },
  {
    id: 'upg_blaster',
    name: 'Meriam Plasma Hyper-Velocity',
    category: 'weapons',
    description: 'Menambah daya hancur plasma dan laju tembakan laras ganda.',
    level: 1,
    maxLevel: 4,
    costStardust: 50,
    costTitanium: 15,
    costCrystal: 10,
    statBonusText: '+25% Damage & Laras Senjata Ganda',
  },
  {
    id: 'upg_engine',
    name: 'Pendorong Fusi Ion Vektor',
    category: 'engine',
    description: 'Mengoptimalkan akselerasi pendorong utama dan durasi hyper-boost.',
    level: 1,
    maxLevel: 3,
    costStardust: 40,
    costTitanium: 8,
    costCrystal: 4,
    statBonusText: '+20% Kecepatan Jelajah & +35% Boost',
  },
  {
    id: 'upg_mining',
    name: 'Laser Traktor Pemotong Kristal',
    category: 'mining',
    description: 'Mempercepat penambangan batuan asteroid dan jangkauan magnet sumber daya.',
    level: 1,
    maxLevel: 3,
    costStardust: 35,
    costTitanium: 6,
    costCrystal: 2,
    statBonusText: '+50% Kecepatan Tambang & Jangkauan Magnet',
  },
];

export function generateAsteroidBelt(count = 70): Asteroid[] {
  const asteroids: Asteroid[] = [];
  const palettes = [
    ['#475569', '#334155'],
    ['#64748b', '#475569'],
    ['#3f3f46', '#27272a'],
    ['#52525b', '#3f3f46'],
  ];

  for (let i = 0; i < count; i++) {
    // Generate scattered in clusters around space
    const angle = Math.random() * Math.PI * 2;
    const dist = 300 + Math.random() * 2200;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    const r = 14 + Math.random() * 26;
    const mineralRoll = Math.random();
    let mineralType: 'stardust' | 'titanium' | 'hyperCrystal' = 'stardust';
    if (mineralRoll > 0.8) mineralType = 'hyperCrystal';
    else if (mineralRoll > 0.5) mineralType = 'titanium';

    asteroids.push({
      id: `ast_${i}_${Date.now()}`,
      x,
      y,
      radius: r,
      hp: Math.floor(r * 2),
      maxHp: Math.floor(r * 2),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.02,
      mineralType,
      palette: palettes[Math.floor(Math.random() * palettes.length)],
      seed: Math.random() * 1000,
    });
  }

  return asteroids;
}
