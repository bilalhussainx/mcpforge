'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface JsonViewerProps {
  data: unknown;
  depth?: number;
  maxDepth?: number;
}

function JsonValue({ value, depth, maxDepth }: { value: unknown; depth: number; maxDepth: number }) {
  if (value === null) {
    return <span className="json-null">null</span>;
  }

  if (value === undefined) {
    return <span className="json-null">undefined</span>;
  }

  if (typeof value === 'boolean') {
    return <span className="json-boolean">{value.toString()}</span>;
  }

  if (typeof value === 'number') {
    return <span className="json-number">{value}</span>;
  }

  if (typeof value === 'string') {
    const displayVal = value.length > 200 ? value.substring(0, 200) + '...' : value;
    return <span className="json-string">&quot;{displayVal}&quot;</span>;
  }

  if (Array.isArray(value)) {
    return <JsonArray arr={value} depth={depth} maxDepth={maxDepth} />;
  }

  if (typeof value === 'object') {
    return <JsonObject obj={value as Record<string, unknown>} depth={depth} maxDepth={maxDepth} />;
  }

  return <span className="text-text-dim">{String(value)}</span>;
}

function JsonArray({ arr, depth, maxDepth }: { arr: unknown[]; depth: number; maxDepth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);

  if (arr.length === 0) {
    return <span className="text-text-muted">[]</span>;
  }

  if (depth >= maxDepth) {
    return <span className="text-text-muted">[{arr.length} items]</span>;
  }

  return (
    <div className="inline">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center text-text-muted hover:text-accent transition-colors"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="text-text-muted ml-0.5">[{arr.length}]</span>
      </button>
      {expanded && (
        <div className="ml-4 border-l border-surface-light pl-2">
          {arr.map((item, idx) => (
            <div key={idx} className="py-0.5">
              <span className="json-number text-xs mr-2">{idx}:</span>
              <JsonValue value={item} depth={depth + 1} maxDepth={maxDepth} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JsonObject({
  obj,
  depth,
  maxDepth,
}: {
  obj: Record<string, unknown>;
  depth: number;
  maxDepth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const keys = Object.keys(obj);

  if (keys.length === 0) {
    return <span className="text-text-muted">{'{}'}</span>;
  }

  if (depth >= maxDepth) {
    return <span className="text-text-muted">{`{${keys.length} keys}`}</span>;
  }

  return (
    <div className="inline">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center text-text-muted hover:text-accent transition-colors"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="text-text-muted ml-0.5">{`{${keys.length}}`}</span>
      </button>
      {expanded && (
        <div className="ml-4 border-l border-surface-light pl-2">
          {keys.map((key) => (
            <div key={key} className="py-0.5">
              <span className="json-key">{key}</span>
              <span className="text-text-muted">: </span>
              <JsonValue value={obj[key]} depth={depth + 1} maxDepth={maxDepth} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JsonViewer({ data, depth = 0, maxDepth = 4 }: JsonViewerProps) {
  return (
    <div className="font-mono text-xs leading-relaxed">
      <JsonValue value={data} depth={depth} maxDepth={maxDepth} />
    </div>
  );
}
