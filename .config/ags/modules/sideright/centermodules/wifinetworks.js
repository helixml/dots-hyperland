import App from 'resource:///com/github/Aylur/ags/app.js';
// import Network from "resource:///com/github/Aylur/ags/service/network.js"; // Disabled for container
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
const { Box, Button, Entry, Icon, Label, Revealer, Scrollable, Slider, Stack, Overlay } = Widget;
const { execAsync, exec } = Utils;
import { MaterialIcon } from '../../.commonwidgets/materialicon.js';
import { setupCursorHover } from '../../.widgetutils/cursorhover.js';
import { ConfigToggle } from '../../.commonwidgets/configwidgets.js';

export default (props) => {
    // WiFi networks disabled for container
    return Box({
        ...props,
        className: 'spacing-v-10',
        vertical: true,
        children: [
            Box({
                homogeneous: true,
                children: [Box({
                    vertical: true,
                    vpack: 'center',
                    className: 'txt spacing-v-10',
                    children: [
                        Box({
                            vertical: true,
                            className: 'spacing-v-5 txt-subtext',
                            children: [
                                MaterialIcon('signal_wifi_off', 'gigantic'),
                                Label({ label: 'WiFi disabled in container', className: 'txt-small' }),
                            ]
                        }),
                    ]
                })]
            })
        ]
    });
}