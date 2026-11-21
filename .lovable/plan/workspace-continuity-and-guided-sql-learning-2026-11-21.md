# Workspace continuity and guided SQL learning

## What will change
- Share the latest generated database design with Workspace as a clearly marked preview. Do not apply its DDL to the live database unless the user explicitly selects that option.
- Make Practice Mode’s topic list come from the selected difficulty’s actual questions (Easy 3, Medium 4, Hard 3), instead of showing unrelated fixed topics.
- Add a lesson for each available SQL topic with four or five runnable-looking English SQL examples and plain-language explanations; provide Tamil lesson explanations while keeping SQL in English.
- Make “Show Example” place a real example into the SQL editor. Add a topic test and keep later topics locked until the current topic is passed.
- Add Tamil to the Workspace language selector and preserve English SQL identifiers and keywords while asking the AI for Tamil explanations.
- Run focused rule tests and verify Workspace, designer handoff, lesson/sample/test gating, and Tamil explanation flows in the preview.

## Technical approach
- Persist the generated design in browser storage on successful generation, read it after hydration in Workspace, and display it separately from the connected database so an unapplied design is never presented as live data.
- Keep lesson content as app-owned topic data, map topics and challenge questions from the current practice records, and use existing read-only answer checks for topic completion.
- Pass the explanation language through the existing server-function boundary; do not expose AI credentials or add a second model integration.
- Add small tests for the level counts, derived topic lists, and unlock rule, then exercise the end-to-end flows in the running preview.

## Held action
- Creating real database tables is intentionally excluded until the user confirms it; generated SQL can change the live database and is difficult to undo.