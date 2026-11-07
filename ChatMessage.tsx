import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

type ChatMessageProps = {
  role: 'user' | 'assistant';
  text: string;
  attachment?: { name: string; mimeType: string };
};

export function ChatMessage({ role, text, attachment }: ChatMessageProps) {
  return (
    <>
      {attachment && (
        <div className="message-attachment">
          <span aria-hidden="true">↗</span>
          <span>{attachment.name}</span>
        </div>
      )}
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
          {text}
        </ReactMarkdown>
      </div>
    </>
  );
}
