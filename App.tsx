import React, { memo, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { randomUUID } from "expo-crypto";
import {
  emptyNotebook,
  normalizeTags,
  selectNotes,
  type Note,
} from "./src/model";
import { useNotebook } from "./src/useNotebook";
import { styles } from "./src/styles";

const colors = ["#f7dc78", "#c9dcbd", "#efc5cd", "#bcd6e8"];
const dateLabel = (time: number) =>
  new Date(time).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

function Button({
  label,
  onPress,
  disabled = false,
  filled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  filled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        filled && styles.filled,
        disabled && { opacity: 0.45 },
      ]}
    >
      <Text style={[styles.buttonText, filled && { color: "#fff9e9" }]}>
        {label}
      </Text>
    </Pressable>
  );
}
const NoteCard = memo(function NoteCard({
  note,
  onOpen,
}: {
  note: Note;
  onOpen: (note: Note) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir ${note.title || "Sans titre"}`}
      onPress={() => onOpen(note)}
      style={[styles.card, { backgroundColor: colors[note.color] }]}
    >
      <View style={styles.row}>
        <Text style={styles.cardDate}>{dateLabel(note.updatedAt)}</Text>
        <Text>{note.pinned ? "★" : "↗"}</Text>
      </View>
      <Text numberOfLines={2} style={styles.cardTitle}>
        {note.title || "Sans titre"}
      </Text>
      <Text numberOfLines={4} style={styles.cardBody}>
        {note.body || "…"}
      </Text>
      <Text numberOfLines={1} style={styles.cardTags}>
        {note.tags.map((tag) => `#${tag}`).join("  ")}
      </Text>
    </Pressable>
  );
});

