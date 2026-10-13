import { createContext, useContext } from 'react';
import type { RoomName } from '@/theme/rooms';
import { themes, type RoomTheme, type ThemeName } from '@/theme/tokens';

/** Which tab palette a room uses. The three reading lenses share the Readings palette. */
export const ROOM_THEME: Record<RoomName, ThemeName> = {
  sky: 'today',
  road: 'timeline',
  ritual: 'practice',
  observatory: 'chart',
  readingVehicle: 'readings',
  readingRoad: 'readings',
  readingStoplight: 'readings',
};

export const RoomThemeContext = createContext<RoomTheme>(themes.today);

/** The palette of the tab the component is drawn in. For components shared between tabs. */
export function useRoomTheme(): RoomTheme {
  return useContext(RoomThemeContext);
}
