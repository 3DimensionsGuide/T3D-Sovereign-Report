import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import { colors } from '@/theme/tokens';

export type TabName = 'today' | 'timeline' | 'readings' | 'practice' | 'chart';

interface Props {
  name: TabName;
  color: string;
  focused: boolean;
  size?: number;
}

/**
 * Drawn tab icons in the T3D shape language. Every icon has an outline version (idle)
 * and a filled version (selected), so the selected tab never depends on colour alone.
 */
export function TabIcon({ name, color, focused, size = 26 }: Props) {
  const fill = focused ? color : 'none';
  const sw = 1.8;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {name === 'today' ? (
        <>
          <Circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth={sw} />
          <Path d="M12 3.5 A8.5 8.5 0 0 1 12 20.5 Z" fill={focused ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </>
      ) : null}
      {name === 'timeline' ? (
        <>
          <Path d="M4 19 C 9 19, 7 12, 12 12 S 15 5, 20 5" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
          <Circle cx="4.5" cy="19" r="2" fill={fill} stroke={color} strokeWidth={sw} />
          <Circle cx="19.5" cy="5" r="2" fill={fill} stroke={color} strokeWidth={sw} />
        </>
      ) : null}
      {name === 'readings' ? (
        <>
          <Polygon points="12,3 15.2,7.2 12,11.4 8.8,7.2" fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
          <Polygon points="6.2,13.2 9.8,20 2.6,20" fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
          <Circle cx="17.6" cy="16.8" r="3.4" fill={fill} stroke={color} strokeWidth={sw} />
        </>
      ) : null}
      {name === 'practice' ? (
        <>
          <Rect x="6.5" y="2.5" width="11" height="19" rx="3.5" fill={fill} stroke={color} strokeWidth={sw} />
          <Circle cx="12" cy="7.6" r="1.7" fill={focused ? colors.obsidian : 'none'} stroke={focused ? colors.obsidian : color} strokeWidth={1.4} />
          <Circle cx="12" cy="12" r="1.7" fill={focused ? colors.obsidian : 'none'} stroke={focused ? colors.obsidian : color} strokeWidth={1.4} />
          <Circle cx="12" cy="16.4" r="1.7" fill={focused ? colors.obsidian : 'none'} stroke={focused ? colors.obsidian : color} strokeWidth={1.4} />
        </>
      ) : null}
      {name === 'chart' ? (
        <>
          <Polygon points="12,2.5 21.5,12 12,21.5 2.5,12" fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
          <Line x1="12" y1="8" x2="12" y2="16" stroke={focused ? colors.obsidian : color} strokeWidth={1.4} strokeLinecap="round" />
          <Rect x="0" y="0" width="0" height="0" />
        </>
      ) : null}
    </Svg>
  );
}
