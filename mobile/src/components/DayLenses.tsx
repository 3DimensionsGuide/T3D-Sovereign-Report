import { StyleSheet, Text } from 'react-native';
import { PremiumGate } from '@/components/PremiumGate';
import { MoonToday } from '@/components/MoonToday';
import { RoadToday } from '@/components/RoadToday';
import { VehicleToday } from '@/components/VehicleToday';
import { gateReadingForDay } from '@/lib/gateDay';
import { roadDayFor } from '@/lib/roadDay';
import type { TimelineResult } from '@/lib/timelineTypes';
import { colors, fonts } from '@/theme/tokens';

/** "Tuesday, October 13" from a YYYY-MM-DD day key. */
export function dayTitleOf(iso?: string): string {
  if (!iso) return 'that day';
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

interface Props {
  data: TimelineResult;
  /** 0 is today. */
  selectedDay: number;
  premium: boolean;
}

/** The Road's reading of the selected day: your Personal Day. Today is free; looking ahead is Premium. */
export function RoadDayBlock({ data, selectedDay, premium }: Props) {
  const title = dayTitleOf(data.personal[selectedDay]?.date);
  if (selectedDay > 0 && !premium) {
    return (
      <PremiumGate
        title={`Your Personal Day on ${title}`}
        detail="Today's Personal Day reading is free. Look ahead with Premium: the theme, where to lean in and what to watch, for each day."
      />
    );
  }
  const rd = roadDayFor(data, selectedDay);
  return rd ? <RoadToday day={rd} dayLabel={selectedDay > 0 ? title : null} /> : null;
}

/** The Vehicle's reading of the selected day: the gate the Sun is in. Today is free; looking ahead is Premium. */
export function VehicleDayBlock({ data, selectedDay, premium }: Props) {
  const title = dayTitleOf(data.personal[selectedDay]?.date);
  if (selectedDay > 0) {
    if (!premium) {
      return (
        <PremiumGate
          title={`The gates on ${title}`}
          detail="Today's gate reading is free. Look ahead with Premium: what the Sun brings, where it tips over, and what to do, for each day."
        />
      );
    }
    const reading = gateReadingForDay(data, selectedDay);
    return reading ? (
      <VehicleToday data={reading} dayLabel={title} />
    ) : (
      <Text style={styles.sub}>Gate readings reach {data.gateDays?.length ?? 14} days ahead. Pick a nearer day to read it.</Text>
    );
  }
  return data.gateToday && data.gateToday.gates.length > 0 ? <VehicleToday data={data.gateToday} /> : null;
}

/** The Stoplight's reading of the selected day: the Moon's sign and house. Today is free; looking ahead is Premium. */
export function StoplightDayBlock({ data, selectedDay, premium }: Props) {
  const title = dayTitleOf(data.personal[selectedDay]?.date);
  if (selectedDay > 0 && !premium) {
    return (
      <PremiumGate
        title={`The Moon on ${title}`}
        detail="Today's Moon reading is free. Look ahead with Premium: the Moon's sign, the house it moves through, and what the day favors."
      />
    );
  }
  const day = data.moonDays?.find((d) => d.dayIndex === selectedDay);
  if (!day) {
    return selectedDay > 0 ? (
      <Text style={styles.sub}>Moon readings reach {data.moonDays ? data.moonDays.length - 1 : 14} days ahead. Pick a nearer day to read it.</Text>
    ) : null;
  }
  return <MoonToday day={day} dayLabel={selectedDay > 0 ? title : null} />;
}

const styles = StyleSheet.create({
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
});
