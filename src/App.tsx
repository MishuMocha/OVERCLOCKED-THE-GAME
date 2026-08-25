import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Cpu,
  Zap,
  Activity,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert,
  Search,
  Flame,
  Bot,
  Layers,
  ThermometerSnowflake,
  Radio,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  TrendingUp,
  CircuitBoard,
  Sliders,
  Award,
  Sparkle,
  Gauge,
  Atom,
  Eye,
  Crosshair,
  Lightbulb,
  X,
  ChevronRight,
  Network,
  Orbit,
  Infinity,
  Sun,
  RefreshCw,
  Clock,
  RadioTower,
  ShieldCheck,
  Disc,
  AlertTriangle,
  Trophy,
  Globe,
  Star,
  BarChart3,
  PieChart,
  Timer
} from 'lucide-react';
import { audioEngine } from './audio';

interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  opsIncrease: number;
  icon: React.ElementType;
  color: string;
}

export interface SubUpgradeItem {
  id: string;
  name: string;
  category: 'click' | 'hardware';
  targetId: string; // 'click' | hardware id
  targetName: string;
  description: string;
  cost: number;
  multiplier: number;
  icon: React.ElementType;
  color: string;
  reqType: 'count' | 'click';
  reqAmount: number;
  reqHardwareId?: string;
  lore: string;
}

export interface QuantumPerk {
  id: string;
  name: string;
  maxLevel: number;
  costs: number[];
  icon: React.ElementType;
  color: string;
  lore: string;
  effectType: 'starter_hardware' | 'passive_boost' | 'click_boost' | 'offline_prod' | 'wafer_catalyst' | 'autofire' | 'thermal_tolerance' | 'precision_crit';
  reqPerkId?: string;
  getDescription: (level: number) => string;
}

export const QUANTUM_PERKS: QuantumPerk[] = [
  {
    id: 'perk-bootloader',
    name: 'Automated Bootloader',
    maxLevel: 3,
    costs: [5, 15, 35],
    icon: Bot,
    color: '#00f2fe',
    lore: 'Pre-compiles initial optical inspection subroutines into silicon ROM before the universe reboots.',
    effectType: 'starter_hardware',
    getDescription: (lvl) => {
      const count = lvl === 3 ? 50 : lvl === 2 ? 25 : 10;
      return `Start each new Quantum Rebirth with ${count} free Magnifying Glasses (Tier 01).`;
    },
  },
  {
    id: 'perk-cryo',
    name: 'Cryo-Superconductors',
    maxLevel: 5,
    costs: [10, 25, 55, 120, 250],
    icon: ThermometerSnowflake,
    color: '#818cf8',
    lore: 'Zero-resistance quantum lattice tracks keep thermodynamic dissipation locked near absolute zero.',
    effectType: 'passive_boost',
    getDescription: (lvl) => `Permanent +${(lvl || 1) * 25}% boost to all passive hardware rates across all runs.`,
  },
  {
    id: 'perk-neural',
    name: 'Neural Overclock',
    maxLevel: 5,
    costs: [8, 20, 45, 100, 220],
    icon: Zap,
    color: '#fbbf24',
    lore: 'Direct neural synaptic bridge bypasses human neuromuscular latency for instant chip fabrication.',
    effectType: 'click_boost',
    getDescription: (lvl) => `Permanent +${(lvl || 1) * 50}% boost to manual tap yield across all runs.`,
  },
  {
    id: 'perk-autofire',
    name: 'Capacitive Pulse Buffer',
    maxLevel: 3,
    costs: [12, 35, 90],
    icon: Crosshair,
    color: '#38bdf8',
    lore: 'Charges an internal capacitive bridge that continuously discharges synthesis pulses under contact.',
    effectType: 'autofire',
    getDescription: (lvl) => {
      if (lvl === 3) return 'Maxes Hold-to-Craft rate to 25 clicks/sec (40ms tick interval).';
      if (lvl === 2) return 'Increases Hold-to-Craft rate to 12 clicks/sec (~83ms tick interval).';
      return 'Unlocks Hold-to-Craft on the central chip at 5 clicks/sec (200ms interval).';
    },
  },
  {
    id: 'perk-thermal',
    name: 'Thermal Tolerance',
    maxLevel: 3,
    costs: [10, 25, 60],
    icon: Flame,
    color: '#f97316',
    lore: 'Micro-channeled liquid nitrogen cooling grids dissipate core thermal energy at extreme velocity.',
    effectType: 'thermal_tolerance',
    getDescription: (lvl) => `Increases passive heat dissipation rate by +${(lvl || 1) * 50}% (+${(lvl || 1) * 10} heat/sec).`,
  },
  {
    id: 'perk-precision',
    name: 'Precision Fabrication',
    maxLevel: 3,
    costs: [8, 20, 50],
    icon: Gauge,
    color: '#ec4899',
    lore: 'Calibrates sub-micron lithography lasers for hyper-frequent critical resonance bursts.',
    effectType: 'precision_crit',
    getDescription: (lvl) => `Increases manual Critical Hit chance to ${(10 + (lvl || 1) * 7.5).toFixed(1)}% (Base: 10.0%, 5x yield on crit).`,
  },
  {
    id: 'perk-offline',
    name: 'Offline Matrix',
    maxLevel: 3,
    costs: [15, 40, 90],
    icon: Orbit,
    color: '#38bdf8',
    lore: 'Quantum entangled background daemons continue state synthesis across asynchronous spacetime dimensions.',
    effectType: 'offline_prod',
    getDescription: (lvl) => {
      const pct = lvl === 3 ? 100 : lvl === 2 ? 75 : 50;
      return `Produce ${pct}% passive Ops while the browser tab is closed or suspended (up to 24h).`;
    },
  },
  {
    id: 'perk-catalyst',
    name: 'Quantum Catalyst',
    maxLevel: 3,
    costs: [40, 95, 220],
    icon: Atom,
    color: '#a855f7',
    lore: 'Enhances sub-atomic wafer resonance to extract computational density per stored quantum wafer.',
    effectType: 'wafer_catalyst',
    getDescription: (lvl) => `Each unspent Quantum Wafer grants +${2 + (lvl || 1)}% boost to all OPS synthesis (Base: +2%).`,
  },
];

export type BuyMultiplier = 1 | 5 | 10 | 'max';

// Hardware Quantity Milestones (2x output multiplier per threshold achieved)
export const HARDWARE_MILESTONES = [10, 25, 50, 100, 150, 250, 500] as const;

export const getHardwareMilestoneMultiplier = (count: number): number => {
  const reached = HARDWARE_MILESTONES.filter((m) => count >= m).length;
  return Math.pow(2, reached);
};

export const getNextHardwareMilestone = (count: number): {
  currentMultiplier: number;
  nextMilestone: number | null;
  prevMilestone: number;
  isMax: boolean;
} => {
  const currentMultiplier = getHardwareMilestoneMultiplier(count);
  const nextMilestone = HARDWARE_MILESTONES.find((m) => count < m) || null;
  const reachedMilestones = HARDWARE_MILESTONES.filter((m) => count >= m);
  const prevMilestone = reachedMilestones.length > 0 ? reachedMilestones[reachedMilestones.length - 1] : 0;
  return {
    currentMultiplier,
    nextMilestone,
    prevMilestone,
    isMax: nextMilestone === null,
  };
};

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
};

// Multi-buy cost calculation helpers
export const getUpgradeMultiCost = (baseCost: number, startCount: number, amount: number): number => {
  let total = 0;
  for (let i = 0; i < amount; i++) {
    total += Math.round(baseCost * Math.pow(1.15, startCount + i));
  }
  return total;
};

export const getUpgradeMaxAffordable = (baseCost: number, startCount: number, availableOps: number): { count: number; cost: number } => {
  let count = 0;
  let totalCost = 0;
  
  while (count < 10000) {
    const nextUnitCost = Math.round(baseCost * Math.pow(1.15, startCount + count));
    if (totalCost + nextUnitCost <= availableOps) {
      totalCost += nextUnitCost;
      count++;
    } else {
      break;
    }
  }
  
  if (count === 0) {
    return {
      count: 0,
      cost: Math.round(baseCost * Math.pow(1.15, startCount)),
    };
  }
  
  return { count, cost: totalCost };
};

const UPGRADES: UpgradeItem[] = [
  {
    id: 'magnifying-glass',
    name: 'Magnifying Glass',
    description: 'Precision inspection for optical alignment and trace inspection.',
    baseCost: 50,
    opsIncrease: 1,
    icon: Search,
    color: '#00f2fe',
  },
  {
    id: 'soldering-iron',
    name: 'Soldering Iron',
    description: 'High-temp micro-soldering station for rapid PCB bonding.',
    baseCost: 250,
    opsIncrease: 3,
    icon: Flame,
    color: '#fbbf24',
  },
  {
    id: 'wire-bonder',
    name: 'Automated Wire Bonder',
    description: 'High-speed robotic ultrasonic wire bonding across die pads.',
    baseCost: 1200,
    opsIncrease: 12,
    icon: Bot,
    color: '#00ff87',
  },
  {
    id: 'lithography-rig',
    name: 'EUV Lithography Rig',
    description: 'Deep ultraviolet laser etching for sub-nanometer circuitry.',
    baseCost: 7500,
    opsIncrease: 48,
    icon: Layers,
    color: '#38bdf8',
  },
  {
    id: 'cryo-cooling',
    name: 'Cryo-Cooling Subsystem',
    description: 'Liquid nitrogen thermal dissipation to prevent junction throttling.',
    baseCost: 50000,
    opsIncrease: 220,
    icon: ThermometerSnowflake,
    color: '#818cf8',
  },
  {
    id: 'neural-synthesizer',
    name: 'Quantum Wafer Stepper',
    description: 'Autonomous wafer synthesis harnessing coherent quantum states.',
    baseCost: 360000,
    opsIncrease: 1100,
    icon: Radio,
    color: '#f43f5e',
  },
  {
    id: 'synaptic-forge',
    name: 'Synaptic Core Forge',
    description: 'Neuromorphic wafer foundry printing billions of memristor artificial synapses.',
    baseCost: 2800000,
    opsIncrease: 5800,
    icon: Network,
    color: '#a855f7',
  },
  {
    id: 'orbital-cleanroom',
    name: 'Orbital Zero-G Cleanroom',
    description: 'Microgravity space station foundry growing atomically defect-free crystal ingots.',
    baseCost: 24000000,
    opsIncrease: 32000,
    icon: Orbit,
    color: '#06b6d4',
  },
  {
    id: 'dark-silicon-engine',
    name: 'Dark-Silicon Subharmonic Engine',
    description: 'Taps unpowered dark silicon sectors through resonant sub-threshold quantum tunneling.',
    baseCost: 160000000,
    opsIncrease: 180000,
    icon: Infinity,
    color: '#f59e0b',
  },
  {
    id: 'computronium-matrix',
    name: 'Dyson Computronium Matrix',
    description: 'Planet-scale stellar megastructure transmuting raw starlight directly into monolithic computation.',
    baseCost: 1000000000, // 1 Billion Ops
    opsIncrease: 1200000,
    icon: Sun,
    color: '#ec4899',
  },
  // TIER 11-15 (New Endgame Expansion)
  {
    id: 'tachyon-fabricator',
    name: 'Tachyon Chrono-Fabricator',
    description: 'Synthesizes chips backwards through temporal causality loops using faster-than-light tachyon pulses.',
    baseCost: 25000000000, // 25B Ops
    opsIncrease: 320000, // +320,000 OPS
    icon: Clock,
    color: '#00f2fe',
  },
  {
    id: 'matrioshka-brain',
    name: 'Planetary Matrioshka Brain',
    description: 'Multi-layered planetary computronium sphere converting an entire celestial body into pure thought.',
    baseCost: 750000000000, // 750B Ops
    opsIncrease: 2200000, // +2.2M OPS
    icon: Globe,
    color: '#10b981',
  },
  {
    id: 'string-loom',
    name: 'Sub-Atomic String Loom',
    description: 'Weaves 11-dimensional vibrating strings to execute trans-dimensional parallel computations.',
    baseCost: 28000000000000, // 28T Ops
    opsIncrease: 18000000, // +18M OPS
    icon: Activity,
    color: '#8b5cf6',
  },
  {
    id: 'galactic-harvester',
    name: 'Galactic Core Harvester',
    description: 'Extracts rotational frame-dragging energy from the central supermassive black hole to power logic gates.',
    baseCost: 1200000000000000, // 1.2Q Ops
    opsIncrease: 160000000, // +160M OPS
    icon: RadioTower,
    color: '#f59e0b',
  },
  {
    id: 'multiverse-engine',
    name: 'Multiverse Silicon Engine',
    description: 'Taps the computational capacity of infinite parallel realities to run monolithic universal simulations.',
    baseCost: 75000000000000000, // 75Q Ops
    opsIncrease: 1500000000, // +1.5B OPS
    icon: Sparkles,
    color: '#f43f5e',
  },
];

