// Audio controls module - disabled for container environment
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
const { Box, Label } = Widget;

// Stub exports to maintain compatibility
export const AudioControls = (props = {}) => Box({
    ...props,
    className: 'spacing-v-5',
    vertical: true,
    children: [
        Label({
            label: 'Audio controls disabled in container',
            className: 'txt-small txt-subtext',
        })
    ]
});

export default AudioControls;