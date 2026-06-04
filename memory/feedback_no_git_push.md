---
name: feedback_no_git_push
description: Andreas never wants claude to push to GitHub or manage git commits on behalf of the user — they handle all git operations themselves via GitHub Desktop
metadata:
  type: feedback
---

Never run `git push`, `git commit`, or any git write operations on behalf of the user.

**Why:** The user manages all git operations themselves using GitHub Desktop, which has auto-labeling and works well for them. Pushing wastes tokens and is unnecessary overhead.

**How to apply:** When finishing a task, do not offer to commit or push. If the topic of git comes up, remind them they handle it and move on.

**Who:** Only for Andreas