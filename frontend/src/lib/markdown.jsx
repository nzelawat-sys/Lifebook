/**
 * Tiny markdown -> HTML renderer.
 * Keeps the bundle slim — no external dep needed.
 * Supports: # h1, ## h2, ### h3, **bold**, *italic*, lists, blank-line paragraphs.
 */
function escapeHtml(s) {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function renderInline(line) {
    let out = escapeHtml(line);
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    return out;
}

function mdToHtml(md = "") {
    const lines = md.split(/\r?\n/);
    const blocks = [];
    let buf = [];
    let inList = false;

    const flushPara = () => {
        if (buf.length) {
            blocks.push(`<p>${buf.map(renderInline).join(" ")}</p>`);
            buf = [];
        }
    };
    const flushList = () => {
        if (inList) {
            blocks.push(`</ul>`);
            inList = false;
        }
    };

    for (const raw of lines) {
        const line = raw.trim();
        if (!line) {
            flushPara();
            flushList();
            continue;
        }
        const h = line.match(/^(#{1,4})\s+(.*)$/);
        if (h) {
            flushPara();
            flushList();
            const lvl = h[1].length;
            blocks.push(`<h${lvl}>${renderInline(h[2])}</h${lvl}>`);
            continue;
        }
        const li = line.match(/^[-*]\s+(.*)$/);
        if (li) {
            flushPara();
            if (!inList) {
                blocks.push("<ul>");
                inList = true;
            }
            blocks.push(`<li>${renderInline(li[1])}</li>`);
            continue;
        }
        buf.push(line);
    }
    flushPara();
    flushList();
    return blocks.join("\n");
}

export default function ReactMarkdown({ children }) {
    return (
        <div
            dangerouslySetInnerHTML={{
                __html: mdToHtml(typeof children === "string" ? children : ""),
            }}
        />
    );
}
