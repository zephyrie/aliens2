// Aliens: Fireteam Elite 2 — build guide data
// Compiled from community build videos published 2026-08-01 .. 2026-09-01.
// Game launched 2026-08-25, so everything here is first-week meta.

window.GUIDE = window.GUIDE || {};

GUIDE.game = {
  title: 'Aliens: Fireteam Elite 2',
  launched: '2026-08-25',
  compiled: '2026-09-01',
  facts: [
    ['Classes', 'Six: Duelist, Marauder, Machinist, Hunter, Medic, and Specialist. Each levels separately to 10.'],
    ['Perk board', '42 perk slots, up from 32 in the first game.'],
    ['Signature weapon', 'Every class now carries a signature weapon slot tied to that class.'],
    ['Squad size', 'Four players, up from three. Cross-platform co-op and voice chat.'],
    ['Friendly fire', 'Switches on at Intense difficulty and above. Sentry turrets are exempt — they never deal friendly-fire damage.'],
    ['No revives at launch', 'You can pick up a downed teammate, but a fully dead player spectates until the mission ends. The devs confirmed resurrection did not make the launch feature set.'],
    ['Specialist unlock', 'Level any two classes to 2 to unlock Specialist. Abilities must be unlocked on their home class first — take a class to 10 and its whole kit becomes available to Specialist.'],
    ['Combat Rating', 'A gear-score style number shown on the perk screen. Endgame builds land roughly 800–1,500.'],
  ],
  difficulties: ['Standard', 'Intense', 'Extreme', 'Insane'],
  caveat: 'The game is eight days old. Nothing here is a settled meta — several creators in this corpus explicitly refuse to publish tier lists yet. Treat rankings as early consensus, not received wisdom.',
};

// ---------------------------------------------------------------------------
// Universal systems: augments, traits, attachment effects seen across builds.
// ---------------------------------------------------------------------------

GUIDE.augments = [
  { name: 'Grey-Market Rounds', type: 'Volatile', verdict: 'best',
    effect: 'Every shot randomly deals between 50% and 250% of normal damage.',
    note: 'The single most-recommended augment in the corpus — four separate creators call it a no-brainer. The randomness averages out in your favour on high-magazine weapons, so it is strongest on pulse rifles, heavy rifles and SMGs. Explicitly *not* recommended on low-magazine precision weapons: rolling a 50% on the one shot you fire at an elite is a disaster.' },
  { name: 'Hollow Point Rounds', type: 'Volatile', verdict: 'good',
    effect: '+120% weak point damage and +125% weak point stopping power.',
    note: 'The precision-weapon answer to Grey-Market. Preferred on the L33 Pike and revolver rifles, where each shot needs to be reliable.' },
  { name: 'Specialized Ammunition', type: 'Volatile', verdict: 'good',
    effect: 'Trades raw damage and stopping power for a large weak point damage and weak point stopping power bonus.',
    note: 'The pick for one-shot-at-a-time weapons if you can reliably hit heads.' },
  { name: 'Cryogenic Ammunition', type: 'Unstable', verdict: 'situational',
    effect: 'Reduces damage and stopping power, but chills, slows and can freeze targets.',
    note: 'The damage loss is widely described as negligible next to the control it buys. Sets up shatter and burst windows. Two enemy types are notably weak to cryo.' },
  { name: 'Electrical Ammunition', type: 'Unstable', verdict: 'situational',
    effect: 'Adds electric damage, which slows and stuns.',
    note: 'The anti-Synth pick. Synths take extra damage; Xenomorphs resist it but still get slowed.' },
  { name: 'Incendiary Ammunition', type: 'Unstable', verdict: 'situational',
    effect: 'Adds burning damage over time.',
    note: 'The anti-Xenomorph pick — creators repeatedly note Xenos are highly vulnerable to fire.' },
  { name: 'Piercing Rounds', type: 'Volatile', verdict: 'situational',
    effect: 'Adds bullet penetration so shots pass through lined-up targets.' },
  { name: 'Quick Charge Mechanism', type: 'Volatile', verdict: 'good',
    effect: 'Sharply reduces charge time on charge-shot weapons.',
    note: 'Specifically the pick for the plasma discharger — more charged shots before you approach the overheat threshold.' },
];

