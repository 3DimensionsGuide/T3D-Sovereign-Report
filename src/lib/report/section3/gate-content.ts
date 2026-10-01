/**
 * Gate keynotes and Channel/Circuit reference data for the Human Design
 * engine's output. Sourced from Tyler's uploaded practitioner reference
 * ("The Practitioner's Guide to the Human Design System") — I Ching names,
 * core meanings, and the full 36-channel circuit classification.
 *
 * Used by: Definition/Circuitry breakdown, Incarnation Cross gate detail,
 * and any page that needs a plain-language name for a gate or channel.
 */

import type { HDCenter } from '@/server/engines/types';

export interface GateKeynote {
  ichingName: string;
  coreMeaning: string;
  center: HDCenter;
}

// ─── HANGING GATE AURIC DETAIL ───────────────────────────────────────────────
//
// An optional deeper layer for the Bridges page's per-gate "Your Bridge
// Gate" block: where the gate physically sits, which channel(s) it's part
// of, and — sourced from the T3D PHILOSOPHER notebook rather than invented —
// what it actually feels like to be in the aura of someone with that gate
// active. Deliberately a PARTIAL record: only gates that have been
// genuinely researched get an entry. A reader whose bridge gate isn't in
// here yet still gets the existing ichingName/coreMeaning line from
// GATE_KEYNOTES — no placeholder or fabricated depth stands in for gates
// not yet researched.
export interface HangingGateAuricDetail {
  location: string;    // where it sits + what kind of Center that is
  channels: string;    // the channel(s) it's part of, in plain language
  experience: string;  // what it feels like to be near someone with it active
}

