'use client';
import BrandBar from "../ui/BrandBar";
import PrimaryButton from "../ui/PrimaryButton";
import {useState} from "react";
import {QUESTIONS} from "@/lib/questions";
import {SKIPPED} from "@/lib/types";
import type { AnswerMap } from "@/lib/types";
import SpørsmålKort from "./SpørsmålKort";
import Intro from "./Intro";


type Stage = "intro" | number | "summary" | "submitted";

export default function Skjema() {
    const [stage, setStage] = useState<Stage>("intro");
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [draft, setDraft] = useState("");

    function goNext() {
      if (stage === "intro") {
        setStage(0);
        return;
      }
      if (typeof stage === 'number') {
        //lagre draft-svaret før vi går videre
        if (draft.trim()) setAnswers(prev => ({ ...prev, [QUESTIONS[stage].id]: draft}))
        setDraft('');
        setStage(stage < QUESTIONS.length - 1 ? stage + 1 : 'summary');
      }
    }

    function goSkip() {
      if (typeof stage !== 'number') return;
      setAnswers(prev => ({ ...prev, [QUESTIONS[stage].id]: SKIPPED}));
      setDraft('');
      setStage(stage < QUESTIONS.length - 1 ? stage + 1 : 'summary');

    }

    function goBack() {
      if (stage === "summary") {setStage(QUESTIONS.length - 1); return;}
      if (typeof stage === 'number' && stage > 0) setStage(stage - 1)
      else if (typeof stage === 'number' && stage == 0) setStage("intro");}
    

    function handleSubmit() {
      // TODO: Kall server action her (George)
      setStage("submitted");
    }
      

    return (
        <div className="flex flex-col min-h-screen bg-ink">
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            {stage === 'intro' && <Intro onStart={goNext} />}
            {typeof stage === 'number' && (
              <SpørsmålKort
                question={QUESTIONS[stage]}
                index={stage}
                total={QUESTIONS.length}
                draft={draft}
                onDraftChange={setDraft}
                onNext={goNext}
                onSkip={goSkip}
                onBack={goBack}/>)}
                
              
              {stage === 'summary' && <div>TODO: &lt;Oppsummering /&gt;</div>}
              {stage === 'submitted' && <div>TODO: &lt;Innsendt /&gt;</div>}
            </main>

            {process.env.NODE_ENV === 'development' && (
              <nav className="fixed bottom-3 left-3 flex flex-wrap gap-1 bg-black/80 text-white
            text-[11px] p-2 rounded-lg z-50">
              <button className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() =>
                setStage('intro')}>Intro</button>
              {QUESTIONS.map((_, i) => (
                <button key={i} className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() => {
                  setDraft(''); setStage(i); }}>Q{i + 1}</button>
                ))}
              <button className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() =>
                setStage('summary')}>Sum</button>
              <button className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() =>
                setStage('submitted')}>Done</button>
              </nav>
              )}
          </div>
    );
  }
  