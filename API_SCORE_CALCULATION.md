# API Score Calculation

This project uses approved activities to calculate capped category totals so that one category does not dominate the full API score.

## Current Category Caps

- `Teaching`: `100`
- `Co-curricular / Service`: `30`
- `Research`: `100`

## Formula

For each faculty member and year:

- `raw_teaching_score = sum(approved Teaching assigned_score)`
- `raw_co_curricular_score = sum(approved Co-curricular and Service assigned_score)`
- `raw_research_score = sum(approved Research assigned_score)`

Then caps are applied:

- `teaching_score = min(raw_teaching_score, 100)`
- `co_curricular_score = min(raw_co_curricular_score, 30)`
- `research_score = min(raw_research_score, 100)`

Final total:

- `total_score = teaching_score + co_curricular_score + research_score`

## Why This Was Added

This keeps one category from overpowering the final score. For example, a very large teaching total will still stop at `100`, and excess points in that category will not spill over into the final API total.

## Scope

This is a practical cap-based implementation for the current project schema. It is not a full end-to-end digital implementation of every UGC 2018 scoring rule.
