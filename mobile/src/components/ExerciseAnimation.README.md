# ExerciseAnimation Components

React Native components for displaying exercise animations in Expo apps.

## Components

### ExerciseAnimation (Basic)

Simple, lightweight component for displaying WebP animations.

**Features:**
- ✅ WebP support via expo-image
- ✅ Auto-play and loop
- ✅ Loading skeleton
- ✅ Error handling
- ✅ Two size presets
- ✅ CDN URL configuration

**When to use:**
- Standard exercise library
- Simple animation needs
- Prioritize performance
- WebP-only workflow

### ExerciseAnimationAdvanced

Feature-rich component with WebP and Lottie support.

**Features:**
- ✅ WebP and Lottie formats
- ✅ Auto format selection
- ✅ Format fallback
- ✅ Three size presets
- ✅ Playback speed control
- ✅ Optional exercise label
- ✅ Enhanced error handling

**When to use:**
- Need Lottie support
- Want format flexibility
- Need playback controls
- Dynamic sizing requirements

## Installation

### Basic (WebP only)

```bash
npm install expo-image
```

### Advanced (WebP + Lottie)

```bash
npm install expo-image lottie-react-native lottie-ios@3.4.0
cd ios && pod install && cd ..
```

## Setup

### Environment Variables

Create or update `.env`:

```bash
EXPO_PUBLIC_CDN_BASE_URL=https://cdn.intensely.app
```

### TypeScript (Optional)

Add type definition for env vars in `env.d.ts`:

```typescript
declare module '@env' {
  export const EXPO_PUBLIC_CDN_BASE_URL: string;
}
```

## Usage

### Basic Example

```tsx
import ExerciseAnimation from '@/components/ExerciseAnimation';

function ExerciseCard({ exercise }) {
  return (
    <View>
      <ExerciseAnimation
        slug={exercise.slug}
        size="compact"
      />
      <Text>{exercise.name}</Text>
    </View>
  );
}
```

### Advanced Example

```tsx
import ExerciseAnimationAdvanced from '@/components/ExerciseAnimationAdvanced';

function ExerciseDetail({ exercise }) {
  return (
    <View>
      <ExerciseAnimationAdvanced
        slug={exercise.slug}
        size="expanded"
        format="auto"
        showLabel
        speed={1.0}
        onLoadEnd={() => console.log('Animation loaded!')}
      />
    </View>
  );
}
```

### With Custom CDN

```tsx
<ExerciseAnimation
  slug="push-up"
  cdnBaseUrl="https://custom-cdn.example.com"
/>
```

### Exercise Library Grid

```tsx
function ExerciseLibrary({ exercises }) {
  return (
    <FlatList
      data={exercises}
      numColumns={3}
      renderItem={({ item }) => (
        <ExerciseAnimation
          slug={item.slug}
          size="compact"
        />
      )}
    />
  );
}
```

### Workout Builder

```tsx
function WorkoutBuilder({ exercises }) {
  return (
    <ScrollView>
      {exercises.map((exercise) => (
        <View key={exercise.slug} style={styles.row}>
          <ExerciseAnimation
            slug={exercise.slug}
            size="compact"
          />
          <View>
            <Text>{exercise.name}</Text>
            <Text>{exercise.sets} × {exercise.reps}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
```

### Exercise Detail View

```tsx
function ExerciseDetailScreen({ exercise }) {
  return (
    <ScrollView>
      <ExerciseAnimationAdvanced
        slug={exercise.slug}
        size="expanded"
        format="auto"
        showLabel
        label={exercise.name}
      />
      <Text>{exercise.description}</Text>
      <Text>Instructions:</Text>
      {exercise.instructions.map((step, i) => (
        <Text key={i}>{i + 1}. {step}</Text>
      ))}
    </ScrollView>
  );
}
```

## API Reference

### ExerciseAnimation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slug` | `string` | required | Exercise slug (e.g., "push-up") |
| `size` | `'compact' \| 'expanded'` | `'compact'` | Display size (120px or 240px) |
| `cdnBaseUrl` | `string` | env var or default | CDN base URL |
| `onLoadStart` | `() => void` | - | Called when loading starts |
| `onLoadEnd` | `() => void` | - | Called when loading completes |
| `onError` | `(error: any) => void` | - | Called on error |

### ExerciseAnimationAdvanced Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slug` | `string` | required | Exercise slug |
| `size` | `'compact' \| 'medium' \| 'expanded'` | `'medium'` | Display size (100, 160, or 240px) |
| `format` | `'webp' \| 'lottie' \| 'auto'` | `'auto'` | Animation format |
| `cdnBaseUrl` | `string` | env var or default | CDN base URL |
| `autoPlay` | `boolean` | `true` | Auto-play animation |
| `loop` | `boolean` | `true` | Loop animation |
| `speed` | `number` | `1.0` | Playback speed multiplier |
| `showLabel` | `boolean` | `false` | Show exercise label |
| `label` | `string` | slug | Custom label text |
| `onLoadStart` | `() => void` | - | Called when loading starts |
| `onLoadEnd` | `() => void` | - | Called when loading completes |
| `onError` | `(error: any) => void` | - | Called on error |

## Size Guide

| Size | Dimensions | Use Case |
|------|------------|----------|
| `compact` | 100-120px | Grid views, lists, thumbnails |
| `medium` | 160px | Cards, previews |
| `expanded` | 240px | Detail views, featured exercises |

## Performance Tips

### 1. Use Compact Size for Lists

