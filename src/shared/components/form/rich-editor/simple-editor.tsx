"use client"

import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import { useEffect, useRef, useState } from "react"

// --- Tiptap Core Extensions ---
import { Highlight } from "@tiptap/extension-highlight"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Selection } from "@tiptap/extensions"
import { StarterKit } from "@tiptap/starter-kit"

// --- UI Primitives ---
import { Button } from "@/shared/components/form/rich-editor/tiptap-ui-primitive/button"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/shared/components/form/rich-editor/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import "@/shared/components/form/rich-editor/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/shared/components/form/rich-editor/tiptap-node/code-block-node/code-block-node.scss"
import "@/shared/components/form/rich-editor/tiptap-node/heading-node/heading-node.scss"
import { HorizontalRule } from "@/shared/components/form/rich-editor/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/shared/components/form/rich-editor/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/shared/components/form/rich-editor/tiptap-node/image-node/image-node.scss"
import { ImageUploadNode } from "@/shared/components/form/rich-editor/tiptap-node/image-upload-node/image-upload-node-extension"
import "@/shared/components/form/rich-editor/tiptap-node/list-node/list-node.scss"
import "@/shared/components/form/rich-editor/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { BlockquoteButton } from "@/shared/components/form/rich-editor/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/shared/components/form/rich-editor/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "@/shared/components/form/rich-editor/tiptap-ui/color-highlight-popover"
import { HeadingDropdownMenu } from "@/shared/components/form/rich-editor/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/shared/components/form/rich-editor/tiptap-ui/image-upload-button"
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "@/shared/components/form/rich-editor/tiptap-ui/link-popover"
import { ListDropdownMenu } from "@/shared/components/form/rich-editor/tiptap-ui/list-dropdown-menu"
import { MarkButton } from "@/shared/components/form/rich-editor/tiptap-ui/mark-button"
import { TextAlignButton } from "@/shared/components/form/rich-editor/tiptap-ui/text-align-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/shared/components/form/rich-editor/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/shared/components/form/rich-editor/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/shared/components/form/rich-editor/tiptap-icons/link-icon"

// --- Hooks ---
import { useCursorVisibility } from "@/shared/hooks/use-cursor-visibility"
import { useIsBreakpoint } from "@/shared/hooks/use-is-breakpoint"
import { useWindowSize } from "@/shared/hooks/use-window-size"

// --- Components ---

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/shared/lib/tiptap-utils"

// --- Styles ---
import "@/shared/components/form/rich-editor/simple-editor.scss"

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor({
  value,
  onValueChange,
  className
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const toolbarRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: `simple-editor ${className || ""}`,
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onValueChange?.(editor.getHTML());
    }
  })

  const [overlayHeight, setOverlayHeight] = useState(0)

  useEffect(() => {
    if (toolbarRef.current) {
      setOverlayHeight(toolbarRef.current.getBoundingClientRect().height)
      const observer = new ResizeObserver((entries) => {
        setOverlayHeight(entries[0].contentRect.height)
      })
      observer.observe(toolbarRef.current)
      return () => observer.disconnect()
    }
  }, [])

  const rect = useCursorVisibility({
    editor,
    overlayHeight,
  })
  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                bottom: `calc(100% - ${height - rect.y}px)`,
              }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className=""
        />
      </EditorContext.Provider>
    </div>
  )
}
