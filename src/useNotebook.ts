import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeNotebook, emptyNotebook, type Notebook } from "./model";

const storageKey = "quicknote.notebook.v1";

export function useNotebook() {
  const [book, setBook] = useState<Notebook>(emptyNotebook);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const current = useRef(book);
  const load = useCallback(async () => {
    setError("");
    try {
      const saved = decodeNotebook(await AsyncStorage.getItem(storageKey));
      current.current = saved;
      setBook(saved);
      setReady(true);
    } catch {
      setError(
        "Le carnet ne peut pas être ouvert. Tes données ont été conservées.",
      );
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const update = useCallback(
    async (change: (previous: Notebook) => Notebook) => {
      if (busy.current || !ready) return false;
      busy.current = true;
      setSaving(true);
      setError("");
      const next = change(current.current);
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(next));
        current.current = next;
        setBook(next);
        return true;
      } catch {
        setError(
          "Sauvegarde impossible. Réessaie : la modification n’a pas été enregistrée.",
        );
        return false;
      } finally {
        busy.current = false;
        setSaving(false);
      }
    },
    [ready],
  );
  return { book, ready, error, saving, update, reload: load };
}
