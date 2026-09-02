import { StyleSheet, Text, View } from 'react-native';

import { colors, space, type } from '@/theme/tokens';
import { EventImageSource } from '@/types/event';

type EventImageSourceBadgeProps = {
  imageSource?: EventImageSource;
};

/** 二階段搜圖補上的圖片，於前台標示為示意圖 */
export default function EventImageSourceBadge({
  imageSource,
}: EventImageSourceBadgeProps) {
  if (imageSource !== 'search') return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>示意圖</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  text: {
    fontSize: type.caption - 1,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.text,
    opacity: 0.9,
  },
});
