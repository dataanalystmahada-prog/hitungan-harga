import React, { useState } from 'react';
import { useMasterData } from '../hooks/useMasterData';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Sparkles, Copy, Check } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { PromptItem } from '../types/database.types';

export const PromptLibraryPage: React.FC = () => {
  const { prompts } = useMasterData();
  const { success } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Disalin ke Clipboard', 'Prompt template siap digunakan.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Prompt Library & AI Sales Assistant
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Kumpulan prompt dan template komunikasi untuk sales follow-up SPH, negosiasi, dan penutupan order.
        </p>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {prompts.map((p: PromptItem) => {
          const isCopied = copiedId === p.id;
          return (
            <Card key={p.id} hoverEffect className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{p.judul}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {p.kategori || 'Sales SPH'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {p.prompt_text}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant={isCopied ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleCopy(p.id, p.prompt_text)}
                  leftIcon={isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {isCopied ? 'Tersalin!' : 'Salin Prompt'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
