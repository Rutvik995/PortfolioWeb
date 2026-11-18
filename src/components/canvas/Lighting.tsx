// ─────────────────────────────────────────────────────────────────────────────
// Lighting — Balanced Atmospheric Night Diorama Lighting:
// - Soft moonlight streaming through the window, providing crisp cool-blue
//   rim highlights on Rutvik's hair mane, glasses, and brown hoodie.
// - Balanced ambient and hemisphere lights ensuring clean visibility and no
//   crushed blacks in room corners or shadows.
// - Soft monitor fill light illuminating the keyboard and front of the hoodie.
// - Note: The hero shadow-casting key light is located inside ArticulatedDeskLamp
//   for 100% physical alignment with the bulb at silky 60 FPS.
// ─────────────────────────────────────────────────────────────────────────────

export function Lighting() {
  return (
    <>
      {/* ── Balanced Ambient & Hemisphere Lighting ── */}
      <ambientLight intensity={0.68} color="#dbeafe" />
      <hemisphereLight args={['#93c5fd', '#3b2518', 1.10]} />

      {/* ── Window Moonlight Directional Light (Crisp cool rim on hair & hoodie) ── */}
      <directionalLight
        position={[3.8, 4.5, -3.8]}
        color="#818cf8"
        intensity={2.0}
        castShadow={false}
      />

      {/* ── Soft Monitor Screen Fill Glow ── */}
      <pointLight
        position={[1.65, 0.55, -0.05]}
        color="#22d3ee"
        intensity={1.8}
        distance={4.2}
        decay={2}
        castShadow={false}
      />

      {/* ── Back-Left Wall Bookshelf Fill Light ── */}
      <pointLight
        position={[0.2, 1.9, -0.6]}
        color="#93c5fd"
        intensity={0.7}
        distance={5}
        decay={2}
        castShadow={false}
      />
    </>
  )
}
