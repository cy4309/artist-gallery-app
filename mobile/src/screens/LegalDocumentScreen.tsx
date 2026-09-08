import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LegalDocument, LegalSection } from '@/content/privacy';
import { colors, space, type } from '@/theme/tokens';

type LegalDocumentScreenProps = {
  document: LegalDocument;
  heading: string;
};

function SectionBlock({ section }: { section: LegalSection }) {
  return (
    <View style={styles.section}>
      {section.title ? (
        <Text style={styles.sectionTitle}>{section.title}</Text>
      ) : null}
      {section.paragraphs?.map((paragraph) => (
        <Text key={paragraph} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
      {section.bullets?.length ? (
        <View style={styles.bullets}>
          {section.bullets.map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}
      {section.subsections?.map((sub, index) => (
        <View key={`${sub.title}-${index}`} style={styles.subsection}>
          {sub.title ? (
            <Text style={styles.subsectionTitle}>{sub.title}</Text>
          ) : null}
          {sub.paragraphs?.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
          {sub.bullets?.length ? (
            <View style={styles.bullets}>
              {sub.bullets.map((item) => (
                <Text key={item} style={styles.bullet}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export default function LegalDocumentScreen({
  document,
  heading,
}: LegalDocumentScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.heading}>{heading}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.updated}>
          Last updated: {document.lastUpdated}
        </Text>

        {document.sections.map((section, index) => (
          <SectionBlock key={`${section.title}-${index}`} section={section} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.lg,
  },
  heading: {
    fontSize: type.heading,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  scroll: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxxl,
    gap: space.lg,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    color: colors.text,
  },
  updated: {
    fontSize: type.meta,
    color: colors.textMuted,
    marginBottom: space.sm,
  },
  section: {
    gap: space.sm,
  },
  sectionTitle: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.text,
    marginTop: space.sm,
  },
  subsection: {
    gap: space.sm,
    marginTop: space.xs,
  },
  subsectionTitle: {
    fontSize: type.meta,
    fontWeight: '700',
    color: colors.text,
  },
  paragraph: {
    fontSize: type.meta,
    lineHeight: 22,
    color: colors.textMuted,
  },
  bullets: {
    gap: 6,
    paddingLeft: space.xs,
  },
  bullet: {
    fontSize: type.meta,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
