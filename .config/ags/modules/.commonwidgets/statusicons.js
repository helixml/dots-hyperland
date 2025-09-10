import App from 'resource:///com/github/Aylur/ags/app.js';
import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

import { MaterialIcon } from './materialicon.js';
// import Bluetooth from 'resource:///com/github/Aylur/ags/service/bluetooth.js'; // Disabled for container
// import Network from 'resource:///com/github/Aylur/ags/service/network.js'; // Disabled for container
import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';
import { languages } from './statusicons_languages.js';

// A guessing func to try to support langs not listed in data/languages.js
function isLanguageMatch(abbreviation, word) {
    const lowerAbbreviation = abbreviation.toLowerCase();
    const lowerWord = word.toLowerCase();
    let j = 0;
    for (let i = 0; i < lowerWord.length; i++) {
        if (lowerWord[i] === lowerAbbreviation[j]) {
            j++;
        }
        if (j === lowerAbbreviation.length) {
            return true;
        }
    }
    return false;
}

export const MicMuteIndicator = () => Widget.Revealer({
    transition: 'slide_left',
    transitionDuration: userOptions.animations.durationSmall,
    revealChild: false,
    setup: (self) => self.hook(Audio, (self) => {
        self.revealChild = Audio.microphone?.stream?.isMuted;
    }),
    child: MaterialIcon('mic_off', 'norm'),
});

export const NotificationIndicator = (notifCenterName = 'sideright') => {
    const widget = Widget.Revealer({
        transition: 'slide_left',
        transitionDuration: userOptions.animations.durationSmall,
        revealChild: false,
        setup: (self) => self
            .hook(Notifications, (self, id) => {
                if (!id || Notifications.dnd) return;
                if (!Notifications.getNotification(id)) return;
                self.revealChild = true;
            }, 'notified')
            .hook(App, (self, currentName, visible) => {
                if (visible && currentName === notifCenterName) {
                    self.revealChild = false;
                }
            })
        ,
        child: Widget.Box({
            children: [
                MaterialIcon('notifications', 'norm'),
                Widget.Label({
                    className: 'txt-small titlefont',
                    attribute: {
                        unreadCount: 0,
                        update: (self) => self.label = `${self.attribute.unreadCount}`,
                    },
                    setup: (self) => self
                        .hook(Notifications, (self, id) => {
                            if (!id || Notifications.dnd) return;
                            if (!Notifications.getNotification(id)) return;
                            self.attribute.unreadCount++;
                            self.attribute.update(self);
                        }, 'notified')
                        .hook(App, (self, currentName, visible) => {
                            if (visible && currentName === notifCenterName) {
                                self.attribute.unreadCount = 0;
                                self.attribute.update(self);
                            }
                        })
                    ,
                })
            ]
        })
    });
    return widget;
}

export const BluetoothIndicator = () => Widget.Label({
    className: 'txt-norm icon-material',
    label: 'bluetooth_disabled', // Always disabled for container
});

const BluetoothDevices = () => Widget.Box({
    className: 'spacing-h-5',
    children: [], // No Bluetooth devices in container
    visible: false,
})

const NetworkWiredIndicator = () => Widget.Label({
    className: 'txt-norm icon-material',
    label: 'signal_wifi_off', // Network disabled for container
});

const SimpleNetworkIndicator = () => Widget.Icon({
    icon: 'network-wireless-disabled-symbolic', // Network disabled for container
    visible: true,
});

const NetworkWifiIndicator = () => Widget.Label({
    className: 'txt-norm icon-material',
    label: 'signal_wifi_off', // Network disabled for container
});

export const NetworkIndicator = () => Widget.Label({
    className: 'txt-norm icon-material',
    label: 'signal_wifi_off', // Network disabled for container
});

const HyprlandXkbKeyboardLayout = async ({ useFlag } = {}) => {
    try {
        const Hyprland = (await import('resource:///com/github/Aylur/ags/service/hyprland.js')).default;
        var languageStackArray = [];

        const updateCurrentKeyboards = () => {
            var initLangs = [];
            JSON.parse(Utils.exec('hyprctl -j devices')).keyboards
                .forEach(keyboard => {
                    initLangs.push(...keyboard.layout.split(',').map(lang => lang.trim()));
                });
            initLangs = [...new Set(initLangs)];
            languageStackArray = Array.from({ length: initLangs.length }, (_, i) => {
                const lang = languages.find(lang => lang.layout == initLangs[i]);
                // if (!lang) return [
                //     initLangs[i],
                //     Widget.Label({ label: initLangs[i] })
                // ];
                // return [
                //     lang.layout,
                //     Widget.Label({ label: (useFlag ? lang.flag : lang.layout) })
                // ];
                // Object
                if (!lang) return {
                    [initLangs[i]]: Widget.Label({ label: initLangs[i] })
                };
                return {
                    [lang.layout]: Widget.Label({ label: (useFlag ? lang.flag : lang.layout) })
                };
            });
        };
        updateCurrentKeyboards();
        const widgetRevealer = Widget.Revealer({
            transition: 'slide_left',
            transitionDuration: userOptions.animations.durationSmall,
            revealChild: languageStackArray.length > 1,
        });
        const widgetKids = {
            ...languageStackArray.reduce((obj, lang) => {
                return { ...obj, ...lang };
            }, {}),
            'undef': Widget.Label({ label: '?' }),
        }
        const widgetContent = Widget.Stack({
            transition: 'slide_up_down',
            transitionDuration: userOptions.animations.durationSmall,
            children: widgetKids,
            setup: (self) => self.hook(Hyprland, (stack, kbName, layoutName) => {
                if (!kbName) {
                    return;
                }
                var lang = languages.find(lang => layoutName.includes(lang.name));
                if (lang) {
                    widgetContent.shown = lang.layout;
                }
                else { // Attempt to support langs not listed
                    lang = languageStackArray.find(lang => isLanguageMatch(lang[0], layoutName));
                    if (!lang) stack.shown = 'undef';
                    else stack.shown = lang[0];
                }
            }, 'keyboard-layout'),
        });
        widgetRevealer.child = widgetContent;
        return widgetRevealer;
    } catch {
        return null;
    }
}

const OptionalKeyboardLayout = async () => {
    try {
        return await HyprlandXkbKeyboardLayout({ useFlag: userOptions.appearance.keyboardUseFlag });
    } catch {
        return null;
    }
};
const createKeyboardLayoutInstances = async () => {
    const Hyprland = (await import('resource:///com/github/Aylur/ags/service/hyprland.js')).default;
    const monitorsCount = Hyprland.monitors.length
    const instances = await Promise.all(
        Array.from({ length: monitorsCount }, () => OptionalKeyboardLayout())
    );

    return instances;
};
const optionalKeyboardLayoutInstances = await createKeyboardLayoutInstances()

export const StatusIcons = (props = {}, monitor = 0) => Widget.Box({
    ...props,
    child: Widget.Box({
        className: 'spacing-h-15',
        children: [
            MicMuteIndicator(),
            optionalKeyboardLayoutInstances[monitor],
            NotificationIndicator(),
            NetworkIndicator(),
            Widget.Box({
                className: 'spacing-h-5',
                children: [BluetoothIndicator(), BluetoothDevices()]
            })
        ]
    })
});
