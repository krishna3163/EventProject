/**
 * examSecurity.js
 * Secure exam mode: disables right-click, copy/paste, tab switching detection,
 * and enforces fullscreen mode.
 */

let tabSwitchCount = 0;
let onViolationCallback = null;
let fullscreenExitCallback = null;

export const examSecurity = {
    /**
     * Activate all exam security measures.
     * @param {Function} onViolation - Called when a violation is detected (tab switch, fullscreen exit)
     * @param {Function} onFullscreenExit - Called specifically when fullscreen is exited
     */
    activate(onViolation, onFullscreenExit) {
        onViolationCallback = onViolation;
        fullscreenExitCallback = onFullscreenExit;

        this._disableRightClick();
        this._disableCopyPaste();
        this._detectTabSwitch();
        this._detectFullscreenExit();
        this.enterFullScreen();
    },

    deactivate() {
        document.removeEventListener('contextmenu', this._contextMenuHandler);
        document.removeEventListener('copy', this._copyHandler);
        document.removeEventListener('paste', this._pasteHandler);
        document.removeEventListener('cut', this._cutHandler);
        document.removeEventListener('visibilitychange', this._visibilityHandler);
        document.removeEventListener('fullscreenchange', this._fullscreenHandler);
        document.removeEventListener('webkitfullscreenchange', this._fullscreenHandler);
        document.removeEventListener('keydown', this._keydownHandler);
        this.exitFullScreen();
    },

    enterFullScreen() {
        const el = document.documentElement;
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => { });
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        }
    },

    exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => { });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    },

    isFullScreen() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement
        );
    },

    getTabSwitchCount() {
        return tabSwitchCount;
    },

    // ── Private handlers ──────────────────────────────────────────────────────

    _contextMenuHandler(e) {
        e.preventDefault();
        return false;
    },

    _copyHandler(e) {
        e.preventDefault();
        return false;
    },

    _pasteHandler(e) {
        e.preventDefault();
        return false;
    },

    _cutHandler(e) {
        e.preventDefault();
        return false;
    },

    _visibilityHandler() {
        if (document.hidden) {
            tabSwitchCount++;
            if (onViolationCallback) {
                onViolationCallback('tab_switch', tabSwitchCount);
            }
        }
    },

    _fullscreenHandler() {
        if (!examSecurity.isFullScreen()) {
            if (fullscreenExitCallback) {
                fullscreenExitCallback();
            }
            if (onViolationCallback) {
                onViolationCallback('fullscreen_exit', tabSwitchCount);
            }
        }
    },

    _keydownHandler(e) {
        // Block common shortcuts
        const blocked = [
            e.key === 'F12',
            e.ctrlKey && e.key === 'u',
            e.ctrlKey && e.key === 'c',
            e.ctrlKey && e.key === 'v',
            e.ctrlKey && e.key === 'a',
            e.ctrlKey && e.shiftKey && e.key === 'I',
            e.ctrlKey && e.shiftKey && e.key === 'J',
            e.ctrlKey && e.shiftKey && e.key === 'C',
            e.altKey && e.key === 'Tab',
        ];
        if (blocked.some(Boolean)) {
            e.preventDefault();
            return false;
        }
    },

    _disableRightClick() {
        document.addEventListener('contextmenu', this._contextMenuHandler);
    },

    _disableCopyPaste() {
        document.addEventListener('copy', this._copyHandler);
        document.addEventListener('paste', this._pasteHandler);
        document.addEventListener('cut', this._cutHandler);
        document.addEventListener('keydown', this._keydownHandler);
    },

    _detectTabSwitch() {
        document.addEventListener('visibilitychange', this._visibilityHandler);
    },

    _detectFullscreenExit() {
        document.addEventListener('fullscreenchange', this._fullscreenHandler);
        document.addEventListener('webkitfullscreenchange', this._fullscreenHandler);
    },
};

export default examSecurity;
