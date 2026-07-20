"use client"

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

  return editorState ?? { editor: null }
}
