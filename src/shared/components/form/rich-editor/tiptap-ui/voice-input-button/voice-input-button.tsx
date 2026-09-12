"use client";

import { Button } from "@/shared/components/form/rich-editor/tiptap-ui-primitive/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/form/rich-editor/tiptap-ui-primitive/dropdown-menu";
import { useTiptapEditor } from "@/shared/hooks/use-tiptap-editor";
import {
	SpeechLanguage,
	useSpeechRecognition,
} from "@/shared/hooks/use-speech-recognition";
import { ChevronDown, Mic, MicOff } from "lucide-react";
import * as React from "react";

const LANGUAGES: { label: string; value: SpeechLanguage }[] = [
	{ label: "বাংলা (Bangla)", value: "bn-BD" },
	{ label: "English", value: "en-US" },
];

/**
 * Dictation for the rich-text editor. Defaults to Bangla because that is the
 * language teachers write homework instructions in, and typing Bangla is the
 * slow part of their daily routine.
 */
export function VoiceInputButton() {
	const { editor } = useTiptapEditor();
	const [language, setLanguage] = React.useState<SpeechLanguage>("bn-BD");

	const { isSupported, isListening, interim, error, toggle, stop } =
		useSpeechRecognition({
			language,
			onFinalText: (text) => {
				if (!editor) return;
				// Insert at the cursor and keep a trailing space so consecutive
				// phrases do not run together.
				editor.chain().focus().insertContent(`${text} `).run();
			},
		});

	// Switching language restarts the engine, so stop first to avoid two sessions.
	const pickLanguage = (value: SpeechLanguage) => {
		if (isListening) stop();
		setLanguage(value);
	};

	if (!editor || !isSupported) return null;

	const activeLabel = LANGUAGES.find((l) => l.value === language)?.label ?? language;

	return (
		<>
			<Button
				type="button"
				data-style="ghost"
				data-active-state={isListening ? "on" : "off"}
				aria-label={isListening ? "Stop dictation" : "Start dictation"}
				aria-pressed={isListening}
				tooltip={
					isListening
						? "Stop dictation"
						: `Dictate in ${activeLabel}`
				}
				onClick={toggle}
			>
				{isListening ? (
					<MicOff className="tiptap-button-icon text-red-500" />
				) : (
					<Mic className="tiptap-button-icon" />
				)}
			</Button>

			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						data-style="ghost"
						aria-label="Dictation language"
						tooltip="Dictation language"
						className="gap-1"
					>
						<span className="text-[11px]">{language === "bn-BD" ? "বাং" : "EN"}</span>
						<ChevronDown className="tiptap-button-icon" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					{LANGUAGES.map((item) => (
						<DropdownMenuItem key={item.value} onClick={() => pickLanguage(item.value)}>
							{item.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			{isListening ? (
				<span className="text-muted-foreground ml-1 flex max-w-48 items-center gap-1.5 truncate text-[11px]">
					<span className="relative flex size-2 shrink-0">
						<span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
						<span className="relative inline-flex size-2 rounded-full bg-red-500" />
					</span>
					{interim || "Listening…"}
				</span>
			) : null}

			{error && error !== "no-speech" ? (
				<span className="text-destructive ml-1 text-[11px]">
					{error === "not-allowed" ? "Mic blocked" : "Mic error"}
				</span>
			) : null}
		</>
	);
}
