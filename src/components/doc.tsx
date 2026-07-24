import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// The one markdown renderer, used by the editor preview and the published
// page so both always agree. Text only: raw HTML is dropped, images are not
// rendered (their alt text is kept as plain text).

export function Doc({ content }: { content: string }) {
  return (
    <div className="doc">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        disallowedElements={["img"]}
        unwrapDisallowed
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