function NotebookScreen() {
  const { book, ready, error, saving, update, reload } = useNotebook();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [draft, setDraft] = useState<Note | null>(null);
  const [tagText, setTagText] = useState("");
  const [settings, setSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const notes = useMemo(
    () => selectNotes(book.notes, query, tag),
    [book.notes, query, tag],
  );
  const paper = book.dark ? "#232b29" : "#f6f1e3";
  const ink = book.dark ? "#f6f1e3" : "#263b32";
  const openNote = (note: Note) => {
    setDeleteId(null);
    setDraft({ ...note, tags: [...note.tags] });
    setTagText(note.tags.join(", "));
  };
  const save = async () => {
    if (!draft || (!draft.title.trim() && !draft.body.trim())) return;
    const tags = normalizeTags(tagText);
    const note = {
      ...draft,
      title: draft.title.trim(),
      tags,
      updatedAt: Date.now(),
    };
    if (
      await update((previous) => ({
        ...previous,
        notes: [...previous.notes.filter((item) => item.id !== note.id), note],
        tags: [...new Set([...previous.tags, ...tags])],
      }))
    )
      setDraft(null);
  };
  const inputStyle = [
    styles.input,
    { color: ink, borderColor: book.dark ? "#7c8980" : "#b9bcae" },
  ];
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: paper }]}>
      <StatusBar style={book.dark ? "light" : "dark"} />
      <View style={styles.shell}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: ink }]}>
              LE PETIT CARNET DE POCHE
            </Text>
            <Text style={[styles.logo, { color: ink }]}>
              quicknote<Text style={{ color: "#d46b41" }}>✱</Text>
            </Text>
          </View>
          <Button
            label="Réglages"
            onPress={() => setSettings(true)}
            disabled={!ready || saving}
          />
        </View>
        <View style={styles.intro}>
          <Text style={[styles.heading, { color: ink }]}>
            Une idée ?{"\n"}Pose-la ici.
          </Text>
          <Text style={[styles.count, { color: ink }]}>
            {book.notes.length}
            {"\n"}note{book.notes.length > 1 ? "s" : ""}
          </Text>
        </View>
        {!!error && (
          <View accessibilityRole="alert" style={styles.error}>
            <Text>{error}</Text>
            {!ready && (
              <Button
                label="Réessayer"
                onPress={() => {
                  void reload();
                }}
              />
            )}
          </View>
        )}
        <TextInput
          accessibilityLabel="Rechercher des notes"
          placeholder="Un mot, une idée, un tag…"
          placeholderTextColor={book.dark ? "#abb7ae" : "#767b70"}
          style={inputStyle}
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.tagsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {[null, ...book.tags].map((item) => (
              <Pressable
                key={item || "all"}
                accessibilityRole="button"
                accessibilityState={{ selected: tag === item }}
                onPress={() => setTag(item)}
                style={[styles.chip, tag === item && styles.activeChip]}
              >
                <Text style={{ color: tag === item ? "#fff9e9" : "#263b32" }}>
                  {item ? `#${item}` : "Tout le carnet"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        {!ready ? (
          <ActivityIndicator color={ink} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(note) => note.id}
            renderItem={({ item }) => (
              <NoteCard note={item} onOpen={openNote} />
            )}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={[styles.emptyDrawing, { color: ink }]}>
                  [ ... ]
                </Text>
                <Text style={[styles.emptyTitle, { color: ink }]}>
                  {query || tag
                    ? "Rien par ici."
                    : "La première page est à toi."}
                </Text>
                <Text style={[styles.emptyText, { color: ink }]}>
                  {query || tag
                    ? "Essaie un autre mot ou un autre tag."
                    : "Une liste, un brouillon, trois mots.\nPas besoin de faire joli."}
                </Text>
              </View>
            }
          />
        )}
        <View style={styles.footer}>
          <Text style={[styles.local, { color: ink }]}>
            {saving
              ? "Enregistrement…"
              : "Dans ton téléphone. Tout simplement."}
          </Text>
          <Button
            label="＋ Une note"
            filled
            disabled={!ready || saving}
            onPress={() =>
              openNote({
                id: randomUUID(),
                title: "",
                body: "",
                tags: tag ? [tag] : [],
                color: 0,
                pinned: false,
                updatedAt: Date.now(),
              })
            }
          />
        </View>
      </View>
      <Modal
        visible={draft !== null}
        animationType="slide"
        onRequestClose={() => {
          if (!saving) setDraft(null);
        }}
      >
        <SafeAreaView style={[styles.screen, { backgroundColor: paper }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.shell}
          >
            <View style={styles.modalHeader}>
              <Button
                label="Fermer"
                disabled={saving}
                onPress={() => setDraft(null)}
              />
              <Button
                label={saving ? "Sauvegarde…" : "Enregistrer"}
                filled
                disabled={
                  saving ||
                  !draft ||
                  (!draft.title.trim() && !draft.body.trim())
                }
                onPress={() => {
                  void save();
                }}
              />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {!!error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.palette}>
                {colors.map((color, index) => (
                  <Pressable
                    key={color}
                    accessibilityRole="button"
                    accessibilityLabel={`Couleur ${index + 1}`}
                    accessibilityState={{ selected: draft?.color === index }}
                    onPress={() =>
                      setDraft((value) => value && { ...value, color: index })
                    }
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: color,
                        borderWidth: draft?.color === index ? 3 : 0,
                      },
                    ]}
                  />
                ))}
                <Button
                  label={draft?.pinned ? "★ Épinglée" : "☆ Épingler"}
                  onPress={() =>
                    setDraft(
                      (value) => value && { ...value, pinned: !value.pinned },
                    )
                  }
                />
              </View>
              <TextInput
                accessibilityLabel="Titre"
                placeholder="Sans titre"
                placeholderTextColor="#8a8d82"
                style={[styles.titleInput, { color: ink }]}
                value={draft?.title || ""}
                maxLength={160}
                onChangeText={(title) =>
                  setDraft((value) => value && { ...value, title })
                }
              />
              <TextInput
                accessibilityLabel="Contenu de la note"
                placeholder="Ce qui te passe par la tête…"
                placeholderTextColor="#8a8d82"
                multiline
                textAlignVertical="top"
                style={[styles.bodyInput, { color: ink }]}
                value={draft?.body || ""}
                onChangeText={(body) =>
                  setDraft((value) => value && { ...value, body })
                }
              />
              <Text style={[styles.eyebrow, { color: ink }]}>
                TAGS · SÉPARÉS PAR DES VIRGULES
              </Text>
              <TextInput
                accessibilityLabel="Tags de la note"
                placeholder="idées, travail…"
                placeholderTextColor="#8a8d82"
                style={inputStyle}
                value={tagText}
                onChangeText={setTagText}
              />
              {book.notes.some((note) => note.id === draft?.id) && (
                <Button
                  label="Supprimer cette note"
                  disabled={saving}
                  onPress={() => setDeleteId(draft!.id)}
                />
              )}
              {deleteId && (
                <View style={styles.error}>
                  <Text>Supprimer définitivement cette note ?</Text>
                  <View style={styles.row}>
                    <Button label="Annuler" onPress={() => setDeleteId(null)} />
                    <Button
                      label="Supprimer"
                      disabled={saving}
                      onPress={() => {
                        void update((previous) => ({
                          ...previous,
                          notes: previous.notes.filter(
                            (note) => note.id !== deleteId,
                          ),
                        })).then((ok) => {
                          if (ok) {
                            setDeleteId(null);
                            setDraft(null);
                          }
                        });
                      }}
                    />
                  </View>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={settings}
        animationType="slide"
        onRequestClose={() => setSettings(false)}
      >
        <SafeAreaView style={[styles.screen, { backgroundColor: paper }]}>
          <ScrollView
            contentContainerStyle={styles.settings}
            keyboardShouldPersistTaps="handled"
          >
            <Button label="← Le carnet" onPress={() => setSettings(false)} />
            <Text style={[styles.heading, { color: ink }]}>À ta façon.</Text>
            {!!error && <Text style={styles.error}>{error}</Text>}
            <Text style={[styles.sectionTitle, { color: ink }]}>
              La lumière
            </Text>
            <Button
              label={
                book.dark ? "☀ Passer en mode jour" : "☾ Passer en mode nuit"
              }
              disabled={saving}
              onPress={() => {
                void update((previous) => ({
                  ...previous,
                  dark: !previous.dark,
                }));
              }}
            />
            <Text style={[styles.sectionTitle, { color: ink }]}>
              Tes étiquettes
            </Text>
            <Text style={[styles.emptyText, { color: ink }]}>
              Retirer un tag conserve les notes associées.
            </Text>
            <View style={styles.chips}>
              {book.tags.map((item) => (
                <Button
                  key={item}
                  label={`#${item} ×`}
                  disabled={saving}
                  onPress={() => {
                    void update((previous) => ({
                      ...previous,
                      tags: previous.tags.filter((t) => t !== item),
                      notes: previous.notes.map((note) => ({
                        ...note,
                        tags: note.tags.filter((t) => t !== item),
                      })),
                    })).then((ok) => {
                      if (ok && tag === item) setTag(null);
                    });
                  }}
                />
              ))}
            </View>
            <TextInput
              accessibilityLabel="Nouveau tag"
              placeholder="Un nouveau tag…"
              placeholderTextColor="#8a8d82"
              style={inputStyle}
              value={newTag}
              onChangeText={setNewTag}
              maxLength={60}
            />
            <Button
              label="Ajouter"
              disabled={saving || !normalizeTags(newTag).length}
              onPress={() => {
                void update((previous) => ({
                  ...previous,
                  tags: [
                    ...new Set([...previous.tags, ...normalizeTags(newTag)]),
                  ],
                })).then((ok) => {
                  if (ok) setNewTag("");
                });
              }}
            />
            <Text style={[styles.sectionTitle, { color: ink }]}>
              Repartir de zéro
            </Text>
            <Button
              label="Vider le carnet"
              disabled={saving}
              onPress={() => setConfirmReset(true)}
            />
            {confirmReset && (
              <View style={styles.error}>
                <Text>
                  Toutes les notes, les tags et les préférences de cet appareil
                  seront supprimés définitivement.
                </Text>
                <Button
                  label="Annuler"
                  disabled={saving}
                  onPress={() => setConfirmReset(false)}
                />
                <Button
                  label="Tout effacer"
                  disabled={saving}
                  onPress={() => {
                    void update(() => emptyNotebook()).then((ok) => {
                      if (ok) {
                        setQuery("");
                        setTag(null);
                        setDraft(null);
                        setTagText("");
                        setNewTag("");
                        setDeleteId(null);
                        setConfirmReset(false);
                        setSettings(false);
                      }
                    });
                  }}
                />
              </View>
            )}
            <Text style={[styles.sectionTitle, { color: ink }]}>
              Pas de nuage.
            </Text>
            <Text style={[styles.emptyText, { color: ink }]}>
              Les notes sont enregistrées sur cet appareil. Elles restent
              disponibles hors ligne, mais ne sont pas synchronisées avec un
              autre téléphone. Désinstaller l’application peut effacer le
              carnet.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <NotebookScreen />
    </SafeAreaProvider>
  );
}
