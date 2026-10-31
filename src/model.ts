export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  color: number;
  pinned: boolean;
  updatedAt: number;
};
export type Notebook = {
  version: 1;
  notes: Note[];
  tags: string[];
  dark: boolean;
};
export const emptyNotebook = (): Notebook => ({
  version: 1,
  notes: [],
  tags: [],
  dark: false,
});
export const normalizeTags = (value: string): string[] =>
  [
    ...new Set(
      value
        .split(",")
        .map((tag) => tag.trim().toLocaleLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 12);

export function decodeNotebook(raw: string | null): Notebook {
  if (raw === null) return emptyNotebook();
  const data = JSON.parse(raw);
  const validTags = (tags: unknown): tags is string[] =>
    Array.isArray(tags) && tags.every((tag) => typeof tag === "string");
  if (
    data?.version !== 1 ||
    !Array.isArray(data.notes) ||
    !validTags(data.tags) ||
    typeof data.dark !== "boolean" ||
    !data.notes.every(
      (note: Note) =>
        note &&
        typeof note.id === "string" &&
        typeof note.title === "string" &&
        typeof note.body === "string" &&
        validTags(note.tags) &&
        Number.isInteger(note.color) &&
        note.color >= 0 &&
        note.color < 4 &&
        typeof note.pinned === "boolean" &&
        Number.isFinite(note.updatedAt),
    )
  ) {
    throw new Error("Invalid notebook");
  }
  return data;
}

export function selectNotes(
  notes: Note[],
  query: string,
  tag: string | null,
): Note[] {
  const text = query.trim().toLocaleLowerCase();
  return notes
    .filter(
      (note) =>
        (!tag || note.tags.includes(tag)) &&
        [note.title, note.body, ...note.tags]
          .join(" ")
          .toLocaleLowerCase()
          .includes(text),
    )
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt,
    );
}
