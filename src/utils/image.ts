import { ImageSourcePropType } from 'react-native';

const LOCAL_IMAGES: Record<string, ImageSourcePropType> = {
  'imagem1.jpg': require('../assets/images/imagem1.jpg'),
  'images2.jpg': require('../assets/images/images2.jpg'),
  'images3.jpg': require('../assets/images/images3.jpg'),
  'images4.jpg': require('../assets/images/images4.jpg'),
  'images5.jpg': require('../assets/images/images5.jpg'),
};

const DEFAULT_FALLBACK_IMAGE: ImageSourcePropType = LOCAL_IMAGES['imagem1.jpg'];

export function resolveImageSource(
  source?: ImageSourcePropType | string | null
): ImageSourcePropType {
  if (!source) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  if (typeof source !== 'string') {
    return source;
  }

  const trimmed = source.trim();
  if (!trimmed) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  if (LOCAL_IMAGES[trimmed]) {
    return LOCAL_IMAGES[trimmed];
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('data:')
  ) {
    return { uri: trimmed };
  }

  return DEFAULT_FALLBACK_IMAGE;
}
