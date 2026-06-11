# Bug Report Feature

## Konsept

Enkel knapp nederst til høyre på skjermen (for Brave-ansatte). Klikk åpner en pop-up med et tekstfelt. Når de sender inn går meldingen direkte til en dedikert Slack-kanal via webhook.

## Flyt

1. Bruker klikker bug-knapp (nederst til høyre)
2. Pop-up åpnes med tekstfelt
3. Bruker skriver melding og sender
4. Server action poster til Slack webhook
5. Melding dukker opp i `#vekstprofil-bugs` (eller tilsvarende)

## Implementasjon

### Slack
- Opprett en innkommende webhook i Slack (gratis): Slack App → Incoming Webhooks → legg til kanal
- Lagre webhook-URL som env var: `SLACK_BUG_WEBHOOK_URL`

### Backend
- Ny server action `reportBug(message, url)` i `app/actions.ts`
- Poster JSON til `SLACK_BUG_WEBHOOK_URL` med meldingen + hvilken URL brukeren var på

### Frontend
- Ny komponent `components/ui/BugReportButton.tsx`
- Fast posisjonert nederst til høyre (`fixed bottom-4 right-4`)
- Liten knapp → klikk åpner pop-up modal
- Pop-up: tekstfelt + send-knapp
- Legg til i admin layout (`app/admin/layout.tsx`) — kun for innloggede Brave-ansatte

## Payload til Slack (eksempel)

```json
{
  "text": "🐛 *Bug rapport*\n*Side:* /admin/surveys/123\n*Melding:* Knappen for å aktivere survey gjør ingenting."
}
```
