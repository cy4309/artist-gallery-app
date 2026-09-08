import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ABOUT_CONTENT } from '@/content/about';
import { COPY } from '@/content/copy';
import { colors, space, type } from '@/theme/tokens';

export default function AboutScreen() {
  const openEmail = () => {
    void Linking.openURL(`mailto:${ABOUT_CONTENT.contactEmail}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.heading}>關於</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{ABOUT_CONTENT.title}</Text>

        <View style={styles.body}>
          {ABOUT_CONTENT.body.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>

        <View style={styles.contact}>
          <Text style={styles.contactPrefix}>✉ {ABOUT_CONTENT.contactLabel}：</Text>
          <Pressable onPress={openEmail} hitSlop={8}>
            <Text style={styles.contactEmail}>{ABOUT_CONTENT.contactEmail}</Text>
          </Pressable>
        </View>

        <View style={styles.links}>
          <Pressable onPress={() => router.push('/privacy')} hitSlop={8}>
            <Text style={styles.link}>{COPY.footer.privacy}</Text>
          </Pressable>
          <Text style={styles.linkSep}>·</Text>
          <Pressable onPress={() => router.push('/terms')} hitSlop={8}>
            <Text style={styles.link}>{COPY.footer.terms}</Text>
          </Pressable>
        </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingBottom: space.xxxl,
    gap: space.xxl,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  body: {
    gap: space.lg,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  paragraph: {
    fontSize: type.meta,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
  },
  contact: {
    alignItems: 'center',
    gap: space.xs,
  },
  contactPrefix: {
    fontSize: type.meta,
    color: colors.textMuted,
  },
  contactEmail: {
    fontSize: type.body,
    fontWeight: '600',
    color: colors.accentSoft,
    textDecorationLine: 'underline',
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.sm,
  },
  link: {
    fontSize: type.caption,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  linkSep: {
    fontSize: type.caption,
    color: colors.textDim,
  },
});
