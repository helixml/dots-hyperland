// Animation helper that respects enableAnimations setting
const { userOptions } = await import('../.configuration/user_options.js');

export function getAnimationDuration(size = 'large') {
    // If animations are disabled, use minimal durations
    if (!userOptions.animations.enableAnimations) {
        return 1; // 1ms - imperceptible but valid CSS
    }
    
    // If animations are enabled, use full durations
    if (size === 'small') {
        return userOptions.animations.durationSmall;
    } else {
        return userOptions.animations.durationLarge;
    }
}

// Convenience functions
export const animationDurationSmall = () => getAnimationDuration('small');
export const animationDurationLarge = () => getAnimationDuration('large');