const SUB_UPGRADES: SubUpgradeItem[] = [
  // Manual Click Sub-Upgrades
  {
    id: 'sub-click-1',
    name: 'Tactile Micro-Switches',
    category: 'click',
    targetId: 'click',
    targetName: 'Manual Synthesis',
    description: 'Manual chip synthesis is 2x more effective (+1 OP per tap).',
    cost: 80,
    multiplier: 2,
    icon: Crosshair,
    color: '#38bdf8',
    reqType: 'click',
    reqAmount: 15,
    lore: 'Zero-latency gold-plated mechanical microswitches for instant silicon triggering.',
  },
  {
    id: 'sub-click-2',
    name: 'Neural Impulse Coupler',
    category: 'click',
    targetId: 'click',
    targetName: 'Manual Synthesis',
    description: 'Manual chip synthesis is 2x more effective (Total 4x tap yield).',
    cost: 750,
    multiplier: 2,
    icon: Zap,
    color: '#a855f7',
    reqType: 'click',
    reqAmount: 75,
    lore: 'Synaptic feedback link synchronizing motor cortex impulses directly to the fabrication bus.',
  },
  {
    id: 'sub-click-3',
    name: 'Superconducting Pulse Emitter',
    category: 'click',
    targetId: 'click',
    targetName: 'Manual Synthesis',
    description: 'Manual chip synthesis is 2.5x more effective (Total 10x tap yield).',
    cost: 6000,
    multiplier: 2.5,
    icon: Sparkles,
    color: '#ec4899',
    reqType: 'click',
    reqAmount: 200,
    lore: 'Nanosecond pulse discharge that delivers concentrated bursts of synthesis energy.',
  },
  {
    id: 'sub-click-4',
    name: 'Sub-Atomic Laser Trigger',
    category: 'click',
    targetId: 'click',
    targetName: 'Manual Synthesis',
    description: 'Manual chip synthesis is 2x more effective (Total 20x tap yield).',
    cost: 50000,
    multiplier: 2,
    icon: Lightbulb,
    color: '#00f2fe',
    reqType: 'click',
    reqAmount: 400,
    lore: 'Femtosecond coherent laser pulse firing silicon gate excitation at the sub-atomic quantum tier.',
  },
  {
    id: 'sub-click-5',
    name: 'Singularity Pulse Driver',
    category: 'click',
    targetId: 'click',
    targetName: 'Manual Synthesis',
    description: 'Manual chip synthesis is 2.5x more effective (Total 50x tap yield).',
    cost: 1200000,
    multiplier: 2.5,
    icon: Atom,
    color: '#fbbf24',
    reqType: 'click',
    reqAmount: 1000,
    lore: 'Localized gravitational micro-distortion inducing instantaneous computational state collapse.',
  },

  // Tier 1: Magnifying Glass
  {
    id: 'sub-mg-1',
    name: 'Fluoride Anti-Glare Coating',
    category: 'hardware',
    targetId: 'magnifying-glass',
    targetName: 'Magnifying Glass',
    description: 'Magnifying Glasses are twice as effective (2x output).',
    cost: 150,
    multiplier: 2,
    icon: Eye,
    color: '#00f2fe',
    reqType: 'count',
    reqHardwareId: 'magnifying-glass',
    reqAmount: 1,
    lore: 'Anti-reflective optical coating reducing flare and accelerating die alignment.',
  },
  {
    id: 'sub-mg-2',
    name: 'Achromatic Doublet Optics',
    category: 'hardware',
    targetId: 'magnifying-glass',
    targetName: 'Magnifying Glass',
    description: 'Magnifying Glasses are twice as effective (Total 4x base output).',
    cost: 850,
    multiplier: 2,
    icon: Search,
    color: '#38bdf8',
    reqType: 'count',
    reqHardwareId: 'magnifying-glass',
    reqAmount: 10,
    lore: 'Crown and flint glass pairing that eliminates chromatic aberration during micron inspection.',
  },
  {
    id: 'sub-mg-3',
    name: 'Polarized UV Eyepiece',
    category: 'hardware',
    targetId: 'magnifying-glass',
    targetName: 'Magnifying Glass',
    description: 'Magnifying Glasses are twice as effective (Total 8x base output).',
    cost: 4500,
    multiplier: 2,
    icon: Lightbulb,
    color: '#67e8f9',
    reqType: 'count',
    reqHardwareId: 'magnifying-glass',
    reqAmount: 25,
    lore: 'High-contrast polarized ultraviolet filter revealing micro-fractures in silicon substrate.',
  },

  // Tier 2: Soldering Iron
  {
    id: 'sub-si-1',
    name: 'Rosin-Core Flux Solder',
    category: 'hardware',
    targetId: 'soldering-iron',
    targetName: 'Soldering Iron',
    description: 'Soldering Irons are twice as effective (2x output).',
    cost: 350,
    multiplier: 2,
    icon: Flame,
    color: '#fbbf24',
    reqType: 'count',
    reqHardwareId: 'soldering-iron',
    reqAmount: 1,
    lore: 'Fast-wetting non-corrosive rosin core that halves bond formation latency.',
  },
  {
    id: 'sub-si-2',
    name: 'Ceramic Induction Element',
    category: 'hardware',
    targetId: 'soldering-iron',
    targetName: 'Soldering Iron',
    description: 'Soldering Irons are twice as effective (Total 4x base output).',
    cost: 2200,
    multiplier: 2,
    icon: Sparkle,
    color: '#f59e0b',
    reqType: 'count',
    reqHardwareId: 'soldering-iron',
    reqAmount: 10,
    lore: 'Rapid-recovery thermal cartridge maintaining exact 350°C junction heat.',
  },
  {
    id: 'sub-si-3',
    name: 'Nitrogen Purge Chamber',
    category: 'hardware',
    targetId: 'soldering-iron',
    targetName: 'Soldering Iron',
    description: 'Soldering Irons are twice as effective (Total 8x base output).',
    cost: 12000,
    multiplier: 2,
    icon: Gauge,
    color: '#d97706',
    reqType: 'count',
    reqHardwareId: 'soldering-iron',
    reqAmount: 25,
    lore: 'Inert atmospheric shielding eliminating oxidation during lead-free surface mounts.',
  },

  // Tier 3: Automated Wire Bonder
  {
    id: 'sub-wb-1',
    name: 'Ultrasonic Transducer',
    category: 'hardware',
    targetId: 'wire-bonder',
    targetName: 'Automated Wire Bonder',
    description: 'Automated Wire Bonders are twice as effective (2x output).',
    cost: 1000,
    multiplier: 2,
    icon: Bot,
    color: '#00ff87',
    reqType: 'count',
    reqHardwareId: 'wire-bonder',
    reqAmount: 1,
    lore: 'Tuned 120kHz piezoelectric transducer creating instantaneous metallurgical welds.',
  },
  {
    id: 'sub-wb-2',
    name: 'Ruby Wire Capillaries',
    category: 'hardware',
    targetId: 'wire-bonder',
    targetName: 'Automated Wire Bonder',
    description: 'Automated Wire Bonders are twice as effective (Total 4x base output).',
    cost: 7000,
    multiplier: 2,
    icon: Sparkles,
    color: '#10b981',
    reqType: 'count',
    reqHardwareId: 'wire-bonder',
    reqAmount: 10,
    lore: 'Zero-friction synthetic gemstone guides allowing 50 bonding cycles per second.',
  },
  {
    id: 'sub-wb-3',
    name: 'Dynamic Loop Profiler',
    category: 'hardware',
    targetId: 'wire-bonder',
    targetName: 'Automated Wire Bonder',
    description: 'Automated Wire Bonders are twice as effective (Total 8x base output).',
    cost: 35000,
    multiplier: 2,
    icon: CircuitBoard,
    color: '#059669',
    reqType: 'count',
    reqHardwareId: 'wire-bonder',
    reqAmount: 25,
    lore: 'AI-assisted wire geometry calculation minimizing electrical impedance.',
  },

  // Tier 4: EUV Lithography Rig
  {
    id: 'sub-litho-1',
    name: 'Pulsed Tin-Plasma Source',
    category: 'hardware',
    targetId: 'lithography-rig',
    targetName: 'EUV Lithography Rig',
    description: 'EUV Lithography Rigs are twice as effective (2x output).',
    cost: 3800,
    multiplier: 2,
    icon: Layers,
    color: '#38bdf8',
    reqType: 'count',
    reqHardwareId: 'lithography-rig',
    reqAmount: 1,
    lore: 'Extreme ultraviolet emission at 13.5nm wavelength via molten droplet vaporization.',
  },
  {
    id: 'sub-litho-2',
    name: 'Multi-Layer Bragg Mirrors',
    category: 'hardware',
    targetId: 'lithography-rig',
    targetName: 'EUV Lithography Rig',
    description: 'EUV Lithography Rigs are twice as effective (Total 4x base output).',
    cost: 28000,
    multiplier: 2,
    icon: Sliders,
    color: '#0ea5e9',
    reqType: 'count',
    reqHardwareId: 'lithography-rig',
    reqAmount: 10,
    lore: 'Molybdenum/silicon 40-layer mirrors with 70% sub-atomic EUV reflectance.',
  },
  {
    id: 'sub-litho-3',
    name: 'High-NA Anamorphic Optics',
    category: 'hardware',
    targetId: 'lithography-rig',
    targetName: 'EUV Lithography Rig',
    description: 'EUV Lithography Rigs are twice as effective (Total 8x base output).',
    cost: 140000,
    multiplier: 2,
    icon: Award,
    color: '#0284c7',
    reqType: 'count',
    reqHardwareId: 'lithography-rig',
    reqAmount: 25,
    lore: '0.55 numerical aperture projection system etching 1-nanometer gate boundaries.',
  },

  // Tier 5: Cryo-Cooling Subsystem
  {
    id: 'sub-cryo-1',
    name: 'Superfluid Helium Loop',
    category: 'hardware',
    targetId: 'cryo-cooling',
    targetName: 'Cryo-Cooling Subsystem',
    description: 'Cryo-Cooling Subsystems are twice as effective (2x output).',
    cost: 13500,
    multiplier: 2,
    icon: ThermometerSnowflake,
    color: '#818cf8',
    reqType: 'count',
    reqHardwareId: 'cryo-cooling',
    reqAmount: 1,
    lore: 'Zero-viscosity thermal fluid circulating at 1.8 Kelvin for zero heat resistance.',
  },
  {
    id: 'sub-cryo-2',
    name: 'Multi-Stage Peltier Cascade',
    category: 'hardware',
    targetId: 'cryo-cooling',
    targetName: 'Cryo-Cooling Subsystem',
    description: 'Cryo-Cooling Subsystems are twice as effective (Total 4x base output).',
    cost: 85000,
    multiplier: 2,
    icon: Gauge,
    color: '#6366f1',
    reqType: 'count',
    reqHardwareId: 'cryo-cooling',
    reqAmount: 10,
    lore: 'Bismuth telluride thermoelectric stack pumping heat directly to heat pipes.',
  },
  {
    id: 'sub-cryo-3',
    name: 'Quantum Thermal Photonic Crystals',
    category: 'hardware',
    targetId: 'cryo-cooling',
    targetName: 'Cryo-Cooling Subsystem',
    description: 'Cryo-Cooling Subsystems are twice as effective (Total 8x base output).',
    cost: 420000,
    multiplier: 2,
    icon: Atom,
    color: '#4f46e5',
    reqType: 'count',
    reqHardwareId: 'cryo-cooling',
    reqAmount: 25,
    lore: 'Radiative infrared emission through metamaterial thermal photonic crystals.',
  },

  // Tier 6: Quantum Wafer Stepper
  {
    id: 'sub-quantum-1',
    name: 'Coherent Spin Polarizer',
    category: 'hardware',
    targetId: 'neural-synthesizer',
    targetName: 'Quantum Wafer Stepper',
    description: 'Quantum Wafer Steppers are twice as effective (2x output).',
    cost: 48000,
    multiplier: 2,
    icon: Radio,
    color: '#f43f5e',
    reqType: 'count',
    reqHardwareId: 'neural-synthesizer',
    reqAmount: 1,
    lore: 'Magnetic quantum well arrays locking electron spin vectors into synchronized states.',
  },
  {
    id: 'sub-quantum-2',
    name: 'Josephson Junction Array',
    category: 'hardware',
    targetId: 'neural-synthesizer',
    targetName: 'Quantum Wafer Stepper',
    description: 'Quantum Wafer Steppers are twice as effective (Total 4x base output).',
    cost: 280000,
    multiplier: 2,
    icon: CircuitBoard,
    color: '#e11d48',
    reqType: 'count',
    reqHardwareId: 'neural-synthesizer',
    reqAmount: 10,
    lore: 'Superconducting quantum interference channels clocking operations in picoseconds.',
  },
  {
    id: 'sub-quantum-3',
    name: 'Zero-Point Lattice Stabilizer',
    category: 'hardware',
    targetId: 'neural-synthesizer',
    targetName: 'Quantum Wafer Stepper',
    description: 'Quantum Wafer Steppers are twice as effective (Total 8x base output).',
    cost: 1400000,
    multiplier: 2,
    icon: Atom,
    color: '#be123c',
    reqType: 'count',
    reqHardwareId: 'neural-synthesizer',
    reqAmount: 25,
    lore: 'Suppresses quantum decoherence and quantum vacuum fluctuations across the silicon die.',
  },

  // Tier 7: Synaptic Core Forge
  {
    id: 'sub-syn-1',
    name: 'Memristor Crossbar Arrays',
    category: 'hardware',
    targetId: 'synaptic-forge',
    targetName: 'Synaptic Core Forge',
    description: 'Synaptic Core Forges are twice as effective (2x output).',
    cost: 190000,
    multiplier: 2,
    icon: Network,
    color: '#a855f7',
    reqType: 'count',
    reqHardwareId: 'synaptic-forge',
    reqAmount: 1,
    lore: 'Analog resistance states store neuromorphic weights directly inside non-volatile crossbar junctions.',
  },
  {
    id: 'sub-syn-2',
    name: 'Spike-Timing Plasticity Core',
    category: 'hardware',
    targetId: 'synaptic-forge',
    targetName: 'Synaptic Core Forge',
    description: 'Synaptic Core Forges are twice as effective (Total 4x base output).',
    cost: 1100000,
    multiplier: 2,
    icon: CircuitBoard,
    color: '#9333ea',
    reqType: 'count',
    reqHardwareId: 'synaptic-forge',
    reqAmount: 10,
    lore: 'Bio-mimetic microsecond pulse timing dynamically optimizes neural routing pathways in silicon.',
  },
  {
    id: 'sub-syn-3',
    name: 'Axonal Photonic Waveguide',
    category: 'hardware',
    targetId: 'synaptic-forge',
    targetName: 'Synaptic Core Forge',
    description: 'Synaptic Core Forges are twice as effective (Total 8x base output).',
    cost: 5800000,
    multiplier: 2,
    icon: Sparkles,
    color: '#7e22ce',
    reqType: 'count',
    reqHardwareId: 'synaptic-forge',
    reqAmount: 25,
    lore: 'Sub-micron laser waveguides connecting neuromorphic clusters at the speed of light.',
  },

  // Tier 8: Orbital Zero-G Cleanroom
  {
    id: 'sub-orb-1',
    name: 'Vacuum Epitaxy Crucible',
    category: 'hardware',
    targetId: 'orbital-cleanroom',
    targetName: 'Orbital Zero-G Cleanroom',
    description: 'Orbital Zero-G Cleanrooms are twice as effective (2x output).',
    cost: 820000,
    multiplier: 2,
    icon: Orbit,
    color: '#06b6d4',
    reqType: 'count',
    reqHardwareId: 'orbital-cleanroom',
    reqAmount: 1,
    lore: 'Hard space vacuum eliminates 100% of atmospheric particulate contamination across atomic wafer depositions.',
  },
  {
    id: 'sub-orb-2',
    name: 'Magnetospheric Radiation Shunt',
    category: 'hardware',
    targetId: 'orbital-cleanroom',
    targetName: 'Orbital Zero-G Cleanroom',
    description: 'Orbital Zero-G Cleanrooms are twice as effective (Total 4x base output).',
    cost: 4600000,
    multiplier: 2,
    icon: Gauge,
    color: '#0891b2',
    reqType: 'count',
    reqHardwareId: 'orbital-cleanroom',
    reqAmount: 10,
    lore: 'Superconducting magnetic deflection shield deflecting cosmic rays away from active crystal growth vats.',
  },
  {
    id: 'sub-orb-3',
    name: 'Spherical Monocrystal Ingot',
    category: 'hardware',
    targetId: 'orbital-cleanroom',
    targetName: 'Orbital Zero-G Cleanroom',
    description: 'Orbital Zero-G Cleanrooms are twice as effective (Total 8x base output).',
    cost: 24000000,
    multiplier: 2,
    icon: Award,
    color: '#0e7490',
    reqType: 'count',
    reqHardwareId: 'orbital-cleanroom',
    reqAmount: 25,
    lore: 'Microgravity surface tension enables flawless spherical silicon ingots with zero lattice dislocation.',
  },

  // Tier 9: Dark-Silicon Subharmonic Engine
  {
    id: 'sub-dark-1',
    name: 'Sub-Threshold Tunnel Diodes',
    category: 'hardware',
    targetId: 'dark-silicon-engine',
    targetName: 'Dark-Silicon Subharmonic Engine',
    description: 'Dark-Silicon Subharmonic Engines are twice as effective (2x output).',
    cost: 3900000,
    multiplier: 2,
    icon: Infinity,
    color: '#f59e0b',
    reqType: 'count',
    reqHardwareId: 'dark-silicon-engine',
    reqAmount: 1,
    lore: 'Operates quantum transistor gates under 200mV, circumventing the thermal Boltzmann tyranny barrier.',
  },
  {
    id: 'sub-dark-2',
    name: 'Clockless Asynchronous Grid',
    category: 'hardware',
    targetId: 'dark-silicon-engine',
    targetName: 'Dark-Silicon Subharmonic Engine',
    description: 'Dark-Silicon Subharmonic Engines are twice as effective (Total 4x base output).',
    cost: 22000000,
    multiplier: 2,
    icon: CircuitBoard,
    color: '#d97706',
    reqType: 'count',
    reqHardwareId: 'dark-silicon-engine',
    reqAmount: 10,
    lore: 'Eradicates global clock power dissipation by firing computation solely on the arrival of logic wave packets.',
  },
  {
    id: 'sub-dark-3',
    name: 'Phonon Heat-to-Current Recycler',
    category: 'hardware',
    targetId: 'dark-silicon-engine',
    targetName: 'Dark-Silicon Subharmonic Engine',
    description: 'Dark-Silicon Subharmonic Engines are twice as effective (Total 8x base output).',
    cost: 110000000,
    multiplier: 2,
    icon: Flame,
    color: '#b45309',
    reqType: 'count',
    reqHardwareId: 'dark-silicon-engine',
    reqAmount: 25,
    lore: 'Acoustic metamaterial captures thermal waste phonons and transduces them directly into computational amperage.',
  },

  // Tier 10: Dyson Computronium Matrix
  {
    id: 'sub-dyson-1',
    name: 'Stellar Photonic Concentrators',
    category: 'hardware',
    targetId: 'computronium-matrix',
    targetName: 'Dyson Computronium Matrix',
    description: 'Dyson Computronium Matrices are twice as effective (2x output).',
    cost: 4000000000,
    multiplier: 2,
    icon: Sun,
    color: '#ec4899',
    reqType: 'count',
    reqHardwareId: 'computronium-matrix',
    reqAmount: 1,
    lore: 'Heliospheric mirror swarms funnel petawatts of raw solar radiation into ultra-dense optical computing matrices.',
  },
  {
    id: 'sub-dyson-2',
    name: 'Relativistic Optical Bus',
    category: 'hardware',
    targetId: 'computronium-matrix',
    targetName: 'Dyson Computronium Matrix',
    description: 'Dyson Computronium Matrices are twice as effective (Total 4x base output).',
    cost: 20000000000,
    multiplier: 2,
    icon: Zap,
    color: '#db2777',
    reqType: 'count',
    reqHardwareId: 'computronium-matrix',
    reqAmount: 10,
    lore: 'Coherent orbital laser interconnects coordinate multi-million-kilometer matrix nodes without latency skew.',
  },
  {
    id: 'sub-dyson-3',
    name: 'Matrioshka Entropy Engine',
    category: 'hardware',
    targetId: 'computronium-matrix',
    targetName: 'Dyson Computronium Matrix',
    description: 'Dyson Computronium Matrices are twice as effective (Total 8x base output).',
    cost: 100000000000,
    multiplier: 2,
    icon: Atom,
    color: '#be185d',
    reqType: 'count',
    reqHardwareId: 'computronium-matrix',
    reqAmount: 25,
    lore: 'Cascading nested megastructure shells recycling waste infrared radiation until the fundamental Landauer limit is reached.',
  },

  // Tier 11: Tachyon Chrono-Fabricator
  {
    id: 'sub-tachyon-1',
    name: 'Chrono-Wave Modulator',
    category: 'hardware',
    targetId: 'tachyon-fabricator',
    targetName: 'Tachyon Chrono-Fabricator',
    description: 'Tachyon Chrono-Fabricators are twice as effective (2x output).',
    cost: 100000000000, // 100B
    multiplier: 2,
    icon: Clock,
    color: '#00f2fe',
    reqType: 'count',
    reqHardwareId: 'tachyon-fabricator',
    reqAmount: 1,
    lore: 'Synchronizes backward-propagating temporal waves to pre-calculate silicon state vectors before instruction dispatch.',
  },
  {
    id: 'sub-tachyon-2',
    name: 'Retrocausal Logic Gates',
    category: 'hardware',
    targetId: 'tachyon-fabricator',
    targetName: 'Tachyon Chrono-Fabricator',
    description: 'Tachyon Chrono-Fabricators are twice as effective (Total 4x base output).',
    cost: 600000000000, // 600B
    multiplier: 2,
    icon: Zap,
    color: '#38bdf8',
    reqType: 'count',
    reqHardwareId: 'tachyon-fabricator',
    reqAmount: 10,
    lore: 'Constructs closed timelike curve logic circuits that resolve complex Boolean computations instantaneously.',
  },
  {
    id: 'sub-tachyon-3',
    name: 'Tachyon Condensate Buffer',
    category: 'hardware',
    targetId: 'tachyon-fabricator',
    targetName: 'Tachyon Chrono-Fabricator',
    description: 'Tachyon Chrono-Fabricators are twice as effective (Total 8x base output).',
    cost: 3500000000000, // 3.5T
    multiplier: 2,
    icon: Sparkles,
    color: '#0284c7',
    reqType: 'count',
    reqHardwareId: 'tachyon-fabricator',
    reqAmount: 25,
    lore: 'Supercooled faster-than-light particle condensate acting as a zero-entropy temporal cache memory matrix.',
  },

  // Tier 12: Planetary Matrioshka Brain
  {
    id: 'sub-matrioshka-1',
    name: 'Planetary Core Thermocouples',
    category: 'hardware',
    targetId: 'matrioshka-brain',
    targetName: 'Planetary Matrioshka Brain',
    description: 'Planetary Matrioshka Brains are twice as effective (2x output).',
    cost: 3000000000000, // 3T
    multiplier: 2,
    icon: Globe,
    color: '#10b981',
    reqType: 'count',
    reqHardwareId: 'matrioshka-brain',
    reqAmount: 1,
    lore: 'Taps molten mantle geothermal convection currents to power planet-sized computronium logic slabs.',
  },
  {
    id: 'sub-matrioshka-2',
    name: 'Crustal Superconductor Mesh',
    category: 'hardware',
    targetId: 'matrioshka-brain',
    targetName: 'Planetary Matrioshka Brain',
    description: 'Planetary Matrioshka Brains are twice as effective (Total 4x base output).',
    cost: 18000000000000, // 18T
    multiplier: 2,
    icon: Network,
    color: '#059669',
    reqType: 'count',
    reqHardwareId: 'matrioshka-brain',
    reqAmount: 10,
    lore: 'Encases the entire planetary lithosphere in room-temperature superconducting graphene neural highways.',
  },
  {
    id: 'sub-matrioshka-3',
    name: 'Biosphere Computronium Layer',
    category: 'hardware',
    targetId: 'matrioshka-brain',
    targetName: 'Planetary Matrioshka Brain',
    description: 'Planetary Matrioshka Brains are twice as effective (Total 8x base output).',
    cost: 100000000000000, // 100T
    multiplier: 2,
    icon: Atom,
    color: '#047857',
    reqType: 'count',
    reqHardwareId: 'matrioshka-brain',
    reqAmount: 25,
    lore: 'Transmutes every planetary ocean and mountain into self-organizing molecular computronium substrate.',
  },

  // Tier 13: Sub-Atomic String Loom
  {
    id: 'sub-string-1',
    name: 'Planck-Scale Harmonic Spindles',
    category: 'hardware',
    targetId: 'string-loom',
    targetName: 'Sub-Atomic String Loom',
    description: 'Sub-Atomic String Looms are twice as effective (2x output).',
    cost: 120000000000000, // 120T
    multiplier: 2,
    icon: Activity,
    color: '#8b5cf6',
    reqType: 'count',
    reqHardwareId: 'string-loom',
    reqAmount: 1,
    lore: 'Oscillates fundamental 1D energy filaments at 10^35 Hz to weave logic states at the Planck barrier.',
  },
  {
    id: 'sub-string-2',
    name: 'Calabi-Yau Manifold Weave',
    category: 'hardware',
    targetId: 'string-loom',
    targetName: 'Sub-Atomic String Loom',
    description: 'Sub-Atomic String Looms are twice as effective (Total 4x base output).',
    cost: 700000000000000, // 700T
    multiplier: 2,
    icon: Layers,
    color: '#7c3aed',
    reqType: 'count',
    reqHardwareId: 'string-loom',
    reqAmount: 10,
    lore: 'Compacts 6 extra spatial dimensions into topological manifolds storing infinite computational states.',
  },
  {
    id: 'sub-string-3',
    name: 'Superstring Resonant Braiding',
    category: 'hardware',
    targetId: 'string-loom',
    targetName: 'Sub-Atomic String Loom',
    description: 'Sub-Atomic String Looms are twice as effective (Total 8x base output).',
    cost: 4000000000000000, // 4Q
    multiplier: 2,
    icon: Sparkles,
    color: '#6d28d9',
    reqType: 'count',
    reqHardwareId: 'string-loom',
    reqAmount: 25,
    lore: 'Non-Abelian anyonic string braiding executes fault-tolerant topological quantum calculations without decoherence.',
  },

  // Tier 14: Galactic Core Harvester
  {
    id: 'sub-galactic-1',
    name: 'Supermassive Event Horizon Tap',
    category: 'hardware',
    targetId: 'galactic-harvester',
    targetName: 'Galactic Core Harvester',
    description: 'Galactic Core Harvesters are twice as effective (2x output).',
    cost: 5000000000000000, // 5Q
    multiplier: 2,
    icon: RadioTower,
    color: '#f59e0b',
    reqType: 'count',
    reqHardwareId: 'galactic-harvester',
    reqAmount: 1,
    lore: 'Penrose process harvesting extracts yottawatts of rotational kinetic energy directly from the ergosphere.',
  },
  {
    id: 'sub-galactic-2',
    name: 'Relativistic Jet Siphon',
    category: 'hardware',
    targetId: 'galactic-harvester',
    targetName: 'Galactic Core Harvester',
    description: 'Galactic Core Harvesters are twice as effective (Total 4x base output).',
    cost: 30000000000000000, // 30Q
    multiplier: 2,
    icon: Zap,
    color: '#d97706',
    reqType: 'count',
    reqHardwareId: 'galactic-harvester',
    reqAmount: 10,
    lore: 'Collimated synchrotron beam waveguides focus polar plasma jets directly into mega-scale silicon logic arrays.',
  },
  {
    id: 'sub-galactic-3',
    name: 'Hawking Radiation Logic Array',
    category: 'hardware',
    targetId: 'galactic-harvester',
    targetName: 'Galactic Core Harvester',
    description: 'Galactic Core Harvesters are twice as effective (Total 8x base output).',
    cost: 180000000000000000, // 180Q
    multiplier: 2,
    icon: Atom,
    color: '#b45309',
    reqType: 'count',
    reqHardwareId: 'galactic-harvester',
    reqAmount: 25,
    lore: 'Captures quantum information emitted via black hole evaporation to calculate universal constants with zero loss.',
  },

  // Tier 15: Multiverse Silicon Engine
  {
    id: 'sub-multiverse-1',
    name: 'Dimensional Membrane Gateway',
    category: 'hardware',
    targetId: 'multiverse-engine',
    targetName: 'Multiverse Silicon Engine',
    description: 'Multiverse Silicon Engines are twice as effective (2x output).',
    cost: 350000000000000000, // 350Q
    multiplier: 2,
    icon: Sparkles,
    color: '#f43f5e',
    reqType: 'count',
    reqHardwareId: 'multiverse-engine',
    reqAmount: 1,
    lore: 'Punctures 11-dimensional Brane cosmology boundaries to stream compute cycles from alternate realities.',
  },
  {
    id: 'sub-multiverse-2',
    name: 'Parallel Timeline Compute Matrix',
    category: 'hardware',
    targetId: 'multiverse-engine',
    targetName: 'Multiverse Silicon Engine',
    description: 'Multiverse Silicon Engines are twice as effective (Total 4x base output).',
    cost: 2200000000000000000, // 2.2 Qi (2.2e18)
    multiplier: 2,
    icon: Orbit,
    color: '#e11d48',
    reqType: 'count',
    reqHardwareId: 'multiverse-engine',
    reqAmount: 10,
    lore: 'Harnesses Everett Many-Worlds branching to calculate every branch path concurrently across parallel spacetime.',
  },
  {
    id: 'sub-multiverse-3',
    name: 'Omniversal Coherence Anchor',
    category: 'hardware',
    targetId: 'multiverse-engine',
    targetName: 'Multiverse Silicon Engine',
    description: 'Multiverse Silicon Engines are twice as effective (Total 8x base output).',
    cost: 15000000000000000000, // 15 Qi (1.5e19)
    multiplier: 2,
    icon: Infinity,
    color: '#be123c',
    reqType: 'count',
    reqHardwareId: 'multiverse-engine',
    reqAmount: 25,
    lore: 'Locks all infinite multiverse realities into monolithic synchronous consensus, turning existence into one eternal chip.',
  },
];