GUIDE.traits = [
  { name: 'Type 111 Directed Particle Emitter', source: 'Hunter signature weapon',
    effect: '+1% damage per hit, stacking to 20%, resets after 1 second without hitting an enemy.',
    note: 'The default trait for any high-fire-rate weapon. Appears in Marauder, Hunter and Duelist builds alike — anything where you hold the trigger down.' },
  { name: 'BD-16 Backhoe', source: 'BD-16',
    effect: '+6.5% critical hit chance.',
    note: 'The flat-crit alternative when you cannot keep a stacking trait alive.' },
  { name: 'EDS-93 Zadaks Plasma Discharger', source: 'Machinist signature weapon',
    effect: 'Stacking 20% movement slow on consecutive hits, 4 seconds.',
    note: 'Turns any spray weapon into a team-wide crowd-control tool.' },
  { name: 'Classic Pulse Rifle', source: 'M41A Pulse Rifle',
    effect: '+20% reload speed.',
    note: 'The fix for slow single-load weapons like revolver rifles and the Pike.' },
  { name: 'The One Who Brung Us', source: 'M12A1 Rocket Launcher',
    effect: '+5% effect radius and explosion radius.' },
];

GUIDE.attachmentGlossary = [
  ['Boosted Flash Hider', 'Muzzle', '+30% crit chance and +40% crit damage on kill, 10s, once per 20s — effectively 10 seconds on, 10 off.'],
  ['Extended Flash Hider', 'Muzzle', '+30% crit hit chance and crit damage on kill.'],
  ['C32-D6 Nagant Shroud', 'Muzzle', 'Every third hit grants +40% stopping power for 7 seconds. Excellent on large magazines.'],
  ['Tanka Muzzle Brake', 'Muzzle', 'Each plasma pellet has a 33% chance to grant +45% stopping power.'],
  ['Combat Actuator', 'Internal magazine', '+5% damage and +0.5 bullet penetration on kill, stacks 5×, ~9–10s. Reaches +2.5 penetration at max stacks.'],
  ['Compound Magazine', 'Magazine', '+15% magazine capacity; +4% fire rate on hit, stacking to 20%, 3s.'],
  ['Expanded Reserve', 'Magazine', '+40% maximum ammo.'],
  ['Expanded Magazine', 'Magazine', 'Increases magazine capacity and max ammo.'],
  ['Large Drum Mag', 'Magazine', 'Increased magazine capacity and max ammo.'],
  ['Turbulent Magazine (Speed Loader)', 'Magazine', 'On kill: bonus damage and reload speed for 4 seconds.'],
  ['Scout Magazine', 'Magazine', 'Magazine and handling oriented.'],
  ['Catalytic VFG', 'Underbarrel', '+7% crit hit chance and −4% recoil, stacks 5×, 6s.'],
  ['AFG Precision', 'Underbarrel', '+30% crit chance and +30% crit hit damage on kill, 10s.'],
  ['Forward Mount Laser', 'Underbarrel', 'Improves recoil handling and aim assist.'],
  ['Precision AFG', 'Underbarrel', 'Crit-oriented underbarrel.'],
  ['Dual Rail Booster', 'Barrel', '+10% weak point damage and weak point stopping power.'],
  ['Miller Twist Rifling', 'Barrel', '+7.5% crit chance, plus weapon range and handling.'],
  ['Hammer Forge', 'Barrel', 'Weak point stopping power, stacking up to 100 over 6 seconds.'],
  ['Polygon Rifling', 'Barrel', 'Accuracy and damage oriented barrel.'],
  ['Bracing Armature', 'Armature', '−12% handling, but on taking damage: +25% damage resistance, +10% stagger resistance, −20% recoil for 5s.'],
  ['LFN Reverb Raider', 'Internal mag (explosive)', '+10% effect radius and explosive radius.'],
  ['Digital Scope', 'Optic', '−10% spread, +20% crit hit chance, +5% crit multiplier. Costs handling and ADS movement speed.'],
  ['Compressed Optics', 'Optic', '+7.5% crit chance and +7.5% crit multiplier, plus handling.'],
  ['Micro Red Dot Sight', 'Optic', '−8% spread, +10% weapon range and handling.'],
  ['Green Dot Sight', 'Optic', 'Weak point damage bonus and weak point stopping power.'],
  ['Triangulation Sight', 'Optic', '+10% weak point damage, +10% weak point stopping power, more range, less spread.'],
  ['Narrowed Sight / Small Optic', 'Optic', 'Critical chance and critical multiplier.'],
  ['Extended Optics', 'Optic', 'Range-oriented optic.'],
  ['H105D7 Gata Executioner', 'Harness', 'Crit hit chance and crit damage, at the cost of handling.'],
  ['Absorbent Heat Sink', 'Heat sink', 'Charge shots 20% faster while generating less heat.'],
  ['Alloy Heat Sink', 'Heat sink', '+2 bullet penetration.'],
];
