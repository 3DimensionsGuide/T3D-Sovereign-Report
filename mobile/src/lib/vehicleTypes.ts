export interface VehicleType {
  name: string;
  strategy: string;
  signature: string;
  notSelf: string;
  plain: string;
  recognize: string[];
  watchFor: string;
  tryThis: string;
  strategyPractice: string;
  notSelfVoice: string[];
}

export interface VehicleAuthority {
  name: string;
  mechanism: string;
  falseUrgency: string;
  distortion: string | null;
  doList: string[];
  doNotList: string[];
  reset: { title: string; instruction: string };
}

export interface VehicleProfile {
  value: string;
  role: string;
  socialPattern: string;
  visibility: string;
  plain: string;
}

export interface BridgeGate {
  gate: number;
  ichingName: string;
  coreMeaning: string;
  center: string;
  partnerGate: number;
  partnerCenter: string;
  channelName: string;
  experience: string | null;
}

export interface Bridge {
  groupA: string[];
  groupB: string[];
  classification: 'narrow' | 'wide';
  hangingGates: BridgeGate[];
}

export interface VehicleCenters {
  defined: { id: string; name: string; title: string; description: string }[];
  open: { id: string; name: string; title: string; sensitivity: string; wisdom: string; notDefect: string }[];
}

export interface VehicleChannel {
  name: string;
  gates: [number, number];
  group: string | null;
  subCircuit: string | null;
  from: string;
  to: string;
}

export interface VehicleGate {
  gate: number;
  line: number;
  planet: string;
  epoch: 'personality' | 'design';
  center: string;
  ichingName: string;
  coreMeaning: string;
}

export interface CrossGate {
  role: string;
  blurb: string;
  gate: number;
  ichingName: string;
  coreMeaning: string;
}

export interface VehicleDetail {
  locked: boolean;
  typeName: string;
  authorityName: string;
  profileValue: string;
  type: VehicleType | null;
  authority: VehicleAuthority | null;
  profile: VehicleProfile | null;
  definition: {
    type: string;
    circuitCount: number;
    meaning: string;
    groups: string[][];
    bridges: Bridge[];
  };
  centers: VehicleCenters;
  circuits: {
    dominant: string;
    keynote: string;
    passage: string;
    counts: Record<string, number>;
    channels: VehicleChannel[];
  };
  gates: VehicleGate[];
  cross: {
    name: string;
    family: string;
    keynote: string;
    passage: string;
    gates: CrossGate[];
  };
  godhead: {
    mechanism: string;
    name: string;
    quarter: string;
    quarterTheme: string;
    archetype: string;
    keynote: string;
    light: string;
    shadow: string;
    gates: number[];
  } | null;
  variables: {
    mechanism: string;
    items: { key: string; title: string; arrow: 'Left' | 'Right'; name: string; meaning: string }[];
  } | null;
}
