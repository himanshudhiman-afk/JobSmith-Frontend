import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Accordion({ items }) {
  const [openId, setOpenId] = useState(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-slate-100 dark:hover:bg-slate-800/60"
            >
              {item.title}
              <ChevronDown
                size={16}
                className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
