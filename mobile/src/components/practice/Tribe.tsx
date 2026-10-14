import { StyleSheet, Text, View } from 'react-native';
import { AccentView } from '@/components/AccentView';
import { GoldButton } from '@/components/GoldButton';
import { InviteCard } from '@/components/InviteCard';
import { LENS_TEXT, LensLabel } from '@/components/Lens';
import { Pressable } from '@/components/Pressable';
import type { TribeMember } from '@/lib/togetherTypes';
import { canAdd, groupTribe, MAX_TRIBE, RELATION_LABEL, RELATION_LINE, readLabel, tribeCountLine } from '@/lib/tribe';
import { colors, fonts, radius, space, themes } from '@/theme/tokens';

const T = themes.practice;

/** The first screen of Together, before anyone is added: what you get, and one clear way to start. */
export function TribeIntro({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={{ gap: space.md }}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>My Tribe</Text>
        <Text accessibilityRole="header" style={styles.heroTitle}>Why do some people feel easy, and others do not?</Text>
        <Text style={styles.body}>
          Add a friend or someone you are seeing. In a minute you will see how your design fits with theirs, so you know how to
          ask, when to move and what to watch for.
        </Text>
      </View>
      <AccentView style={[styles.benefit, { borderLeftColor: colors.vehicle }]}>
        <LensLabel lens="vehicle">How you ask</LensLabel>
        <Text style={styles.body}>How to bring a plan or a question to each other so you both feel heard.</Text>
      </AccentView>
      <AccentView style={[styles.benefit, { borderLeftColor: colors.road }]}>
        <LensLabel lens="road">Where you line up</LensLabel>
        <Text style={styles.body}>Where your paths meet, and where your pace differs this year.</Text>
      </AccentView>
      <AccentView style={[styles.benefit, { borderLeftColor: colors.stoplight }]}>
        <LensLabel lens="stoplight">Where you spark</LensLabel>
        <Text style={styles.body}>Where your skies fit, soften or clash, strongest first.</Text>
      </AccentView>
      <GoldButton label="Add your first person" onPress={onAdd} />
      <Text style={styles.small}>Their birth details stay on this phone. Nothing about them is saved on our server.</Text>
    </View>
  );
}

function Initial({ name, relation }: { name: string; relation: TribeMember['relation'] }) {
  const tint = relation === 'romantic' ? LENS_TEXT.stoplight : LENS_TEXT.road;
  return (
    <View style={[styles.avatar, { borderColor: tint }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={[styles.avatarText, { color: tint }]}>{(name.trim()[0] ?? '?').toUpperCase()}</Text>
    </View>
  );
}

/** Everyone saved, grouped, each one tappable to read the connection. */
export function TribeList({ people, onOpen, onAdd }: { people: TribeMember[]; onOpen: (id: string) => void; onAdd: () => void }) {
  return (
    <View style={{ gap: space.md }}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>My Tribe</Text>
        <Text accessibilityRole="header" style={styles.heroTitle}>The people in your life</Text>
        <Text style={styles.small}>{tribeCountLine(people.length)}. Tap anyone to see how you fit.</Text>
      </View>
      {groupTribe(people).map((g) => (
        <View key={g.relation} style={{ gap: space.sm }}>
          <Text accessibilityRole="header" style={styles.groupTitle}>{g.title}</Text>
          {g.members.map((m) => (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={`${readLabel(m.profile.label)}. ${RELATION_LABEL[m.relation]}.`}
              onPress={() => onOpen(m.id)}
              style={styles.member}
            >
              <Initial name={m.profile.label} relation={m.relation} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.memberName} numberOfLines={1}>{m.profile.label}</Text>
                <Text style={styles.small}>{RELATION_LABEL[m.relation]} · {RELATION_LINE[m.relation]}</Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}
        </View>
      ))}
      {canAdd(people) ? (
        <GoldButton label="Add someone" onPress={onAdd} />
      ) : (
        <Text style={styles.small}>Your tribe is full at {MAX_TRIBE} people. Remove someone to add a new person.</Text>
      )}
      <InviteCard />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: T.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: T.edge, padding: space.lg, gap: 12 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold },
  heroTitle: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 24, lineHeight: 31, color: colors.parchment },
  benefit: { backgroundColor: T.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: T.edge, borderLeftWidth: 4, padding: space.lg, gap: 6 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  groupTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 27, color: colors.parchment, paddingTop: space.xs },
  member: {
    minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md,
    backgroundColor: T.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: T.edge,
  },
  memberName: { fontFamily: fonts.display, fontSize: 20, lineHeight: 27, color: colors.parchment },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: T.raised },
  avatarText: { fontFamily: fonts.display, fontSize: 20 },
  chev: { fontFamily: fonts.body, fontSize: 24, color: colors.parchmentMuted },
});
