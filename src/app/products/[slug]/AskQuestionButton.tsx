'use client';

import { useProductContext } from './ProductClientWrapper';

export default function AskQuestionButton() {
    const { openQuestionModal } = useProductContext();

    return (
        <button
            onClick={openQuestionModal}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
            Soru Sor
        </button>
    );
}
