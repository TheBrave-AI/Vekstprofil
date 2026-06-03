"use client";
import { useState } from "react";
import type { Question } from "@/lib/types";
import PrimaryButton from "../ui/PrimaryButton";
import GhostButton from "../ui/GhostButton";
import Arrow from "../ui/Arrow";
import BrandBar from "../ui/BrandBar";
import ProgressBar from "../skjema/Progressbar";

interface Props {
    question: Question;
    index : number;
    total: number;
    draft : string;
    onDraftChange :  (v: string) => void;
    onSkip: () => void;
    onNext: () => void;
    onBack: () => void;
}

export default function SpørsmålKort({ question, index, total, draft, onDraftChange, onNext, onSkip, onBack }:
  Props) {
    const [focused, setFocused] = useState(false);

    return (
         
      <div className="w-full max-w-[720px] bg-midnight rounded-card shadow-card p-[clamp(28px,4.4vw,52px)] m-10">
        <BrandBar />     
        <ProgressBar current={index} total={total} />
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-5">
            <span className="w-[22px] h-[2px] bg-marker shrink-0" />
            <span className="text-accent text-[12.5px] font-bold uppercase tracking-[0.12em]">
            {question.category}
            </span>
        </div>

        {/* Spørsmål */}
        <h2 className="font-display font-medium text-cloud leading-[1.1] tracking-[-0.015em] [text-wrap:pretty]"
            style={{ fontSize: 'clamp(28px, 4.6vw, 42px)' }}>
            {question.label}
        </h2>

        {/* Hjelpetekst */}
        <p className="text-mist text-[16.5px] leading-[1.55] max-w-[46ch] mt-4">
            {question.help}
        </p>

          {/* Input-rad */}
        <div className={`flex items-stretch mt-[34px] bg-navy rounded-xl overflow-hidden border-[1.5px] transition-all duration-200 ${
            focused ? 'border-accent shadow-[0_0_0_4px_rgba(12,139,160,0.14)]' : 'border-steel'}`}>
            {question.prefix && (
            <span className="text-muted text-[17px] px-[18px] flex items-center shrink-0">
                {question.prefix}
            </span>
            )}

            {question.type === 'text' ? (
            <textarea
                value={draft}
                onChange={e => onDraftChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={question.placeholder}
                rows={3}
                className="flex-1 bg-transparent text-cloud text-[18px] leading-[1.5] placeholder:text-muted p-[18px_20px]
                    resize-none outline-none min-h-[92px]"/>) : question.type === 'number' ? (
            <input
                type="text"
                inputMode="decimal"
                value={draft}
                onChange={e => onDraftChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={question.placeholder}
                className="flex-1 bg-transparent text-cloud text-[19px] font-medium placeholder:text-muted p-5 outline-none"/>) : (
            <div className="flex-1 p-5 text-muted text-[15px]">TODO: {question.type}</div>
            )}

            {question.suffix && (
            <span className="text-muted text-[17px] px-[18px] flex items-center shrink-0">
                {question.suffix}
            </span>
            )}
        </div>
        
        {/* Action-rad */}
        <div className= "flex items-center gap-[14px] flex-wrap mt-7">
            <PrimaryButton label={index === 0 ? 'Start' : 'Lagre og fortsett'} onClick={onNext} />
            <GhostButton label="Vet ikke / Har ikke tall på det" onClick={onSkip} />
            <button type="button" onClick={onBack} className="ml-auto text-muted text-[15px] font-medium hover:text-mist transition-colors px-2">← {index === 0 ? 'Avslutt' : 'Tilbake'}</button>
        </div>
      </div>
    );
  }