"use client";

import { Modal } from "@/components/ui/Modal";
import { EditQuestionForm } from "./EditQuestionForm";

export interface EditableQuestion {
  id: string;
  label: string;
  category: string | null;
  type: string;
  help: string | null;
  placeholder: string | null;
  prefix: string | null;
  suffix: string | null;
  options: unknown;
}

export function EditQuestionModal({ question, onClose }: { question: EditableQuestion | null; onClose: () => void }) {
  if (!question) return null;
  return (
    <Modal onClose={onClose}>
      <EditQuestionForm question={question} onSaved={onClose} onClose={onClose} />
    </Modal>
  );
}
