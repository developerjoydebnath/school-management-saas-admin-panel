"use client";

/**
 * Radix's Select (and DropdownMenu) default to `modal={true}` — when nested
 * inside an ancestor Dialog/Sheet/AlertDialog (also modal), the two
 * primitives' focus-traps and "outside pointer down" detection fight each
 * other: clicking anywhere in the nested popup that isn't a direct item can
 * bubble up as an "outside" interaction on the ancestor, closing it too,
 * instead of only closing the nested popup.
 *
 * `select.tsx` sets `modal={false}` on Select by default, which is the real
 * fix for that specific primitive. This guard is the safety net for
 * whatever that alone doesn't cover (edge-case timing, third-party popups,
 * Popover/DropdownMenu content) — call it from a modal container's
 * `onInteractOutside`/`onPointerDownOutside`/`onFocusOutside` handlers and
 * skip closing while any tracked floating layer is open.
 */
export function hasOpenFloatingLayer(): boolean {
	if (typeof document === "undefined") return false;
	return Boolean(
		document.body.hasAttribute("data-select-layer-open") ||
			document.querySelector(
				[
					'[data-slot="select-content"][data-state="open"]',
					'[data-slot="popover-content"][data-state="open"]',
					'[data-slot="dropdown-menu-content"][data-state="open"]',
				].join(",")
			)
	);
}

/** Cancels the outside-interaction event if a floating layer is open. Returns whether it did. */
export function preventCloseForFloatingLayer(event: Event): boolean {
	if (hasOpenFloatingLayer()) {
		event.preventDefault();
		return true;
	}
	return false;
}
