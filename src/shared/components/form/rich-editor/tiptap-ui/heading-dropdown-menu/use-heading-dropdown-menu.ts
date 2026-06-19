"use client"

import { useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/shared/hooks/use-tiptap-editor"

// --- Icons ---
import { HeadingIcon } from "@/shared/components/form/rich-editor/tiptap-icons/heading-icon"

// --- Tiptap UI ---
import {
  headingIcons,
  type Level,
  isHeadingActive,
  canToggle,
  shouldShowButton,
} from "@/shared/components/form/rich-editor/tiptap-ui/heading-button"

/**
 * Configuration for the heading dropdown menu functionality
 */
export interface UseHeadingDropdownMenuConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Available heading levels to show in the dropdown
   * @default [1, 2, 3, 4, 5, 6]
   */
  levels?: Level[]
  /**
   * Whether the dropdown should hide when headings are not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
}

/**
 * Gets the currently active heading level from the available levels
 */
export function getActiveHeadingLevel(
  editor: Editor | null,
  levels: Level[] = [1, 2, 3, 4, 5, 6]
): Level | undefined {
  if (!editor || !editor.isEditable) return undefined
  return levels.find((level) => isHeadingActive(editor, level))
}

/**
 * Custom hook that provides heading dropdown menu functionality for Tiptap editor
 */
export function useHeadingDropdownMenu(config?: UseHeadingDropdownMenuConfig) {
  const {
    editor: providedEditor,
    levels = [1, 2, 3, 4, 5, 6],
    hideWhenUnavailable = false,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = useState(true)
  const [, forceUpdate] = useState({})

  // isActive/activeLevel/canToggleState are read fresh on every render;
  // forceUpdate drives re-renders whenever a transaction fires.
  const activeLevel = getActiveHeadingLevel(editor, levels)
  const isActive = isHeadingActive(editor)
  const canToggleState = canToggle(editor)

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      setIsVisible(
        shouldShowButton({ editor, hideWhenUnavailable, level: levels })
      )
      forceUpdate({})
    }

    handleUpdate()

    editor.on("transaction", handleUpdate)

    return () => {
      editor.off("transaction", handleUpdate)
    }
  }, [editor, hideWhenUnavailable, levels])

  return {
    isVisible,
    activeLevel,
    isActive,
    canToggle: canToggleState,
    levels,
    label: "Heading",
    Icon: activeLevel ? headingIcons[activeLevel] : HeadingIcon,
  }
}
