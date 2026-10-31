import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decodeNotebook,
  emptyNotebook,
  normalizeTags,
  selectNotes,
  type Note,
} from "../src/model.ts";
const note = (id: string, pinned = false, updatedAt = 1): Note => ({
  id,
  title: id,
  body: "Une idée",
  tags: ["travail"],
  color: 0,
  pinned,
  updatedAt,
});
test("a new installation starts with an empty notebook", () =>
  assert.deepEqual(decodeNotebook(null), emptyNotebook()));
test("notes and preferences survive serialization", () => {
  const book = {
    ...emptyNotebook(),
    notes: [note("a")],
    tags: ["travail"],
    dark: true,
  };
  assert.deepEqual(decodeNotebook(JSON.stringify(book)), book);
});
test("corrupted or unsupported data is rejected instead of silently reset", () => {
  for (const raw of [
    "{",
    "{}",
    '{"version":2}',
    JSON.stringify({ ...emptyNotebook(), notes: [{ ...note("a"), color: 8 }] }),
  ]) {
    assert.throws(() => decodeNotebook(raw));
  }
});
test("tags are trimmed, deduplicated and normalized", () =>
  assert.deepEqual(normalizeTags(" Travail, , travail, idées "), [
    "travail",
    "idées",
  ]));
test("pinned notes come first, then the latest update, without changing the source", () => {
  const notes = [note("a", false, 3), note("b", true), note("c", false, 4)];
  assert.deepEqual(
    selectNotes(notes, "", null).map((n) => n.id),
    ["b", "c", "a"],
  );
  assert.equal(notes[0].id, "a");
});
test("search and tag filters combine", () => {
  assert.equal(selectNotes([note("Budget")], "IDÉE", "travail").length, 1);
  assert.equal(selectNotes([note("Budget")], "budget", "maison").length, 0);
});
