/**
 * Icon Configuration
 * Based on Intensely Design System v1.0
 * Using Ionicons from @expo/vector-icons
 * Reference: /design.md
 */

// Icon Sizes
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

// Common Icons (Ionicons names)
export const icons = {
  // Workout Controls
  play: 'play-circle-outline',
  pause: 'pause-circle-outline',
  stop: 'stop-circle-outline',
  skip: 'play-skip-forward-outline',
  back: 'play-skip-back-outline',

  // Status
  checkmark: 'checkmark-circle',
  checkmarkOutline: 'checkmark-circle-outline',
  close: 'close',
  closeCircle: 'close-circle',

  // Actions
  add: 'add-circle-outline',
  addCircle: 'add-circle',
  remove: 'remove-circle-outline',
  edit: 'create-outline',
  delete: 'trash-outline',

  // Navigation
  search: 'search-outline',
  filter: 'filter-outline',
  settings: 'settings-outline',
  home: 'home-outline',
  user: 'person-outline',

  // Content
  timer: 'timer-outline',
  calendar: 'calendar-outline',
  list: 'list-outline',
  grid: 'grid-outline',
  heart: 'heart-outline',
  heartFilled: 'heart',
  star: 'star-outline',
  starFilled: 'star',

  // Info
  info: 'information-circle-outline',
  warning: 'warning-outline',
  error: 'alert-circle-outline',
  help: 'help-circle-outline',

  // Navigation Arrows
  arrowBack: 'arrow-back',
  arrowForward: 'arrow-forward',
  arrowUp: 'arrow-up',
  arrowDown: 'arrow-down',
  chevronBack: 'chevron-back',
  chevronForward: 'chevron-forward',
  chevronUp: 'chevron-up',
  chevronDown: 'chevron-down',

  // More
  more: 'ellipsis-horizontal',
  moreVertical: 'ellipsis-vertical',
  menu: 'menu-outline',

  // Workout Specific
  fitness: 'fitness-outline',
  barbell: 'barbell-outline',
  body: 'body-outline',
  stopwatch: 'stopwatch-outline',
} as const;

// Type exports
export type IconSizes = typeof iconSizes;
export type Icons = typeof icons;
export type IconName = typeof icons[keyof typeof icons];