export const HANGING_GATE_AURIC_DETAIL: Partial<Record<number, HangingGateAuricDetail>> = {
  57: {
    location:
      'The Spleen Center — humanity’s oldest awareness center, reading instinctive, body-level truth in the present moment rather than anything visual or logical.',
    channels:
      'Gate 57 sits at the center of three channels at once: 57–10 (Perfected Form), 57–20 (The Brainwave), and 57–34 (Power) — together with Gates 10, 20, and 34, the structural core of the Integration circuitry, the body’s survival backbone.',
    experience:
      'Being around someone with Gate 57 active feels like standing in a gentle, steady wind: barely noticeable at first, but it keeps penetrating until you feel quietly, thoroughly read — not analyzed, just registered, the way an animal senses a shift in a room before anyone has said anything. The read is acoustic and instinctive, not visual or mental: it’s picking up the vibrational truth underneath whatever is actually being said. It tends to arrive as a single, quiet signal rather than a repeated nudge, so it’s genuinely easy to miss if your attention is elsewhere — there’s no second alarm.',
  },
  52: {
    location:
      'The Root Center — the adrenalized pressure hub at the base of the bodygraph, supplying the physical fuel and pressure to ground energy, hold still, and concentrate before taking action.',
    channels:
      'Gate 52 forms the 52–9 channel (Concentration) with Gate 9 in the Sacral Center — the foundational format channel of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 52 active feels like standing next to a quiet, massive mountain: an immediate, heavy center of gravity that exerts a wordless pressure on the room to slow down and stop rushing. The aura acts as a grounded anchor — mental agitation settles, and the urge toward frantic busyness gives way to stillness and focus. It doesn’t push or demand anything; it simply holds an unyielding, calm space that makes scattered energy feel jarringly out of place.',
  },
  27: {
    location:
      'The Sacral Center — the body’s primary engine of life-force and generative energy, governing work capacity, sustainability, and physical vitality.',
    channels:
      'Gate 27 forms the 27–50 channel (Preservation) with Gate 50 in the Spleen Center — a core pillar of Tribal circuitry, governing the caretaking and physical protection of one’s own.',
    experience:
      'Being around someone with Gate 27 active feels like stepping into the warmth of a protective hearth: an immediate, visceral sense of being looked after and nourished. The aura radiates a distinct caretaking frequency that invites others to drop their guard and expect support, as if an unspoken protective blanket has been draped over the room — it instinctively draws in anyone seeking comfort, prioritizing the health and well-being of whoever is nearby.',
  },
  1: {
    location:
      'The G Center — the seat of personal identity, love, and direction, housing the Magnetic Monopole that holds the illusion of separateness together and pulls us along our trajectory in space.',
    channels:
      'Gate 1 forms the 1–8 channel (Inspiration) with Gate 8 in the Throat Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 1 active feels like stepping into the magnetic orbit of an unselfconscious artist completely absorbed in their own creative flow. Their aura doesn’t seek your approval, demand attention, or ask you to follow them; it simply broadcasts a raw, uncompromising frequency of individual self-expression that makes all social performance feel suddenly hollow. It acts like a hollow bamboo through which pure creative force blows—not looking backward to explain itself or forward to plan a destination, but standing so fully in its present frequency that everyone nearby is subtly challenged to drop their copycat masks and step into their own original authenticity.',
  },
  2: {
    location:
      'The G Center — the seat of personal identity, love, and direction, housing the Magnetic Monopole that holds the illusion of separateness together and pulls us along our trajectory in space.',
    channels:
      'Gate 2 forms the 2–14 channel (The Beat) with Gate 14 in the Sacral Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 2 active feels like stepping into a deeply quiet, magnetic sanctuary where the frantic, mental struggle to figure out where life is going suddenly dissolves. Because their aura acts as a pure, receptive vessel for the universe’s directional guidance, being in their presence instills a visceral sense of spatial orientation, as if your internal compass has been silently calibrated without a single word being spoken. You don’t feel commanded or led; you simply feel anchored in the calm, unshakeable knowing that the current trajectory is correct, allowing the mind to rest in the beauty of the ride.',
  },
  3: {
    location:
      'The Sacral Center — the body’s primary engine of life-force and generative energy, governing work capacity, sustainability, and physical vitality.',
    channels:
      'Gate 3 forms the 3–60 channel (Mutation) with Gate 60 in the Root Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 3 active feels like standing at the epicenter of an unpredictable, mutative pulse: an energetic field where something raw, chaotic, and entirely new is struggling to order itself into form. There is a palpable, restless pressure in their presence—a generative spark that breaks through old stagnation but offers no logical roadmap for where it will land. Being near them disrupts rigid routines, forcing the environment to adapt to the unpredictable birth of a new cycle.',
  },
  4: {
    location:
      'The Ajna Center — the awareness center for mental processing and conceptualization, translating raw inspirational pressure into theories, formulas, opinions, and structured thought.',
    channels:
      'Gate 4 forms the 4–63 channel (Logic) with Gate 63 in the Head Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 4 active feels like stepping into an arena of immediate, solution-seeking mental pressure: an unmistakable frequency that jumps at any unresolved question or doubt in the room and instantly offers a crisp, logical formula or answer. The aura doesn’t wait to see if the solution is deeply needed; it simply projects a compelling, theory-driven clarity that tempts others to hand over their confusion, offering a quick-fix mental blueprint to straighten out whatever feels uncertain.',
  },
  5: {
    location:
      'The Sacral Center — the body’s primary engine of life-force and generative energy, governing work capacity, sustainability, and physical vitality.',
    channels:
      'Gate 5 forms the 5–15 channel (Rhythm) with Gate 15 in the G Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 5 active feels like stepping into the steady, unyielding ticking of a grandfather clock or the rhythmic pull of the tides: an intense, cellular field of fixed timing and natural routine. Their frequency imposes an organic tempo on the space—if you try to rush them or disrupt their natural cadence, your own energy feels jarringly derailed. Their presence silently demands that everyone around them slow down, honor natural seasons, and align with the unhurried intelligence of universal timing.',
  },
  6: {
    location:
      'The Solar Plexus Center — the motor and emerging awareness center of emotions, feelings, and desires, operating on a continuous mechanical wave of highs and lows where clarity only matures over time.',
    channels:
      'Gate 6 forms the 6–59 channel (Mating) with Gate 59 in the Sacral Center — part of the Tribal Defense circuitry, governing the preservation, caretaking, and physical protection of the clan and its future generations.',
    experience:
      'Being around someone with Gate 6 active feels like standing before a subtle emotional gatekeeper or atmospheric valve: an immediate, palpable frequency of friction and calibration that tests whether the environment is safe and open for true intimacy. The read is environmental and visceral, regulating the emotional pH of the space so you can instantly sense whether their guard is up or down. It exerts an undeniable auric pressure that demands resolution, dictating whether the room feels disarmingly open for honest connection or firmly closed off to keep emotional turbulence at bay.',
  },
  7: {
    location:
      'The G Center — the seat of personal identity, love, and direction, housing the Magnetic Monopole that holds the illusion of separateness together and pulls us along our trajectory in space.',
    channels:
      'Gate 7 forms the 7–31 channel (The Alpha) with Gate 31 in the Throat Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 7 active feels like encountering a calm, strategic commander standing over a map room: an immediate, organizing presence that subtly aligns the surrounding space toward a clear future objective. Their aura projects an unspoken expectation of consensus and common purpose, making disorganized drift feel instantly out of place and prompting those nearby to fall into step. It doesn’t bully or demand compliance with raw willpower; it radiates a quiet, structural authority that reassures others that someone at the helm actually understands how to guide the collective safely forward.',
  },
  8: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 8 forms the 1–8 channel (Inspiration) with Gate 1 in the G Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 8 active feels like standing near a quiet, illuminated beacon in a crowded room: you can’t help but look, not because they are making a scene, but because their presence projects a distinct, unshakeable aura of individual authenticity. It exerts a subtle magnetic pull that encourages everyone nearby to drop their conformity and step into their own unique truth. The aura doesn’t preach or demand attention; it simply demonstrates what it looks like to stand cleanly in one’s individual style, making those in their orbit feel invited to express their own original contribution without fear of judgment.',
  },
  9: {
    location:
      'The Sacral Center — the body’s primary engine of life-force and generative energy, governing work capacity, sustainability, and physical vitality.',
    channels:
      'Gate 9 forms the 9–52 channel (Concentration) with Gate 52 in the Root Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 9 active feels like entering a high-magnification field of relentless focus, where every tiny detail, flaw, and nuance in the room is magnified and energized. Their generative field supplies the physical juice to pore over minutiae without fatigue, creating an atmospheric pressure for those nearby to stop skimming the surface and zoom in on what actually needs fixing. It is a potent, magnetic pull toward precision and thorough, step-by-step execution.',
  },
  10: {
    location:
      'The G Center — the seat of personal identity, love, and direction, housing the Magnetic Monopole that holds the illusion of separateness together and pulls us along our trajectory in space.',
    channels:
      'Gate 10 sits at the center of three channels at once: 34–10 (Exploration), 20–10 (Awakening), and 10–57 (Perfected Form) — together with Gates 34, 20, and 57, the structural core of the Integration circuitry, the body’s survival backbone.',
    experience:
      'Being around someone with Gate 10 active feels like encountering someone who gently picks up a tiger’s tail and makes friends with it: an undeniable, infectious frequency of unbothered self-love and behavioral ease. Their aura acts like a mirror that immediately exposes where you are bowing to social approval or beating yourself up, while simultaneously radiating an uncompromised grace that invites you to relax into loving your own life. It doesn’t demand that you adopt their style; it simply broadcasts such a deep, natural self-acceptance that trying to act like a martyr or people-pleaser in their presence feels utterly absurd.',
  },
  11: {
    location:
      'The Ajna Center — the awareness center for mental processing and conceptualization, translating raw inspirational pressure into theories, formulas, opinions, and structured thought.',
    channels:
      'Gate 11 forms the 11–56 channel (Curiosity) with Gate 56 in the Throat Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 11 active feels like walking into a rich, panoramic landscape of pure conceptual possibility: an atmospheric field where vivid ideas, stories, and philosophical pictures constantly bubble up into the room. Their presence acts like a gentle imaginative lens, stimulating others to see new potential paths, historical parallels, or hopeful scenarios without any immediate pressure to act—inviting you to simply contemplate the beauty and harmony of a new perspective.',
  },
  12: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 12 forms the 12–22 channel (Openness) with Gate 22 in the Solar Plexus Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 12 active feels like stepping through a heavy velvet curtain into an emotionally charged, atmospheric sanctuary: people instinctively hush their voices and tread lightly without quite knowing why. The aura carries a palpable, delicate selectivity that radiates either a breathtaking, poetic depth when the mood is right, or an impenetrable, chilling wall of reserve when it isn’t. You immediately sense that every word spoken in their presence carries weight, creating a space where superficial small talk feels strangely out of place and only authentic, mood-aligned expression can pass through.',
  },
  13: {
    location:
      'The G Center — the seat of personal identity, love, and direction, housing the Magnetic Monopole that holds the illusion of separateness together and pulls us along our trajectory in space.',
    channels:
      'Gate 13 forms the 13–33 channel (The Prodigal) with Gate 33 in the Throat Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 13 active feels like sitting down beside an ancient, empathetic hearth where your guard instantly drops and your untold stories naturally spill out. Their aura acts like a vacuum for human experience, holding a wide-open, non-judgmental container that makes total strangers feel compelled to confess their deepest secrets, trials, and past memories without quite knowing why. You don’t feel interrogated or critically dissected; you feel profoundly witnessed, accepted, and held, as if your chaotic history has finally found a safe vault where it can be acknowledged and given real meaning.',
  },
  14: {
    location:
      'The Sacral Center — the body’s primary engine of life-force and generative energy, governing work capacity, sustainability, and physical vitality.',
    channels:
      'Gate 14 forms the 2–14 channel (The Beat) with Gate 2 in the G Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 14 active feels like standing near a roaring, abundant furnace of creative and material vitality: a rich, magnetic energy field that radiates capacity, resourcefulness, and fertile output. Their Sacral field generates a palpable, uplifting warmth that makes prosperity, skill, and material manifestation feel tangible and available. It acts as an energetic generator that fuels direction and empowers those nearby to invest their energy only into work that carries genuine joy and value.',
  },
  15: {
    location:
      'The G Center — the seat of personal identity, love, and direction, housing the Magnetic Monopole that holds the illusion of separateness together and pulls us along our trajectory in space.',
    channels:
      'Gate 15 forms the 5–15 channel (Rhythm) with Gate 5 in the Sacral Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 15 active feels like stepping into a vast, oceanic current that can accommodate any wave, no matter how wild or unusual: an immediate, expansive aura of humanitarian warmth that accepts the full, chaotic spectrum of human behavior. Being in their presence relaxes the secret shame of being ‘too much’ or ‘too weird,’ because their field naturally normalizes extremes and holds space for every bizarre pace or rhythm without flinching. It feels like an all-encompassing embrace that gently pulls everyone in the room into a larger, organized flow of life where no human quirk is outside the circle of care.',
  },
  16: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 16 forms the 16–48 channel (The Wavelength) with Gate 48 in the Spleen Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 16 active feels like being caught in a sudden, electric burst of enthusiastic momentum: an energetic spark that instantly awakens dormant skills and ideas in everyone nearby. Their aura radiates an infectious, animated zest for mastery that makes abstract concepts feel exciting, actionable, and ready to be practiced. It doesn’t analyze or deliberate; it sweeps people up in a shared wave of enthusiasm, instilling a playful confidence that invites others to throw themselves into honing a craft, experimenting with life, or mastering a technique with joyful dedication.',
  },
  17: {
    location:
      'The Ajna Center — the awareness center for mental processing and conceptualization, translating raw inspirational pressure into theories, formulas, opinions, and structured thought.',
    channels:
      'Gate 17 forms the 17–62 channel (Acceptance) with Gate 62 in the Throat Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 17 active feels like entering an arena of structured, future-oriented evaluation: a crisp, discerning field that subtly pulls everyone present into organizing their thoughts, examining patterns, and testing whether an idea holds water. The aura radiates a sharp, opinionated frame that instantly highlights imperfections, incomplete logic, or timing gaps, prompting those nearby to re-examine their own assumptions and align with a clearer, more organized way forward.',
  },
  18: {
    location:
      'The Spleen Center — humanity’s oldest awareness center, reading instinctive, body-level truth in the present moment rather than anything visual or logical.',
    channels:
      'Gate 18 forms the 18–58 channel (Judgment) with Gate 58 in the Root Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 18 active feels like standing before an intuitive inspector with a master eye for detail: you instantly feel an unspoken audit of whatever is out of alignment, flawed, or in need of repair. The aura doesn’t judge out of personal malice; rather, it radiates an automatic, instinctual pressure that zeroes in on the broken pattern or the loose thread in the room. You become hyper-aware of your own shortcomings or where something has been ‘spoilt,’ as if an invisible standard of potential perfection has been set. It creates a subtle, corrective tension that compels everything nearby to be upgraded, fixed, or brought up to code.',
  },
  19: {
    location:
      'The Root Center — the adrenalized motor and pressure center at the base of the bodygraph, supplying physical stress, momentum, and foundational fuel to drive evolutionary movement and handle life’s demands.',
    channels:
      'Gate 19 forms the 19–49 channel (Synthesis) with Gate 49 in the Solar Plexus Center — part of the Tribal Ego circuitry, managing material resources, bargains, and financial security to build, support, and sustain the community.',
    experience:
      'Being in the presence of someone with Gate 19 active feels like an immediate, delicate pull toward touch, proximity, and mutual awareness: a heightened sensitivity to whether everyone’s basic needs are being met. Their aura projects a subtle, expectant pressure that scans for inclusion, emotional attunement, and shared resources, making you instinctively check your own boundaries and level of care. It silently asks whether everyone is connected and supported, creating an environment where emotional coldness or physical distance becomes immediately palpable.',
  },
  20: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 20 sits at the center of three channels at once: 57–20 (The Brainwave), 34–20 (Charisma), and 20–10 (Awakening) — together with Gates 57, 34, and 10, the structural core of the Integration circuitry, the body’s survival backbone.',
    experience:
      'Being around someone with Gate 20 active feels like being abruptly snapped into the sharp, unfiltered immediacy of the present second: past regrets and future anxieties suddenly evaporate, leaving only what is happening right now. Their aura carries an urgent, spontaneous frequency that demands direct engagement with the present moment, making abstract plans and mental churning feel instantly irrelevant. Standing near them forces everyone to stop intellectualizing life and respond directly to the raw, immediate reality of whatever situation, action, or truth is unfolding in front of them this very instant.',
  },
  21: {
    location:
      'The Heart Center — the motor center of ego and willpower, driving material ambition, self-worth, bargains, and the physical determination to prove value and provide resources.',
    channels:
      'Gate 21 forms the 21–45 channel (The Money Line) with Gate 45 in the Throat Center — part of the Tribal Ego circuitry, managing material resources, bargains, and financial security to build, support, and sustain the community.',
    experience:
      'Being around someone with Gate 21 active feels like stepping into a tightly managed perimeter where an invisible, firm hand has already taken charge of the room: an immediate, commanding frequency of control that establishes order and authority over the surrounding environment. The aura projects an unmistakable executive pressure that instinctively prompts others to check their boundaries, step in line, or defer logistical and material oversight to them. It doesn’t ask for permission to lead; it simply holds a firm, protective grip on resources, money, and structure, making chaotic or unregulated behavior feel instantly held accountable.',
  },
  22: {
    location:
      'The Solar Plexus Center — the motor and emerging awareness center of emotions, feelings, and desires, operating on a continuous mechanical wave of highs and lows where clarity only matures over time.',
    channels:
      'Gate 22 forms the 12–22 channel (Openness) with Gate 12 in the Throat Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 22 active feels like entering a field of effortless charm and disarming emotional grace: an open, magnetic aura that makes hard social boundaries soften and invites you into a space of emotional beauty. The energy feels like a cool, clear flame moving through the room, lifting the atmosphere and disarming everyone nearby without a single word being spoken. There is a poetic, disarming warmth to the field that can open doors where others see solid walls, though it carries an underlying intensity that expects you to honor the depth of the moment.',
  },
  23: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 23 forms the 23–43 channel (Structuring) with Gate 43 in the Ajna Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 23 active feels like watching a sharp, surgical blade effortlessly slice through a tangled web of mental noise: convoluted concepts and overcomplicated theories suddenly collapse into stark, simple clarity. Their aura exerts a quiet, uncompromising pressure that strips away pretense and fluff, leaving only the bare, essential core of an idea. It can feel startlingly abrupt or even disruptive to those clinging to old habits of thought, as if an entire structure of logic was cleanly split open in a single moment, forcing everyone nearby to digest a fresh, unvarnished insight.',
  },
  24: {
    location:
      'The Ajna Center — the awareness center for mental processing and conceptualization, translating raw inspirational pressure into theories, formulas, opinions, and structured thought.',
    channels:
      'Gate 24 forms the 24–61 channel (Awareness) with Gate 61 in the Head Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 24 active feels like entering a quiet, rhythmic mental pulse: a contemplative, inward-turning current that invites everyone in its orbit to slow down, review past concepts, and rethink troubling issues. It exerts a gentle, persistent pressure to re-examine the same ground over and over, lulling the surrounding mental noise into a state of patient contemplation until a sudden, quiet shift in perspective transforms confusion into effortless inner knowing.',
  },
  25: {
    location:
      'The G Center — the seat of personal identity, love, and direction, housing the Magnetic Monopole that holds the illusion of separateness together and pulls us along our trajectory in space.',
    channels:
      'Gate 25 forms the 25–51 channel (Initiation) with Gate 51 in the Heart Center — part of the Individual Centering circuitry, anchoring self-love and individual conviction to center the self and empower others by example.',
    experience:
      'Being around someone with Gate 25 active feels like stepping into a cool, crystalline sanctuary of unconditioned purity that disarms all emotional defense mechanisms. Their aura radiates a serene, transcendent ‘cool love’—an innocent, guileless presence that loves a flower, a machine, or a human with the exact same unattached, sacred reverence. Near them, petty personal agendas, manipulative games, and cynicism feel strangely heavy and irrelevant, replaced by an instinctual reset that shocks the spirit back into a state of childlike wonder and universal trust in existence.',
  },
  26: {
    location:
      'The Heart Center — the motor center of ego and willpower, driving material ambition, self-worth, bargains, and the physical determination to prove value and provide resources.',
    channels:
      'Gate 26 forms the 26–44 channel (Surrender) with Gate 44 in the Spleen Center — part of the Tribal Ego circuitry, managing material resources, bargains, and financial security to build, support, and sustain the community.',
    experience:
      'Being around someone with Gate 26 active feels like standing near a high-stakes, magnetic master marketer: an intoxicating frequency of sheer persuasion and opportunistic confidence that makes grand possibilities feel completely achievable right now. The aura projects an irresistible, deal-making charm that sweeps others into their vision, effortlessly convincing those nearby to buy into a proposal, product, or direction before they’ve even paused to check the details. It radiates a sleek, low-effort/high-reward authority that bends perceptions in the room, making even bold exaggerations feel like the most promising and lucrative opportunity available.',
  },
  28: {
    location:
      'The Spleen Center — humanity’s oldest awareness center, reading instinctive, body-level truth in the present moment rather than anything visual or logical.',
    channels:
      'Gate 28 forms the 28–38 channel (Struggle) with Gate 38 in the Root Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 28 active feels like stepping onto a high-stakes field where the trivialities of daily life suddenly drop away: their aura radiates an intense, existential dare. You feel a visceral pressure that asks whether what you are doing actually matters, confronting you with the underlying fear of a meaningless existence. Being near them heightens the stakes in the room, making playing it safe feel suffocating and provoking you to figure out what is truly worth struggling or taking risks for. It is an aura that refuses to let anyone waste time on shallow pursuits when there is a real game of life to be played.',
  },
  29: {
    location:
      'The Sacral Center — the body’s primary engine of life-force and generative energy, governing work capacity, sustainability, and physical vitality.',
    channels:
      'Gate 29 forms the 29–46 channel (Discovery) with Gate 46 in the G Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 29 active feels like standing on the edge of a deep, irresistible vortex of total commitment: a visceral, engulfing Sacral field that leaps whole-heartedly into life’s experiences without holding back. Their presence carries a potent, infectious momentum that draws others into saying ‘Yes’ and diving into the deep end. It is a loyal, uncompromising frequency that tests whether you are willing to surrender completely to a journey and see it through to its ultimate fulfillment or failure.',
  },
  30: {
    location:
      'The Solar Plexus Center — the motor and emerging awareness center of emotions, feelings, and desires, operating on a continuous mechanical wave of highs and lows where clarity only matures over time.',
    channels:
      'Gate 30 forms the 30–41 channel (Recognition) with Gate 41 in the Root Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 30 active feels like standing near a crackling, intense hearth: an inescapable aura of emotional yearning and contagious desire that pulls you directly into their current of expectation and feeling. The energy in the room feels charged with a dramatic, restless spark that urges you to leap into new experiences just to taste life fully. It operates as a steep, rising wave of emotional anticipation that makes everything around them feel heightened and significant, making it almost impossible to stay indifferent or emotionally detached.',
  },
  31: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 31 forms the 7–31 channel (The Alpha) with Gate 7 in the G Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 31 active feels like being in the orbit of a natural, steady figurehead: you instinctively feel a quiet impulse to listen and align with their direction, even if no formal authority has been granted. Their aura projects a calm, collective leadership that doesn’t push, command, or force obedience, but instead draws people into consensus through a shared vision. Standing near them instills a reassuring sense of order and guidance, as if the room has found its voice and its natural spokesperson to articulate where the group needs to go next.',
  },
  32: {
    location:
      'The Spleen Center — humanity’s oldest awareness center, reading instinctive, body-level truth in the present moment rather than anything visual or logical.',
    channels:
      'Gate 32 forms the 32–54 channel (Transformation) with Gate 54 in the Root Center — part of the Tribal Ego circuitry, managing material resources, bargains, and financial security to build, support, and sustain the community.',
    experience:
      'Being around someone with Gate 32 active feels like standing beside an ancient assessor silently calculating the long-term viability of everything in sight: their aura smells out whether an endeavor, a person, or a talent has true staying power or is heading for extinction. Being near them creates a quiet, conservative gravity where your plans and potential feel instinctually weighed for durability. It triggers a subtle awareness of failure and survival, making you question if you have the right resources and people to endure. You feel continuously appraised by a force that only respects what can stand the test of time.',
  },
  33: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 33 forms the 13–33 channel (The Prodigal) with Gate 13 in the G Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 33 active feels like stepping into a quiet, sunlit archive or an ancient place of retreat: the frantic pace of the world outside naturally slows down to a contemplative crawl. Their aura radiates a deep, reflective privacy that invites others to pause, look back over their journey, and process the lessons of their past experiences. It creates a safe, honorable container where people feel instinctively comfortable opening up and sharing their stories, trusting that whatever is spoken will be held in sacred confidence and distilled into timeless wisdom.',
  },
  34: {
    location:
      'The Sacral Center — the body’s primary engine of life-force and generative energy, governing work capacity, sustainability, and physical vitality.',
    channels:
      'Gate 34 sits at the center of three channels at once: 34–10 (Exploration), 57–34 (Power), and 34–20 (Charisma) — together with Gates 10, 57, and 20, the structural core of the Integration circuitry, the body’s survival backbone.',
    experience:
      'Being around someone with Gate 34 active feels like standing near a high-voltage industrial generator operating at maximum capacity: an immense, asexual surge of pure, physical power that is utterly absorbed in its own busyness. Their field is dense, impenetrable, and fiercely self-contained—a ‘get out of my way, I’m busy’ frequency that doesn’t seek interaction or validation. Being near them energizes the physical space, driving action and momentum while shutting out external distractions.',
  },
  35: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 35 forms the 35–36 channel (Transitoriness) with Gate 36 in the Solar Plexus Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 35 active feels like standing on the open deck of a ship setting sail into uncharted waters: a restless, electric wind of anticipation that makes staying still feel nearly impossible. Their aura carries an unmistakable hunger for progress and new emotional horizons, stirring a deep craving for adventure and movement in anyone nearby. Stagnation and routine feel heavy and suffocating in their presence, impelling those around them to break free from old patterns, embrace change, and leap into the next lived experience just to see where the story leads.',
  },
  36: {
    location:
      'The Solar Plexus Center — the motor and emerging awareness center of emotions, feelings, and desires, operating on a continuous mechanical wave of highs and lows where clarity only matures over time.',
    channels:
      'Gate 36 forms the 35–36 channel (Transitoriness) with Gate 35 in the Throat Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 36 active feels like stepping onto the threshold of an impending storm or an unexplored tunnel: a charged, atmospheric pressure of emotional adventure and sudden crisis that makes the room feel electric with vulnerability. Their aura exerts a subtle, restless push that shatters routine complacency, inviting you to feel the visceral weight of life’s raw emotional depth. It draws others into the transformative edge of an untried experience, where initial hesitation gives way to the deep, unavoidable necessity of emotional resolution.',
  },
  37: {
    location:
      'The Solar Plexus Center — the motor and emerging awareness center of emotions, feelings, and desires, operating on a continuous mechanical wave of highs and lows where clarity only matures over time.',
    channels:
      'Gate 37 forms the 37–40 channel (Community) with Gate 40 in the Heart Center — part of the Tribal Ego circuitry, managing material resources, bargains, and financial security to build, support, and sustain the community.',
    experience:
      'Being around someone with Gate 37 active feels like stepping into the welcoming warmth of a close family hearth: an immediate, enveloping wave of tribal affection and belonging that makes you feel instantly included and held in trust. The aura carries a comforting, unifying pull that tacitly invites mutual support, fair bargains, and genuine loyalty, easing social distance in an instant. It radiates a nurturing field that prioritizes the cohesion and emotional security of the group, making anyone nearby feel cared for, grounded, and recognized as part of the clan.',
  },
  38: {
    location:
      'The Root Center — the adrenalized motor and pressure center at the base of the bodygraph, supplying physical stress, momentum, and foundational fuel to drive evolutionary movement and handle life’s demands.',
    channels:
      'Gate 38 forms the 28–38 channel (Struggle) with Gate 28 in the Spleen Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Standing in the aura of someone with Gate 38 feels like meeting an unyielding, stubborn wall of resistance that demands to know if something is genuinely worth fighting for. Their presence emits an adversarial, combative pressure that tests the integrity of whatever is presented, refusing to yield to superficial demands or empty authority. It naturally provokes a defensive or confrontational charge in those nearby, forcing everyone in the room to clarify their convictions and stand up for what actually matters.',
  },
  39: {
    location:
      'The Root Center — the adrenalized motor and pressure center at the base of the bodygraph, supplying physical stress, momentum, and foundational fuel to drive evolutionary movement and handle life’s demands.',
    channels:
      'Gate 39 forms the 39–55 channel (Emoting) with Gate 55 in the Solar Plexus Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 39 active feels like a sharp, unpredictable prod to your emotional equilibrium: a poking, teasing pressure designed to disturb comfort and test your spirit. Their aura radiates an undeniable tension that intentionally pushes buttons or creates awkward pauses, probing underneath polite surfaces to see what is real. It instantly eliminates neutrality, forcing an emotional reaction that exposes where people are trapped in emotional stagnation.',
  },
  40: {
    location:
      'The Heart Center — the motor center of ego and willpower, driving material ambition, self-worth, bargains, and the physical determination to prove value and provide resources.',
    channels:
      'Gate 40 forms the 37–40 channel (Community) with Gate 37 in the Solar Plexus Center — part of the Tribal Ego circuitry, managing material resources, bargains, and financial security to build, support, and sustain the community.',
    experience:
      'Being around someone with Gate 40 active feels like encountering a firm, immovable boundary stone in the middle of a negotiation: a self-contained, sobering frequency that wordlessly calculates the exact cost of commitment and refuses to give away its energy for free. The aura exerts an immediate pressure on others to state their business and clarify the terms of a deal, making people acutely aware of the boundaries of labor and personal space. It doesn’t seek connection for its own sake; it holds a dignified, solitary presence that shuts down unfair expectations, forcing those nearby to respect their limits and evaluate whether any bargain is truly worth the effort.',
  },
  41: {
    location:
      'The Root Center — the adrenalized motor and pressure center at the base of the bodygraph, supplying physical stress, momentum, and foundational fuel to drive evolutionary movement and handle life’s demands.',
    channels:
      'Gate 41 forms the 30–41 channel (Recognition) with Gate 30 in the Solar Plexus Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Stepping into the aura of someone with Gate 41 feels like absorbing a quiet, brewing wave of expectation and imaginative yearning: the subtle adrenal itch that precedes a brand-new emotional adventure. Their presence transmits a concentrated pressure of unfulfilled desire and fantasy, making the present moment feel strangely incomplete and ripe for change. It awakens a collective restlessness in the room, inspiring others to daydream, crave new horizons, and anticipate what is coming next.',
  },
  42: {
    location:
      'The Sacral Center — the body’s primary engine of life-force and generative energy, governing work capacity, sustainability, and physical vitality.',
    channels:
      'Gate 42 forms the 42–53 channel (Maturation) with Gate 53 in the Root Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 42 active feels like stepping into a powerful gravitational slipstream that accelerates the completion and maturation of whatever life cycle you are currently navigating. Their Sacral field carries a momentum of growth and expansion that pushes open-ended situations toward their natural conclusion. Being near them energizes projects, relationships, and processes to move through their necessary stages, ensuring that nothing stays stagnant and that every experience yields its full lesson.',
  },
  43: {
    location:
      'The Ajna Center — the awareness center for mental processing and conceptualization, translating raw inspirational pressure into theories, formulas, opinions, and structured thought.',
    channels:
      'Gate 43 forms the 23–43 channel (Structuring) with Gate 23 in the Throat Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 43 active feels like stepping into a sudden, electric frequency shift in the room: an intense, individual acoustic field that drops a completely novel, non-linear insight out of nowhere. The aura carries a distinct, unyielding ‘inner ear’ resonance that pays no attention to traditional consensus or standard logic, forcing the minds of those nearby to bend around an unconventional realization that feels either like striking, eccentric genius or utter, bizarre shock.',
  },
  44: {
    location:
      'The Spleen Center — humanity’s oldest awareness center, reading instinctive, body-level truth in the present moment rather than anything visual or logical.',
    channels:
      'Gate 44 forms the 26–44 channel (Surrender) with Gate 26 in the Heart Center — part of the Tribal Ego circuitry, managing material resources, bargains, and financial security to build, support, and sustain the community.',
    experience:
      'Being around someone with Gate 44 active feels like being in the presence of a watchful guard dog with a cellular memory for human history: their aura registers the unspoken ‘scent’ of your past patterns and track record before a single word is exchanged. You feel subtly vetted for trustworthiness and capability, as if your past encounters, motives, and reliability have already been cross-referenced against an instinctual archive. It creates a sharp, alert frequency in the room that senses who belongs in the tribe and who carries old threat, leaving no room for phony facades or repeated mistakes.',
  },
  45: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 45 forms the 21–45 channel (The Money Line) with Gate 21 in the Heart Center — part of the Tribal Ego circuitry, managing material resources, bargains, and financial security to build, support, and sustain the community.',
    experience:
      'Being around someone with Gate 45 active feels like stepping into the grand hall of a sovereign monarch: an immediate, unmistakable atmosphere of territorial presence, ownership, and material oversight. Their aura radiates a natural, protective authority that commands respect without needing to assert itself aggressively, causing others to instinctively look to them for allocation of resources, order, and stability. Standing in their presence instills a clear awareness of boundaries and stewardship, making everyone in the room feel both protected by their shelter and aware of who holds the keys to the collective treasury.',
  },
  46: {
    location:
      'The G Center — the seat of personal identity, love, and direction, housing the Magnetic Monopole that holds the illusion of separateness together and pulls us along our trajectory in space.',
    channels:
      'Gate 46 forms the 29–46 channel (Discovery) with Gate 29 in the Sacral Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 46 active feels like being suddenly pulled out of your head and anchored straight into the vibrant, sensory richness of your physical body. Their aura emits a buoyant, sensuous frequency of pure physical presence that makes being in a human vessel feel like an extraordinary stroke of luck rather than a heavy burden. In their proximity, anxiety about future outcomes dissolves into a grounded, delight-filled realization that simply being fully present in this exact moment, in this exact physical form, is where all fortune, health, and serendipitous magic naturally reside.',
  },
  47: {
    location:
      'The Ajna Center — the awareness center for mental processing and conceptualization, translating raw inspirational pressure into theories, formulas, opinions, and structured thought.',
    channels:
      'Gate 47 forms the 47–64 channel (Abstraction) with Gate 64 in the Head Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 47 active feels like sitting within the heavy, atmosphere-dense pressure of an unsolved puzzle: a deep, reflective field that holds the weight of past confusion, chaos, or unresolved memory. The aura draws others into a shared space of mental brewing, where the intense pressure to make sense of life’s messiness gradually builds—until, without warning, a sudden ‘aha!’ realization breaks through the fog, bringing immense mental relief as the scattered pieces finally click into place.',
  },
  48: {
    location:
      'The Spleen Center — humanity’s oldest awareness center, reading instinctive, body-level truth in the present moment rather than anything visual or logical.',
    channels:
      'Gate 48 forms the 16–48 channel (The Wavelength) with Gate 16 in the Throat Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 48 active feels like standing at the edge of a deep, silent well whose bottom disappears into darkness: you immediately sense an unfathomable reservoir of instinctual wisdom and solutions waiting beneath the surface. Their aura exerts a quiet, magnetic pull that draws out deeper questions and forces surface-level small talk to evaporate. At the same time, it can trigger a subtle feeling of inadequacy in those nearby, as if you have stumbled upon a level of depth and historical mastery that demands far more substance than you were prepared to bring.',
  },
  49: {
    location:
      'The Solar Plexus Center — the motor and emerging awareness center of emotions, feelings, and desires, operating on a continuous mechanical wave of highs and lows where clarity only matures over time.',
    channels:
      'Gate 49 forms the 19–49 channel (Synthesis) with Gate 19 in the Root Center — part of the Tribal Ego circuitry, managing material resources, bargains, and financial security to build, support, and sustain the community.',
    experience:
      'Being around someone with Gate 49 active feels like standing before an unbending emotional arbiter holding a line of strict principles: an aura of sharp, decisive evaluation that instantly senses whether someone or something aligns with fundamental values. You feel an immediate, visceral alertness to whether you are being accepted or rejected into their circle, as the energy in the room sets clear, non-negotiable boundaries around what is honorable, just, and allowable. It acts as an uncompromising filter that tolerates no superficial pretense, demanding that all interactions be rooted in genuine principles and mutual respect.',
  },
  50: {
    location:
      'The Spleen Center — humanity’s oldest awareness center, reading instinctive, body-level truth in the present moment rather than anything visual or logical.',
    channels:
      'Gate 50 forms the 27–50 channel (Preservation) with Gate 27 in the Sacral Center — part of the Tribal Defense circuitry, governing the preservation, caretaking, and physical protection of the clan and its future generations.',
    experience:
      'Being around someone with Gate 50 active feels like entering the sanctuary of a tribal lawgiver overseeing the communal hearth: their aura projects a heavy, protective weight of responsibility, tribal values, and unspoken laws. You feel an immediate, visceral accountability for how you behave toward the group, as if the physical and moral safety of the entire clan is being actively maintained in your presence. It instinctively prompts those nearby to respect the rules, honor shared commitments, and ensure everyone is cared for, making any reckless or corrupting behavior feel instantly exposed.',
  },
  51: {
    location:
      'The Heart Center — the motor center of ego and willpower, driving material ambition, self-worth, bargains, and the physical determination to prove value and provide resources.',
    channels:
      'Gate 51 forms the 25–51 channel (Initiation) with Gate 25 in the G Center — part of the Individual Centering circuitry, anchoring self-love and individual conviction to center the self and empower others by example.',
    experience:
      'Being around someone with Gate 51 active feels like standing beneath a sudden, electric thunderclap in a clear sky: an abrupt, galvanizing frequency that startles the room awake and instantly shatters comfortable complacency. The aura carries a sharp, competitive edge that jolts others out of their habitual routines, forcing those nearby to drop their rehearsed excuses and face a sudden, unpredictable shift in reality. It doesn’t soothe or ease people into change; it delivers an unsettling, awakening pulse that breaks through mental armor, leaving everyone present alert, wide-awake, and challenged to step beyond their perceived limitations.',
  },
  53: {
    location:
      'The Root Center — the adrenalized motor and pressure center at the base of the bodygraph, supplying physical stress, momentum, and foundational fuel to drive evolutionary movement and handle life’s demands.',
    channels:
      'Gate 53 forms the 42–53 channel (Maturation) with Gate 42 in the Sacral Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being near someone with Gate 53 active feels like being caught in the momentum of a starting gun: an urgent, restless pressure that demands the initiation of new cycles and projects. Their aura radiates an infectious, pushing frequency that makes staying in place feel unbearable, compelling those around them to break ground, launch ideas, and turn the page. It brings an undeniable surge of beginnings into the space, driving the room forward into new territory.',
  },
  54: {
    location:
      'The Root Center — the adrenalized motor and pressure center at the base of the bodygraph, supplying physical stress, momentum, and foundational fuel to drive evolutionary movement and handle life’s demands.',
    channels:
      'Gate 54 forms the 32–54 channel (Transformation) with Gate 32 in the Spleen Center — part of the Tribal Ego circuitry, managing material resources, bargains, and financial security to build, support, and sustain the community.',
    experience:
      'Standing in the aura of someone with Gate 54 feels like feeling the heat of a rising furnace: a driving, laser-focused pressure of raw material ambition and social ascent. Their presence radiates a disciplined, striving frequency that refuses to accept mediocrity, silently challenging everyone nearby to raise their standards and strive for higher ground. It exerts an invisible pull toward achievement and status, making complacency feel unacceptable and sparking a desire to build, transform, and excel.',
  },
  55: {
    location:
      'The Solar Plexus Center — the motor and emerging awareness center of emotions, feelings, and desires, operating on a continuous mechanical wave of highs and lows where clarity only matures over time.',
    channels:
      'Gate 55 forms the 39–55 channel (Emoting) with Gate 39 in the Root Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 55 active feels like standing in a shifting weather system of pure, uninhibited spirit: an aura that radiates a deep, poetic emotional atmosphere ranging from quiet melancholy to radiant, infectious ecstasy. You feel a subtle, inexplicable emotional surge that bypasses all mental logic, inviting you to drop your rational mind and feel the wild, unbreakable abundance of life’s emotional spectrum. It carries an aura of unyielding, individual freedom that cannot be tamed or reasoned with, acting as a living reminder that true spirit rises up no matter what the external circumstances bring.',
  },
  56: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 56 forms the 11–56 channel (Curiosity) with Gate 11 in the Ajna Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Being around someone with Gate 56 active feels like sitting near a crackling campfire while a captivating wanderer weaves tales of far-off lands: the mundane demands of daily reality instantly fade into the background. Their aura casts a spellbinding, imaginative field that stimulates curiosity and wonder, using metaphors and sensory pictures to evoke deep emotional resonance in those listening. It doesn’t demand practical application or logical proof; it simply enchants the listener, inviting everyone nearby to step out of their narrow world and explore new ideas, beliefs, and possibilities.',
  },
  58: {
    location:
      'The Root Center — the adrenalized motor and pressure center at the base of the bodygraph, supplying physical stress, momentum, and foundational fuel to drive evolutionary movement and handle life’s demands.',
    channels:
      'Gate 58 forms the 18–58 channel (Judgment) with Gate 18 in the Spleen Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 58 active feels like standing under a bright, high-voltage spotlight focused squarely on what is stagnant, broken, or in need of improvement. Their aura transmits an irrepressible, vital pressure for perfection and joy, naturally highlighting flaws and inefficiencies not out of malice, but from a deep drive to restore life force. It creates an energetic itch in the room to fix, refine, and polish whatever is currently failing to thrive.',
  },
  59: {
    location:
      'The Sacral Center — the body’s primary engine of life-force and generative energy, governing work capacity, sustainability, and physical vitality.',
    channels:
      'Gate 59 forms the 6–59 channel (Mating) with Gate 6 in the Solar Plexus Center — part of the Tribal Defense circuitry, governing the preservation, caretaking, and physical protection of the clan and its future generations.',
    experience:
      'Being around someone with Gate 59 active feels like watching social walls and personal boundaries instantly dissolve: a deeply magnetic, penetrating frequency that bypasses superficial defenses to create immediate, visceral intimacy. As a genetic ‘aura breaker,’ their presence carries an irresistible, disarming warmth that melts formality, inviting raw, honest connection whether emotional, creative, or physical. Being near them makes it impossible to maintain polite distance, forcing a transparent encounter.',
  },
  60: {
    location:
      'The Root Center — the adrenalized motor and pressure center at the base of the bodygraph, supplying physical stress, momentum, and foundational fuel to drive evolutionary movement and handle life’s demands.',
    channels:
      'Gate 60 forms the 3–60 channel (Mutation) with Gate 3 in the Sacral Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being in the aura of someone with Gate 60 active feels like being held in a tight, waiting vice: a heavy pressure of structural limitation and restraint that demands complete acceptance of what is. Their aura imposes an undeniable container on the room, forcing energy to slow down and endure the confines of present reality without panicking. Yet beneath that heavy compression lies a charged, erratic heartbeat, creating an atmosphere where everyone senses that a sudden, transformative pulse of mutation could burst through at any second.',
  },
  61: {
    location:
      'The Head Center — the pressure center for mental inspiration, generating the drive, wonder, and questioning that fuel human inquiry and force the mind to contemplate existence.',
    channels:
      'Gate 61 forms the 24–61 channel (Awareness) with Gate 24 in the Ajna Center — part of the Individual Knowing circuitry, driving individual mutation, creative expression, and unique acoustic knowing through a spontaneous pulse.',
    experience:
      'Being around someone with Gate 61 active feels like standing on the edge of a deep, mysterious canyon of universal truth. Their aura exerts a quiet, mesmerizing mental pressure that draws the room toward life’s deepest ‘why,’ inspiring others to drop mundane chatter and contemplate the profound mysteries of existence.',
  },
  62: {
    location:
      'The Throat Center — the primary hub of manifestation and communication, where all energetic streams throughout the bodygraph seek to transform into speech, action, and physical reality.',
    channels:
      'Gate 62 forms the 17–62 channel (Acceptance) with Gate 17 in the Ajna Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Being around someone with Gate 62 active feels like entering a brightly lit, pristine laboratory where every chaotic element is suddenly sorted, labeled, and placed in its exact shelf location. Their aura projects a cool, stabilizing frequency of precise detail that calms mental confusion and grounds abstract feelings into tangible facts and clear terminology. Standing near them brings a quiet, reassuring order to the atmosphere, making complex or overwhelming situations feel manageable, understandable, and neatly cataloged through the sheer grounding power of naming things accurately.',
  },
  63: {
    location:
      'The Head Center — the pressure center for mental inspiration, generating the drive, wonder, and questioning that fuel human inquiry and force the mind to contemplate existence.',
    channels:
      'Gate 63 forms the 4–63 channel (Logic) with Gate 4 in the Ajna Center — part of the Collective Logic circuitry, setting the master frequency for sustained focus, testing patterns, and logical determination.',
    experience:
      'Standing near someone with Gate 63 active feels like being placed under the lens of a rigorous, logical testing apparatus. Their presence radiates a sharp, persistent frequency of doubt that questions every assumption in the room, compelling those nearby to verify their facts and prove that their theories are logically sound.',
  },
  64: {
    location:
      'The Head Center — the pressure center for mental inspiration, generating the drive, wonder, and questioning that fuel human inquiry and force the mind to contemplate existence.',
    channels:
      'Gate 64 forms the 47–64 channel (Abstraction) with Gate 47 in the Ajna Center — part of the Collective Abstract circuitry, extracting wisdom from past lived experiences, emotional cycles, and reflection to share with humanity.',
    experience:
      'Proximity to someone with Gate 64 active feels like stepping into a swirling, cinematic gallery of past memories and abstract imagery. Their aura carries a dense, contemplative pressure to make sense of life’s chaotic experiences, drawing those nearby into a shared brewing phase until the overarching story finally becomes clear.',
  },
};

