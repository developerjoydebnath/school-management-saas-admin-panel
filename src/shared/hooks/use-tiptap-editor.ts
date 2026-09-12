"use client"

// React Compiler would memoize the render-time `editor.isActive(...)` reads
// below on the stable [editor, type] refs and never recompute them, freezing
// every toolbar button in its first state. These hooks intentionally read the
// editor fresh on each render and re-render via a transaction listener.
"use no memo";

import type { Editor } from "@tiptap/react"
import { useCurrentEditor, useEditorState } from "@tiptap/react"
import { useEffect, useState } from "react"

function getActivePageEditor(editor: Editor): Editor | null {
  const storage = editor.storage as unknown as Record<string, unknown>
  const pages = storage.pages as { activeEditor?: Editor | null } | undefined
  if (!pages || !("activeEditor" in pages)) return null
  return pages.activeEditor ?? null
}

export function useTiptapEditor(providedEditor?: Editor | null): {
  editor: Editor | null
  editorState?: Editor["state"]
  canCommand?: Editor["can"]
} {
  "use no memo";
  const { editor: coreEditor } = useCurrentEditor()
  const mainEditor = providedEditor ?? coreEditor

  const [storageEditor, setStorageEditor] = useState<Editor | null>(null)
  const [, setEditorStateVersion] = useState(0)

  useEffect(() => {
    if (!mainEditor) {
      setStorageEditor(null)
      return
    }

    const updateHandler = () =>
      setStorageEditor(getActivePageEditor(mainEditor))

    updateHandler()

    mainEditor.on("update", updateHandler)
    mainEditor.on("selectionUpdate", updateHandler)

    return () => {
      mainEditor.off("update", updateHandler)
      mainEditor.off("selectionUpdate", updateHandler)
    }
  }, [mainEditor])

  useEffect(() => {
    if (!storageEditor) return

    const handleDestroy = () => setStorageEditor(null)

    storageEditor.on("destroy", handleDestroy)
    return () => {
      storageEditor.off("destroy", handleDestroy)
    }
  }, [storageEditor])

  const activeEditor = storageEditor ?? mainEditor

  useEffect(() => {
    if (!activeEditor) return

    const refreshToolbarState = () => {
      setEditorStateVersion((version) => version + 1)
    }

    refreshToolbarState()

    activeEditor.on("transaction", refreshToolbarState)
    activeEditor.on("selectionUpdate", refreshToolbarState)
    activeEditor.on("update", refreshToolbarState)
    activeEditor.on("focus", refreshToolbarState)
    activeEditor.on("blur", refreshToolbarState)

    return () => {
      activeEditor.off("transaction", refreshToolbarState)
      activeEditor.off("selectionUpdate", refreshToolbarState)
      activeEditor.off("update", refreshToolbarState)
      activeEditor.off("focus", refreshToolbarState)
      activeEditor.off("blur", refreshToolbarState)
    }
  }, [activeEditor])

  const editorState = useEditorState({
    editor: activeEditor,
    selector(context) {
      if (!context.editor) {
        return { editor: null, editorState: undefined, canCommand: undefined }
      }

      return {
        editor: context.editor,
        editorState: context.editor.state,
        canCommand: context.editor.can,
      }
    },
  })

  // The editor identity deliberately does NOT come from `useEditorState`.
  //
  // Tiptap's EditorStateManager seeds `lastSnapshot` with the editor passed on
  // the first render — null here, because `useEditor({ immediatelyRender:
  // false })` resolves after mount. Its `watch()` then swaps in the real editor
  // but neither refreshes `lastSnapshot` nor bumps `transactionNumber`, and
  // `getSnapshot()` short-circuits while those numbers match. So the selector
  // keeps reporting `editor: null` until the first transaction — i.e. until the
  // user clicks into the document — which left every toolbar control that
  // guards on `editor` rendering nothing until then.
  //
  // `activeEditor` comes from the context/prop and is correct immediately, so
  // it is the source of truth; `useEditorState` is kept purely as a re-render
  // signal.
  const resolvedEditor = activeEditor ?? editorState?.editor ?? null
  if (!resolvedEditor) {
    return { editor: null }
  }

  return {
    editor: resolvedEditor,
    editorState: resolvedEditor.state,
    canCommand: resolvedEditor.can,
  }
}
