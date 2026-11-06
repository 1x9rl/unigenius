# Flutter → Web migration record

The uploaded Flutter sources are retained unchanged under `legacy-flutter/` for reference. The new web application does not delete or overwrite them.

| Flutter source | Web migration status |
|---|---|
| `lib/data/subjects.dart` | Migrated: all seven IDs and bilingual names are in `src/data/subjects.ts`. |
| `AnswerMode.quick/study/professor` | Migrated: tutor mode selector and prompt modes. |
| `lib/modules.dart` contracts | Replaced with explicit web diagnostics and an optional server-side AI adapter; no fake engine output. |
| `storagePath(userId, subjectId)` concept | Preserved as a data-isolation design requirement; authentication and multi-user storage are not implemented in this first build. |
| Flutter home screen | Replaced by responsive React web workspace. |
| Flutter theme/language controls | Reimplemented as web theme and Arabic/English toggles. |
| OCR / Vision / KnowledgeBase / Local LLM stubs | Not represented as completed features; scheduled for later implementation gates. |

The original `unigenius-main.zip` should remain in version control history or a separate backup. This migration archive also contains the extracted Flutter source files as a safety copy.
