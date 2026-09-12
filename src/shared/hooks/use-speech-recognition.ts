"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Thin wrapper over the Web Speech API.
 *
 * Bengali (bn-BD) dictation is the primary use case: teachers assign homework
 * for several classes every day and typing Bangla on a keyboard is slow, so
 * speaking the instructions is far faster.
 *
 * The API is Chrome/Edge-only and needs a network round trip, so `isSupported`
 * must be checked before showing any UI for it.
 */

type SpeechRecognitionLike = {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	maxAlternatives: number;
	start: () => void;
	stop: () => void;
	abort: () => void;
	onresult: ((event: any) => void) | null;
	onerror: ((event: any) => void) | null;
	onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
	if (typeof window === "undefined") return null;
	const w = window as any;
	return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export type SpeechLanguage = "bn-BD" | "en-US";

export function useSpeechRecognition({
	language = "bn-BD",
	onFinalText,
}: {
	language?: SpeechLanguage;
	/** Called with each finalised phrase, ready to insert into the document. */
	onFinalText: (text: string) => void;
}) {
	const [isSupported, setIsSupported] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [interim, setInterim] = useState("");
	const [error, setError] = useState<string | null>(null);

	const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
	// Held in a ref so restarting mid-session never binds a stale callback.
	// Written in an effect, never during render.
	const onFinalTextRef = useRef(onFinalText);
	useEffect(() => {
		onFinalTextRef.current = onFinalText;
	}, [onFinalText]);
	const shouldKeepListeningRef = useRef(false);

	useEffect(() => {
		setIsSupported(!!getRecognitionCtor());
	}, []);

	const stop = useCallback(() => {
		shouldKeepListeningRef.current = false;
		recognitionRef.current?.stop();
		setIsListening(false);
		setInterim("");
	}, []);

	const start = useCallback(() => {
		const Ctor = getRecognitionCtor();
		if (!Ctor) {
			setError("unsupported");
			return;
		}

		// Drop any previous instance so a language change takes effect.
		recognitionRef.current?.abort?.();

		const recognition = new Ctor();
		recognition.lang = language;
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.maxAlternatives = 1;

		recognition.onresult = (event: any) => {
			let interimText = "";
			for (let i = event.resultIndex; i < event.results.length; i += 1) {
				const result = event.results[i];
				const transcript = result[0]?.transcript ?? "";
				if (result.isFinal) {
					const clean = transcript.trim();
					if (clean) onFinalTextRef.current(clean);
				} else {
					interimText += transcript;
				}
			}
			setInterim(interimText);
		};

		recognition.onerror = (event: any) => {
			// "no-speech" and "aborted" are routine and shouldn't look like failures.
			if (event?.error === "no-speech" || event?.error === "aborted") return;
			setError(event?.error || "error");
			shouldKeepListeningRef.current = false;
			setIsListening(false);
		};

		recognition.onend = () => {
			setInterim("");
			// Chrome ends the session on its own after a pause; restart so a long
			// dictation is not cut off mid-sentence.
			if (shouldKeepListeningRef.current) {
				try {
					recognition.start();
					return;
				} catch {
					// Restart can throw if the engine is still shutting down.
				}
			}
			setIsListening(false);
		};

		recognitionRef.current = recognition;
		shouldKeepListeningRef.current = true;
		setError(null);
		try {
			recognition.start();
			setIsListening(true);
		} catch {
			setError("start-failed");
			setIsListening(false);
		}
	}, [language]);

	const toggle = useCallback(() => {
		if (isListening) stop();
		else start();
	}, [isListening, start, stop]);

	// Release the microphone if the component unmounts mid-dictation.
	useEffect(() => {
		return () => {
			shouldKeepListeningRef.current = false;
			recognitionRef.current?.abort?.();
		};
	}, []);

	return { isSupported, isListening, interim, error, start, stop, toggle };
}