// Achievements & Milestones Definitions
export interface AchievementDef {
  id: string;
  title: string;
  category: 'clicks' | 'ops' | 'rebirth' | 'glitch' | 'hardware';
  description: string;
  icon: React.ElementType;
  color: string;
  targetCount: number;
  getCurrentProgress: (stats: {
    clickCount: number;
    lifetimeOps: number;
    rebirthCount: number;
    glitchesCaught: number;
    upgradeCounts: Record<string, number>;
    quantumFluxLevel: number;
    purchasedSubUpgrades?: string[];
    qWafers?: number;
    quantumPerks?: string[];
  }) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Clicks
  {
    id: 'ach-tap-1',
    title: 'First Silicon Trace',
    category: 'clicks',
    description: 'Manually synthesize 1 Silicon Op.',
    icon: Crosshair,
    color: '#38bdf8',
    targetCount: 1,
    getCurrentProgress: (s) => s.clickCount,
  },
  {
    id: 'ach-tap-100',
    title: 'Circuit Assembler',
    category: 'clicks',
    description: 'Manually fabricate 100 times.',
    icon: Crosshair,
    color: '#00f2fe',
    targetCount: 100,
    getCurrentProgress: (s) => s.clickCount,
  },
  {
    id: 'ach-tap-1000',
    title: 'Silicon Artisan',
    category: 'clicks',
    description: 'Reach 1,000 manual fabrication taps.',
    icon: Zap,
    color: '#a855f7',
    targetCount: 1000,
    getCurrentProgress: (s) => s.clickCount,
  },
  {
    id: 'ach-tap-5000',
    title: 'Clock Generator',
    category: 'clicks',
    description: 'Reach 5,000 manual fabrication taps.',
    icon: Gauge,
    color: '#ec4899',
    targetCount: 5000,
    getCurrentProgress: (s) => s.clickCount,
  },
  {
    id: 'ach-tap-25000',
    title: 'Sub-Atomic Tapper',
    category: 'clicks',
    description: 'Reach 25,000 manual fabrication taps.',
    icon: Sparkles,
    color: '#fbbf24',
    targetCount: 25000,
    getCurrentProgress: (s) => s.clickCount,
  },

  // Lifetime Ops
  {
    id: 'ach-ops-10k',
    title: 'Kilobyte Epoch',
    category: 'ops',
    description: 'Accumulate 10,000 Lifetime Ops.',
    icon: CircuitBoard,
    color: '#38bdf8',
    targetCount: 10000,
    getCurrentProgress: (s) => s.lifetimeOps,
  },
  {
    id: 'ach-ops-1m',
    title: 'Megabyte Surge',
    category: 'ops',
    description: 'Accumulate 1,000,000 Lifetime Ops.',
    icon: Zap,
    color: '#00ff87',
    targetCount: 1000000,
    getCurrentProgress: (s) => s.lifetimeOps,
  },
  {
    id: 'ach-ops-1b',
    title: 'Gigabyte Mainframe',
    category: 'ops',
    description: 'Accumulate 1 Billion Lifetime Ops.',
    icon: Sun,
    color: '#fbbf24',
    targetCount: 1000000000,
    getCurrentProgress: (s) => s.lifetimeOps,
  },
  {
    id: 'ach-ops-1t',
    title: 'Terabyte Supercluster',
    category: 'ops',
    description: 'Accumulate 1 Trillion Lifetime Ops.',
    icon: Orbit,
    color: '#a855f7',
    targetCount: 1000000000000,
    getCurrentProgress: (s) => s.lifetimeOps,
  },
  {
    id: 'ach-ops-1q',
    title: 'Petabyte Singularity',
    category: 'ops',
    description: 'Accumulate 1 Quadrillion Lifetime Ops.',
    icon: Infinity,
    color: '#ec4899',
    targetCount: 1000000000000000,
    getCurrentProgress: (s) => s.lifetimeOps,
  },
  {
    id: 'ach-ops-100q',
    title: 'Exabyte Omniverse',
    category: 'ops',
    description: 'Accumulate 100 Quadrillion Lifetime Ops.',
    icon: Star,
    color: '#f43f5e',
    targetCount: 100000000000000000,
    getCurrentProgress: (s) => s.lifetimeOps,
  },

  // Quantum Rebirth
  {
    id: 'ach-rebirth-1',
    title: 'Quantum Awakening',
    category: 'rebirth',
    description: 'Complete your first Quantum Rebirth.',
    icon: Atom,
    color: '#00f2fe',
    targetCount: 1,
    getCurrentProgress: (s) => s.rebirthCount,
  },
  {
    id: 'ach-rebirth-3',
    title: 'Spacetime Architect',
    category: 'rebirth',
    description: 'Complete 3 Quantum Rebirths.',
    icon: RefreshCw,
    color: '#a855f7',
    targetCount: 3,
    getCurrentProgress: (s) => s.rebirthCount,
  },
  {
    id: 'ach-rebirth-10',
    title: 'Multiversal Weaver',
    category: 'rebirth',
    description: 'Complete 10 Quantum Rebirths.',
    icon: Orbit,
    color: '#ec4899',
    targetCount: 10,
    getCurrentProgress: (s) => s.rebirthCount,
  },
  {
    id: 'ach-rebirth-25',
    title: 'Transcendent Observer',
    category: 'rebirth',
    description: 'Complete 25 Quantum Rebirths.',
    icon: Infinity,
    color: '#fbbf24',
    targetCount: 25,
    getCurrentProgress: (s) => s.rebirthCount,
  },

  // Glitches
  {
    id: 'ach-glitch-1',
    title: 'Quantum Anomaly',
    category: 'glitch',
    description: 'Intercept 1 floating Quantum Glitch.',
    icon: Sparkles,
    color: '#fbbf24',
    targetCount: 1,
    getCurrentProgress: (s) => s.glitchesCaught,
  },
  {
    id: 'ach-glitch-5',
    title: 'Glitch Hunter',
    category: 'glitch',
    description: 'Intercept 5 floating Quantum Glitches.',
    icon: Sparkle,
    color: '#00f2fe',
    targetCount: 5,
    getCurrentProgress: (s) => s.glitchesCaught,
  },
  {
    id: 'ach-glitch-15',
    title: 'Warp Master',
    category: 'glitch',
    description: 'Intercept 15 floating Quantum Glitches.',
    icon: Zap,
    color: '#ec4899',
    targetCount: 15,
    getCurrentProgress: (s) => s.glitchesCaught,
  },
  {
    id: 'ach-glitch-50',
    title: 'Nexus Harvester',
    category: 'glitch',
    description: 'Intercept 50 floating Quantum Glitches.',
    icon: Star,
    color: '#a855f7',
    targetCount: 50,
    getCurrentProgress: (s) => s.glitchesCaught,
  },

  // Hardware Milestones & Sinks
  {
    id: 'ach-hw-cleanroom',
    title: 'Zero-G Pioneer',
    category: 'hardware',
    description: 'Construct 1 Orbital Zero-G Cleanroom.',
    icon: Orbit,
    color: '#06b6d4',
    targetCount: 1,
    getCurrentProgress: (s) => s.upgradeCounts['orbital-cleanroom'] || 0,
  },
  {
    id: 'ach-hw-dyson',
    title: 'Dyson Architect',
    category: 'hardware',
    description: 'Construct 1 Dyson Computronium Matrix.',
    icon: Sun,
    color: '#ec4899',
    targetCount: 1,
    getCurrentProgress: (s) => s.upgradeCounts['computronium-matrix'] || 0,
  },
  {
    id: 'ach-hw-tachyon',
    title: 'Chrono Master',
    category: 'hardware',
    description: 'Deploy 1 Tachyon Chrono-Fabricator.',
    icon: Clock,
    color: '#00f2fe',
    targetCount: 1,
    getCurrentProgress: (s) => s.upgradeCounts['tachyon-fabricator'] || 0,
  },
  {
    id: 'ach-hw-matrioshka',
    title: 'World Brain',
    category: 'hardware',
    description: 'Deploy 1 Planetary Matrioshka Brain.',
    icon: Globe,
    color: '#10b981',
    targetCount: 1,
    getCurrentProgress: (s) => s.upgradeCounts['matrioshka-brain'] || 0,
  },
  {
    id: 'ach-hw-multiverse',
    title: 'Infinite Realities',
    category: 'hardware',
    description: 'Deploy 1 Multiverse Silicon Engine.',
    icon: Sparkles,
    color: '#f43f5e',
    targetCount: 1,
    getCurrentProgress: (s) => s.upgradeCounts['multiverse-engine'] || 0,
  },
  {
    id: 'ach-flux-5',
    title: 'Flux Resonator Master',
    category: 'hardware',
    description: 'Reach Level 5 in the Quantum Flux Resonator sink.',
    icon: Infinity,
    color: '#a855f7',
    targetCount: 5,
    getCurrentProgress: (s) => s.quantumFluxLevel,
  },
];

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  text: string;
  isCrit?: boolean;
}

// Synchronously retrieve saved audio preferences to prevent audio blasting on first gesture
const getInitialAudioConfig = () => {
  try {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        musicVolume: typeof parsed.musicVolume === 'number' ? parsed.musicVolume : 0.5,
        isMusicMuted: typeof parsed.isMusicMuted === 'boolean' ? parsed.isMusicMuted : false,
        sfxVolume: typeof parsed.sfxVolume === 'number' ? parsed.sfxVolume : 0.8,
        isSfxMuted: typeof parsed.isSfxMuted === 'boolean' ? parsed.isSfxMuted : false,
      };
    }
  } catch {}
  return { musicVolume: 0.5, isMusicMuted: false, sfxVolume: 0.8, isSfxMuted: false };
};

const initialAudio = getInitialAudioConfig();
audioEngine.setMusicVolume(initialAudio.musicVolume);
audioEngine.setMusicMuted(initialAudio.isMusicMuted);
audioEngine.setSfxVolume(initialAudio.sfxVolume);
audioEngine.setSfxMuted(initialAudio.isSfxMuted);

