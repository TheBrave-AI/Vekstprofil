export const SURVEY_STATUS = {
  submitted: { label: "Besvart",   badge: "bg-accent/10 text-accent", dot: "bg-accent" },
  active:    { label: "Ubesvart", badge: "bg-amber/10 text-amber",   dot: "bg-amber"  },
  draft:     { label: "Utkast",   badge: "bg-steel/40 text-muted",   dot: "bg-steel"  },
} as const;

export type SurveyStatus = keyof typeof SURVEY_STATUS;