export const GATE_KEYNOTES: Record<number, GateKeynote> = {
  // Head Center
  64: { ichingName: 'Before Completion', coreMeaning: 'The pressure of confusion, to make sense of the past.', center: 'head' },
  61: { ichingName: 'Inner Truth', coreMeaning: 'The pressure of mystery, to know the unknowable.', center: 'head' },
  63: { ichingName: 'After Completion', coreMeaning: 'The pressure of doubt, to find the logical pattern.', center: 'head' },
  // Ajna Center
  47: { ichingName: 'Oppression', coreMeaning: 'The realization of mental patterns, the "aha" moment.', center: 'ajna' },
  24: { ichingName: 'Returning', coreMeaning: 'The rationalization of knowing, the cyclical return of thought.', center: 'ajna' },
  4:  { ichingName: 'Youthful Folly', coreMeaning: 'The formulation of logical answers, the possibility of a solution.', center: 'ajna' },
  17: { ichingName: 'Following', coreMeaning: 'The formulation of opinions, the understanding of patterns.', center: 'ajna' },
  43: { ichingName: 'Breakthrough', coreMeaning: 'The expression of individual insight, the "I know" that is not logical.', center: 'ajna' },
  11: { ichingName: 'Peace', coreMeaning: 'The conception of ideas, the stream of creativity.', center: 'ajna' },
  // Throat Center
  62: { ichingName: 'Preponderance of the Small', coreMeaning: 'The expression of detail, the naming of things.', center: 'throat' },
  23: { ichingName: 'Splitting Apart', coreMeaning: 'The expression of individual knowing, "I know that I know."', center: 'throat' },
  56: { ichingName: 'The Wanderer', coreMeaning: 'The expression of ideas through storytelling.', center: 'throat' },
  35: { ichingName: 'Progress', coreMeaning: 'The expression of experience, the "jack of all trades."', center: 'throat' },
  12: { ichingName: 'Standstill', coreMeaning: 'The expression of caution, the social gate of stillness.', center: 'throat' },
  45: { ichingName: 'Gathering Together', coreMeaning: 'The expression of the "I have," the voice of the King or Queen.', center: 'throat' },
  33: { ichingName: 'Retreat', coreMeaning: 'The expression of memory, the storyteller of the past.', center: 'throat' },
  8:  { ichingName: 'Holding Together', coreMeaning: 'The expression of contribution, making a unique difference.', center: 'throat' },
  31: { ichingName: 'Influence', coreMeaning: 'The expression of leadership, the voice of the democratic leader.', center: 'throat' },
  20: { ichingName: 'Contemplation', coreMeaning: 'The expression of the now, the voice of self-awareness.', center: 'throat' },
  16: { ichingName: 'Enthusiasm', coreMeaning: 'The expression of skill, the talent for mastery through repetition.', center: 'throat' },
  // G Center
  7:  { ichingName: 'The Army', coreMeaning: 'The role of the self in interaction, democratic leadership.', center: 'g_center' },
  1:  { ichingName: 'The Creative', coreMeaning: 'The expression of the creative self, pure yang.', center: 'g_center' },
  13: { ichingName: 'The Fellowship of Man', coreMeaning: 'The role of the listener, the keeper of secrets.', center: 'g_center' },
  10: { ichingName: 'Treading', coreMeaning: 'The behavior of the self, the love of being.', center: 'g_center' },
  15: { ichingName: 'Modesty', coreMeaning: 'The love of humanity, the energy of extremes in rhythm.', center: 'g_center' },
  2:  { ichingName: 'The Receptive', coreMeaning: 'The direction of the self, the driver, pure yin.', center: 'g_center' },
  46: { ichingName: 'Pushing Upward', coreMeaning: 'The love of the body, the determination of the self.', center: 'g_center' },
  25: { ichingName: 'Innocence', coreMeaning: 'The spirit of the self, universal love.', center: 'g_center' },
  // Heart Center
  21: { ichingName: 'Biting Through', coreMeaning: 'The control of resources, the treasurer.', center: 'heart' },
  40: { ichingName: 'Deliverance', coreMeaning: 'The aloneness of the ego, the will to provide.', center: 'heart' },
  26: { ichingName: 'The Taming Power of the Great', coreMeaning: 'The egoist, the trickster, the salesman.', center: 'heart' },
  51: { ichingName: 'The Arousing (Shock)', coreMeaning: 'The shock of initiation, the competitive will.', center: 'heart' },
  // Spleen Center
  48: { ichingName: 'The Well', coreMeaning: 'The fear of inadequacy, the depth of knowledge.', center: 'spleen' },
  57: { ichingName: 'The Gentle', coreMeaning: 'The fear of the future, the intuition of the now.', center: 'spleen' },
  44: { ichingName: 'Coming to Meet', coreMeaning: 'The fear of the past, the instinct for what is possible.', center: 'spleen' },
  50: { ichingName: 'The Cauldron', coreMeaning: 'The fear of responsibility, the awareness of tribal values.', center: 'spleen' },
  32: { ichingName: 'Duration', coreMeaning: 'The fear of failure, the intuition for what has endurance.', center: 'spleen' },
  28: { ichingName: 'Preponderance of the Great', coreMeaning: 'The fear of death, the struggle for purpose.', center: 'spleen' },
  18: { ichingName: 'Work on What Has Been Spoilt', coreMeaning: 'The fear of authority, the joy of correction.', center: 'spleen' },
  // Sacral Center
  5:  { ichingName: 'Waiting', coreMeaning: 'The fixed rhythm of life force, the pattern of waiting.', center: 'sacral' },
  14: { ichingName: 'Possession in Great Measure', coreMeaning: 'The power skills, the fuel to generate wealth.', center: 'sacral' },
  29: { ichingName: 'The Abysmal', coreMeaning: 'The energy to say "yes," the commitment to a cycle.', center: 'sacral' },
  59: { ichingName: 'Dispersion', coreMeaning: 'The energy for intimacy and breaking down barriers.', center: 'sacral' },
  9:  { ichingName: 'The Taming Power of the Small', coreMeaning: 'The power of focus and detail.', center: 'sacral' },
  3:  { ichingName: 'Difficulty at the Beginning', coreMeaning: 'The energy for mutation and ordering.', center: 'sacral' },
  42: { ichingName: 'Increase', coreMeaning: 'The energy for growth and finishing cycles.', center: 'sacral' },
  27: { ichingName: 'Nourishment', coreMeaning: 'The energy for caring and responsibility.', center: 'sacral' },
  34: { ichingName: 'The Power of the Great', coreMeaning: 'The pure power of life force, the busiest gate.', center: 'sacral' },
  // Solar Plexus Center
  6:  { ichingName: 'Conflict', coreMeaning: 'The emotional wave of intimacy and friction.', center: 'solar_plexus' },
  37: { ichingName: 'The Family', coreMeaning: 'The emotional wave of friendship and community.', center: 'solar_plexus' },
  22: { ichingName: 'Grace', coreMeaning: 'The emotional wave of openness and social grace.', center: 'solar_plexus' },
  36: { ichingName: 'The Darkening of the Light', coreMeaning: 'The emotional wave of crisis and new experience.', center: 'solar_plexus' },
  30: { ichingName: 'The Clinging Fire', coreMeaning: 'The emotional wave of desire and intensity.', center: 'solar_plexus' },
  55: { ichingName: 'Abundance', coreMeaning: 'The emotional wave of spirit and mood.', center: 'solar_plexus' },
  49: { ichingName: 'Revolution', coreMeaning: 'The emotional wave of principles and rejection.', center: 'solar_plexus' },
  // Root Center
  53: { ichingName: 'Development', coreMeaning: 'The pressure to start new things.', center: 'root' },
  60: { ichingName: 'Limitation', coreMeaning: 'The pressure of limitation, to transcend restriction.', center: 'root' },
  52: { ichingName: 'Keeping Still (Mountain)', coreMeaning: 'The pressure to focus and concentrate.', center: 'root' },
  19: { ichingName: 'Approach', coreMeaning: 'The pressure to be sensitive to the needs of the tribe.', center: 'root' },
  39: { ichingName: 'Obstruction', coreMeaning: 'The pressure to provoke and find the spirit.', center: 'root' },
  41: { ichingName: 'Decrease', coreMeaning: 'The pressure of fantasy, to begin a new experience.', center: 'root' },
  58: { ichingName: 'The Joyous', coreMeaning: 'The pressure to perfect, the vitality to correct.', center: 'root' },
  38: { ichingName: 'Opposition', coreMeaning: 'The pressure to struggle and find purpose.', center: 'root' },
  54: { ichingName: 'The Marrying Maiden', coreMeaning: 'The pressure of ambition and the drive to rise up.', center: 'root' },
};

