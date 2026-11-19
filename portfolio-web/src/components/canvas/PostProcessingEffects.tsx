'use client';

import { EffectComposer, Bloom, Vignette, Noise, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

/**
 * PostProcessingEffects
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic post-processing stack:
 *  - Selective Bloom on glowing monitors, desk lamp, and city window lights
 *  - Soft vignette darkening periphery
 *  - Fine film grain / noise
 *  - ACES Filmic Tone Mapping for rich color dynamics
 */
export function PostProcessingEffects() {
  return (
    <EffectComposer multisampling={4}>
      {/* ── Bloom for glowing monitors, lamp, and windows ── */}
      <Bloom
        luminanceThreshold={0.72}
        luminanceSmoothing={0.4}
        intensity={0.85}
        mipmapBlur
      />

      {/* ── Subtle Film Grain ── */}
      <Noise opacity={0.022} />

      {/* ── Vignette for cinematic focus ── */}
      <Vignette offset={0.32} darkness={0.65} />

      {/* ── ACES Filmic Tone Mapping ── */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
