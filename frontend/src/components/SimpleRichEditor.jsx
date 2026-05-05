import { useEffect, useRef, useState } from "react";
import {
    TextB,
    TextItalic,
    TextHOne,
    TextHTwo,
    ListBullets,
    ListNumbers,
    Quotes,
} from "@phosphor-icons/react";

/**
 * SimpleRichEditor — contenteditable-based, dependency-free.
 * Saves HTML. Supports bold, italic, h2, h3, ul, ol, blockquote.
 * Backwards compatible with plain-text values: detects HTML by `<` presence.
 */
export default function SimpleRichEditor({
    value,
    onChange,
    onBlur,
    placeholder = "Begin here…",
    testId,
}) {
    const ref = useRef(null);
    const [focused, setFocused] = useState(false);
    const [empty, setEmpty] = useState(true);
    const initialised = useRef(false);

    // Convert plain text (legacy) to HTML once, on first mount
    useEffect(() => {
        if (initialised.current) return;
        initialised.current = true;
        const v = value || "";
        const html = looksLikeHtml(v) ? v : plainToHtml(v);
        if (ref.current) {
            ref.current.innerHTML = html;
            setEmpty(stripTags(html).trim().length === 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync external value -> editor (e.g., AI suggestion appended)
    useEffect(() => {
        if (!ref.current) return;
        const cur = ref.current.innerHTML;
        const v = value || "";
        const wanted = looksLikeHtml(v) ? v : plainToHtml(v);
        if (cur !== wanted && document.activeElement !== ref.current) {
            ref.current.innerHTML = wanted;
            setEmpty(stripTags(wanted).trim().length === 0);
        }
    }, [value]);

    const exec = (cmd, arg = null) => {
        ref.current?.focus();
        document.execCommand(cmd, false, arg);
        emit();
    };

    const emit = () => {
        if (!ref.current) return;
        const html = ref.current.innerHTML;
        setEmpty(stripTags(html).trim().length === 0);
        onChange?.(html);
    };

    const Btn = ({ children, onMouseDown, label, testid }) => (
        <button
            type="button"
            data-testid={testid}
            aria-label={label}
            title={label}
            onMouseDown={(e) => {
                e.preventDefault();
                onMouseDown();
            }}
            className="w-7 h-7 inline-flex items-center justify-center rounded text-ink-muted hover:text-forest hover:bg-paper-soft transition-colors dark:text-paper/70 dark:hover:text-paper dark:hover:bg-ink/40"
        >
            {children}
        </button>
    );

    return (
        <div className="atlas-rich" data-testid={testId}>
            <div
                className={`flex items-center gap-1 mb-2 transition-opacity ${focused ? "opacity-100" : "opacity-50"
                    }`}
            >
                <Btn label="Bold" testid="rt-bold" onMouseDown={() => exec("bold")}>
                    <TextB size={16} weight="thin" />
                </Btn>
                <Btn label="Italic" testid="rt-italic" onMouseDown={() => exec("italic")}>
                    <TextItalic size={16} weight="thin" />
                </Btn>
                <span className="w-px h-4 bg-line mx-1" />
                <Btn
                    label="Heading"
                    testid="rt-h2"
                    onMouseDown={() => exec("formatBlock", "<h2>")}
                >
                    <TextHOne size={16} weight="thin" />
                </Btn>
                <Btn
                    label="Sub-heading"
                    testid="rt-h3"
                    onMouseDown={() => exec("formatBlock", "<h3>")}
                >
                    <TextHTwo size={16} weight="thin" />
                </Btn>
                <span className="w-px h-4 bg-line mx-1" />
                <Btn
                    label="Bulleted list"
                    testid="rt-ul"
                    onMouseDown={() => exec("insertUnorderedList")}
                >
                    <ListBullets size={16} weight="thin" />
                </Btn>
                <Btn
                    label="Numbered list"
                    testid="rt-ol"
                    onMouseDown={() => exec("insertOrderedList")}
                >
                    <ListNumbers size={16} weight="thin" />
                </Btn>
                <Btn
                    label="Quote"
                    testid="rt-quote"
                    onMouseDown={() => exec("formatBlock", "<blockquote>")}
                >
                    <Quotes size={16} weight="thin" />
                </Btn>
            </div>

            <div className="relative">
                {empty && (
                    <span className="pointer-events-none absolute top-2 left-0 text-ink-muted/70 dark:text-paper/40 italic font-display-italic">
                        {placeholder}
                    </span>
                )}
                <div
                    ref={ref}
                    contentEditable
                    data-testid={testId ? `${testId}-area` : undefined}
                    suppressContentEditableWarning
                    onInput={emit}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        setFocused(false);
                        onBlur?.(ref.current?.innerHTML || "");
                    }}
                    onPaste={(e) => {
                        // Force plain-text paste to keep things calm
                        e.preventDefault();
                        const text = e.clipboardData.getData("text/plain");
                        document.execCommand("insertText", false, text);
                    }}
                    className="prose-atlas atlas-rich-area outline-none border-b border-line dark:border-ink-soft/40 pb-3 min-h-[80px]"
                />
            </div>
        </div>
    );
}

// ---- helpers ---------------------------------------------------------------
function looksLikeHtml(s) {
    return /<\/?(p|div|h[1-6]|ul|ol|li|blockquote|strong|em|b|i|br)[\s>]/i.test(s);
}
function plainToHtml(s) {
    if (!s) return "";
    return s
        .split(/\n\s*\n/)
        .map(
            (para) =>
                "<p>" + para.replace(/\n/g, "<br/>").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</p>"
        )
        .join("");
}
function stripTags(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}