export type CircuitGroup = 'Individual' | 'Collective' | 'Tribal';
export type SubCircuit =
  | 'Knowing' | 'Centering'                    // Individual
  | 'Sensing/Abstract' | 'Understanding/Logic'  // Collective
  | 'Defense' | 'Ego'                           // Tribal
  | 'Integration';                              // cross-cutting, not part of a Circuit Group

export interface ChannelCircuit {
  gates: [number, number];
  name: string;
  group: CircuitGroup | 'Integration';
  subCircuit: SubCircuit;
}

// The dominant reading calculateCircuitBalance() can return: one of the
// three Circuit Groups, the cross-cutting Integration construct, an even
// spread across all three groups with no single winner, or none at all
// (no active channels — the Reflector case).
export type CircuitMeaningKey = CircuitGroup | 'Integration' | 'Even' | 'None';

export const CIRCUIT_GROUP_MEANING: Record<CircuitMeaningKey, { keynote: string; passage: string }> = {
  Individual: {
    keynote: 'Empowerment',
    passage:
      "Your Individual channels don't run on a steady current — they pulse. There's a mutative on/off rhythm to how you know things: a sudden download of certainty, then a genuine quiet with nothing coming through at all. Neither half is a malfunction; both are the mechanism working correctly. The quiet half is where most of the trouble starts — if your mind tries to explain the emptiness instead of just letting it pass, that ordinary chemical dip can curdle into something that feels like real depression. You're not built to fit into a room's consensus or soften a knowing until it sounds palatable; when it lands, it can sound strange, disruptive, even a little unhinged to people running on steadier circuitry, and waiting for the right moment to say it out loud is not the same as silencing yourself. What you're actually here for is simpler than convincing anyone: mutate the world by being unmistakably, uncompromisingly yourself, and let that example do the influencing your words don't have to.",
  },
  Collective: {
    keynote: 'Sharing',
    passage:
      "Your Collective channels point outward by default — toward the room, the organization, the species, never just the one person in front of you. Two very different engines can produce that outward pull. The Logic side runs on testing and pattern, building toward a workable future: what can be made clearer, more efficient, more true, so it holds up later. The Abstract side runs on lived experience, replaying the past until the wisdom in it becomes shareable: what you just lived through, and who needs to hear it. Whichever engine dominates yours, the currency is the same — a pattern, an opinion, a story, offered to the group rather than kept as private property. The shadow shows up as impersonal energy mistaken for a personal attack: Logic can tip into relentless correcting and doubt, Abstract into replaying a disappointment until it hardens into a grievance. The fix isn't to stop sharing — it's remembering the material is about the pattern, not the person holding it, yours or anyone else's.",
  },
  Tribal: {
    keynote: 'Support',
    passage:
      "Your Tribal channels care about a much smaller radius than Individual or Collective circuitry — not humanity, not a broader philosophy, just who's actually in the room and whether they're provided for. Everything here runs on bargains: I support you, you support me, spoken or not. The Defense side protects and nurtures — the physical safety and continuity of the people closest to you. The Ego side builds and provides — ambition, resources, the material means to actually make good on the bargain. Belonging matters more here than almost anywhere else in the chart, and so does its shadow: a hard line between who's in the clan and who isn't, drawn less by logic than by familiarity. When a bargain goes unspoken and then gets broken, resentment lands harder here than the situation usually warrants — not because you're petty, but because an unspoken agreement is still an agreement to Tribal circuitry. The guidance is almost mechanical in its simplicity: say the terms out loud, every time, before you're depending on someone to hold up their end.",
  },
  Integration: {
    keynote: 'Survival',
    passage:
      "The four Integration channels — Power, Charisma, Awakening, and Perfected Form — aren't really a fourth circuit group; they're a separate structure entirely, tying the Throat, G Center, Sacral, and Spleen into what this system calls the survival backbone. Where Individual, Collective, and Tribal are all in some way social — mutating, sharing, or supporting other people — Integration isn't. It's the spine that lets you stand on your own conviction, right now, regardless of what any group thinks. Lived out of balance, that self-referencing intensity can look like reckless overdrive, an intuitive fear with no clear source, or a self-worth that quietly erodes when there's no external mirror confirming it. Lived in balance, it's simply the part of you that doesn't need permission to exist. If Integration is your strongest theme, the work isn't finding your tribe or your audience — it's trusting the immediate, gut-level, in-the-moment read your own design is already giving you.",
  },
  Even: {
    keynote: 'Synthesis',
    passage:
      "No single circuit dominates your design — two or more of Individual, Collective, Tribal, and Integration are running in close to equal measure. That's not indecision or a diluted version of any one theme; it makes you a natural translator between genuinely different operating systems. Depending on which circuits are tied, you might generate a personal knowing and shape it into something shareable with a wider audience, or ground a collective idea in what actually supports the people closest to you, or hold your own immediate conviction steady while still building toward something for the group — one circuit doing what another circuit can't. The friction shows up as an internal tug-of-war rather than a single clear pull: competing, equally legitimate demands, all wanting to run at once. Don't expect your mind to referee that argument — it can't, and every attempt just adds noise. Strategy and Authority already knows which circuit is correct for this specific moment; the balance was never a problem to solve, only a range to trust.",
  },
  None: {
    keynote: 'Reflection',
    passage:
      "You have no active channels running any of the three Circuit Groups — consistent with a Reflector configuration, where every Center stays open and nothing runs as a fixed circuit of your own. Circuitry, in the usual sense, isn't where your design does its work; your resistant, sampling aura is. Rather than generating a fixed pattern to mutate, share, or support, you take in whatever circuitry is active in the people and places around you and reflect it back with startling clarity — often becoming the clearest mirror in any room for how a group, a family, or even the wider culture is actually doing. That's not an absence; it's a different mechanism entirely, and its correctness depends almost completely on getting your environment and your timing right.",
  },
};