export default function App() {
  // Game State
  const [totalOps, setTotalOps] = useState<number>(0);
  const [lifetimeOps, setLifetimeOps] = useState<number>(0);
  const [opsPerSecond, setOpsPerSecond] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [upgradeCounts, setUpgradeCounts] = useState<Record<string, number>>({});
  const [purchasedSubUpgrades, setPurchasedSubUpgrades] = useState<string[]>([]);
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const [musicVolume, setMusicVolume] = useState<number>(initialAudio.musicVolume);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(initialAudio.isMusicMuted);
  const [sfxVolume, setSfxVolume] = useState<number>(initialAudio.sfxVolume);
  const [isSfxMuted, setIsSfxMuted] = useState<boolean>(initialAudio.isSfxMuted);
  const [showRestartConfirm, setShowRestartConfirm] = useState<boolean>(false);
  const [isOverclocking, setIsOverclocking] = useState<boolean>(false);
  const [recentPurchased, setRecentPurchased] = useState<string | null>(null);
  const [recentSubPurchased, setRecentSubPurchased] = useState<string | null>(null);
  const [showInstalledModal, setShowInstalledModal] = useState<boolean>(false);
  const [hoveredSub, setHoveredSub] = useState<{ sub: SubUpgradeItem; rect: DOMRect } | null>(null);
  const [hoveredUpgrade, setHoveredUpgrade] = useState<{ item: UpgradeItem; rect: DOMRect; idx: number } | null>(null);
  const [buyMultiplier, setBuyMultiplier] = useState<BuyMultiplier>(1);

  // Quantum Foundry Prestige State & Sink
  const [qWafers, setQWafers] = useState<number>(0);
  const [totalQWafersClaimed, setTotalQWafersClaimed] = useState<number>(0);
  const [rebirthCount, setRebirthCount] = useState<number>(0);
  const [quantumPerks, setQuantumPerks] = useState<Record<string, number>>({});
  const [quantumFluxLevel, setQuantumFluxLevel] = useState<number>(0);
  const [showQuantumModal, setShowQuantumModal] = useState<boolean>(false);
  const [quantumModalTab, setQuantumModalTab] = useState<'rebirth' | 'perks' | 'sink'>('rebirth');
  const [showRebirthConfirmModal, setShowRebirthConfirmModal] = useState<boolean>(false);
  const [isRebirthing, setIsRebirthing] = useState<boolean>(false);
  const [offlineReport, setOfflineReport] = useState<{ show: boolean; ops: number; timeSec: number } | null>(null);

  // Overheat & Thermal System State
  const [heatLevel, setHeatLevel] = useState<number>(0);
  const [isOverheated, setIsOverheated] = useState<boolean>(false);
  const [overheatCooldownRemaining, setOverheatCooldownRemaining] = useState<number>(0);

  // Random Golden Glitch System State
  const [activeGlitch, setActiveGlitch] = useState<{ id: number; x: number; y: number; vx: number; vy: number; remainingTime: number } | null>(null);
  const [frenzyRemaining, setFrenzyRemaining] = useState<number>(0);
  const [glitchesCaught, setGlitchesCaught] = useState<number>(0);
  const [glitchToast, setGlitchToast] = useState<{ title: string; desc: string; type: 'frenzy' | 'ops' } | null>(null);

  // Achievements State
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [achievementCategory, setAchievementCategory] = useState<'all' | 'clicks' | 'ops' | 'rebirth' | 'glitch' | 'hardware'>('all');
  const [achievementToast, setAchievementToast] = useState<{ id: string; title: string; description: string } | null>(null);

  // Statistics & Ledger State
  const [runStartTime, setRunStartTime] = useState<number>(() => Date.now());
  const [firstPlayTime, setFirstPlayTime] = useState<number>(() => Date.now());
  const [lifetimeManualOps, setLifetimeManualOps] = useState<number>(0);
  const [lifetimePassiveOps, setLifetimePassiveOps] = useState<number>(0);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  // References for timing and Web Audio
  const totalOpsRef = useRef<number>(0);
  const lifetimeOpsRef = useRef<number>(0);
  const opsPerSecondRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number>(performance.now());
  const chipRef = useRef<HTMLButtonElement | null>(null);
  const saveGameRef = useRef<() => void>(() => {});
  const isHoldingRef = useRef<boolean>(false);
  const autofireTimerRef = useRef<number | null>(null);
  const lastPointerCoordsRef = useRef<{ clientX: number; clientY: number } | null>(null);

  // Statistics references
  const runStartTimeRef = useRef<number>(Date.now());
  const firstPlayTimeRef = useRef<number>(Date.now());
  const lifetimeManualOpsRef = useRef<number>(0);
  const lifetimePassiveOpsRef = useRef<number>(0);

  // Heat & Overheat references
  const heatLevelRef = useRef<number>(0);
  const isOverheatedRef = useRef<boolean>(false);
  const overheatCooldownRef = useRef<number>(0);
  const quantumPerksRef = useRef<Record<string, number>>({});

  // Glitch & Frenzy refs for high-frequency loop synchronization
  const glitchSpawnTimerRef = useRef<number>(performance.now() + (90 + Math.random() * 90) * 1000);
  const activeGlitchRef = useRef<{ id: number; x: number; y: number; vx: number; vy: number; remainingTime: number } | null>(null);
  const frenzyRemainingRef = useRef<number>(0);
  const glitchesCaughtRef = useRef<number>(0);
  const quantumFluxLevelRef = useRef<number>(0);
  const unlockedAchievementsRef = useRef<string[]>([]);
  const checkAchievementsRef = useRef<() => void>(() => {});

  // Keep transient non-accumulating refs in sync with state
  opsPerSecondRef.current = opsPerSecond;
  isPausedRef.current = isPaused;
  frenzyRemainingRef.current = frenzyRemaining;
  glitchesCaughtRef.current = glitchesCaught;
  quantumFluxLevelRef.current = quantumFluxLevel;
  unlockedAchievementsRef.current = unlockedAchievements;
  quantumPerksRef.current = quantumPerks;
  heatLevelRef.current = heatLevel;
  isOverheatedRef.current = isOverheated;
  overheatCooldownRef.current = overheatCooldownRemaining;

  // Sound Synthesizer using Web Audio API AudioEngine
  const playCyberSound = useCallback((type: 'click' | 'crit' | 'upgrade' | 'research' | 'pause' | 'resume' | 'rebirth' | 'quantum' | 'glitch' | 'achievement') => {
    audioEngine.playSfx(type);
  }, []);

  const handleMusicVolumeChange = useCallback((vol: number) => {
    setMusicVolume(vol);
    audioEngine.setMusicVolume(vol);
    if (vol > 0 && isMusicMuted) {
      setIsMusicMuted(false);
      audioEngine.setMusicMuted(false);
    }
  }, [isMusicMuted]);

  const handleToggleMusicMute = useCallback(() => {
    setIsMusicMuted((prev) => {
      const next = !prev;
      audioEngine.setMusicMuted(next);
      return next;
    });
  }, []);

  const handleSfxVolumeChange = useCallback((vol: number) => {
    setSfxVolume(vol);
    audioEngine.setSfxVolume(vol);
    if (vol > 0 && isSfxMuted) {
      setIsSfxMuted(false);
      audioEngine.setSfxMuted(false);
    }
  }, [isSfxMuted]);

  const handleToggleSfxMute = useCallback(() => {
    setIsSfxMuted((prev) => {
      const next = !prev;
      audioEngine.setSfxMuted(next);
      if (!next) {
        audioEngine.playSfx('click');
      }
      return next;
    });
  }, []);

  // Multiplier Helper Functions
  const getHardwareMultiplier = useCallback((hardwareId: string, purchased: string[]) => {
    return SUB_UPGRADES
      .filter((sub) => sub.targetId === hardwareId && purchased.includes(sub.id))
      .reduce((acc, sub) => acc * sub.multiplier, 1);
  }, []);

  const getClickMultiplier = useCallback((purchased: string[]) => {
    return SUB_UPGRADES
      .filter((sub) => sub.targetId === 'click' && purchased.includes(sub.id))
      .reduce((acc, sub) => acc * sub.multiplier, 1);
  }, []);

  // Get Quantum Perk Level (0 if not owned)
  const getPerkLevel = useCallback((id: string, perksMap?: Record<string, number>) => {
    const map = perksMap !== undefined ? perksMap : quantumPerks;
    return map[id] || 0;
  }, [quantumPerks]);

  // Check if Quantum Perk is purchased (level > 0)
  const hasQuantumPerk = useCallback((id: string, perksMap?: Record<string, number>) => {
    return getPerkLevel(id, perksMap) > 0;
  }, [getPerkLevel]);

  // Per-Wafer percentage boost (+2% base, +3% to +5% with Quantum Catalyst)
  const getWaferMultiplierRate = useCallback((perksMap?: Record<string, number>) => {
    const catLvl = getPerkLevel('perk-catalyst', perksMap);
    return 0.02 + (catLvl * 0.01);
  }, [getPerkLevel]);

  // Global Quantum Wafer Multiplier
  const getQuantumWaferMultiplier = useCallback((wafersCount?: number, perksMap?: Record<string, number>) => {
    const w = wafersCount !== undefined ? wafersCount : qWafers;
    const rate = getWaferMultiplierRate(perksMap);
    return 1 + (w * rate);
  }, [qWafers, getWaferMultiplierRate]);

  // Infinite Quantum Flux Resonator Multiplier (+10% global boost per level)
  const getQuantumFluxMultiplier = useCallback((fluxLevel?: number) => {
    const lvl = fluxLevel !== undefined ? fluxLevel : quantumFluxLevel;
    return 1 + (lvl * 0.10);
  }, [quantumFluxLevel]);

  // Infinite Quantum Flux Resonator Cost (base 2 Q-Wafers * 1.5^level)
  const getQuantumFluxCost = useCallback((fluxLevel?: number) => {
    const lvl = fluxLevel !== undefined ? fluxLevel : quantumFluxLevel;
    return Math.max(1, Math.round(2 * Math.pow(1.5, lvl)));
  }, [quantumFluxLevel]);

  // Achievements Global Silicon Yield Bonus (+1% global yield per unlocked achievement)
  const getAchievementMultiplier = useCallback((achList?: string[]) => {
    const list = achList !== undefined ? achList : unlockedAchievements;
    return 1 + (list.length * 0.01);
  }, [unlockedAchievements]);

  // Calculate total Ops/second taking all active sub-upgrades, quantum perks, flux sink, and frenzy into account
  const calculateTotalOpsPerSecond = useCallback(
    (
      counts: Record<string, number>,
      purchased: string[],
      wafersCount?: number,
      perksMap?: Record<string, number>,
      fluxLevel?: number,
      achList?: string[],
      isFrenzyActive?: boolean
    ) => {
      const baseTotal = UPGRADES.reduce((total, item) => {
        const count = counts[item.id] || 0;
        const mult = getHardwareMultiplier(item.id, purchased);
        const milestoneMult = getHardwareMilestoneMultiplier(count);
        return total + (count * item.opsIncrease * mult * milestoneMult);
      }, 0);

      const cryoLevel = getPerkLevel('perk-cryo', perksMap);
      const cryoBonus = 1 + (cryoLevel * 0.25);
      const waferBonus = getQuantumWaferMultiplier(wafersCount, perksMap);
      const fluxBonus = getQuantumFluxMultiplier(fluxLevel);
      const achBonus = getAchievementMultiplier(achList);
      const frenzyBonus = (isFrenzyActive !== undefined ? isFrenzyActive : frenzyRemainingRef.current > 0) ? 7 : 1;

      return baseTotal * cryoBonus * waferBonus * fluxBonus * achBonus * frenzyBonus;
    },
    [getHardwareMultiplier, getPerkLevel, getQuantumWaferMultiplier, getQuantumFluxMultiplier, getAchievementMultiplier]
  );

  // Manual Click Power Calculation
  const getEffectiveClickPower = useCallback(
    (
      purchasedSubs?: string[],
      wafersCount?: number,
      perksMap?: Record<string, number>,
      fluxLevel?: number,
      achList?: string[],
      isFrenzyActive?: boolean
    ) => {
      const subMult = getClickMultiplier(purchasedSubs !== undefined ? purchasedSubs : purchasedSubUpgrades);
      const neuralLevel = getPerkLevel('perk-neural', perksMap);
      const neuralBonus = 1 + (neuralLevel * 0.5);
      const waferBonus = getQuantumWaferMultiplier(wafersCount, perksMap);
      const fluxBonus = getQuantumFluxMultiplier(fluxLevel);
      const achBonus = getAchievementMultiplier(achList);
      const frenzyBonus = (isFrenzyActive !== undefined ? isFrenzyActive : frenzyRemainingRef.current > 0) ? 7 : 1;

      const baseSubYield = 1 * subMult * neuralBonus * waferBonus * fluxBonus * achBonus * frenzyBonus;
      const clickYield = baseSubYield + (opsPerSecondRef.current * 0.01);
      return clickYield;
    },
    [getClickMultiplier, purchasedSubUpgrades, getPerkLevel, getQuantumWaferMultiplier, getQuantumFluxMultiplier, getAchievementMultiplier]
  );

  // Active Sustained Stream Autofire rate (Clicks Per Second)
  const getAutofireRate = useCallback((perksMap?: Record<string, number>) => {
    const level = getPerkLevel('perk-autofire', perksMap);
    if (level === 3) return 25;
    if (level === 2) return 12;
    if (level === 1) return 5;
    return 0;
  }, [getPerkLevel]);

  // Critical Hit Chance (Base 10%, scaling up to 40% with Precision Fabrication)
  const getCritChance = useCallback((perksMap?: Record<string, number>) => {
    const precisionLevel = getPerkLevel('perk-precision', perksMap);
    return 0.10 + (precisionLevel * 0.075);
  }, [getPerkLevel]);

  // Passive Heat Dissipation Rate in % per second (Base 20%, increased by Thermal Tolerance)
  const getHeatDissipationRate = useCallback((perksMap?: Record<string, number>) => {
    const thermalLevel = getPerkLevel('perk-thermal', perksMap);
    return 20 * (1 + thermalLevel * 0.5);
  }, [getPerkLevel]);

  // Check achievements engine
  const checkAchievements = useCallback(
    (
      currentGlitches?: number,
      currentClicks?: number,
      currentLifetime?: number,
      currentCounts?: Record<string, number>,
      currentRebirths?: number,
      currentFlux?: number
    ) => {
      const stateSnapshot = {
        clickCount: currentClicks !== undefined ? currentClicks : clickCount,
        lifetimeOps: currentLifetime !== undefined ? currentLifetime : lifetimeOpsRef.current,
        rebirthCount: currentRebirths !== undefined ? currentRebirths : rebirthCount,
        glitchesCaught: currentGlitches !== undefined ? currentGlitches : glitchesCaughtRef.current,
        upgradeCounts: currentCounts !== undefined ? currentCounts : upgradeCounts,
        quantumFluxLevel: currentFlux !== undefined ? currentFlux : quantumFluxLevelRef.current,
      };

      const currentUnlocked = unlockedAchievementsRef.current;
      const newlyUnlocked: string[] = [];

      for (const ach of ACHIEVEMENTS) {
        if (!currentUnlocked.includes(ach.id)) {
          const progress = ach.getCurrentProgress(stateSnapshot);
          if (progress >= ach.targetCount) {
            newlyUnlocked.push(ach.id);
          }
        }
      }

      if (newlyUnlocked.length > 0) {
        const nextList = [...currentUnlocked, ...newlyUnlocked];
        unlockedAchievementsRef.current = nextList;
        setUnlockedAchievements(nextList);

        const latestAch = ACHIEVEMENTS.find((a) => a.id === newlyUnlocked[newlyUnlocked.length - 1]);
        if (latestAch) {
          setAchievementToast({
            id: latestAch.id,
            title: latestAch.title,
            description: latestAch.description,
          });
          setTimeout(() => setAchievementToast(null), 4500);
        }

        playCyberSound('achievement');

        // Recalculate rate with new achievement bonus
        const newRate = calculateTotalOpsPerSecond(
          stateSnapshot.upgradeCounts,
          purchasedSubUpgrades,
          qWafers,
          quantumPerks,
          stateSnapshot.quantumFluxLevel,
          nextList
        );
        setOpsPerSecond(newRate);
        opsPerSecondRef.current = newRate;
      }
    },
    [clickCount, rebirthCount, upgradeCounts, purchasedSubUpgrades, qWafers, quantumPerks, playCyberSound, calculateTotalOpsPerSecond]
  );

  checkAchievementsRef.current = checkAchievements;

  // Save game to localStorage
  const saveGame = useCallback(() => {
    try {
      const stateToSave = {
        totalOps: totalOpsRef.current,
        lifetimeOps: lifetimeOpsRef.current,
        opsPerSecond: opsPerSecondRef.current,
        clickCount,
        upgradeCounts,
        purchasedSubUpgrades,
        buyMultiplier,
        musicVolume,
        isMusicMuted,
        sfxVolume,
        isSfxMuted,
        qWafers,
        totalQWafersClaimed,
        rebirthCount,
        quantumPerks,
        quantumFluxLevel,
        glitchesCaught,
        unlockedAchievements,
        runStartTime: runStartTimeRef.current,
        firstPlayTime: firstPlayTimeRef.current,
        lifetimeManualOps: lifetimeManualOpsRef.current,
        lifetimePassiveOps: lifetimePassiveOpsRef.current,
        lastActiveTimestamp: Date.now(),
      };
      localStorage.setItem('gameState', JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save game state to localStorage:', e);
    }
  }, [
    clickCount,
    upgradeCounts,
    purchasedSubUpgrades,
    buyMultiplier,
    musicVolume,
    isMusicMuted,
    sfxVolume,
    isSfxMuted,
    qWafers,
    totalQWafersClaimed,
    rebirthCount,
    quantumPerks,
    quantumFluxLevel,
    glitchesCaught,
    unlockedAchievements,
  ]);

  // Keep saveGame reference fresh
  saveGameRef.current = saveGame;

  // Load game from localStorage
  const loadGame = useCallback(() => {
    try {
      const saved = localStorage.getItem('gameState');
      if (saved) {
        const parsed = JSON.parse(saved);
        let loadedOps = typeof parsed.totalOps === 'number' ? parsed.totalOps : 0;
        let loadedLifetimeOps = typeof parsed.lifetimeOps === 'number' ? parsed.lifetimeOps : loadedOps;
        const loadedCounts = parsed.upgradeCounts || {};
        const loadedSubUpgrades = Array.isArray(parsed.purchasedSubUpgrades) ? parsed.purchasedSubUpgrades : [];
        const loadedQWafers = typeof parsed.qWafers === 'number' ? parsed.qWafers : 0;
        const loadedTotalClaimed = typeof parsed.totalQWafersClaimed === 'number' ? parsed.totalQWafersClaimed : 0;
        const loadedRebirthCount = typeof parsed.rebirthCount === 'number' ? parsed.rebirthCount : 0;
        
        let loadedQuantumPerks: Record<string, number> = {};
        if (parsed.quantumPerks) {
          if (Array.isArray(parsed.quantumPerks)) {
            parsed.quantumPerks.forEach((id: string) => {
              if (id === 'perk-autofire-1') loadedQuantumPerks['perk-autofire'] = Math.max(loadedQuantumPerks['perk-autofire'] || 0, 1);
              else if (id === 'perk-autofire-2') loadedQuantumPerks['perk-autofire'] = Math.max(loadedQuantumPerks['perk-autofire'] || 0, 2);
              else if (id === 'perk-autofire-3') loadedQuantumPerks['perk-autofire'] = Math.max(loadedQuantumPerks['perk-autofire'] || 0, 3);
              else loadedQuantumPerks[id] = 1;
            });
          } else if (typeof parsed.quantumPerks === 'object') {
            loadedQuantumPerks = parsed.quantumPerks;
          }
        }

        const loadedQuantumFluxLevel = typeof parsed.quantumFluxLevel === 'number' ? parsed.quantumFluxLevel : 0;
        const loadedGlitchesCaught = typeof parsed.glitchesCaught === 'number' ? parsed.glitchesCaught : 0;
        const loadedAchievements = Array.isArray(parsed.unlockedAchievements) ? parsed.unlockedAchievements : [];

        // Statistics telemetry
        const now = Date.now();
        const loadedRunStartTime = typeof parsed.runStartTime === 'number' ? parsed.runStartTime : now;
        const loadedFirstPlayTime = typeof parsed.firstPlayTime === 'number'
          ? parsed.firstPlayTime
          : (typeof parsed.lastActiveTimestamp === 'number' ? parsed.lastActiveTimestamp - 60000 : now);
        const loadedManualOps = typeof parsed.lifetimeManualOps === 'number' ? parsed.lifetimeManualOps : 0;
        let loadedPassiveOps = typeof parsed.lifetimePassiveOps === 'number' ? parsed.lifetimePassiveOps : Math.max(0, loadedLifetimeOps - loadedManualOps);

        // Recalculate true rate from counts + sub-upgrades + quantum bonuses + flux + achievements
        const recalculatedRate = calculateTotalOpsPerSecond(
          loadedCounts,
          loadedSubUpgrades,
          loadedQWafers,
          loadedQuantumPerks,
          loadedQuantumFluxLevel,
          loadedAchievements,
          false
        );

        // Offline Matrix Simulation (if perk unlocked)
        const offlineLevel = loadedQuantumPerks['perk-offline'] || 0;
        if (offlineLevel > 0 && typeof parsed.lastActiveTimestamp === 'number') {
          const elapsedSeconds = Math.min(24 * 3600, Math.max(0, (now - parsed.lastActiveTimestamp) / 1000));
          if (elapsedSeconds >= 10 && recalculatedRate > 0) {
            const efficiency = offlineLevel === 3 ? 1.0 : offlineLevel === 2 ? 0.75 : 0.5;
            const offlineYield = Math.floor(recalculatedRate * elapsedSeconds * efficiency);
            loadedOps += offlineYield;
            loadedLifetimeOps += offlineYield;
            loadedPassiveOps += offlineYield;
            setOfflineReport({ show: true, ops: offlineYield, timeSec: elapsedSeconds });
          }
        }

        setTotalOps(loadedOps);
        setLifetimeOps(loadedLifetimeOps);
        setOpsPerSecond(recalculatedRate);
        setQWafers(loadedQWafers);
        setTotalQWafersClaimed(loadedTotalClaimed);
        setRebirthCount(loadedRebirthCount);
        setQuantumPerks(loadedQuantumPerks);
        setQuantumFluxLevel(loadedQuantumFluxLevel);
        setGlitchesCaught(loadedGlitchesCaught);
        setUnlockedAchievements(loadedAchievements);
        setRunStartTime(loadedRunStartTime);
        setFirstPlayTime(loadedFirstPlayTime);
        setLifetimeManualOps(loadedManualOps);
        setLifetimePassiveOps(loadedPassiveOps);

        totalOpsRef.current = loadedOps;
        lifetimeOpsRef.current = loadedLifetimeOps;
        opsPerSecondRef.current = recalculatedRate;
        quantumFluxLevelRef.current = loadedQuantumFluxLevel;
        glitchesCaughtRef.current = loadedGlitchesCaught;
        unlockedAchievementsRef.current = loadedAchievements;
        quantumPerksRef.current = loadedQuantumPerks;
        runStartTimeRef.current = loadedRunStartTime;
        firstPlayTimeRef.current = loadedFirstPlayTime;
        lifetimeManualOpsRef.current = loadedManualOps;
        lifetimePassiveOpsRef.current = loadedPassiveOps;

        if (parsed.clickCount) setClickCount(parsed.clickCount);
        setUpgradeCounts(loadedCounts);
        setPurchasedSubUpgrades(loadedSubUpgrades);

        if (parsed.buyMultiplier === 1 || parsed.buyMultiplier === 5 || parsed.buyMultiplier === 10 || parsed.buyMultiplier === 'max') {
          setBuyMultiplier(parsed.buyMultiplier);
        }

        if (typeof parsed.musicVolume === 'number') {
          setMusicVolume(parsed.musicVolume);
          audioEngine.setMusicVolume(parsed.musicVolume);
        }
        if (typeof parsed.isMusicMuted === 'boolean') {
          setIsMusicMuted(parsed.isMusicMuted);
          audioEngine.setMusicMuted(parsed.isMusicMuted);
        }
        if (typeof parsed.sfxVolume === 'number') {
          setSfxVolume(parsed.sfxVolume);
          audioEngine.setSfxVolume(parsed.sfxVolume);
        }
        if (typeof parsed.isSfxMuted === 'boolean') {
          setIsSfxMuted(parsed.isSfxMuted);
          audioEngine.setSfxMuted(parsed.isSfxMuted);
        }
      }
    } catch (e) {
      console.warn('Failed to load game state:', e);
    }
    lastTimeRef.current = performance.now();
  }, [calculateTotalOpsPerSecond]);

  // Format numbers nicely with commas and metric abbreviations
  const formatOps = (num: number): string => {
    if (num >= 1_000_000_000_000_000) {
      return (num / 1_000_000_000_000_000).toFixed(2) + 'Q';
    }
    if (num >= 1_000_000_000_000) {
      return (num / 1_000_000_000_000).toFixed(2) + 'T';
    }
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2) + 'B';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M';
    }
    if (num >= 10_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return Math.floor(num).toLocaleString();
  };

  const formatRate = (rate: number): string => {
    if (rate >= 1_000_000_000_000) {
      return (rate / 1_000_000_000_000).toFixed(2) + 'T';
    }
    if (rate >= 1_000_000_000) {
      return (rate / 1_000_000_000).toFixed(2) + 'B';
    }
    if (rate >= 1_000_000) {
      return (rate / 1_000_000).toFixed(2) + 'M';
    }
    if (rate >= 10_000) {
      return (rate / 1_000).toFixed(1) + 'K';
    }
    return rate.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // Calculate current dynamic cost for a single upgrade item
  const getUpgradeCost = (item: UpgradeItem) => {
    const count = upgradeCounts[item.id] || 0;
    return Math.round(item.baseCost * Math.pow(1.15, count));
  };

  // Multi-tier upgrade information resolver
  const getMultiUpgradeInfo = useCallback(
    (item: UpgradeItem, multiplier: BuyMultiplier, currentOps: number) => {
      const count = upgradeCounts[item.id] || 0;
      if (multiplier === 'max') {
        const maxInfo = getUpgradeMaxAffordable(item.baseCost, count, currentOps);
        if (maxInfo.count === 0) {
          return {
            countToBuy: 1,
            actualBuyCount: 0,
            totalCost: maxInfo.cost,
            canAfford: false,
            isMax: true,
          };
        }
        return {
          countToBuy: maxInfo.count,
          actualBuyCount: maxInfo.count,
          totalCost: maxInfo.cost,
          canAfford: !isPausedRef.current,
          isMax: true,
        };
      } else {
        const cost = getUpgradeMultiCost(item.baseCost, count, multiplier);
        return {
          countToBuy: multiplier,
          actualBuyCount: multiplier,
          totalCost: cost,
          canAfford: !isPausedRef.current && currentOps >= cost,
          isMax: false,
        };
      }
    },
    [upgradeCounts]
  );

  // Stop Sustained Autofire
  const stopAutofire = useCallback(() => {
    const wasHolding = isHoldingRef.current;
    isHoldingRef.current = false;
    if (autofireTimerRef.current !== null) {
      window.clearInterval(autofireTimerRef.current);
      autofireTimerRef.current = null;
    }
    setIsOverclocking(false);
    if (wasHolding) {
      saveGameRef.current();
    }
  }, []);

  // Craft Chip Handler
  const craftChip = useCallback((coords?: { clientX?: number; clientY?: number }) => {
    if (isPausedRef.current || isOverheatedRef.current) return;

    const critChance = getCritChance();
    const isCrit = Math.random() < critChance;
    const baseGain = getEffectiveClickPower();
    const clickGain = isCrit ? baseGain * 5 : baseGain;

    totalOpsRef.current += clickGain;
    lifetimeOpsRef.current += clickGain;
    lifetimeManualOpsRef.current += clickGain;
    setTotalOps(totalOpsRef.current);
    setLifetimeOps(lifetimeOpsRef.current);
    setLifetimeManualOps(lifetimeManualOpsRef.current);

    setClickCount((prev) => prev + 1);
    setIsOverclocking(true);
    setTimeout(() => {
      if (!isHoldingRef.current) {
        setIsOverclocking(false);
      }
    }, 110);

    if (isCrit) {
      playCyberSound('crit');
    } else {
      playCyberSound('click');
    }

    // Overheat Accumulation
    const heatIncrement = 3.5;
    const nextHeat = heatLevelRef.current + heatIncrement;
    if (nextHeat >= 100) {
      heatLevelRef.current = 100;
      setHeatLevel(100);
      isOverheatedRef.current = true;
      setIsOverheated(true);
      overheatCooldownRef.current = 5.0;
      setOverheatCooldownRemaining(5.0);
      stopAutofire();
      playCyberSound('glitch');
    } else {
      heatLevelRef.current = nextHeat;
      setHeatLevel(nextHeat);
    }

    // Spawn floating particle directly at cursor position relative to fabrication button
    if (chipRef.current) {
      const rect = chipRef.current.getBoundingClientRect();
      const pointer = coords || lastPointerCoordsRef.current;
      const x = pointer && pointer.clientX !== undefined
        ? Math.max(10, Math.min(rect.width - 10, pointer.clientX - rect.left))
        : rect.width / 2;
      const y = pointer && pointer.clientY !== undefined
        ? Math.max(10, Math.min(rect.height - 10, pointer.clientY - rect.top))
        : rect.height / 2;
      
      const newParticle: ClickParticle = {
        id: performance.now() + Math.random(),
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 12 - 6),
        text: isCrit
          ? `⚡ CRIT! +${clickGain >= 100 ? formatOps(clickGain) : clickGain.toFixed(1)} OP`
          : `+${clickGain >= 100 ? formatOps(clickGain) : clickGain.toFixed(1)} OP`,
        isCrit,
      };

      setParticles((prev) => [...prev.slice(-28), newParticle]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, isCrit ? 1200 : 900);
    }
  }, [getEffectiveClickPower, getCritChance, playCyberSound, stopAutofire]);

  // Start Sustained Autofire
  const startAutofire = useCallback((coords?: { clientX: number; clientY: number }) => {
    if (isPausedRef.current || isOverheatedRef.current) return;
    if (coords) {
      lastPointerCoordsRef.current = coords;
    }

    // Always craft once immediately upon initial contact
    craftChip(coords || lastPointerCoordsRef.current || undefined);

    const rate = getAutofireRate();
    if (rate > 0 && !isOverheatedRef.current) {
      if (autofireTimerRef.current !== null) {
        window.clearInterval(autofireTimerRef.current);
      }
      isHoldingRef.current = true;
      setIsOverclocking(true);
      const intervalMs = Math.max(20, Math.round(1000 / rate));
      autofireTimerRef.current = window.setInterval(() => {
        if (!isPausedRef.current && isHoldingRef.current && !isOverheatedRef.current) {
          craftChip(lastPointerCoordsRef.current || undefined);
        } else {
          stopAutofire();
        }
      }, intervalMs);
    } else {
      saveGameRef.current();
    }
  }, [getAutofireRate, craftChip, stopAutofire]);

  // Global Pointer Listeners for release and smooth cursor tracking during autofire
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isHoldingRef.current) {
        stopAutofire();
      }
    };

    const handleGlobalPointerMove = (e: MouseEvent | TouchEvent) => {
      if (isHoldingRef.current) {
        if ('touches' in e && e.touches && e.touches.length > 0) {
          lastPointerCoordsRef.current = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        } else if ('clientX' in e) {
          lastPointerCoordsRef.current = { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
        }
      }
    };

    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    window.addEventListener('touchcancel', handleGlobalPointerUp);
    window.addEventListener('mousemove', handleGlobalPointerMove);
    window.addEventListener('touchmove', handleGlobalPointerMove);

    return () => {
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
      window.removeEventListener('touchcancel', handleGlobalPointerUp);
      window.removeEventListener('mousemove', handleGlobalPointerMove);
      window.removeEventListener('touchmove', handleGlobalPointerMove);
      if (autofireTimerRef.current !== null) {
        window.clearInterval(autofireTimerRef.current);
      }
    };
  }, [stopAutofire]);

  // Buy Hardware Upgrade Handler (supports 1x, 5x, 10x, and Max)
  const buyUpgrade = (item: UpgradeItem) => {
    const info = getMultiUpgradeInfo(item, buyMultiplier, totalOpsRef.current);
    const buyCount = info.isMax ? info.actualBuyCount : info.countToBuy;
    if (isPausedRef.current || !info.canAfford || buyCount <= 0) return;

    const nextCounts = {
      ...upgradeCounts,
      [item.id]: (upgradeCounts[item.id] || 0) + buyCount,
    };

    const newRate = calculateTotalOpsPerSecond(
      nextCounts,
      purchasedSubUpgrades,
      qWafers,
      quantumPerks,
      quantumFluxLevel,
      unlockedAchievements
    );

    totalOpsRef.current -= info.totalCost;
    setTotalOps(totalOpsRef.current);
    setOpsPerSecond(newRate);
    opsPerSecondRef.current = newRate;
    setUpgradeCounts(nextCounts);

    setRecentPurchased(item.id);
    setTimeout(() => setRecentPurchased(null), 600);

    playCyberSound('upgrade');
    checkAchievements(undefined, undefined, undefined, nextCounts);
    saveGame();
  };

  // Buy Sub-Upgrade (Cookie Clicker style Tech Enhancement)
  const buySubUpgrade = (sub: SubUpgradeItem) => {
    if (isPaused || totalOpsRef.current < sub.cost || purchasedSubUpgrades.includes(sub.id)) return;

    const nextPurchased = [...purchasedSubUpgrades, sub.id];
    const newRate = calculateTotalOpsPerSecond(
      upgradeCounts,
      nextPurchased,
      qWafers,
      quantumPerks,
      quantumFluxLevel,
      unlockedAchievements
    );

    totalOpsRef.current -= sub.cost;
    setTotalOps(totalOpsRef.current);
    setPurchasedSubUpgrades(nextPurchased);
    setOpsPerSecond(newRate);
    opsPerSecondRef.current = newRate;

    setRecentSubPurchased(sub.id);
    setTimeout(() => setRecentSubPurchased(null), 800);

    playCyberSound('research');
    saveGame();
  };

  // Buy Quantum Perk Handler (Multi-Level)
  const buyQuantumPerk = (perk: QuantumPerk) => {
    const currentLevel = quantumPerks[perk.id] || 0;
    if (currentLevel >= perk.maxLevel) return;

    const isPrereqMet = !perk.reqPerkId || (quantumPerks[perk.reqPerkId] || 0) > 0;
    const cost = perk.costs[currentLevel];
    if (qWafers < cost || !isPrereqMet) return;

    const nextQWafers = qWafers - cost;
    const nextPerks = {
      ...quantumPerks,
      [perk.id]: currentLevel + 1,
    };

    setQWafers(nextQWafers);
    setQuantumPerks(nextPerks);
    quantumPerksRef.current = nextPerks;

    const newRate = calculateTotalOpsPerSecond(
      upgradeCounts,
      purchasedSubUpgrades,
      nextQWafers,
      nextPerks,
      quantumFluxLevel,
      unlockedAchievements
    );
    setOpsPerSecond(newRate);
    opsPerSecondRef.current = newRate;

    playCyberSound('quantum');
    saveGame();
  };

  // Buy Quantum Flux Resonator Level (Infinite Q-Wafer Sink)
  const buyQuantumFluxLevel = () => {
    const cost = getQuantumFluxCost();
    if (qWafers < cost) return;

    const nextWafers = qWafers - cost;
    const nextLevel = quantumFluxLevel + 1;

    setQWafers(nextWafers);
    setQuantumFluxLevel(nextLevel);
    quantumFluxLevelRef.current = nextLevel;

    const newRate = calculateTotalOpsPerSecond(
      upgradeCounts,
      purchasedSubUpgrades,
      nextWafers,
      quantumPerks,
      nextLevel,
      unlockedAchievements
    );
    setOpsPerSecond(newRate);
    opsPerSecondRef.current = newRate;

    playCyberSound('quantum');
    checkAchievements(undefined, undefined, undefined, undefined, undefined, nextLevel);
    saveGame();
  };

  // Handle Quantum Glitch Interception
  const handleGlitchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeGlitchRef.current) return;
    activeGlitchRef.current = null;
    setActiveGlitch(null);

    playCyberSound('glitch');

    const newGlitchCount = glitchesCaught + 1;
    setGlitchesCaught(newGlitchCount);
    glitchesCaughtRef.current = newGlitchCount;

    // 50% chance of 15s 7x Overclock Frenzy OR instant 10min passive yield burst
    const isFrenzy = Math.random() < 0.5;
    if (isFrenzy) {
      frenzyRemainingRef.current = 15;
      setFrenzyRemaining(15);
      const newRate = calculateTotalOpsPerSecond(
        upgradeCounts,
        purchasedSubUpgrades,
        qWafers,
        quantumPerks,
        quantumFluxLevel,
        unlockedAchievements,
        true
      );
      setOpsPerSecond(newRate);
      opsPerSecondRef.current = newRate;

      setGlitchToast({
        title: 'OVERCLOCK FRENZY ACTIVATED!',
        desc: '7x Global OPS Throughput & Manual Click Power for 15 Seconds!',
        type: 'frenzy',
      });
    } else {
      const baseYield = Math.max(500, Math.round(opsPerSecondRef.current * 600));
      totalOpsRef.current += baseYield;
      lifetimeOpsRef.current += baseYield;
      lifetimePassiveOpsRef.current += baseYield;
      setTotalOps(totalOpsRef.current);
      setLifetimeOps(lifetimeOpsRef.current);
      setLifetimePassiveOps(lifetimePassiveOpsRef.current);

      setGlitchToast({
        title: 'QUANTUM BURST EXTRACTED!',
        desc: `+${formatOps(baseYield)} OPS harvested instantaneously (10 min yield)!`,
        type: 'ops',
      });
    }

    setTimeout(() => setGlitchToast(null), 4500);
    checkAchievements(newGlitchCount);
    saveGame();
  };

  // Quantum Rebirth Initiation Flow
  const initiateQuantumRebirth = () => {
    const potentialWafers = Math.floor(Math.sqrt(lifetimeOpsRef.current / 1_000_000));
    const claimable = lifetimeOpsRef.current >= 50_000_000 ? Math.max(0, potentialWafers - totalQWafersClaimed) : 0;

    if (claimable <= 0 && lifetimeOpsRef.current < 50_000_000) return;

    setIsRebirthing(true);
    playCyberSound('rebirth');

    const newWafers = qWafers + claimable;
    const newTotalClaimed = totalQWafersClaimed + claimable;
    const newRebirthCount = rebirthCount + 1;

    setQWafers(newWafers);
    setTotalQWafersClaimed(newTotalClaimed);
    setRebirthCount(newRebirthCount);

    // Reset current run stats
    totalOpsRef.current = 0;
    setTotalOps(0);
    const now = Date.now();
    runStartTimeRef.current = now;
    setRunStartTime(now);

    // Reset thermal state on rebirth
    heatLevelRef.current = 0;
    setHeatLevel(0);
    isOverheatedRef.current = false;
    setIsOverheated(false);
    overheatCooldownRef.current = 0;
    setOverheatCooldownRemaining(0);

    // Automated Bootloader Perk: Start with free Magnifying Glasses based on level
    const bootloaderLevel = quantumPerks['perk-bootloader'] || 0;
    const bootCount = bootloaderLevel === 3 ? 50 : bootloaderLevel === 2 ? 25 : bootloaderLevel === 1 ? 10 : 0;
    const initialHardware: Record<string, number> = bootCount > 0
      ? { 'magnifying-glass': bootCount }
      : {};
    setUpgradeCounts(initialHardware);
    setPurchasedSubUpgrades([]);

    const newRate = calculateTotalOpsPerSecond(
      initialHardware,
      [],
      newWafers,
      quantumPerks,
      quantumFluxLevel,
      unlockedAchievements
    );
    setOpsPerSecond(newRate);
    opsPerSecondRef.current = newRate;

    setShowRebirthConfirmModal(false);
    setShowQuantumModal(false);

    checkAchievements(undefined, undefined, undefined, initialHardware, newRebirthCount);

    setTimeout(() => {
      setIsRebirthing(false);
      saveGame();
    }, 1500);
  };

  // Check if a sub-upgrade is discovered (unlocked to purchase)
  const isSubUpgradeDiscovered = (sub: SubUpgradeItem) => {
    if (sub.reqType === 'click') {
      return clickCount >= sub.reqAmount;
    }
    if (sub.reqHardwareId) {
      return (upgradeCounts[sub.reqHardwareId] || 0) >= sub.reqAmount;
    }
    return false;
  };

  // Available (discovered and unpurchased) sub-upgrades
  const availableSubUpgrades = SUB_UPGRADES.filter(
    (sub) => isSubUpgradeDiscovered(sub) && !purchasedSubUpgrades.includes(sub.id)
  );

  // Pause toggle
  const togglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;
    if (!nextPaused) {
      lastTimeRef.current = performance.now();
      playCyberSound('resume');
    } else {
      playCyberSound('pause');
    }
  };

  const resumeGame = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    lastTimeRef.current = performance.now();
    playCyberSound('resume');
  };

  const restartGame = () => {
    try {
      localStorage.removeItem('gameState');
    } catch {}
    const now = Date.now();
    setTotalOps(0);
    setLifetimeOps(0);
    setOpsPerSecond(0);
    setClickCount(0);
    setUpgradeCounts({});
    setPurchasedSubUpgrades([]);
    setQWafers(0);
    setTotalQWafersClaimed(0);
    setRebirthCount(0);
    setQuantumPerks({});
    setQuantumFluxLevel(0);
    setGlitchesCaught(0);
    setUnlockedAchievements([]);
    setHeatLevel(0);
    setIsOverheated(false);
    setOverheatCooldownRemaining(0);
    setRunStartTime(now);
    setFirstPlayTime(now);
    setLifetimeManualOps(0);
    setLifetimePassiveOps(0);
    totalOpsRef.current = 0;
    lifetimeOpsRef.current = 0;
    opsPerSecondRef.current = 0;
    quantumFluxLevelRef.current = 0;
    glitchesCaughtRef.current = 0;
    unlockedAchievementsRef.current = [];
    quantumPerksRef.current = {};
    heatLevelRef.current = 0;
    isOverheatedRef.current = false;
    overheatCooldownRef.current = 0;
    runStartTimeRef.current = now;
    firstPlayTimeRef.current = now;
    lifetimeManualOpsRef.current = 0;
    lifetimePassiveOpsRef.current = 0;
    setShowRestartConfirm(false);
    resumeGame();
  };

  // Initial Load (Run once on mount)
  useEffect(() => {
    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start 16-Bit Background Music on First User Interaction (Browser Audio Policy)
  useEffect(() => {
    const handleFirstGesture = () => {
      audioEngine.init();
      if (!audioEngine.getMusicMuted() && audioEngine.getMusicVolume() > 0) {
        audioEngine.startMusic();
      }
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);
    window.addEventListener('touchstart', handleFirstGesture);

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  // RequestAnimationFrame Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastUiUpdate = performance.now();
    let lastAchievementCheck = performance.now();

    const loop = (timestamp: number) => {
      if (!isPausedRef.current) {
        const deltaTime = Math.min(1.0, (timestamp - lastTimeRef.current) / 1000);
        if (deltaTime > 0 && opsPerSecondRef.current > 0) {
          const generated = opsPerSecondRef.current * deltaTime;
          totalOpsRef.current += generated;
          lifetimeOpsRef.current += generated;
          lifetimePassiveOpsRef.current += generated;
        }

        // Overheat and Thermal Dissipation handling
        if (isOverheatedRef.current) {
          overheatCooldownRef.current = Math.max(0, overheatCooldownRef.current - deltaTime);
          heatLevelRef.current = Math.max(0, (overheatCooldownRef.current / 5.0) * 100);
          if (overheatCooldownRef.current <= 0) {
            isOverheatedRef.current = false;
            setIsOverheated(false);
            heatLevelRef.current = 0;
            setHeatLevel(0);
            setOverheatCooldownRemaining(0);
            playCyberSound('resume');
          }
        } else {
          const dissipationRate = getHeatDissipationRate(quantumPerksRef.current);
          if (heatLevelRef.current > 0) {
            heatLevelRef.current = Math.max(0, heatLevelRef.current - dissipationRate * deltaTime);
          }
        }

        // Frenzy countdown handler
        if (frenzyRemainingRef.current > 0) {
          frenzyRemainingRef.current = Math.max(0, frenzyRemainingRef.current - deltaTime);
          if (frenzyRemainingRef.current <= 0) {
            // Restore normal non-frenzy rate
            const normalRate = calculateTotalOpsPerSecond(
              upgradeCounts,
              purchasedSubUpgrades,
              qWafers,
              quantumPerks,
              quantumFluxLevel,
              unlockedAchievements,
              false
            );
            setOpsPerSecond(normalRate);
            opsPerSecondRef.current = normalRate;
          }
        }

        // Golden Glitch spawn timer check (every 90-180 seconds)
        if (!activeGlitchRef.current && timestamp >= glitchSpawnTimerRef.current) {
          const angle = Math.random() * Math.PI * 2;
          const newGlitch = {
            id: Date.now(),
            x: 15 + Math.random() * 70, // 15% to 85% of screen width
            y: 15 + Math.random() * 65, // 15% to 80% of screen height
            vx: Math.cos(angle) * 4.5,
            vy: Math.sin(angle) * 4.5,
            remainingTime: 8.0, // 8 seconds lifetime
          };
          activeGlitchRef.current = newGlitch;
          setActiveGlitch(newGlitch);
          glitchSpawnTimerRef.current = timestamp + (90 + Math.random() * 90) * 1000;
        }

        // Active Glitch motion & expiration update
        if (activeGlitchRef.current) {
          activeGlitchRef.current.remainingTime -= deltaTime;
          activeGlitchRef.current.x = Math.max(5, Math.min(92, activeGlitchRef.current.x + activeGlitchRef.current.vx * deltaTime));
          activeGlitchRef.current.y = Math.max(10, Math.min(88, activeGlitchRef.current.y + activeGlitchRef.current.vy * deltaTime));

          if (activeGlitchRef.current.remainingTime <= 0) {
            activeGlitchRef.current = null;
            setActiveGlitch(null);
          } else {
            setActiveGlitch({ ...activeGlitchRef.current });
          }
        }

        // Periodic achievement check during passive progress
        if (timestamp - lastAchievementCheck >= 1000) {
          checkAchievementsRef.current();
          lastAchievementCheck = timestamp;
        }

        // Throttle React UI re-renders to 20Hz (every 50ms) for silky-smooth 60fps frame rates without React bottlenecking
        if (timestamp - lastUiUpdate >= 50) {
          setTotalOps(totalOpsRef.current);
          setLifetimeOps(lifetimeOpsRef.current);
          setLifetimePassiveOps(lifetimePassiveOpsRef.current);
          setLifetimeManualOps(lifetimeManualOpsRef.current);
          setHeatLevel(heatLevelRef.current);
          setFrenzyRemaining(frenzyRemainingRef.current);
          if (isOverheatedRef.current) {
            setOverheatCooldownRemaining(overheatCooldownRef.current);
          }
          lastUiUpdate = timestamp;
        }
      }
      lastTimeRef.current = timestamp;
      animationFrameId = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    lastUiUpdate = performance.now();
    lastAchievementCheck = performance.now();
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [calculateTotalOpsPerSecond, getHeatDissipationRate, playCyberSound, upgradeCounts, purchasedSubUpgrades, qWafers, quantumPerks, quantumFluxLevel, unlockedAchievements]);

  // Periodic Auto-Save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGameRef.current();
    }, 5000);
    return () => clearInterval(saveInterval);
  }, []);

  const clickPower = getEffectiveClickPower();
  const isPrestigeUnlocked = lifetimeOps >= 50_000_000 || totalQWafersClaimed > 0 || rebirthCount > 0;
  const potentialTotalWafers = Math.floor(Math.sqrt(lifetimeOps / 1_000_000));
  const claimableWafers = lifetimeOps >= 50_000_000 ? Math.max(0, potentialTotalWafers - totalQWafersClaimed) : 0;
  const nextWaferCost = Math.pow(potentialTotalWafers + 1, 2) * 1_000_000;
  const currentWaferThreshold = Math.pow(potentialTotalWafers, 2) * 1_000_000;
  const waferProgressPercent = isPrestigeUnlocked
    ? Math.min(100, Math.max(0, ((lifetimeOps - currentWaferThreshold) / (nextWaferCost - currentWaferThreshold)) * 100))
    : Math.min(100, (lifetimeOps / 50_000_000) * 100);

  return (
    <div id="game-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-6 lg:p-8 relative select-none font-sans overflow-x-hidden">
      
      {/* Scanline / Grid overlay */}
      <div className="scanline-effect"></div>

      {/* Cyberpunk Top Bar */}
      <header id="header-panel" className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 mb-6 rounded-2xl bg-slate-900/90 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wider text-white font-display">
              OVERCLOCKED
            </h1>
            <p className="text-[11px] text-cyan-400/80 font-mono tracking-widest uppercase">
              Silicon Empire Protocol v2.5
            </p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Header Persistent Audio Controls */}
          <div
            id="header-audio-controls"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950 shadow-inner"
          >
            {/* Cyber Ambient Soundtrack Controls */}
            <div className="flex items-center gap-1.5" title="Background Cyber Ambient Music Controls">
              <button
                id="music-header-mute-btn"
                type="button"
                onClick={handleToggleMusicMute}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isMusicMuted || musicVolume === 0
                    ? 'bg-slate-900 text-slate-500 hover:text-slate-300'
                    : 'bg-cyan-950 text-cyan-300 hover:bg-cyan-900 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                }`}
                title={isMusicMuted || musicVolume === 0 ? 'Unmute Cyber Ambient Music' : 'Mute Cyber Ambient Music'}
              >
                {isMusicMuted || musicVolume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <div className="flex items-center gap-1.5">
                <Music className="w-3 h-3 text-slate-400 hidden sm:inline" />
                <input
                  id="music-header-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={isMusicMuted ? 0 : Math.round(musicVolume * 100)}
                  onChange={(e) => handleMusicVolumeChange(Number(e.target.value) / 100)}
                  className="w-14 sm:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
                  title={`Music: ${isMusicMuted || musicVolume === 0 ? 'Muted' : `${Math.round(musicVolume * 100)}%`}`}
                />
                <span className="text-[10px] font-mono text-slate-400 w-7 text-right hidden md:inline">
                  {isMusicMuted || musicVolume === 0 ? 'OFF' : `${Math.round(musicVolume * 100)}%`}
                </span>
              </div>
            </div>

            <div className="w-[1px] h-4 bg-slate-800" />

            {/* Sound Effects (SFX) Controls */}
            <div className="flex items-center gap-1.5" title="Sound Effects (SFX) Controls">
              <button
                id="sfx-header-mute-btn"
                type="button"
                onClick={handleToggleSfxMute}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isSfxMuted || sfxVolume === 0
                    ? 'bg-slate-900 text-slate-500 hover:text-slate-300'
                    : 'bg-cyan-950 text-cyan-300 hover:bg-cyan-900 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                }`}
                title={isSfxMuted || sfxVolume === 0 ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              >
                {isSfxMuted || sfxVolume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400 hidden sm:inline" />
                <input
                  id="sfx-header-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={isSfxMuted ? 0 : Math.round(sfxVolume * 100)}
                  onChange={(e) => handleSfxVolumeChange(Number(e.target.value) / 100)}
                  className="w-14 sm:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
                  title={`SFX: ${isSfxMuted || sfxVolume === 0 ? 'Muted' : `${Math.round(sfxVolume * 100)}%`}`}
                />
                <span className="text-[10px] font-mono text-cyan-400/90 w-7 text-right hidden md:inline">
                  {isSfxMuted || sfxVolume === 0 ? 'OFF' : `${Math.round(sfxVolume * 100)}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Achievements Modal Trigger Button */}
          <button
            id="open-achievements-btn"
            onClick={() => {
              setShowAchievementsModal(true);
              playCyberSound('click');
            }}
            className="px-3.5 py-2 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer bg-slate-950 text-slate-200 hover:text-white border border-slate-800 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            title="Achievements and Global Yield Boosts"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col text-left">
              <span className="tracking-wider leading-none">ACHIEVEMENTS</span>
              <span className="text-[10px] text-emerald-400 mt-0.5 font-bold">
                {unlockedAchievements.length}/{ACHIEVEMENTS.length} (+{unlockedAchievements.length}% OPS)
              </span>
            </div>
          </button>

          {/* Statistics Ledger Trigger Button */}
          <button
            id="open-statistics-btn"
            onClick={() => {
              setShowStatsModal(true);
              playCyberSound('click');
            }}
            className="px-3.5 py-2 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer bg-slate-950 text-slate-200 hover:text-white border border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,242,254,0.25)]"
            title="System Statistics and Efficiency Ledger"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col text-left">
              <span className="tracking-wider leading-none">STATISTICS</span>
              <span className="text-[10px] text-cyan-300 mt-0.5 font-bold">
                {lifetimeOps > 0 ? `${((lifetimePassiveOps / Math.max(1, lifetimeOps)) * 100).toFixed(0)}% Passive` : 'Ledger Active'}
              </span>
            </div>
          </button>

          {/* Quantum Foundry Rebirth Button */}
          <button
            id="open-quantum-foundry-btn"
            onClick={() => {
              setShowQuantumModal(true);
              playCyberSound('click');
            }}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              isPrestigeUnlocked
                ? 'bg-slate-950 border border-purple-500/60 text-purple-200 hover:text-white hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
            title="Quantum Foundry Rebirth & Meta-Research"
          >
            <Atom className={`w-4 h-4 ${isPrestigeUnlocked ? 'text-purple-400 animate-spin-slow' : 'text-slate-500'}`} />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="tracking-wider">QUANTUM FOUNDRY</span>
                {claimableWafers > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-cyan-400 text-slate-950 animate-pulse">
                    +{claimableWafers} READY
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-400 mt-0.5 font-bold">
                {isPrestigeUnlocked
                  ? `${qWafers} Wafers (+${((getQuantumWaferMultiplier() - 1) * 100).toFixed(0)}% Boost)`
                  : `Locked (${waferProgressPercent.toFixed(0)}% to 50M Ops)`}
              </span>
            </div>
          </button>

          {/* Pause / Resume Button */}
          <button
            id="pause-resume-btn"
            onClick={togglePause}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPaused
                ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          {/* Restart Button */}
          <button
            id="restart-game-btn"
            onClick={() => setShowRestartConfirm(true)}
            className="p-2.5 rounded-xl font-mono text-xs bg-slate-950 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer"
            title="Reset Progress"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid Layout - Spread across wider viewport with balanced column split */}
      <main id="main-content" className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column: Telemetry & Central Fabrication Chip (5 cols) */}
        <section id="fabrication-section" className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Telemetry Stat Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Ops Metric */}
            <div id="total-ops-card" className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
                <span>FABRICATED OPS</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span id="totalOps" className="text-2xl md:text-3xl font-bold tracking-tight text-white font-mono">
                  {formatOps(totalOps)}
                </span>
                <span className="text-xs text-cyan-400 font-semibold font-mono">OPS</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Stored computational balance
              </div>
            </div>

            {/* Ops Per Second Metric */}
            <div id="ops-rate-card" className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
                <span>PASSIVE SYNTHESIS</span>
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span id="opsPerSecond" className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-300 font-mono">
                  {formatRate(opsPerSecond)}
                </span>
                <span className="text-xs text-emerald-400/80 font-semibold font-mono">/SEC</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Autonomous yield
              </div>
            </div>
          </div>

          {/* Quantum Matrix Telemetry Strip (when unlocked / wafers owned) */}
          {(qWafers > 0 || quantumPerks.length > 0 || rebirthCount > 0 || isPrestigeUnlocked) && (
            <div
              id="quantum-matrix-banner"
              onClick={() => {
                setShowQuantumModal(true);
                playCyberSound('click');
              }}
              className="w-full p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between text-xs font-mono cursor-pointer hover:border-purple-500/50 hover:bg-slate-900 transition-all group"
            >
              <div className="flex items-center gap-2.5 text-slate-300">
                <Atom className="w-4 h-4 text-purple-400 group-hover:rotate-90 transition-transform duration-500 flex-shrink-0" />
                <span>QUANTUM MATRIX: <strong className="text-white">{qWafers} Q-Wafers</strong></span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-emerald-400 font-bold">
                  +{((getQuantumWaferMultiplier() - 1) * 100).toFixed(0)}% Boost
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  {quantumPerks.length}/5 Perks
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          )}

          {/* Central Silicon Microchip Station - Anchoring Left Column without clipping glow */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center relative min-h-[440px] flex-1">
            
            {/* Ambient Background Radial Wrapper to prevent gradient bleed while preserving button glow */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className={`absolute inset-0 transition-all duration-500 ${
                isOverheated
                  ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.25),transparent_70%)]'
                  : frenzyRemaining > 0
                  ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.2),transparent_70%)]'
                  : heatLevel > 60
                  ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.18),transparent_70%)]'
                  : 'bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,254,0.12),transparent_70%)]'
              }`}></div>
            </div>

            {/* Overclock Frenzy Active HUD Display */}
            {frenzyRemaining > 0 && (
              <div
                id="frenzy-active-badge"
                className="w-full max-w-sm mb-4 p-3 rounded-2xl bg-amber-950/90 border-2 border-amber-400 text-amber-300 font-mono shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-pulse flex flex-col gap-1.5 z-20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-amber-500 text-slate-950 animate-bounce">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <span className="font-bold text-xs tracking-wider text-amber-200 uppercase font-display">
                      7x OVERCLOCK FRENZY
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-300 bg-slate-950/90 px-2 py-0.5 rounded border border-amber-500/50">
                    {frenzyRemaining.toFixed(1)}s
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-amber-500/30">
                  <div
                    style={{ width: `${Math.min(100, Math.max(0, (frenzyRemaining / 15) * 100))}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-100"
                  />
                </div>
                <div className="text-[10px] text-amber-300 text-center font-bold tracking-wide">
                  ⚡ 7× ALL PASSIVE OPS & MANUAL TAP YIELD ⚡
                </div>
              </div>
            )}

            {/* Thermal Load & Core Temperature Monitor */}
            <div
              id="thermal-monitor-panel"
              className={`w-full max-w-sm mb-5 p-3 rounded-2xl border font-mono transition-all z-20 ${
                isOverheated
                  ? 'bg-rose-950/90 border-rose-500/80 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse'
                  : heatLevel > 75
                  ? 'bg-orange-950/80 border-orange-500/70 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.25)]'
                  : heatLevel > 40
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  {isOverheated ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                  ) : (
                    <Flame className={`w-3.5 h-3.5 ${
                      heatLevel > 75 ? 'text-orange-400' : heatLevel > 40 ? 'text-amber-400' : 'text-cyan-400'
                    }`} />
                  )}
                  <span className={isOverheated ? 'text-rose-200 uppercase font-black' : 'text-slate-200'}>
                    {isOverheated ? 'CORE OVERHEAT LOCKOUT' : 'THERMAL LOAD'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold">
                    {(35 + heatLevel * 0.65).toFixed(1)}°C
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-black border ${
                    isOverheated
                      ? 'bg-rose-950 text-rose-300 border-rose-500/60'
                      : heatLevel > 75
                      ? 'bg-orange-950 text-orange-300 border-orange-500/50'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}>
                    {Math.round(heatLevel)}%
                  </span>
                </div>
              </div>

              {/* Dynamic Thermal Progress Gauge */}
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800 relative">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, heatLevel))}%` }}
                  className={`h-full transition-all duration-75 ease-linear ${
                    isOverheated
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                      : heatLevel > 75
                      ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500'
                      : heatLevel > 40
                      ? 'bg-gradient-to-r from-cyan-400 via-amber-400 to-orange-400'
                      : 'bg-gradient-to-r from-cyan-500 to-cyan-300'
                  }`}
                />
              </div>

              {/* Status / Cooling Subtext */}
              <div className="mt-1.5 flex items-center justify-between text-[10px]">
                {isOverheated ? (
                  <span className="text-rose-300 font-bold">
                    Emergency Cooldown: <strong>{overheatCooldownRemaining.toFixed(1)}s</strong>
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Dissipation: <strong className="text-cyan-300">{getHeatDissipationRate().toFixed(0)}%/s</strong>
                  </span>
                )}
                <span className="text-slate-400">
                  Crit Rate: <strong className="text-amber-300">{(getCritChance() * 100).toFixed(1)}%</strong>
                </span>
              </div>
            </div>

            {/* Silicon Fabrication Node */}
            <div className="relative flex flex-col items-center justify-center">
              
              {/* Particle Burst Elements - absolute relative to container */}
              <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
                {particles.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      left: `${p.x}px`,
                      top: `${p.y}px`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 animate-float-up font-mono font-bold pointer-events-none whitespace-nowrap select-none transition-transform ${
                      p.isCrit
                        ? 'text-amber-300 text-base md:text-lg font-black drop-shadow-[0_0_14px_rgba(245,158,11,1)] z-40 scale-110 tracking-tight'
                        : 'text-cyan-300 text-sm drop-shadow-[0_0_10px_rgba(0,242,254,0.9)]'
                    }`}
                  >
                    {p.text}
                  </div>
                ))}
              </div>

              {/* Scaled Anchoring Microchip Button */}
              <button
                ref={chipRef}
                id="craft-chip-btn"
                onClick={(e) => {
                  e.preventDefault();
                }}
                onMouseDown={(e) => {
                  if (e.button === 0 && !isOverheated) {
                    startAutofire({ clientX: e.clientX, clientY: e.clientY });
                  }
                }}
                onMouseUp={stopAutofire}
                onMouseLeave={stopAutofire}
                onMouseMove={(e) => {
                  lastPointerCoordsRef.current = { clientX: e.clientX, clientY: e.clientY };
                }}
                onTouchStart={(e) => {
                  if (e.touches.length > 0 && !isOverheated) {
                    startAutofire({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length > 0) {
                    lastPointerCoordsRef.current = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
                  }
                }}
                onTouchEnd={stopAutofire}
                onTouchCancel={stopAutofire}
                disabled={isPaused || isOverheated}
                className={`relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-3xl bg-slate-950 border-2 flex flex-col items-center justify-center group select-none transition-all ${
                  isPaused
                    ? 'border-slate-800 opacity-60 cursor-not-allowed'
                    : isOverheated
                    ? 'border-rose-500 bg-rose-950/40 shadow-[0_0_70px_rgba(244,63,94,0.85)] cursor-not-allowed animate-pulse'
                    : heatLevel > 75
                    ? 'border-orange-500 shadow-[0_0_60px_rgba(249,115,22,0.7)] cursor-pointer'
                    : heatLevel > 40
                    ? 'border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.5)] cursor-pointer'
                    : 'border-cyan-500/60 hover:border-cyan-400 shadow-[0_0_40px_rgba(0,242,254,0.3)] hover:shadow-[0_0_60px_rgba(0,242,254,0.55)] cursor-pointer'
                } ${isOverclocking && !isOverheated ? 'border-cyan-300 shadow-[0_0_80px_rgba(0,242,254,0.85)]' : ''} active:scale-[0.98]`}
              >
                {/* Circuit Traces Pattern */}
                <div className={`absolute inset-2.5 border border-dashed rounded-2xl pointer-events-none ${
                  isOverheated ? 'border-rose-500/40' : 'border-cyan-500/25'
                }`}></div>
                <div className={`absolute inset-5 border rounded-xl pointer-events-none ${
                  isOverheated ? 'border-rose-500/30' : 'border-cyan-500/15'
                }`}></div>
                
                {/* Golden Pins on Periphery */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-28 sm:w-36 h-2 bg-amber-400/80 rounded-full blur-[0.5px]"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-28 sm:w-36 h-2 bg-amber-400/80 rounded-full blur-[0.5px]"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-28 sm:h-36 w-2 bg-amber-400/80 rounded-full blur-[0.5px]"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 h-28 sm:h-36 w-2 bg-amber-400/80 rounded-full blur-[0.5px]"></div>

                {/* Central Die Core */}
                <div className={`w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl border flex items-center justify-center relative overflow-hidden shadow-inner transition-colors ${
                  isOverheated
                    ? 'bg-rose-950/80 border-rose-500'
                    : heatLevel > 75
                    ? 'bg-orange-950/80 border-orange-400'
                    : 'bg-gradient-to-br from-cyan-950/90 via-slate-900 to-slate-950 border-cyan-400/60 group-hover:border-cyan-300'
                }`}>
                  {isOverheated ? (
                    <AlertTriangle className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-rose-400 animate-bounce drop-shadow-[0_0_15px_rgba(244,63,94,0.9)]" />
                  ) : (
                    <Cpu className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-colors ${
                      heatLevel > 75
                        ? 'text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]'
                        : heatLevel > 40
                        ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                        : 'text-cyan-400 group-hover:text-cyan-200 drop-shadow-[0_0_12px_rgba(0,242,254,0.7)]'
                    } ${isOverclocking ? 'scale-110' : ''}`} />
                  )}
                  
                  {/* Scan Beam */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-700 ease-in-out"></div>
                </div>

                <div className="mt-4 flex flex-col items-center pointer-events-none">
                  <span className={`text-xs sm:text-sm font-mono font-bold tracking-widest uppercase ${
                    isOverheated
                      ? 'text-rose-400 animate-pulse'
                      : heatLevel > 75
                      ? 'text-orange-300'
                      : 'text-cyan-300 group-hover:text-white'
                  }`}>
                    {isOverheated
                      ? `OVERHEAT (${overheatCooldownRemaining.toFixed(1)}s)`
                      : getAutofireRate() > 0
                      ? 'HOLD TO CRAFT'
                      : 'FABRICATE'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {isOverheated ? 'COOLING SHIELD ACTIVE' : `+${formatOps(clickPower)} / Tap`}
                  </span>
                </div>
              </button>
            </div>

            {/* Quick Metrics Footer */}
            <div className="mt-6 flex items-center justify-between w-full max-w-md px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner text-[11px] font-mono text-slate-400">
              <span>Manual Synthesis: <strong className="text-slate-200">{clickCount.toLocaleString()}</strong></span>
              <span className="text-cyan-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Synced
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Upgrade Shop with Sub-Upgrades & Hardware (7 cols) */}
        <section id="upgrade-shop" className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Research & Firmware Sub-Upgrades Tray */}
          <div id="sub-upgrades-tray" className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl relative z-20 overflow-visible">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <CircuitBoard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-white font-display">
                    RESEARCH & FIRMWARE OVERCLOCKS
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Permanent multipliers & hardware efficiency enhancements
                  </p>
                </div>
              </div>

              {/* Installed Mods Tracker / Modal Trigger */}
              <button
                onClick={() => setShowInstalledModal(true)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-mono border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>Installed ({purchasedSubUpgrades.length} / {SUB_UPGRADES.length})</span>
              </button>
            </div>

            {/* Sub-Upgrades Grid / Empty State */}
            {availableSubUpgrades.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto p-1 overflow-x-hidden">
                {availableSubUpgrades.map((sub) => {
                  const SubIcon = sub.icon;
                  const canAffordSub = !isPaused && totalOps >= sub.cost;
                  const isJustBought = recentSubPurchased === sub.id;

                  return (
                    <div
                      key={sub.id}
                      id={`sub-upgrade-${sub.id}`}
                      className="relative"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setHoveredSub(null);
                          if (canAffordSub) buySubUpgrade(sub);
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredSub({ sub, rect });
                        }}
                        onMouseLeave={() => setHoveredSub(null)}
                        disabled={!canAffordSub}
                        className={`w-full p-2.5 rounded-2xl text-left transition-all relative flex items-center gap-2.5 select-none ${
                          isJustBought ? 'ring-2 ring-purple-400 bg-purple-950/70 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : ''
                        } ${
                          canAffordSub
                            ? 'bg-slate-900/90 border border-purple-500/40 hover:border-purple-300 hover:bg-purple-950/40 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                            : 'bg-slate-900/40 border border-slate-900 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {/* Sub-Upgrade Icon */}
                        <div
                          style={{
                            borderColor: canAffordSub ? `${sub.color}80` : `${sub.color}30`,
                            backgroundColor: canAffordSub ? `${sub.color}25` : `${sub.color}10`,
                            color: canAffordSub ? sub.color : '#94a3b8'
                          }}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all ${
                            canAffordSub ? 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' : ''
                          }`}
                        >
                          <SubIcon className="w-4 h-4" />
                        </div>

                        {/* Title & Cost */}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-white font-display truncate">
                            {sub.name}
                          </div>
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-purple-300">
                              {sub.multiplier}x Boost
                            </span>
                            <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${
                              canAffordSub ? 'text-amber-400' : 'text-slate-500'
                            }`}>
                              <Zap className="w-2.5 h-2.5 text-amber-400" />
                              {formatOps(sub.cost)}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center gap-1.5">
                <p className="text-xs text-slate-400 font-mono">
                  {purchasedSubUpgrades.length === SUB_UPGRADES.length
                    ? '🎉 All firmware protocols & overclocking modules installed!'
                    : '🔒 Synthesize more hardware tiers & tap the fabrication node to discover new research protocols.'}
                </p>
              </div>
            )}
          </div>

          {/* Main Hardware Upgrades Section */}
          <div className="p-5 md:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl flex-1 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-wide text-white font-display">
                  HARDWARE UPGRADES
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Sequential Tech Tree // Unlock higher tiers by synthesizing previous hardware
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* 1x, 5x, 10x, MAX Buy Multiplier Selector */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2 hidden sm:inline-block">BUY</span>
                  {([1, 5, 10, 'max'] as BuyMultiplier[]).map((multiplier) => {
                    const isSelected = buyMultiplier === multiplier;
                    return (
                      <button
                        key={multiplier}
                        id={`buy-multiplier-${multiplier}`}
                        onClick={() => {
                          setBuyMultiplier(multiplier);
                          playCyberSound('click');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                            : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                        }`}
                      >
                        {multiplier === 'max' ? 'MAX' : `${multiplier}x`}
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const unlockedCount = UPGRADES.filter((_, idx) => idx === 0 || (upgradeCounts[UPGRADES[idx - 1].id] || 0) >= 1).length;
                  return (
                    <span className="text-xs px-3 py-1 rounded-xl bg-slate-950 text-slate-300 font-mono border border-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>{unlockedCount} / {UPGRADES.length} Discovered</span>
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Upgrade Items List - High-contrast focal hierarchy */}
            <div
              className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1.5 pb-4"
              onScroll={() => {
                if (hoveredUpgrade) setHoveredUpgrade(null);
              }}
            >
              {UPGRADES.map((item, idx) => {
                const isUnlocked = idx === 0 || (upgradeCounts[UPGRADES[idx - 1].id] || 0) >= 1;
                const prevTierName = idx > 0 ? UPGRADES[idx - 1].name : '';

                // If locked by Fog of War (Compact Sleek Locked Card)
                const currentTierStr = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
                const prevTierStr = idx < 10 ? `0${idx}` : `${idx}`;

                if (!isUnlocked) {
                  return (
                    <div
                      key={item.id}
                      id={`upgrade-locked-${item.id}`}
                      className="p-4 rounded-2xl bg-slate-900/40 relative select-none flex items-center justify-between gap-4 group transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 text-slate-500 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-xs md:text-sm font-mono tracking-wider text-slate-400">
                              [CLASSIFIED HARDWARE - TIER {currentTierStr}]
                            </h3>
                          </div>
                          <p className="text-xs text-amber-400/80 font-mono mt-0.5">
                            Requires 1x {prevTierName} (Tier {prevTierStr}) to declassify
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl bg-amber-950/40 flex-shrink-0">
                        <Lock className="w-3.5 h-3.5" /> LOCKED
                      </span>
                    </div>
                  );
                }

                // If Unlocked and Revealed (Clean Focused Card with Multi-Buy support)
                const multiInfo = getMultiUpgradeInfo(item, buyMultiplier, totalOps);
                const cost = multiInfo.totalCost;
                const canAfford = !isPaused && multiInfo.canAfford;
                const count = upgradeCounts[item.id] || 0;
                const progressPercent = Math.max(0, Math.min(100, (totalOps / Math.max(1, cost)) * 100));
                const isJustPurchased = recentPurchased === item.id;
                const IconComponent = item.icon;
                const hardwareMult = getHardwareMultiplier(item.id, purchasedSubUpgrades);
                const milestoneInfo = getNextHardwareMilestone(count);
                const milestoneMultiplier = milestoneInfo.currentMultiplier;
                const effectiveRateEach = item.opsIncrease * hardwareMult * milestoneMultiplier;
                const buyAmountLabel = multiInfo.isMax
                  ? `+${multiInfo.actualBuyCount} (MAX)`
                  : `+${multiInfo.countToBuy}`;

                return (
                  <div
                    key={item.id}
                    id={`upgrade-${item.id}`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredUpgrade({ item, rect, idx });
                    }}
                    onMouseLeave={() => setHoveredUpgrade(null)}
                    className={`upgrade-btn p-3.5 md:p-4 rounded-2xl transition-all select-none relative ${
                      isJustPurchased ? 'ring-2 ring-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,242,254,0.35)]' : ''
                    } ${
                      canAfford
                        ? 'bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-900 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                        : 'bg-slate-900/50 border border-slate-900/80 hover:border-slate-800'
                    }`}
                  >
                    {/* Card Main Row: Name and Buy Button are immediate focal points */}
                    <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                      {/* Left: Icon & Upgrade Name Header */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Icon */}
                        <div
                          style={{
                            borderColor: canAfford ? `${item.color}60` : `${item.color}30`,
                            backgroundColor: canAfford ? `${item.color}20` : `${item.color}0d`,
                            color: canAfford ? item.color : '#94a3b8'
                          }}
                          className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all ${
                            canAfford ? 'shadow-[0_0_10px_rgba(0,242,254,0.2)]' : ''
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* Title, Badges, and Passive Rate */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm md:text-base font-display tracking-wide text-white">
                              {item.name}
                            </h3>
                            {count > 0 && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-cyan-300 font-bold">
                                LVL {count}
                              </span>
                            )}
                            {hardwareMult > 1 && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-950 text-purple-300 font-bold">
                                {hardwareMult}x FIRMWARE
                              </span>
                            )}
                          </div>

                          {/* Primary Positive Yield */}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                              +{formatOps(effectiveRateEach)} OPS/s
                            </span>
                            {count > 0 && (
                              <span className="text-[10px] font-mono text-slate-500">
                                (+{formatOps(effectiveRateEach * count)}/s total)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Integrated High-Contrast Focal Buy Button */}
                      <div className="flex flex-col items-end flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canAfford) buyUpgrade(item);
                          }}
                          disabled={!canAfford}
                          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 select-none min-w-[145px] ${
                            canAfford
                              ? 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 shadow-[0_0_20px_rgba(0,242,254,0.4)] active:scale-95 cursor-pointer font-black'
                              : 'bg-slate-950 text-slate-500 cursor-not-allowed opacity-80'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${canAfford ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                              {buyAmountLabel}
                            </span>
                            <Zap className={`w-3.5 h-3.5 ${canAfford ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
                            <span className={`text-sm font-extrabold ${canAfford ? 'text-slate-950' : 'text-amber-400'}`}>{formatOps(cost)}</span>
                            <span className="text-[10px] opacity-80 font-mono">OPS</span>
                          </div>
                          {canAfford && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      </div>
                    </div>

                    {/* Accurate Real-Time Bottom Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-950 rounded-b-2xl overflow-hidden pointer-events-none">
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: canAfford ? '#00f2fe' : item.color,
                        }}
                        className={`h-full ${
                          canAfford
                            ? 'shadow-[0_0_10px_rgba(0,242,254,0.9)] opacity-100'
                            : 'opacity-70'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] text-slate-500 text-center font-mono">
              Auto-persisted to Local Storage
            </div>
          </div>
        </section>
      </main>

      {/* Installed Mods Gallery Modal */}
      {showInstalledModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold font-display text-white">
                  INSTALLED FIRMWARE & OVERCLOCK PROTOCOLS ({purchasedSubUpgrades.length} / {SUB_UPGRADES.length})
                </h3>
              </div>
              <button
                onClick={() => setShowInstalledModal(false)}
                className="text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            {purchasedSubUpgrades.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {purchasedSubUpgrades.map((subId) => {
                  const sub = SUB_UPGRADES.find((s) => s.id === subId);
                  if (!sub) return null;
                  const SubIcon = sub.icon;

                  return (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 flex items-start gap-3"
                    >
                      <div
                        style={{ color: sub.color, borderColor: `${sub.color}50`, backgroundColor: `${sub.color}15` }}
                        className="w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0"
                      >
                        <SubIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs text-white font-display truncate">{sub.name}</h4>
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                            {sub.multiplier}x BOOST
                          </span>
                        </div>
                        <p className="text-[10px] text-purple-200/90 font-mono mt-0.5">
                          {sub.description}
                        </p>
                        <div className="text-[9px] text-slate-400 font-mono mt-1">
                          Target: {sub.targetName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">
                No firmware sub-upgrades purchased yet. Discover them in the Research tray above!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restart Confirmation Modal */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <ShieldAlert className="w-7 h-7" />
              <h3 className="text-lg font-bold font-display text-white">CONFIRM SYSTEM PURGE</h3>
            </div>
            <p className="text-xs text-slate-300 font-mono mb-6 leading-relaxed">
              Purging all synthesized Ops, acquired hardware modules, and research overclocks will reset the Silicon Empire to initial state. Are you sure you want to reboot the system?
            </p>
            <div className="flex items-center justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
              >
                ABORT
              </button>
              <button
                onClick={restartGame}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer"
              >
                PURGE & REBOOT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu Modal Overlay */}
      {isPaused && (
        <div
          id="pauseOverlay"
          className="pause-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
        >
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(0,242,254,0.3)] relative overflow-hidden">
            
            {/* Glowing Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400"></div>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-400/50 mx-auto flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_15px_rgba(0,242,254,0.4)]">
                <Pause className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-display tracking-wider text-slate-100">
                SYSTEM PAUSED
              </h2>
              <p className="text-xs font-mono text-cyan-400/80 mt-1">
                Fabrication clock cycles suspended
              </p>
            </div>

            {/* Diagnostics Stats Summary */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-4 font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Stored Silicon Ops:</span>
                <strong className="text-cyan-300">{formatOps(totalOps)}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Throughput Rate:</span>
                <strong className="text-emerald-300">+{formatRate(opsPerSecond)} /sec</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Manual Syntheses:</span>
                <strong className="text-slate-200">{clickCount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Installed Protocols:</span>
                <strong className="text-purple-300">{purchasedSubUpgrades.length} / {SUB_UPGRADES.length}</strong>
              </div>
            </div>

            {/* Audio Tip Banner */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 mb-5 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px]">Audio & SFX controls are available in the top bar.</span>
              </div>
              <span className="text-[11px] text-purple-300 font-bold">
                {isMusicMuted || musicVolume === 0 ? 'MUTED' : `${Math.round(musicVolume * 100)}%`}
              </span>
            </div>

            {/* Actions */}
            {!showRestartConfirm ? (
              <div className="flex flex-col gap-3">
                <button
                  id="resume-btn"
                  onClick={resumeGame}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:shadow-[0_0_25px_rgba(0,242,254,0.6)] transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>RESUME FABRICATION</span>
                </button>

                <button
                  id="restart-prompt-btn"
                  onClick={() => setShowRestartConfirm(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-300 border border-slate-700 hover:border-red-500/50 text-slate-300 font-mono text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>PURGE & RESTART SYSTEM</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>CONFIRM MEMORY PURGE?</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  This will reset all Silicon Ops, hardware upgrades, and research overclocks permanently.
                </p>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={restartGame}
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  >
                    YES, RESTART
                  </button>
                  <button
                    onClick={() => setShowRestartConfirm(false)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-all cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unclipped High-Visibility Tooltip Portal for Research & Firmware Overclocks */}
      {hoveredSub && (
        <div
          id="active-sub-upgrade-tooltip"
          style={{
            position: 'fixed',
            left: `${Math.min(window.innerWidth - 340, Math.max(16, hoveredSub.rect.left + hoveredSub.rect.width / 2 - 160))}px`,
            top: hoveredSub.rect.top > 250
              ? `${hoveredSub.rect.top - 10}px`
              : `${hoveredSub.rect.bottom + 10}px`,
            transform: hoveredSub.rect.top > 250 ? 'translateY(-100%)' : 'translateY(0)',
          }}
          className="w-72 sm:w-80 pointer-events-none z-[100] p-4 rounded-xl bg-slate-950/95 border-2 border-purple-500/80 shadow-[0_0_40px_rgba(0,0,0,0.95),0_0_25px_rgba(168,85,247,0.45)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                style={{
                  borderColor: `${hoveredSub.sub.color}80`,
                  backgroundColor: `${hoveredSub.sub.color}25`,
                  color: hoveredSub.sub.color,
                }}
                className="w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0"
              >
                {(() => {
                  const Icon = hoveredSub.sub.icon;
                  return <Icon className="w-3.5 h-3.5" />;
                })()}
              </div>
              <span className="font-bold text-xs md:text-sm text-white font-display truncate">
                {hoveredSub.sub.name}
              </span>
            </div>
            <span className="text-[9px] font-mono text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-950/90 border border-purple-700/60 uppercase flex-shrink-0">
              FIRMWARE MOD
            </span>
          </div>

          {/* Description / Boost */}
          <div className="text-xs text-purple-200 font-mono font-bold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span>{hoveredSub.sub.description}</span>
          </div>

          {/* Flavor Lore */}
          <p className="text-[11px] text-slate-300 font-mono leading-relaxed mb-2.5 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
            {hoveredSub.sub.lore}
          </p>

          {/* Target & Cost Footer */}
          <div className="pt-2 border-t border-slate-800/90 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              Target: <strong className="text-slate-200">{hoveredSub.sub.targetName}</strong>
            </span>
            <span
              className={
                !isPaused && totalOps >= hoveredSub.sub.cost
                  ? 'text-amber-300 font-bold flex items-center gap-1'
                  : 'text-slate-400 font-bold flex items-center gap-1'
              }
            >
              <Zap className="w-3 h-3 text-amber-400" />
              {formatOps(hoveredSub.sub.cost)} OPS
            </span>
          </div>
        </div>
      )}

      {/* Unclipped High-Visibility Tooltip Portal for Hardware Upgrades */}
      {hoveredUpgrade && (() => {
        const item = hoveredUpgrade.item;
        const idx = hoveredUpgrade.idx;
        const multiInfo = getMultiUpgradeInfo(item, buyMultiplier, totalOps);
        const cost = multiInfo.totalCost;
        const canAfford = !isPaused && multiInfo.canAfford;
        const count = upgradeCounts[item.id] || 0;
        const buyAmount = multiInfo.isMax ? multiInfo.actualBuyCount : multiInfo.countToBuy;
        const progressPercent = Math.min(100, (totalOps / Math.max(1, cost)) * 100);
        const hardwareMult = getHardwareMultiplier(item.id, purchasedSubUpgrades);
        const milestoneInfo = getNextHardwareMilestone(count);
        const milestoneMultiplier = milestoneInfo.currentMultiplier;
        const effectiveRateEach = item.opsIncrease * hardwareMult * milestoneMultiplier;
        const IconComponent = item.icon;

        return (
          <div
            id="active-hardware-upgrade-tooltip"
            style={{
              position: 'fixed',
              left: `${Math.min(window.innerWidth - 380, Math.max(16, hoveredUpgrade.rect.left + hoveredUpgrade.rect.width / 2 - 180))}px`,
              top: hoveredUpgrade.rect.top > 320
                ? `${hoveredUpgrade.rect.top - 10}px`
                : `${hoveredUpgrade.rect.bottom + 10}px`,
              transform: hoveredUpgrade.rect.top > 320 ? 'translateY(-100%)' : 'translateY(0)',
            }}
            className="w-80 sm:w-96 pointer-events-none z-[100] p-4 rounded-xl bg-slate-950/95 border-2 border-cyan-500/80 shadow-[0_0_45px_rgba(0,0,0,0.95),0_0_25px_rgba(0,242,254,0.4)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  style={{
                    borderColor: `${item.color}80`,
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                  }}
                  className="w-7 h-7 rounded-md border flex items-center justify-center flex-shrink-0"
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white font-display truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-700/80 uppercase flex-shrink-0">
                Tier {idx < 9 ? `0${idx + 1}` : `${idx + 1}`} {count > 0 ? `// LVL ${count}` : ''}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed mb-3 font-mono bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80">
              {item.description}
            </p>

            {/* Live Metrics Grid */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1.5 mb-2.5">
              <div className="flex justify-between items-center gap-2 text-slate-400">
                <span className="whitespace-nowrap">Base Unit Output:</span>
                <strong className="text-emerald-400 whitespace-nowrap">+{item.opsIncrease}.00 OPS/s</strong>
              </div>
              <div className="flex justify-between items-center gap-2 text-slate-400">
                <span className="whitespace-nowrap">Firmware Multiplier:</span>
                <strong className={`whitespace-nowrap ${hardwareMult > 1 ? 'text-purple-300' : 'text-slate-300'}`}>
                  {hardwareMult}x Multiplier
                </strong>
              </div>
              <div className="flex justify-between items-center gap-2 text-slate-400">
                <span className="whitespace-nowrap">Milestone Bonus:</span>
                <strong className={`whitespace-nowrap ${milestoneMultiplier > 1 ? 'text-amber-300' : 'text-slate-300'}`}>
                  {milestoneMultiplier}x Multiplier
                </strong>
              </div>
              <div className="flex justify-between items-center gap-2 text-slate-400">
                <span className="whitespace-nowrap">Next Milestone:</span>
                <strong className={`whitespace-nowrap ${milestoneInfo.isMax ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
                  {milestoneInfo.isMax ? `Maxed (${count} / 500)` : `${count} / ${milestoneInfo.nextMilestone}`}
                </strong>
              </div>
              <div className="flex justify-between items-center gap-2 text-slate-400">
                <span className="whitespace-nowrap">Current Total Output:</span>
                <strong className="text-emerald-300 font-bold whitespace-nowrap">
                  +{formatOps(effectiveRateEach * count)} OPS/s
                </strong>
              </div>
              <div className="flex justify-between items-center gap-2 text-slate-400 pt-1 border-t border-slate-800/70">
                <span className="whitespace-nowrap">Output After Buying (+{buyAmount}):</span>
                {(() => {
                  const nextCount = count + (buyAmount || 1);
                  const nextMilestoneMultiplier = getHardwareMilestoneMultiplier(nextCount);
                  const nextEffectiveRateEach = item.opsIncrease * hardwareMult * nextMilestoneMultiplier;
                  return (
                    <strong className="text-cyan-300 font-bold whitespace-nowrap">
                      +{formatOps(nextEffectiveRateEach * nextCount)} OPS/s
                    </strong>
                  );
                })()}
              </div>
            </div>

            {/* Cost & Deficit Footer */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Cost ({buyMultiplier === 'max' ? `${buyAmount}x MAX` : `${buyMultiplier}x`}): <strong className={canAfford ? 'text-amber-300' : 'text-slate-300'}>{formatOps(cost)} OPS</strong>
              </span>
              {!canAfford && (
                <span className="text-amber-400 font-bold text-[11px]">
                  Need +{formatOps(cost - totalOps)} OPS ({Math.floor(progressPercent)}%)
                </span>
              )}
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* QUANTUM FOUNDRY PRESTIGE MODAL */}
      {/* ========================================================================= */}
      {showQuantumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            id="quantum-foundry-modal"
            className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-purple-500/80 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.35)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-950/90 border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <Atom className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold tracking-wide text-white font-display">
                      QUANTUM FOUNDRY REBIRTH
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-600/60 uppercase">
                      Sub-Atomic Matrix
                    </span>
                  </div>
                  <p className="text-xs text-purple-300/80 font-mono">
                    Soft-Reset Reality // Harness Quantum Wafers for Permanent Omnipresent Overclocks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Banked Q-Wafer Balance Indicator */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/50 font-mono text-xs text-purple-200">
                  <Disc className="w-4 h-4 text-cyan-400" />
                  <span>Banked: <strong className="text-white">{qWafers}</strong> Q-Wafers</span>
                </div>

                <button
                  id="close-quantum-modal-btn"
                  onClick={() => {
                    setShowQuantumModal(false);
                    playCyberSound('click');
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-2 flex-wrap">
              <button
                id="quantum-tab-reactor"
                onClick={() => {
                  setQuantumModalTab('rebirth');
                  playCyberSound('click');
                }}
                className={`pb-3 px-4 font-mono text-xs font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  quantumModalTab === 'rebirth'
                    ? 'border-purple-400 text-purple-300 shadow-[0_2px_10px_rgba(168,85,247,0.4)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Atom className="w-4 h-4" />
                <span>QUANTUM REACTOR CORE</span>
              </button>

              <button
                id="quantum-tab-perks"
                onClick={() => {
                  setQuantumModalTab('perks');
                  playCyberSound('click');
                }}
                className={`pb-3 px-4 font-mono text-xs font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  quantumModalTab === 'perks'
                    ? 'border-cyan-400 text-cyan-300 shadow-[0_2px_10px_rgba(0,242,254,0.4)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CircuitBoard className="w-4 h-4" />
                <span>QUANTUM RESEARCH LAB ({quantumPerks.length}/{QUANTUM_PERKS.length})</span>
              </button>

              <button
                id="quantum-tab-sink"
                onClick={() => {
                  setQuantumModalTab('sink');
                  playCyberSound('click');
                }}
                className={`pb-3 px-4 font-mono text-xs font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  quantumModalTab === 'sink'
                    ? 'border-amber-400 text-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>FLUX RESONATOR (LVL {quantumFluxLevel})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {quantumModalTab === 'rebirth' ? (
                <div className="space-y-6">
                  {/* Top Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Lifetime Ops */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">Lifetime Silicon Yield</span>
                      <div className="flex items-baseline gap-1.5 my-1">
                        <span className="text-xl md:text-2xl font-bold font-mono text-white">
                          {formatOps(lifetimeOps)}
                        </span>
                        <span className="text-xs text-cyan-400 font-mono font-semibold">OPS</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Across all quantum cycles</span>
                    </div>

                    {/* Banked Q-Wafers & Boost */}
                    <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 flex flex-col justify-between">
                      <span className="text-[11px] font-mono text-purple-300 uppercase">Stored Quantum Wafers</span>
                      <div className="flex items-baseline gap-1.5 my-1">
                        <span className="text-xl md:text-2xl font-bold font-mono text-purple-200">
                          {qWafers}
                        </span>
                        <span className="text-xs text-purple-400 font-mono font-semibold">WAFERS</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        +{((getQuantumWaferMultiplier() - 1) * 100).toFixed(0)}% Permanent OPS Boost
                      </span>
                    </div>

                    {/* Rebirth Cycles */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">Quantum Cycles Completed</span>
                      <div className="flex items-baseline gap-1.5 my-1">
                        <span className="text-xl md:text-2xl font-bold font-mono text-cyan-300">
                          {rebirthCount}
                        </span>
                        <span className="text-xs text-cyan-400/80 font-mono font-semibold">REBIRTHS</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {totalQWafersClaimed} Total Wafers Fabricated
                      </span>
                    </div>
                  </div>

                  {/* Central Rebirth Singularity Console */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950 border border-purple-500/50 shadow-inner flex flex-col items-center text-center relative overflow-hidden">
                    {/* Glowing Singularity Core Orb */}
                    <div className="relative my-4 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-purple-600/20 border-2 border-purple-400/60 animate-ping absolute"></div>
                      <div className="w-20 h-20 rounded-full bg-cyan-600/20 border border-cyan-400/50 animate-pulse absolute"></div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.8)] z-10">
                        <Atom className="w-9 h-9 animate-spin-slow text-white" />
                      </div>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-white font-display mb-1">
                      {isPrestigeUnlocked ? 'QUANTUM EXTRACTION READY' : 'QUANTUM FOUNDRY DORMANT'}
                    </h3>

                    {/* Progress / Yield Status */}
                    {isPrestigeUnlocked ? (
                      <div className="w-full max-w-lg space-y-4 my-2">
                        {/* Claimable Box */}
                        <div className="p-4 rounded-xl bg-purple-950/70 border border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.25)] flex flex-col items-center gap-1">
                          <span className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
                            Claimable On Rebirth
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold font-mono text-cyan-300">
                              +{claimableWafers}
                            </span>
                            <span className="text-sm font-mono text-purple-200 font-bold">
                              QUANTUM WAFERS
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-400">
                            (+{(claimableWafers * (hasQuantumPerk('perk-catalyst') ? 3 : 2))}% additional passive OPS boost)
                          </span>
                        </div>

                        {/* Progress to next wafer */}
                        <div className="space-y-1.5 text-left font-mono">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>Progress to next wafer:</span>
                            <span className="text-purple-300 font-bold">
                              {formatOps(lifetimeOps)} / {formatOps(nextWaferCost)} OPS ({Math.floor(waferProgressPercent)}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${waferProgressPercent}%` }}
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                            />
                          </div>
                        </div>

                        {/* Rebirth Trigger Button */}
                        <button
                          id="initiate-rebirth-prompt-btn"
                          disabled={claimableWafers <= 0}
                          onClick={() => {
                            setShowRebirthConfirmModal(true);
                            playCyberSound('click');
                          }}
                          className={`w-full py-3.5 px-6 rounded-xl font-mono font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            claimableWafers > 0
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.7)]'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <RefreshCw className={`w-4 h-4 ${claimableWafers > 0 ? 'animate-spin-slow' : ''}`} />
                          <span>
                            {claimableWafers > 0
                              ? `INITIATE QUANTUM REBIRTH (+${claimableWafers} WAFERS)`
                              : 'SYNTHESIZE MORE OPS TO EXTRACT WAFERS'}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full max-w-md space-y-4 my-2 font-mono">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          The Quantum Singularity requires <strong className="text-cyan-400">50,000,000 Lifetime Ops</strong> to breach the sub-atomic barrier and begin harvesting Quantum Wafers.
                        </p>
                        <div className="space-y-1.5 text-left">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>Sub-Atomic Threshold:</span>
                            <span className="text-cyan-300 font-bold">
                              {formatOps(lifetimeOps)} / 50.00M OPS ({Math.floor(waferProgressPercent)}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${waferProgressPercent}%` }}
                              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary Matrix of Resets vs Persists */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-left font-mono text-xs">
                      <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-1">
                        <div className="text-rose-400 font-bold flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5" />
                          <span>WHAT RESETS ON REBIRTH</span>
                        </div>
                        <ul className="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
                          <li>Current Silicon Ops balance (set to 0)</li>
                          <li>Hardware upgrade levels & counts</li>
                          <li>Standard Firmware sub-upgrades</li>
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                        <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>WHAT REMAINS PERMANENT</span>
                        </div>
                        <ul className="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
                          <li>All banked & newly claimed Quantum Wafers</li>
                          <li>All purchased Quantum Lab Meta-Perks</li>
                          <li>Lifetime Silicon yield statistics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : quantumModalTab === 'perks' ? (
                /* Quantum Research Lab (Meta-Perks Tree) */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
                    <div>
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>QUANTUM META-RESEARCH LAB</span>
                      </div>
                      <p className="text-[11px] text-purple-300/80">
                        Purchase permanent enhancements that persist across all future Quantum Rebirth cycles.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-purple-400/50 text-xs">
                      <Disc className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300">Available: <strong className="text-white">{qWafers}</strong> Q-Wafers</span>
                    </div>
                  </div>

                  {/* Perks Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {QUANTUM_PERKS.map((perk) => {
                      const currentLevel = getPerkLevel(perk.id);
                      const isMax = currentLevel >= perk.maxLevel;
                      const isOwned = currentLevel > 0;
                      const nextCost = !isMax ? perk.costs[currentLevel] : 0;
                      const reqPerk = perk.reqPerkId ? QUANTUM_PERKS.find((p) => p.id === perk.reqPerkId) : null;
                      const isPrereqMet = !perk.reqPerkId || getPerkLevel(perk.reqPerkId) > 0;
                      const canAfford = !isMax && isPrereqMet && qWafers >= nextCost;
                      const IconComponent = perk.icon;

                      return (
                        <div
                          key={perk.id}
                          id={`quantum-perk-${perk.id}`}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            isMax
                              ? 'bg-purple-950/30 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                              : isOwned
                              ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.1)]'
                              : canAfford
                              ? 'bg-slate-950/80 border-slate-700 hover:border-cyan-400/70 shadow-md'
                              : 'bg-slate-950/50 border-slate-800/80 opacity-70'
                          }`}
                        >
                          <div>
                            {/* Header */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  style={{
                                    backgroundColor: `${perk.color}20`,
                                    borderColor: `${perk.color}60`,
                                    color: perk.color,
                                  }}
                                  className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0"
                                >
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-white font-display flex items-center gap-2">
                                    <span>{perk.name}</span>
                                  </h4>
                                  <span className="text-[10px] font-mono text-purple-300 uppercase">
                                    Permanent Meta-Upgrade
                                  </span>
                                </div>
                              </div>

                              {/* Level Badge */}
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                                  isMax
                                    ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                                    : isOwned
                                    ? 'bg-cyan-950 border-cyan-500/50 text-cyan-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}>
                                  LVL {currentLevel}/{perk.maxLevel}
                                </span>
                                {/* Mini Level Pip Progress */}
                                <div className="flex gap-1">
                                  {Array.from({ length: perk.maxLevel }).map((_, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-2 h-1 rounded-sm ${
                                        idx < currentLevel
                                          ? isMax
                                            ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                                            : 'bg-cyan-400 shadow-[0_0_4px_rgba(0,242,254,0.6)]'
                                          : 'bg-slate-800'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-200 font-mono font-semibold mb-1">
                              {perk.getDescription(currentLevel || 1)}
                            </p>

                            {/* Next Level Preview if upgradeable */}
                            {!isMax && currentLevel > 0 && (
                              <p className="text-[11px] font-mono text-cyan-400/90 mb-2">
                                Next Level: {perk.getDescription(currentLevel + 1)}
                              </p>
                            )}

                            {/* Lore */}
                            <p className="text-[11px] text-slate-400 font-mono leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 mb-3 mt-1">
                              {perk.lore}
                            </p>

                            {/* Prerequisite Indicator if locked */}
                            {!isOwned && !isPrereqMet && reqPerk && (
                              <div className="text-[11px] font-mono text-amber-400/90 bg-amber-950/30 border border-amber-500/30 px-2.5 py-1.5 rounded-lg mb-3 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Prerequisite: <strong>{reqPerk.name}</strong></span>
                              </div>
                            )}
                          </div>

                          {/* Purchase / Upgrade Button */}
                          {!isMax ? (
                            <button
                              id={`buy-perk-${perk.id}`}
                              disabled={!canAfford}
                              onClick={() => buyQuantumPerk(perk)}
                              className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                canAfford
                                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              }`}
                            >
                              <Atom className="w-3.5 h-3.5" />
                              <span>
                                {!isPrereqMet && reqPerk
                                  ? `REQUIRES ${reqPerk.name.toUpperCase()}`
                                  : canAfford
                                  ? currentLevel === 0
                                    ? `RESEARCH PERK (${nextCost} WAFERS)`
                                    : `UPGRADE TO LVL ${currentLevel + 1} (${nextCost} WAFERS)`
                                  : `NEED ${nextCost} Q-WAFERS (LVL ${currentLevel + 1})`}
                              </span>
                            </button>
                          ) : (
                            <div className="w-full py-1.5 px-3 rounded-lg bg-purple-950/60 border border-purple-500/40 text-center font-mono text-[11px] text-purple-300 font-bold flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>MAX LEVEL ACTIVE IN ALL CYCLES</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Quantum Flux Resonator (Infinite Quantum Wafer Sink) */
                <div className="space-y-6 font-mono">
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>QUANTUM FLUX RESONATOR // INFINITE WAFER SINK</span>
                      </div>
                      <p className="text-[11px] text-amber-300/80">
                        Overcharge the sub-atomic singularity with surplus Quantum Wafers for multiplicative global yield enhancements.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-amber-400/50 text-xs">
                      <Disc className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300">Banked: <strong className="text-white">{qWafers}</strong> Q-Wafers</span>
                    </div>
                  </div>

                  {/* Resonator Core Card */}
                  <div className="p-6 rounded-2xl bg-slate-950/80 border-2 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col items-center text-center relative overflow-hidden">
                    <div className="relative my-3 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-amber-600/20 border-2 border-amber-400/60 animate-ping absolute"></div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.7)] z-10">
                        <Zap className="w-8 h-8 fill-current" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white font-display mb-1">
                      RESONATOR LEVEL: <span className="text-amber-400">{quantumFluxLevel}</span>
                    </h3>
                    <p className="text-xs text-amber-300/90 mb-4 max-w-md">
                      Current Multiplier: <strong className="text-emerald-400 text-sm">+{quantumFluxLevel * 10}% OPS BOOST</strong> (×{(1 + quantumFluxLevel * 0.1).toFixed(2)})
                    </p>

                    <div className="w-full max-w-md p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs text-left mb-5">
                      <div className="flex justify-between text-slate-400">
                        <span>Next Upgrade Yield Boost:</span>
                        <strong className="text-cyan-300">+10% Multiplicative Output</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Cost for Level {quantumFluxLevel + 1}:</span>
                        <strong className={qWafers >= getQuantumFluxCost(quantumFluxLevel) ? 'text-amber-400' : 'text-slate-500'}>
                          {getQuantumFluxCost(quantumFluxLevel)} Quantum Wafers
                        </strong>
                      </div>
                    </div>

                    <button
                      id="buy-quantum-flux-btn"
                      disabled={qWafers < getQuantumFluxCost(quantumFluxLevel)}
                      onClick={buyQuantumFluxLevel}
                      className={`w-full max-w-md py-3.5 px-6 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        qWafers >= getQuantumFluxCost(quantumFluxLevel)
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] font-black'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>
                        {qWafers >= getQuantumFluxCost(quantumFluxLevel)
                          ? `OVERCHARGE RESONATOR (${getQuantumFluxCost(quantumFluxLevel)} Q-WAFERS)`
                          : `NEED ${getQuantumFluxCost(quantumFluxLevel)} Q-WAFERS`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REBIRTH CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {showRebirthConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
          <div
            id="rebirth-confirm-modal"
            className="w-full max-w-md bg-slate-900 border-2 border-purple-500 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.5)] p-6 space-y-4 animate-in zoom-in-95 duration-150 font-mono"
          >
            <div className="flex items-center gap-3 text-purple-400 border-b border-purple-500/30 pb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500 flex items-center justify-center">
                <Atom className="w-6 h-6 animate-spin-slow text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white font-display">INITIATE QUANTUM REBIRTH?</h3>
                <p className="text-[11px] text-purple-300">Reality Phase Transition Protocol</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-500/50 text-center space-y-1">
              <span className="text-xs text-purple-300 uppercase">You will be awarded</span>
              <div className="text-3xl font-bold text-cyan-300">+{claimableWafers} Quantum Wafers</div>
              <span className="text-[11px] text-emerald-400 font-semibold">
                Permanent +{(claimableWafers * (hasQuantumPerk('perk-catalyst') ? 3 : 2))}% boost to all future synthesis
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your current OPS and hardware will reset to factory zero, but all banked Q-Wafers, Quantum Lab perks, and lifetime stats remain preserved forever.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                id="confirm-rebirth-btn"
                onClick={initiateQuantumRebirth}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all cursor-pointer"
              >
                WARP TIMELINE
              </button>
              <button
                id="cancel-rebirth-btn"
                onClick={() => setShowRebirthConfirmModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                ABORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REBIRTH WARP HYPERSPACE SCREEN VFX */}
      {/* ========================================================================= */}
      {isRebirthing && (
        <div
          id="rebirth-warp-overlay"
          className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300"
        >
          {/* Pulsing Quantum Hyperspace Portal */}
          <div className="relative flex items-center justify-center my-6">
            <div className="w-64 h-64 rounded-full border-4 border-cyan-400/50 animate-ping absolute"></div>
            <div className="w-48 h-48 rounded-full border-4 border-purple-500/70 animate-spin-slow absolute"></div>
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_80px_rgba(0,242,254,0.9)] animate-pulse">
              <Atom className="w-16 h-16 animate-spin-slow" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 tracking-widest mb-2 animate-pulse">
            QUANTUM SINGULARITY DETONATION
          </h2>
          <p className="text-xs md:text-sm font-mono text-cyan-300 max-w-md tracking-wider">
            RECONFIGURING SUB-ATOMIC SILICON CONSTANTS // COMPILING NEXT TIMELINE...
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFLINE SYNTHESIS MATRIX REPORT MODAL */}
      {/* ========================================================================= */}
      {offlineReport && offlineReport.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div
            id="offline-report-modal"
            className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/80 rounded-2xl shadow-[0_0_40px_rgba(0,242,254,0.35)] p-6 space-y-4 font-mono animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 text-cyan-400 border-b border-cyan-500/30 pb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.4)]">
                <Orbit className="w-6 h-6 animate-spin-slow text-cyan-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white font-display">OFFLINE MATRIX REPORT</h3>
                <p className="text-[11px] text-cyan-300/80">Quantum Entanglement Daemon Active</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              While you were disconnected for{' '}
              <strong className="text-white font-bold">
                {Math.floor(offlineReport.timeSec / 3600)}h {Math.floor((offlineReport.timeSec % 3600) / 60)}m {Math.floor(offlineReport.timeSec % 60)}s
              </strong>
              , your Offline Matrix simulated asynchronous synthesis at 50% efficiency:
            </p>

            <div className="p-4 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-center">
              <span className="text-[11px] text-cyan-300 uppercase">Fabricated While Offline</span>
              <div className="text-2xl md:text-3xl font-bold text-emerald-300 font-mono mt-0.5">
                +{formatOps(offlineReport.ops)} OPS
              </div>
            </div>

            <button
              id="claim-offline-ops-btn"
              onClick={() => {
                setOfflineReport(null);
                playCyberSound('research');
                saveGame();
              }}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(0,242,254,0.4)] cursor-pointer"
            >
              SYNC TO QUANTUM CORE
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING QUANTUM GLITCH EVENT PARTICLE */}
      {/* ========================================================================= */}
      {activeGlitch && (
        <div
          id="quantum-glitch-particle"
          onClick={handleGlitchClick}
          style={{
            position: 'fixed',
            left: `${activeGlitch.x}%`,
            top: `${activeGlitch.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="fixed z-50 cursor-pointer group flex flex-col items-center select-none"
        >
          <div className="relative flex items-center justify-center p-3.5 rounded-full bg-cyan-950/90 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,242,254,1),0_0_60px_rgba(168,85,247,0.7)] group-hover:scale-125 transition-transform">
            <Sparkles className="w-8 h-8 text-cyan-300 animate-spin-slow" />
            <div className="absolute -inset-1.5 rounded-full border-2 border-dashed border-purple-400 animate-ping pointer-events-none"></div>
            <div className="absolute -inset-3 rounded-full border border-cyan-400/40 animate-pulse pointer-events-none"></div>
          </div>
          <div className="mt-2 px-2.5 py-0.5 rounded-md bg-slate-950/95 border border-cyan-400 text-[10px] font-mono font-bold text-cyan-300 tracking-wider shadow-[0_0_15px_rgba(0,242,254,0.5)] flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400 animate-bounce" />
            <span>QUANTUM GLITCH! ({activeGlitch.remainingTime.toFixed(1)}s)</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GLITCH REWARD TOAST NOTIFICATION */}
      {/* ========================================================================= */}
      {glitchToast && (
        <div
          id="glitch-toast"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900/95 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] backdrop-blur-md max-w-sm animate-in slide-in-from-bottom-5 duration-200 font-mono"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-500 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 font-display uppercase tracking-wider">
                {glitchToast.title}
              </div>
              <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
                {glitchToast.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACHIEVEMENT UNLOCKED TOAST */}
      {/* ========================================================================= */}
      {achievementToast && (
        <div
          id="achievement-toast"
          className="fixed top-6 right-6 z-50 p-4 rounded-xl bg-slate-900/95 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.45)] backdrop-blur-md max-w-sm animate-in slide-in-from-top-5 duration-200 font-mono"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/90 border border-amber-400 flex items-center justify-center text-amber-300 flex-shrink-0">
              <Trophy className="w-6 h-6 animate-bounce text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                ACHIEVEMENT UNLOCKED (+1% OPS)
              </div>
              <div className="text-sm font-bold text-white font-display mt-0.5">
                {achievementToast.title}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {achievementToast.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SYSTEM STATISTICS & EFFICIENCY LEDGER MODAL */}
      {/* ========================================================================= */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            id="statistics-modal"
            className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-cyan-500/80 rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.35)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-mono"
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-950/90 border-b border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.4)]">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold tracking-wide text-white font-display">
                      SYSTEM TELEMETRY & EFFICIENCY LEDGER
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600/60 uppercase">
                      Live Telemetry
                    </span>
                  </div>
                  <p className="text-xs text-cyan-300/80">
                    Comprehensive analytical breakdown of silicon manufacturing operations & yield efficiency.
                  </p>
                </div>
              </div>

              <button
                id="close-statistics-modal-btn"
                onClick={() => {
                  setShowStatsModal(false);
                  playCyberSound('click');
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
              
              {/* SECTION 1: Chrono & Temporal Metrics */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <Timer className="w-4 h-4" />
                  <span>Chrono & Operational Time Metrics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-400 uppercase">Total System Uptime</span>
                    <div className="text-lg md:text-xl font-bold text-white font-mono mt-1">
                      {formatDuration(Date.now() - firstPlayTime)}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Since first activation</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-400 uppercase">Current Cycle Duration</span>
                    <div className="text-lg md:text-xl font-bold text-cyan-300 font-mono mt-1">
                      {formatDuration(Date.now() - runStartTime)}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Active run time</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-400 uppercase">Quantum Rebirths</span>
                    <div className="text-lg md:text-xl font-bold text-purple-300 font-mono mt-1">
                      {rebirthCount.toLocaleString()} Cycles
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Foundry resets performed</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Yield Distribution (Manual vs. Passive) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    <PieChart className="w-4 h-4" />
                    <span>Silicon Yield Breakdown (Manual vs. Passive)</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Lifetime Total: <strong className="text-emerald-400 font-bold">{formatOps(lifetimeOps)} OPS</strong>
                  </span>
                </div>

                {(() => {
                  const total = Math.max(1, lifetimeOps);
                  const manualPct = Math.min(100, Math.max(0, (lifetimeManualOps / total) * 100));
                  const passivePct = Math.min(100, Math.max(0, (lifetimePassiveOps / total) * 100));

                  return (
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                      {/* Visual Dual-Tone Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                            Manual Synthesis: {manualPct.toFixed(1)}% ({formatOps(lifetimeManualOps)} OPS)
                          </span>
                          <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                            Automated Synthesis: {passivePct.toFixed(1)}% ({formatOps(lifetimePassiveOps)} OPS)
                          </span>
                        </div>
                        
                        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                          <div
                            style={{ width: `${manualPct}%` }}
                            className="h-full bg-cyan-400 transition-all duration-300"
                            title={`Manual: ${manualPct.toFixed(1)}%`}
                          />
                          <div
                            style={{ width: `${passivePct}%` }}
                            className="h-full bg-emerald-400 transition-all duration-300"
                            title={`Passive: ${passivePct.toFixed(1)}%`}
                          />
                        </div>
                      </div>

                      {/* Manual & Click Diagnostics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Total Manual Clicks</span>
                          <span className="text-sm font-bold text-white font-mono">{clickCount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Avg Ops / Tap</span>
                          <span className="text-sm font-bold text-cyan-300 font-mono">
                            {clickCount > 0 ? formatOps(lifetimeManualOps / clickCount) : '0'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Base Tap Power</span>
                          <span className="text-sm font-bold text-amber-300 font-mono">
                            {formatOps(getEffectiveClickPower())} OPS
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Crit Strike Rate</span>
                          <span className="text-sm font-bold text-red-400 font-mono">
                            {(getCritChance() * 100).toFixed(1)}% (5x Multiplier)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SECTION 3: Hardware Efficiency & Top Earner Analysis */}
              <div className="space-y-3">
                {(() => {
                  // Calculate each hardware item's current effective rate
                  const hardwareStats = UPGRADES.map((item) => {
                    const count = upgradeCounts[item.id] || 0;
                    const subMult = getHardwareMultiplier(item.id, purchasedSubUpgrades);
                    const milestoneInfo = getNextHardwareMilestone(count);
                    const itemRateEach = item.opsIncrease * subMult * milestoneInfo.currentMultiplier;
                    const totalTierRate = count * itemRateEach;
                    return {
                      item,
                      count,
                      subMult,
                      milestoneInfo,
                      itemRateEach,
                      totalTierRate,
                    };
                  });

                  const totalBaseHardwareRate = hardwareStats.reduce((sum, h) => sum + h.totalTierRate, 0);
                  const activeHardware = hardwareStats.filter((h) => h.count > 0);
                  const topEarner = activeHardware.reduce<typeof hardwareStats[0] | null>(
                    (max, cur) => (!max || cur.totalTierRate > max.totalTierRate ? cur : max),
                    null
                  );

                  return (
                    <>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                          <Cpu className="w-4 h-4" />
                          <span>Hardware Efficiency & Production Share</span>
                        </div>
                        {topEarner && totalBaseHardwareRate > 0 && (
                          <span className="text-xs font-mono text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-500/40 font-bold">
                            Top Earner: {topEarner.item.name} ({((topEarner.totalTierRate / totalBaseHardwareRate) * 100).toFixed(1)}% of output)
                          </span>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                        {activeHardware.length === 0 ? (
                          <div className="text-center py-6 text-slate-500 text-xs font-mono">
                            No hardware units deployed yet in current cycle.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeHardware
                              .sort((a, b) => b.totalTierRate - a.totalTierRate)
                              .map(({ item, count, subMult, milestoneInfo, totalTierRate }) => {
                                const sharePct = totalBaseHardwareRate > 0 ? (totalTierRate / totalBaseHardwareRate) * 100 : 0;
                                const IconComponent = item.icon;

                                return (
                                  <div key={item.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div
                                          style={{ color: item.color, backgroundColor: `${item.color}15`, borderColor: `${item.color}40` }}
                                          className="w-6 h-6 rounded border flex items-center justify-center flex-shrink-0"
                                        >
                                          <IconComponent className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-white">{item.name}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">x{count}</span>
                                        {milestoneInfo.currentMultiplier > 1 && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600/50">
                                            {milestoneInfo.currentMultiplier}x Milestone
                                          </span>
                                        )}
                                        {subMult > 1 && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-600/50">
                                            {subMult}x Firmware
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-3 font-mono">
                                        <span className="text-emerald-400 font-bold">
                                          +{formatOps(totalTierRate)}/s
                                        </span>
                                        <span className="text-slate-400 text-[11px] w-12 text-right">
                                          {sharePct.toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>

                                    {/* Share mini-bar */}
                                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                      <div
                                        style={{ width: `${sharePct}%`, backgroundColor: item.color }}
                                        className="h-full transition-all duration-300"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* SECTION 4: Quantum & Meta Telemetry */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <Atom className="w-4 h-4" />
                  <span>Quantum Matrix & Multiplier Diagnostics</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Golden Glitches</span>
                    <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">
                      {glitchesCaught.toLocaleString()} Intercepted
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Q-Wafers Banked</span>
                    <span className="text-sm font-bold text-purple-300 font-mono mt-0.5 block">
                      {qWafers} (+{((getQuantumWaferMultiplier() - 1) * 100).toFixed(0)}%)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Flux Resonator</span>
                    <span className="text-sm font-bold text-cyan-300 font-mono mt-0.5 block">
                      LVL {quantumFluxLevel} (+{quantumFluxLevel * 10}%)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Achievement Boost</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                      +{unlockedAchievements.length}% Global
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACHIEVEMENTS MODAL */}
      {/* ========================================================================= */}
      {showAchievementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            id="achievements-modal"
            className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-mono"
          >
            {/* Header */}
            <div className="p-5 bg-slate-950/90 border-b border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold tracking-wide text-white font-display">
                      SYSTEM ACHIEVEMENTS
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/60 uppercase">
                      +{unlockedAchievements.length}% Global Yield
                    </span>
                  </div>
                  <p className="text-xs text-amber-300/80">
                    Each acquired achievement permanently increases total computational Ops synthesis by +1%.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/50 text-xs text-amber-200">
                  Unlocked: <strong className="text-white">{unlockedAchievements.length}</strong> / {ACHIEVEMENTS.length} ({Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%)
                </div>
                <button
                  id="close-achievements-modal-btn"
                  onClick={() => {
                    setShowAchievementsModal(false);
                    playCyberSound('click');
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-2 overflow-x-auto">
              {(['all', 'clicks', 'ops', 'rebirth', 'glitch', 'hardware'] as const).map((cat) => {
                const count = ACHIEVEMENTS.filter((a) => cat === 'all' || a.category === cat).length;
                const unlocked = ACHIEVEMENTS.filter((a) => (cat === 'all' || a.category === cat) && unlockedAchievements.includes(a.id)).length;
                const isSelected = achievementCategory === cat;

                return (
                  <button
                    key={cat}
                    id={`achievement-tab-${cat}`}
                    onClick={() => {
                      setAchievementCategory(cat);
                      playCyberSound('click');
                    }}
                    className={`pb-3 px-3 text-xs font-bold tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap uppercase ${
                      isSelected
                        ? 'border-amber-400 text-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {unlocked}/{count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Achievements Grid */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACHIEVEMENTS.filter((ach) => achievementCategory === 'all' || ach.category === achievementCategory).map((ach) => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);
                  const Icon = ach.icon;
                  const currentProg = ach.getCurrentProgress({
                    lifetimeOps,
                    clickCount,
                    rebirthCount,
                    upgradeCounts,
                    purchasedSubUpgrades,
                    qWafers,
                    quantumPerks,
                    quantumFluxLevel,
                    glitchesCaught,
                  });
                  const progPercent = Math.min(100, Math.max(0, (currentProg / ach.targetCount) * 100));

                  return (
                    <div
                      key={ach.id}
                      id={`achievement-card-${ach.id}`}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        isUnlocked
                          ? 'bg-amber-950/25 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              style={{
                                backgroundColor: isUnlocked ? `${ach.color}25` : '#1e293b',
                                borderColor: isUnlocked ? `${ach.color}70` : '#334155',
                                color: isUnlocked ? ach.color : '#64748b',
                              }}
                              className="w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0"
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className={`font-bold text-sm font-display ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                                {ach.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 uppercase">
                                Category: {ach.category}
                              </span>
                            </div>
                          </div>

                          {isUnlocked ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 border border-emerald-500/60 text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              ACQUIRED (+1% OPS)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 border border-slate-800 text-slate-500 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              LOCKED
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                          {ach.description}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      {!isUnlocked && (
                        <div className="space-y-1 pt-2 border-t border-slate-800/60 text-[11px]">
                          <div className="flex justify-between text-slate-400">
                            <span>Progress:</span>
                            <span className="text-amber-300 font-bold">
                              {ach.category === 'ops' ? formatOps(currentProg) : currentProg.toLocaleString()} / {ach.category === 'ops' ? formatOps(ach.targetCount) : ach.targetCount.toLocaleString()} ({Math.floor(progPercent)}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${progPercent}%` }}
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