```tsx
// ✅ Good - Compact size for grid
<FlatList
  data={exercises}
  renderItem={({ item }) => (
    <ExerciseAnimation slug={item.slug} size="compact" />
  )}
/>

// ❌ Bad - Large size for grid (performance impact)
<FlatList
  data={exercises}
  renderItem={({ item }) => (
    <ExerciseAnimation slug={item.slug} size="expanded" />
  )}
/>
```

### 2. Lazy Load Animations

```tsx
// Only render animations when visible
<FlatList
  data={exercises}
  windowSize={5}  // Render 5 screens worth
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  renderItem={({ item }) => (
    <ExerciseAnimation slug={item.slug} size="compact" />
  )}
/>
```

### 3. Preload Critical Animations

```tsx
import { Image } from 'expo-image';

// Preload animations for user's favorite exercises
useEffect(() => {
  const urls = favoriteExercises.map(
    ex => `${CDN_BASE}/animations/${ex.slug}.webp`
  );
  Image.prefetch(urls);
}, [favoriteExercises]);
```

### 4. Use Format Auto-Selection

```tsx
// Automatically uses smaller Lottie if available
<ExerciseAnimationAdvanced
  slug={exercise.slug}
  format="auto"  // Prefers Lottie (smaller), fallback to WebP
/>
```

## Caching

Both components use expo-image's built-in caching:

- **Memory cache**: Fast access for recently viewed
- **Disk cache**: Persistent across app launches
- **CDN cache**: Edge-cached for fast initial load

**Cache policy:**
```tsx
cachePolicy="memory-disk"  // Default - uses both memory and disk
```

## Error Handling

### Display Error State

```tsx
<ExerciseAnimation
  slug={exercise.slug}
  onError={(error) => {
    console.error('Animation failed:', error);
    // Show toast/alert to user
    Alert.alert('Animation Error', 'Failed to load animation');
  }}
/>
```

### Fallback to Static Image

```tsx
function ExerciseAnimationWithFallback({ exercise }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <Image
        source={{ uri: exercise.thumbnailUrl }}
        style={{ width: 120, height: 120 }}
      />
    );
  }

  return (
    <ExerciseAnimation
      slug={exercise.slug}
      onError={() => setHasError(true)}
    />
  );
}
```

## Testing

### Unit Tests

```tsx
import { render } from '@testing-library/react-native';
import ExerciseAnimation from './ExerciseAnimation';

describe('ExerciseAnimation', () => {
  it('renders with correct slug', () => {
    const { getByTestId } = render(
      <ExerciseAnimation slug="push-up" size="compact" />
    );
    // Add assertions
  });

  it('shows loading skeleton initially', () => {
    const { getByTestId } = render(
      <ExerciseAnimation slug="push-up" />
    );
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });
});
```

### Integration Tests

```tsx
it('loads animation from CDN', async () => {
  const { getByTestId } = render(
    <ExerciseAnimation slug="push-up" />
  );

  await waitFor(() => {
    expect(getByTestId('animation-loaded')).toBeTruthy();
  });
});
```

## Troubleshooting

### Animation not loading

**Check:**
1. CDN URL is correct
2. Animation file exists on CDN
3. Network connectivity
4. CORS headers (if testing on web)

**Debug:**
```tsx
<ExerciseAnimation
  slug="push-up"
  onLoadStart={() => console.log('Loading...')}
  onLoadEnd={() => console.log('Loaded!')}
  onError={(e) => console.error('Error:', e)}
/>
```

### Lottie not working

**Check:**
1. `lottie-react-native` installed
2. iOS pods installed (`cd ios && pod install`)
3. Lottie JSON file exists on CDN

**Fallback to WebP:**
```tsx
<ExerciseAnimationAdvanced
  slug="push-up"
  format="auto"  // Will fallback to WebP if Lottie fails
/>
```

### Poor performance

**Solutions:**
1. Use `compact` size for lists
2. Reduce number of simultaneous animations
3. Use WebP instead of Lottie (lower CPU usage)
4. Implement virtualized lists

### Large bundle size

**Solutions:**
1. Use CDN hosting (don't bundle animations)
2. Preload only critical exercises
3. Lazy load animations on demand

## Migration Guide

### From Local Assets

**Before:**
```tsx
<Image source={require('./assets/animations/push-up.webp')} />
```

**After:**
```tsx
<ExerciseAnimation slug="push-up" />
```

### From Custom Component

**Before:**
```tsx
<AnimatedImage
  url={`https://cdn.example.com/push-up.webp`}
  width={120}
  height={120}
/>
```

**After:**
```tsx
<ExerciseAnimation
  slug="push-up"
  size="compact"
  cdnBaseUrl="https://cdn.example.com"
/>
```

## Best Practices

1. **Use correct size** - Compact for lists, expanded for details
2. **Handle errors** - Show fallback UI if animation fails
3. **Preload favorites** - Cache user's frequent exercises
4. **Lazy load** - Don't load all animations upfront
5. **Monitor performance** - Profile with many animations
6. **Use auto format** - Let component choose best format
7. **Test on devices** - Simulator performance differs from real devices

## Examples

See `ExerciseAnimation.example.tsx` for complete usage examples:
- Basic usage
- Different sizes
- Exercise library grid
- Exercise detail view
- With callbacks
- Workout builder
- Custom CDN
- Progressive loading

## Support

For issues or questions:
- GitHub: [anthropics/claude-code](https://github.com/anthropics/claude-code/issues)
- Documentation: See animation-pipeline/README.md

## License

MIT
