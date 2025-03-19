/**
 * Check if the current browser is running on an Apple OS (macOS or iOS).
 *
 * @returns {boolean} whether the browser is running on an Apple OS
 */
export const isAppleOS = () =>
	typeof navigator !== 'undefined' &&
	// navigator.platform is deprecated，the latest Experimental proposal is navigator.userAgentData.platform
	// https://developer.mozilla.org/zh-CN/docs/Web/API/NavigatorUAData/platform
	(/Mac/.test(navigator.platform) ||
		(/AppleWebKit/.test(navigator.userAgent) &&
			/Mobile\/\w+/.test(navigator.userAgent)))

/**
 * Format a keyboard shortcut string.
 *
 * @param {string} shortcut the string to format
 * @param {string} [ctrlText='Ctrl'] the text to use for the 'Mod' key
 * @returns {string} the formatted string
 *
 * `formatKeyboardShortcut` takes a shortcut string with 'Mod' as a special token
 * for the modifier key. On Apple devices, this is the Command key, represented
 * by the ⌘ symbol. On other devices, the value of `ctrlText` is used.
 *
 * Example:
 *
 * ```
 * formatKeyboardShortcut('Mod+Enter') // '⌘+Enter' on Apple devices, 'Ctrl+Enter' on other devices
 * ```
 *
 * @param {string} shortcut the string to format
 * @param {string} [ctrlText='Ctrl'] the text to use for the 'Mod' key
 * @returns {string} the formatted string
 */
export function formatKeyboardShortcut(shortcut: string, ctrlText = 'Ctrl') {
	if (isAppleOS()) {
		return shortcut.replace('Mod', '⌘')
	}

	return shortcut.replace('Mod', ctrlText)
}

/**
 * Merges CSS classes.
 *
 * @param {string[]} classes the classes to merge
 * @returns {string} the merged classes
 */
export function mergeCSSClasses(...classes: string[]) {
	return classes.filter((c) => c).join(' ')
}

/**
 * Checks if the current browser is Safari.
 *
 * @returns {boolean} whether the browser is Safari
 */
export const isSafari = () =>
	/^((?!chrome|android).)*safari/i.test(navigator.userAgent)
