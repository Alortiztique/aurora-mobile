import { useEffect, useState } from "react";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import {
  Check,
  Edit2,
  Flag,
  Heart,
  Lock,
  MessageCircle,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react-native";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Card, Eyebrow, PrimaryButton } from "./ui";
import { useLocale } from "../locale";
import { colors, radii, spacing } from "../theme";

const COMMUNITY_STORAGE_KEY = "aurora.community_posts.v3";

export interface CommunityReply {
  id: string;
  body: string;
  time: string;
  timestamp: number;
}

export interface CommunityPost {
  id: string;
  author: string;
  time: string;
  badge: string;
  badgeType: "milestone" | "vent" | "pledge";
  body: string;
  timestamp: number;
  isMine?: boolean;
  supports?: number;
  userSupported?: boolean;
  replies?: CommunityReply[];
}

export function CommunityTab() {
  const { locale } = useLocale();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<"all" | "milestone" | "vent" | "pledge">("all");
  const [reportedPosts, setReportedPosts] = useState<Record<string, boolean>>({});

  // Creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBadgeType, setNewBadgeType] = useState<"milestone" | "vent" | "pledge">("vent");
  const [newBody, setNewBody] = useState("");

  // Edit modal
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editBody, setEditBody] = useState("");

  // Reply state
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [replyInputByPost, setReplyInputByPost] = useState<Record<string, string>>({});

  // Load real user posts from SecureStore on mount (no mock/fake data)
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await SecureStore.getItemAsync(COMMUNITY_STORAGE_KEY);
        if (stored && active) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setPosts(parsed);
            return;
          }
        }
        if (active) {
          setPosts([]);
        }
      } catch {
        if (active) setPosts([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const savePosts = async (updated: CommunityPost[]) => {
    setPosts(updated);
    try {
      await SecureStore.setItemAsync(COMMUNITY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage fallback
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (filter === "all") return true;
    return p.badgeType === filter;
  });

  const handleReport = (id: string) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setReportedPosts((prev) => ({ ...prev, [id]: true }));
  };

  const handleCreatePost = async () => {
    if (!newBody.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const badgeLabel =
      newBadgeType === "milestone"
        ? locale === "es" ? "Victoria" : "Milestone"
        : newBadgeType === "vent"
        ? locale === "es" ? "Desahogo" : "Venting"
        : locale === "es" ? "Compromiso" : "Pledge";

    const newEntry: CommunityPost = {
      id: `post-${Date.now()}`,
      author: locale === "es" ? "Tú (Anónimo)" : "You (Anonymous)",
      time: locale === "es" ? "Ahora" : "Just now",
      badge: badgeLabel,
      badgeType: newBadgeType,
      body: newBody.trim(),
      timestamp: Date.now(),
      isMine: true,
      supports: 0,
      userSupported: false,
      replies: [],
    };

    const updated = [newEntry, ...posts];
    await savePosts(updated);
    setNewBody("");
    setShowCreateModal(false);
  };

  const handleDeletePost = (id: string) => {
    Alert.alert(
      locale === "es" ? "Eliminar publicación" : "Delete post",
      locale === "es"
        ? "¿Estás seguro de que deseas eliminar tu publicación anónima?"
        : "Are you sure you want to delete your anonymous post?",
      [
        { text: locale === "es" ? "Cancelar" : "Cancel", style: "cancel" },
        {
          text: locale === "es" ? "Eliminar" : "Delete",
          style: "destructive",
          onPress: () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const updated = posts.filter((p) => p.id !== id);
            void savePosts(updated);
          },
        },
      ]
    );
  };

  const handleOpenEdit = (post: CommunityPost) => {
    setEditingPost(post);
    setEditBody(post.body);
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !editBody.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated = posts.map((p) =>
      p.id === editingPost.id ? { ...p, body: editBody.trim() } : p
    );
    await savePosts(updated);
    setEditingPost(null);
  };

  const handleToggleSupport = (postId: string) => {
    void Haptics.selectionAsync();
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      const wasSupported = Boolean(p.userSupported);
      return {
        ...p,
        userSupported: !wasSupported,
        supports: Math.max(0, (p.supports || 0) + (wasSupported ? -1 : 1)),
      };
    });
    void savePosts(updated);
  };

  const handleAddReply = (postId: string, text: string) => {
    if (!text.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newReply: CommunityReply = {
      id: `rep-${Date.now()}`,
      body: text.trim(),
      time: locale === "es" ? "Ahora" : "Just now",
      timestamp: Date.now(),
    };

    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        replies: [...(p.replies || []), newReply],
      };
    });

    void savePosts(updated);
    setReplyInputByPost((prev) => ({ ...prev, [postId]: "" }));
    setExpandedReplies((prev) => ({ ...prev, [postId]: true }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Eyebrow>{locale === "es" ? "COMUNIDAD ANÓNIMA" : "ANONYMOUS COMMUNITY"}</Eyebrow>
          <Text style={styles.title}>
            {locale === "es" ? "Muro de Apoyo y Desahogo" : "Support & Vent Wall"}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Compartir"
          style={styles.btnNewPost}
          onPress={() => {
            void Haptics.selectionAsync();
            setShowCreateModal(true);
          }}
        >
          <Plus color="#0C0C0E" size={18} />
          <Text style={styles.btnNewPostText}>
            {locale === "es" ? "Aportar" : "Share"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        {locale === "es"
          ? "Un espacio 100% anónimo para desahogarte en momentos difíciles, compartir tus victorias y recuperar agencia. Sin algoritmos ni calificaciones de personas."
          : "A 100% anonymous sanctuary to vent during cravings, celebrate milestones, and reclaim agency."}
      </Text>

      {/* Filter Chips */}
      <View style={styles.filtersRow}>
        <Pressable
          style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
            {locale === "es" ? "Todos" : "All"} ({posts.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterChip, filter === "vent" && styles.filterChipActive]}
          onPress={() => setFilter("vent")}
        >
          <Text style={[styles.filterText, filter === "vent" && styles.filterTextActive]}>
            {locale === "es" ? "Desahogos" : "Venting"}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterChip, filter === "milestone" && styles.filterChipActive]}
          onPress={() => setFilter("milestone")}
        >
          <Text style={[styles.filterText, filter === "milestone" && styles.filterTextActive]}>
            {locale === "es" ? "Victorias" : "Milestones"}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterChip, filter === "pledge" && styles.filterChipActive]}
          onPress={() => setFilter("pledge")}
        >
          <Text style={[styles.filterText, filter === "pledge" && styles.filterTextActive]}>
            {locale === "es" ? "Compromisos" : "Pledges"}
          </Text>
        </Pressable>
      </View>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Card style={styles.emptyCard}>
          <MessageSquare color={colors.auroraBlue} size={36} />
          <Text style={styles.emptyTitle}>
            {locale === "es"
              ? "Espacio Soberano y Libre de Métricas Falsas"
              : "Sovereign Sanctuary Free of Vanity Metrics"}
          </Text>
          <Text style={styles.emptyDesc}>
            {locale === "es"
              ? "No hay publicaciones en este momento. Comparte tu desahogo, tu compromiso o tu victoria con total anonimato."
              : "No posts in this category yet. Share your experience with complete anonymity."}
          </Text>
          <Pressable
            style={styles.btnEmptyCTA}
            onPress={() => {
              void Haptics.selectionAsync();
              setShowCreateModal(true);
            }}
          >
            <Plus color="#0C0C0E" size={18} />
            <Text style={styles.btnEmptyCTAText}>
              {locale === "es" ? "Publicar mi Desahogo o Victoria" : "Post a Vent or Milestone"}
            </Text>
          </Pressable>
        </Card>
      ) : (
        <View style={styles.postsList}>
          {filteredPosts.map((post) => {
            const isReported = reportedPosts[post.id];
            const isExpanded = Boolean(expandedReplies[post.id]);
            const replies = post.replies || [];
            const replyText = replyInputByPost[post.id] || "";

            return (
              <Card key={post.id} style={styles.postCard}>
                <View style={styles.postTop}>
                  <View style={styles.postBadgeRow}>
                    <View
                      style={[
                        styles.postBadge,
                        post.badgeType === "milestone"
                          ? styles.badgeMilestone
                          : post.badgeType === "vent"
                          ? styles.badgeVent
                          : styles.badgePledge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.postBadgeText,
                          post.badgeType === "milestone"
                            ? { color: colors.positive }
                            : post.badgeType === "vent"
                            ? { color: colors.auroraBlue }
                            : { color: colors.auroraPink },
                        ]}
                      >
                        {post.badge}
                      </Text>
                    </View>
                    <Text style={styles.postTime}>{post.time}</Text>
                    {post.isMine && (
                      <View style={styles.myPostPill}>
                        <Text style={styles.myPostPillText}>
                          {locale === "es" ? "Tu publicación" : "Your post"}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.postActionsTop}>
                    {post.isMine ? (
                      <View style={styles.myActionsRow}>
                        <Pressable
                          accessibilityLabel="Editar"
                          style={styles.iconBtn}
                          onPress={() => handleOpenEdit(post)}
                        >
                          <Edit2 color={colors.auroraBlue} size={14} />
                        </Pressable>
                        <Pressable
                          accessibilityLabel="Eliminar"
                          style={styles.iconBtn}
                          onPress={() => handleDeletePost(post.id)}
                        >
                          <Trash2 color={colors.danger} size={14} />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityLabel="Reportar publicación"
                        style={styles.btnFlag}
                        onPress={() => handleReport(post.id)}
                      >
                        <Flag
                          color={isReported ? colors.danger : colors.textMuted}
                          size={13}
                        />
                        {isReported && (
                          <Text style={styles.reportedLabel}>
                            {locale === "es" ? "Reportado" : "Reported"}
                          </Text>
                        )}
                      </Pressable>
                    )}
                  </View>
                </View>

                <Text style={styles.postBody}>{post.body}</Text>

                {/* Footer Controls: Solidarity & Replies */}
                <View style={styles.postFooter}>
                  <View style={styles.socialButtonsRow}>
                    <Pressable
                      style={[
                        styles.solidarityBtn,
                        post.userSupported && styles.solidarityBtnActive,
                      ]}
                      onPress={() => handleToggleSupport(post.id)}
                    >
                      <Heart
                        color={post.userSupported ? colors.auroraPink : colors.textMuted}
                        fill={post.userSupported ? colors.auroraPink : "transparent"}
                        size={14}
                      />
                      <Text
                        style={[
                          styles.solidarityBtnText,
                          post.userSupported && styles.solidarityBtnTextActive,
                        ]}
                      >
                        {post.userSupported
                          ? locale === "es" ? "Acompañado" : "Supported"
                          : locale === "es" ? "Dar apoyo" : "Support"}
                        {Boolean(post.supports && post.supports > 0) && ` (${post.supports})`}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.replyToggleBtn}
                      onPress={() =>
                        setExpandedReplies((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }))
                      }
                    >
                      <MessageCircle color={colors.textMuted} size={14} />
                      <Text style={styles.replyToggleBtnText}>
                        {locale === "es" ? "Respuestas" : "Replies"}{" "}
                        {replies.length > 0 ? `(${replies.length})` : ""}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.anonAuthorBadge}>
                    <Lock color={colors.textMuted} size={10} />
                    <Text style={styles.anonAuthorText}>
                      {locale === "es" ? "100% Anónimo" : "100% Anonymous"}
                    </Text>
                  </View>
                </View>

                {/* Expanded Replies Thread */}
                {isExpanded && (
                  <View style={styles.repliesSection}>
                    {replies.length > 0 && (
                      <View style={styles.repliesList}>
                        {replies.map((rep) => (
                          <View key={rep.id} style={styles.replyItem}>
                            <View style={styles.replyTop}>
                              <Text style={styles.replyAuthor}>
                                {locale === "es" ? "Compañero anónimo" : "Anonymous peer"}
                              </Text>
                              <Text style={styles.replyTime}>{rep.time}</Text>
                            </View>
                            <Text style={styles.replyBody}>{rep.body}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Encouragement Quick Chips */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.quickChipsRow}
                    >
                      <Pressable
                        style={styles.quickChip}
                        onPress={() =>
                          handleAddReply(
                            post.id,
                            locale === "es"
                              ? "¡Fuerza! Un día a la vez."
                              : "Stay strong! One day at a time."
                          )
                        }
                      >
                        <Text style={styles.quickChipText}>
                          {locale === "es" ? "✊ Un día a la vez" : "✊ One day at a time"}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.quickChip}
                        onPress={() =>
                          handleAddReply(
                            post.id,
                            locale === "es"
                              ? "Respira profundo, este impulso pasará en 5 minutos."
                              : "Breathe deeply, this peak will pass in 5 min."
                          )
                        }
                      >
                        <Text style={styles.quickChipText}>
                          {locale === "es" ? "💨 El impulso pasará" : "💨 It will pass"}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.quickChip}
                        onPress={() =>
                          handleAddReply(
                            post.id,
                            locale === "es"
                              ? "¡Gran victoria! Orgullosos de tu avance."
                              : "Great victory! Proud of your progress."
                          )
                        }
                      >
                        <Text style={styles.quickChipText}>
                          {locale === "es" ? "⭐ Orgullosos de ti" : "⭐ Proud of you"}
                        </Text>
                      </Pressable>
                    </ScrollView>

                    {/* Reply Input Form */}
                    <View style={styles.replyInputBox}>
                      <TextInput
                        value={replyText}
                        onChangeText={(t) =>
                          setReplyInputByPost((prev) => ({ ...prev, [post.id]: t }))
                        }
                        placeholder={
                          locale === "es"
                            ? "Escribe un mensaje de apoyo sobrio y constructivo..."
                            : "Write a supportive, constructive message..."
                        }
                        placeholderTextColor={colors.textMuted}
                        style={styles.replyInput}
                      />
                      <Pressable
                        disabled={!replyText.trim()}
                        style={[
                          styles.replySubmitBtn,
                          !replyText.trim() && { opacity: 0.4 },
                        ]}
                        onPress={() => handleAddReply(post.id, replyText)}
                      >
                        <Send color="#0C0C0E" size={14} />
                      </Pressable>
                    </View>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      )}

      {/* MODAL: Post Creation */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {locale === "es" ? "Publicación Anónima" : "Anonymous Post"}
              </Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <X color={colors.textMuted} size={22} />
              </Pressable>
            </View>

            <Text style={styles.modalPrompt}>
              {locale === "es" ? "¿De qué se trata?" : "Select category:"}
            </Text>

            {/* Type selector */}
            <View style={styles.typeSelector}>
              <Pressable
                style={[
                  styles.typeBtn,
                  newBadgeType === "vent" && styles.typeBtnActive,
                ]}
                onPress={() => setNewBadgeType("vent")}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    newBadgeType === "vent" && styles.typeBtnTextActive,
                  ]}
                >
                  {locale === "es" ? "Desahogo" : "Vent"}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.typeBtn,
                  newBadgeType === "milestone" && styles.typeBtnActive,
                ]}
                onPress={() => setNewBadgeType("milestone")}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    newBadgeType === "milestone" && styles.typeBtnTextActive,
                  ]}
                >
                  {locale === "es" ? "Victoria" : "Victory"}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.typeBtn,
                  newBadgeType === "pledge" && styles.typeBtnActive,
                ]}
                onPress={() => setNewBadgeType("pledge")}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    newBadgeType === "pledge" && styles.typeBtnTextActive,
                  ]}
                >
                  {locale === "es" ? "Compromiso" : "Pledge"}
                </Text>
              </Pressable>
            </View>

            <TextInput
              value={newBody}
              onChangeText={setNewBody}
              multiline
              textAlignVertical="top"
              maxLength={360}
              placeholder={
                locale === "es"
                  ? "Escribe aquí lo que sientes o tu victoria. Tu mensaje es 100% anónimo. No menciones nombres reales ni datos personales."
                  : "Share your experience or milestone. It is 100% anonymous. Do not include real names or private details."
              }
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
            />

            <View style={styles.modalFooter}>
              <Text style={styles.charCount}>{newBody.length}/360</Text>
              <PrimaryButton
                disabled={!newBody.trim()}
                onPress={() => void handleCreatePost()}
              >
                <View style={styles.submitBtnInner}>
                  <Send color="#0C0C0E" size={16} />
                  <Text style={styles.submitBtnText}>
                    {locale === "es" ? "Publicar Anónimamente" : "Post Anonymously"}
                  </Text>
                </View>
              </PrimaryButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Post Editing */}
      <Modal visible={Boolean(editingPost)} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {locale === "es" ? "Editar mi publicación" : "Edit my post"}
              </Text>
              <Pressable onPress={() => setEditingPost(null)}>
                <X color={colors.textMuted} size={22} />
              </Pressable>
            </View>

            <TextInput
              value={editBody}
              onChangeText={setEditBody}
              multiline
              textAlignVertical="top"
              maxLength={360}
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
            />

            <View style={styles.modalFooter}>
              <Text style={styles.charCount}>{editBody.length}/360</Text>
              <PrimaryButton
                disabled={!editBody.trim()}
                onPress={() => void handleSaveEdit()}
              >
                <View style={styles.submitBtnInner}>
                  <Check color="#0C0C0E" size={16} />
                  <Text style={styles.submitBtnText}>
                    {locale === "es" ? "Guardar cambios" : "Save Changes"}
                  </Text>
                </View>
              </PrimaryButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginTop: 2,
  },
  btnNewPost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.auroraBlue,
  },
  btnNewPostText: {
    color: "#0C0C0E",
    fontSize: 12,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -6,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    borderColor: colors.auroraBlue,
    backgroundColor: "rgba(117, 132, 193, 0.16)",
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  filterTextActive: {
    color: colors.auroraBlue,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  btnEmptyCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.medium,
    backgroundColor: colors.auroraBlue,
    marginTop: 6,
  },
  btnEmptyCTAText: {
    color: "#0C0C0E",
    fontSize: 13,
    fontWeight: "900",
  },
  postsList: {
    gap: 12,
  },
  postCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  postTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  postBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  badgeMilestone: {
    backgroundColor: "rgba(74, 222, 128, 0.12)",
  },
  badgeVent: {
    backgroundColor: "rgba(117, 132, 193, 0.15)",
  },
  badgePledge: {
    backgroundColor: "rgba(245, 174, 219, 0.15)",
  },
  postBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  postTime: {
    color: colors.textMuted,
    fontSize: 11,
  },
  myPostPill: {
    backgroundColor: "rgba(117, 132, 193, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  myPostPillText: {
    color: colors.auroraBlueLight,
    fontSize: 10,
    fontWeight: "700",
  },
  postActionsTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  myActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    padding: 6,
    borderRadius: radii.small,
    backgroundColor: colors.surfaceRaised,
  },
  btnFlag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  reportedLabel: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: "700",
  },
  postBody: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  socialButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  solidarityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  solidarityBtnActive: {
    backgroundColor: "rgba(245, 174, 219, 0.12)",
    borderColor: colors.auroraPink,
  },
  solidarityBtnText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  solidarityBtnTextActive: {
    color: colors.auroraPink,
  },
  replyToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  replyToggleBtnText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  anonAuthorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  anonAuthorText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  repliesSection: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.medium,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  repliesList: {
    gap: 8,
  },
  replyItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    gap: 2,
  },
  replyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  replyAuthor: {
    color: colors.auroraBlue,
    fontSize: 11,
    fontWeight: "700",
  },
  replyTime: {
    color: colors.textMuted,
    fontSize: 10,
  },
  replyBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  quickChipsRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  quickChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  replyInputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  replyInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replySubmitBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.auroraBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  modalPrompt: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  typeBtnActive: {
    borderColor: colors.auroraBlue,
    backgroundColor: "rgba(117, 132, 193, 0.16)",
  },
  typeBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  typeBtnTextActive: {
    color: colors.auroraBlue,
  },
  modalInput: {
    minHeight: 120,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.medium,
    padding: 14,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: {
    color: colors.textMuted,
    fontSize: 12,
  },
  submitBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    color: "#0C0C0E",
    fontWeight: "900",
    fontSize: 14,
  },
});
