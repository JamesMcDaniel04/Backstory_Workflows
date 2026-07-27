import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ClipboardList, Loader2, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from './ui/Dialog';
import { CopyButton } from './ui/CopyButton';
import { assetUrl } from '../lib/cn';

// The generated project files carry a preamble (title, where the instructions
// go) above a `---` rule, then the block that is actually pasted into the
// Claude/OpenAI instruction field. Split them so the copy button hands over
// exactly the pasteable part and nothing else.
function splitInstructions(markdown) {
  const match = markdown.match(/^---\s*$/m);
  if (!match || match.index === undefined) return { preamble: '', body: markdown.trim() };
  return {
    preamble: markdown.slice(0, match.index).trim(),
    body: markdown.slice(match.index + match[0].length).trim(),
  };
}

function fieldLocation(preamble) {
  const match = preamble.match(/^##\s+Where This Goes\s*\n+(.+)$/m);
  return match ? match[1].trim() : '';
}

const markdownComponents = {
  h1: () => null,
  h2: ({ children }) => (
    <h2 className="mb-2 mt-6 border-b border-ac-light-gray pb-1.5 font-display text-[15px] font-bold text-ac-dark first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ac-coral-dark">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="mb-3 text-[13px] leading-6 text-ac-dark-secondary">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 text-[13px] leading-6 text-ac-dark-secondary">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-[13px] leading-6 text-ac-dark-secondary">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-ac-dark">{children}</strong>,
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-ac-warm-white px-1 py-0.5 font-mono text-[11.5px] text-ac-coral-dark">{children}</code>
    ) : (
      <code className="font-mono text-[11.5px] leading-5 text-ac-dark-secondary">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg border border-ac-light-gray bg-ac-warm-white p-3">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-ac-light-gray bg-ac-warm-white px-2.5 py-1.5 text-left font-semibold text-ac-dark">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-ac-light-gray px-2.5 py-1.5 align-top text-ac-dark-secondary">{children}</td>
  ),
  hr: () => <hr className="my-4 border-ac-light-gray" />,
};

export function ProjectInstructionsDialog({ workflowId, file, title, note, children }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ status: 'idle', body: '', preamble: '' });
  // Which file we have already kicked off a fetch for. Kept in a ref rather
  // than in `state` so that setting `loading` does not re-run this effect and
  // trip its own cleanup, which would cancel the request it just started.
  const requestedRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const key = `${workflowId}/${file}`;
    if (requestedRef.current === key) return undefined;
    requestedRef.current = key;

    let cancelled = false;
    setState({ status: 'loading', body: '', preamble: '' });

    fetch(assetUrl(`downloads/${workflowId}/${file}`))
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        setState({ status: 'ready', ...splitInstructions(text) });
      })
      .catch(() => {
        if (cancelled) return;
        // Allow a retry the next time the dialog is opened.
        requestedRef.current = null;
        setState({ status: 'error', body: '', preamble: '' });
      });

    return () => {
      cancelled = true;
    };
  }, [open, workflowId, file]);

  const where = fieldLocation(state.preamble);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[min(880px,calc(100vw-32px))]" padded={false} hideClose>
        <div className="sticky top-0 z-10 rounded-t-2xl border-b border-ac-light-gray bg-ac-card px-7 pb-4 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-10">
            <div>
              <div className="font-display text-[17px] font-bold text-ac-dark">{title}</div>
              {where ? (
                <div className="mt-1 font-mono text-[11px] text-ac-med-gray">Paste into: {where}</div>
              ) : null}
            </div>
            {state.status === 'ready' ? (
              <CopyButton text={state.body} label="Copy instructions" variant="primary" className="shrink-0" />
            ) : null}
          </div>
          {note ? <p className="mt-2 text-[12px] leading-5 text-ac-dark-secondary">{note}</p> : null}
          <DialogClose
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-ac-med-gray hover:bg-ac-cream hover:text-ac-dark"
            aria-label="Close"
          >
            <X size={18} />
          </DialogClose>
        </div>

        <div className="px-7 pb-7 pt-5">
          {state.status === 'loading' || state.status === 'idle' ? (
            <div className="flex items-center gap-2 py-10 text-[13px] text-ac-med-gray">
              <Loader2 size={14} className="animate-spin" /> Loading instructions…
            </div>
          ) : null}

          {state.status === 'error' ? (
            <p className="py-10 text-[13px] text-ac-dark-secondary">
              Could not load these instructions. The file is available at{' '}
              <code className="font-mono text-[12px]">
                {workflowId}/{file}
              </code>{' '}
              in the workflow repository.
            </p>
          ) : null}

          {state.status === 'ready' ? (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {state.body}
              </ReactMarkdown>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ac-light-gray pt-4">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-ac-med-gray">
                  <ClipboardList size={13} /> Copies as plain text, ready to paste.
                </span>
                <CopyButton text={state.body} label="Copy instructions" />
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