// All 36 Channels, with their gate pair, name, and circuit classification.
export const CHANNELS: ChannelCircuit[] = [
  { gates: [61, 24], name: 'Awareness',      group: 'Individual', subCircuit: 'Knowing' },
  { gates: [43, 23], name: 'Structuring',    group: 'Individual', subCircuit: 'Knowing' },
  { gates: [8, 1],   name: 'Inspiration',    group: 'Individual', subCircuit: 'Knowing' },
  { gates: [2, 14],  name: 'The Beat',       group: 'Individual', subCircuit: 'Knowing' },
  { gates: [3, 60],  name: 'Mutation',       group: 'Individual', subCircuit: 'Knowing' },
  { gates: [28, 38], name: 'Struggle',       group: 'Individual', subCircuit: 'Knowing' },
  { gates: [57, 20], name: 'The Brainwave',  group: 'Individual', subCircuit: 'Knowing' },
  { gates: [39, 55], name: 'Emoting',        group: 'Individual', subCircuit: 'Knowing' },
  { gates: [12, 22], name: 'Openness',       group: 'Individual', subCircuit: 'Knowing' },
  { gates: [51, 25], name: 'Initiation',     group: 'Individual', subCircuit: 'Centering' },
  { gates: [34, 10], name: 'Exploration',    group: 'Individual', subCircuit: 'Centering' },

  { gates: [64, 47], name: 'Abstraction',    group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [11, 56], name: 'Curiosity',      group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [13, 33], name: 'The Prodigal',   group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [46, 29], name: 'Discovery',      group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [35, 36], name: 'Transitoriness', group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [41, 30], name: 'Recognition',    group: 'Collective', subCircuit: 'Sensing/Abstract' },
  { gates: [53, 42], name: 'Maturation',     group: 'Collective', subCircuit: 'Sensing/Abstract' },

  { gates: [63, 4],  name: 'Logic',          group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [17, 62], name: 'Acceptance',     group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [31, 7],  name: 'The Alpha',      group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [15, 5],  name: 'Rhythm',         group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [16, 48], name: 'The Wavelength', group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [18, 58], name: 'Judgment',       group: 'Collective', subCircuit: 'Understanding/Logic' },
  { gates: [9, 52],  name: 'Concentration',  group: 'Collective', subCircuit: 'Understanding/Logic' },

  { gates: [50, 27], name: 'Preservation',   group: 'Tribal', subCircuit: 'Defense' },
  { gates: [59, 6],  name: 'Mating',         group: 'Tribal', subCircuit: 'Defense' },

  { gates: [44, 26], name: 'Surrender',      group: 'Tribal', subCircuit: 'Ego' },
  { gates: [19, 49], name: 'Synthesis',      group: 'Tribal', subCircuit: 'Ego' },
  { gates: [37, 40], name: 'Community',      group: 'Tribal', subCircuit: 'Ego' },
  { gates: [21, 45], name: 'The Money Line', group: 'Tribal', subCircuit: 'Ego' },
  { gates: [32, 54], name: 'Transformation', group: 'Tribal', subCircuit: 'Ego' },

  { gates: [57, 34], name: 'Power',          group: 'Integration', subCircuit: 'Integration' },
  { gates: [34, 20], name: 'Charisma',       group: 'Integration', subCircuit: 'Integration' },
  { gates: [20, 10], name: 'Awakening',      group: 'Integration', subCircuit: 'Integration' },
  { gates: [10, 57], name: 'Perfected Form', group: 'Integration', subCircuit: 'Integration' },
];

/** Look up a channel's circuit info by its two gate numbers, in either order. */
export function findChannelCircuit(gateA: number, gateB: number): ChannelCircuit | undefined {
  return CHANNELS.find(
    ch => (ch.gates[0] === gateA && ch.gates[1] === gateB) ||
          (ch.gates[0] === gateB && ch.gates[1] === gateA)
  );
}
