"use client";

import { useRouter } from "next/navigation";
import { deleteSurvey } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export function DeleteSurveyButton({ surveyId }: { surveyId: string }) {
  const router = useRouter();

  return (
    <ConfirmDeleteButton
      label="Slett undersøkelse"
      description="Undersøkelsen og alle tilhørende svar vil bli permanent slettet. Dette kan ikke angres."
      onConfirm={async () => {
        await deleteSurvey(surveyId);
        router.push("/admin/surveys");
      }}
    />
  );
}
