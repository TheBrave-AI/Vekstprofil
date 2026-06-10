"use client";
import { useState, useRef, useEffect } from "react";
import type { Question } from "@/lib/types";
import Button from "../ui/primitives/Button";
import Arrow from "../ui/primitives/Arrow";
import BrandBar from "../ui/brand/BrandBar";
import ProgressBar from "../ui/primitives/Progressbar";
import Eyebrow from "../ui/primitives/Eyebrow";
import { validateNumber } from "@/lib/validation";

interface Props {
  question: Question;
  index: number;
  total: number;
  draft: string;
  onDraftChange: (v: string) => void;
  onSkip: () => void;
  onNext: () => void;
  onBack: () => void;
  focusTrigger: number;
  companyName?: string;
}

export default function QuestionCard({ question, index, total, draft, onDraftChange, onNext, onSkip, onBack, focusTrigger, companyName }: Props) {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const numberError = question.type === "number" && touched ? validateNumber(draft) : null;
  const hasError = numberError !== null;

  function handleNext() {
    if (question.type === "number") {
      setTouched(true);
      if (validateNumber(draft) !== null) return;
    }
    onNext();
  }

  useEffect(() => { setTouched(false); }, [focusTrigger]);

  // Boolean state — parsed from draft on mount (component remounts per question via AnimatePresence key)
  const [boolChoice, setBoolChoice] = useState<"Ja" | "Nei" | null>(() => {
    if (draft === "Ja" || draft.startsWith("Ja\n")) return "Ja";
    if (draft === "Nei") return "Nei";
    return null;
  });

  const textRef = useRef<HTMLTextAreaElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const boolTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (question.type === "text") {
      textRef.current?.focus();
    } else if (question.type === "number") {
      numberRef.current?.focus();
    } else if (question.type === "boolean" && boolChoice === "Ja") {
      boolTextareaRef.current?.focus();
    }
  }, [focusTrigger]);

  const [boolDesc, setBoolDesc] = useState<string>(() =>
    draft.startsWith("Ja\n") ? draft.slice(3) : ""
  );

  // Select state
  const [selectValue, setSelectValue] = useState<string>(() => draft || "");

  // Multiselect state — stored/parsed with \n separator
  const [multiValues, setMultiValues] = useState<string[]>(() =>
    draft ? draft.split("\n").filter(Boolean) : []
  );

  function handleBoolChoice(choice: "Ja" | "Nei") {
    setBoolChoice(choice);
    if (choice === "Nei") {
      setBoolDesc("");
      onDraftChange("Nei");
    } else {
      onDraftChange(boolDesc ? `Ja\n${boolDesc}` : "Ja");
    }
  }

  function handleBoolDesc(text: string) {
    setBoolDesc(text);
    onDraftChange(text ? `Ja\n${text}` : "Ja");
  }

  function handleSelect(option: string) {
    setSelectValue(option);
    onDraftChange(option);
  }

  function handleMultiToggle(option: string) {
    const next = multiValues.includes(option)
      ? multiValues.filter(v => v !== option)
      : [...multiValues, option];
    setMultiValues(next);
    onDraftChange(next.join("\n"));
  }

  const pillBase = "px-4 py-3 rounded-xl text-[15px] font-medium border-[1.5px] transition-all duration-200";
  const pillActive = "bg-brand text-onbrand border-brand";
  const pillInactive = "bg-navy text-mist border-steel hover:border-accent hover:text-cloud";

  return (
    <div className="w-full max-w-[720px] bg-midnight rounded-card shadow-card p-[clamp(28px,4.4vw,52px)] m-10">
      <BrandBar label={companyName} />
      <ProgressBar current={index} total={total} />

      <Eyebrow label={question.category ?? ""} className="mb-5" />

      {/* Question */}
      <h2
        className="font-display font-medium text-cloud leading-[1.1] tracking-[-0.015em] [text-wrap:pretty]"
        style={{ fontSize: "clamp(28px, 4.6vw, 42px)" }}
      >
        {question.label}
      </h2>

      {/* Help text */}
      <p className="text-mist text-[16.5px] leading-[1.55] max-w-[46ch] mt-4">
        {question.help}
      </p>

      {/* Input area */}
      {question.type === "text" || question.type === "number" ? (
        <div className="mt-[34px]">
        <div className={`flex items-stretch bg-navy rounded-xl overflow-hidden border-[1.5px] transition-all duration-200 ${
          hasError ? "border-coral shadow-[0_0_0_4px_rgba(191,77,39,0.12)]" :
          focused   ? "border-accent shadow-[0_0_0_4px_rgba(12,139,160,0.14)]" : "border-steel"}`}>
          {question.prefix && (
            <span className="text-muted text-[17px] px-[18px] flex items-center shrink-0">
              {question.prefix}
            </span>
          )}
          {question.type === "text" ? (
            <textarea
              ref={textRef}
              value={draft}
              onChange={e => onDraftChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); onNext(); } }}
              placeholder={question.placeholder}
              rows={3}
              maxLength={2000}
              className="flex-1 bg-transparent text-cloud text-[18px] leading-[1.5] placeholder:text-muted p-[18px_20px] resize-none outline-none min-h-[92px]"
            />
          ) : (
            <input
              ref={numberRef}
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={e => onDraftChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
              placeholder={question.placeholder}
              maxLength={30}
              className="flex-1 bg-transparent text-cloud text-[19px] font-medium placeholder:text-muted p-5 outline-none"
            />
          )}
          {question.suffix && (
            <span className="text-muted text-[17px] px-[18px] flex items-center shrink-0">
              {question.suffix}
            </span>
          )}
        </div>
        {numberError && (
          <p className="mt-2 text-[13px] text-coral font-medium">{numberError}</p>
        )}
        </div>

      ) : question.type === "boolean" ? (
        <div className="mt-[34px] flex flex-col gap-3">
          <div className="flex gap-3">
            {(["Ja", "Nei"] as const).map(choice => (
              <button
                key={choice}
                type="button"
                onClick={() => handleBoolChoice(choice)}
                className={`flex-1 py-4 rounded-xl text-[17px] font-medium border-[1.5px] transition-all duration-200 ${
                  boolChoice === choice ? pillActive : pillInactive
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
          {boolChoice === "Ja" && (
            <div className={`flex items-stretch bg-navy rounded-xl overflow-hidden border-[1.5px] transition-all duration-200 ${
              focused ? "border-accent shadow-[0_0_0_4px_rgba(12,139,160,0.14)]" : "border-steel"}`}>
              <textarea
                ref={boolTextareaRef}
                value={boolDesc}
                onChange={e => handleBoolDesc(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); onNext(); } }}
                placeholder={question.placeholder}
                rows={3}
                maxLength={2000}
                className="flex-1 bg-transparent text-cloud text-[18px] leading-[1.5] placeholder:text-muted p-[18px_20px] resize-none outline-none min-h-[92px]"
              />
            </div>
          )}
        </div>

      ) : question.type === "select" ? (
        <div className="mt-[34px] flex flex-wrap gap-2">
          {question.options?.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`${pillBase} ${selectValue === option ? pillActive : pillInactive}`}
            >
              {option}
            </button>
          ))}
        </div>

      ) : question.type === "multiselect" ? (
        <div className="mt-[34px] flex flex-wrap gap-2">
          {question.options?.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => handleMultiToggle(option)}
              className={`${pillBase} ${multiValues.includes(option) ? pillActive : pillInactive}`}
            >
              {option}
            </button>
          ))}
        </div>

      ) : null}

      {/* Action row */}
      <div className="flex items-center gap-[14px] flex-wrap mt-7">
<<<<<<< Updated upstream
        <Button size="lg" onClick={handleNext} disabled={hasError} icon={<Arrow />}>{index === 0 ? "Start" : "Lagre og fortsett"}</Button>
        <Button variant="ghost" size="lg" onClick={onSkip}>Hoppe over</Button>
=======
>>>>>>> Stashed changes
        <button
          type="button"
          onClick={onBack}
          className="mr-auto text-muted text-[15px] font-medium hover:text-mist transition-colors px-2"
        >
          ← {index === 0 ? "Avslutt" : "Tilbake"}
        </button>

        <Button variant="ghost" size="lg" onClick={onSkip}>Hopp over</Button>
        <Button size="lg" onClick={handleNext} disabled={hasError} icon={<Arrow />}>{index === 0 ? "Start" : "Lagre og fortsett"}</Button>
      </div>
    </div>
  );
}
