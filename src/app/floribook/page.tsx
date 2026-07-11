"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Navigation } from "@/components/Navigation";
import { useLang } from "@/hooks/useLang";

const T = {
  en: { title:"FloriBook 🌸", feed:"Feed", search:"Search", messages:"Messages", profile:"Profile",
    newPost:"Share something...", postBtn:"Post", postPlaceholder:"What's growing in your garden? 🌱",
    flowers:"flowers", comment:"Comment", comments:"comments", noFeed:"No posts yet. Be the first to share!",
    searchPlaceholder:"Search by username or city...", noResults:"No gardeners found.",
    setupTitle:"Welcome to the Garden Community! 🌸", setupSub:"Choose a unique username to get started.",
    usernamePlaceholder:"Username (3-15 chars)", usernameAvail:"✓ Available", usernameTaken:"✗ Already taken",
    usernameInvalid:"Only letters, numbers, underscores", join:"Join Community", joining:"Joining...",
    myPosts:"My Posts", followers:"Followers", following:"Following", editProfile:"Edit profile",
    saveProfile:"Save", bioPh:"Short bio (e.g. Tomato grower in Prague 🍅)", follow:"Follow", unfollow:"Unfollow",
    send:"Send", msgPh:"Write a message...", noMessages:"No messages yet.",
    privacyPublic:"Public profile", privacyPrivate:"Private profile", deletePost:"Delete",
    shareCopied:"Link copied!", loading:"Loading...", writeComment:"Write a comment...",
    viewComments:"View comments", hideComments:"Hide", pendingFollow:"Requested",
  },
  cs: { title:"FloriBook 🌸", feed:"Zeď", search:"Hledání", messages:"Zprávy", profile:"Profil",
    newPost:"Sdílej něco...", postBtn:"Sdílet", postPlaceholder:"Co roste na tvé zahradě? 🌱",
    flowers:"květin", comment:"Komentář", comments:"komentářů", noFeed:"Zatím žádné příspěvky. Buď první!",
    searchPlaceholder:"Hledej podle přezdívky nebo města...", noResults:"Žádní zahrádkáři nenalezeni.",
    setupTitle:"Vítej v zahradním sousedství! 🌸", setupSub:"Vyber si unikátní přezdívku a vstup.",
    usernamePlaceholder:"Přezdívka (3-15 znaků)", usernameAvail:"✓ Dostupná", usernameTaken:"✗ Již obsazená",
    usernameInvalid:"Jen písmena, číslice, podtržítko", join:"Vstoupit", joining:"Ukládám...",
    myPosts:"Moje příspěvky", followers:"Sledující", following:"Sleduji", editProfile:"Upravit profil",
    saveProfile:"Uložit", bioPh:"Krátké bio (např. Pěstuji rajčata na balkóně v Plzni 🍅)", follow:"Sledovat", unfollow:"Přestat sledovat",
    send:"Odeslat", msgPh:"Napiš zprávu...", noMessages:"Zatím žádné zprávy.",
    privacyPublic:"Veřejný profil", privacyPrivate:"Soukromý profil", deletePost:"Smazat",
    shareCopied:"Odkaz zkopírován!", loading:"Načítám...", writeComment:"Napiš komentář...",
    viewComments:"Zobrazit komentáře", hideComments:"Skrýt", pendingFollow:"Požádáno",
  },
  de: { title:"FloriBook 🌸", feed:"Feed", search:"Suche", messages:"Nachrichten", profile:"Profil",
    newPost:"Teile etwas...", postBtn:"Posten", postPlaceholder:"Was wächst in deinem Garten? 🌱",
    flowers:"Blumen", comment:"Kommentar", comments:"Kommentare", noFeed:"Noch keine Beiträge. Sei der Erste!",
    searchPlaceholder:"Nach Nutzername oder Stadt suchen...", noResults:"Keine Gärtner gefunden.",
    setupTitle:"Willkommen in der Garten-Community! 🌸", setupSub:"Wähle einen eindeutigen Nutzernamen.",
    usernamePlaceholder:"Nutzername (3-15 Zeichen)", usernameAvail:"✓ Verfügbar", usernameTaken:"✗ Bereits vergeben",
    usernameInvalid:"Nur Buchstaben, Zahlen, Unterstriche", join:"Beitreten", joining:"Speichern...",
    myPosts:"Meine Beiträge", followers:"Follower", following:"Folge ich", editProfile:"Profil bearbeiten",
    saveProfile:"Speichern", bioPh:"Kurze Bio (z.B. Tomaten auf dem Balkon in Berlin 🍅)", follow:"Folgen", unfollow:"Entfolgen",
    send:"Senden", msgPh:"Schreib eine Nachricht...", noMessages:"Noch keine Nachrichten.",
    privacyPublic:"Öffentliches Profil", privacyPrivate:"Privates Profil", deletePost:"Löschen",
    shareCopied:"Link kopiert!", loading:"Lade...", writeComment:"Kommentar schreiben...",
    viewComments:"Kommentare anzeigen", hideComments:"Ausblenden", pendingFollow:"Angefragt",
  },
  pl: { title:"FloriBook 🌸", feed:"Tablica", search:"Szukaj", messages:"Wiadomości", profile:"Profil",
    newPost:"Podziel się...", postBtn:"Opublikuj", postPlaceholder:"Co rośnie w twoim ogrodzie? 🌱",
    flowers:"kwiatków", comment:"Komentarz", comments:"komentarzy", noFeed:"Brak postów. Bądź pierwszy!",
    searchPlaceholder:"Szukaj po nazwie lub mieście...", noResults:"Nie znaleziono ogrodników.",
    setupTitle:"Witaj w społeczności ogrodników! 🌸", setupSub:"Wybierz unikalną nazwę użytkownika.",
    usernamePlaceholder:"Nazwa użytkownika (3-15 znaków)", usernameAvail:"✓ Dostępna", usernameTaken:"✗ Zajęta",
    usernameInvalid:"Tylko litery, cyfry, podkreślenia", join:"Dołącz", joining:"Zapisuję...",
    myPosts:"Moje posty", followers:"Obserwujący", following:"Obserwuję", editProfile:"Edytuj profil",
    saveProfile:"Zapisz", bioPh:"Krótkie bio (np. Uprawiam pomidory na balkonie w Warszawie 🍅)", follow:"Obserwuj", unfollow:"Przestań obserwować",
    send:"Wyślij", msgPh:"Napisz wiadomość...", noMessages:"Brak wiadomości.",
    privacyPublic:"Profil publiczny", privacyPrivate:"Profil prywatny", deletePost:"Usuń",
    shareCopied:"Link skopiowany!", loading:"Ładuję...", writeComment:"Napisz komentarz...",
    viewComments:"Pokaż komentarze", hideComments:"Ukryj", pendingFollow:"Wysłano prośbę",
  },
};

type Tab = "feed" | "search" | "messages" | "profile";

interface Profile {
  id: string; username: string; bio: string; avatar_url: string;
  is_private: boolean; city?: string;
}
interface Post {
  id: string; user_id: string; content: string; image_url: string;
  flowers_count: number; created_at: string;
  profile?: Profile;
  my_flower?: boolean;
  comments?: Comment[];
  show_comments?: boolean;
}
interface Comment {
  id: string; post_id: string; user_id: string; content: string;
  created_at: string; profile?: Profile;
}
interface Message {
  id: string; sender_id: string; receiver_id: string; content: string;
  read: boolean; created_at: string; profile?: Profile;
}
interface Conversation { partner: Profile; lastMsg: Message; unread: number; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 40 }: { profile: Profile; size?: number }) {
  const initials = profile.username?.slice(0, 2).toUpperCase() ?? "?";
  if (profile.avatar_url) {
    return <img src={profile.avatar_url} alt={profile.username}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }} />;
  }
  const colors = ["bg-forest-400","bg-soil-400","bg-amber-400","bg-pink-400","bg-purple-400"];
  const color = colors[(profile.username?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div className={`${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

function timeAgo(iso: string, lang: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const labels: Record<string, [string,string,string,string,string]> = {
    en:["now","m ago","h ago","d ago","w ago"],
    cs:["teď","m","h","d","t"],
    de:["jetzt","Min.","Std.","T.","W."],
    pl:["teraz","min","g","d","t"],
  };
  const l = labels[lang] ?? labels["en"];
  if (sec < 60) return l[0];
  if (sec < 3600) return `${Math.floor(sec/60)}${l[1]}`;
  if (sec < 86400) return `${Math.floor(sec/3600)}${l[2]}`;
  if (sec < 604800) return `${Math.floor(sec/86400)}${l[3]}`;
  return `${Math.floor(sec/604800)}${l[4]}`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FloriBookPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = T[lang as keyof typeof T] ?? T["en"];

  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("feed");

  // Setup
  const [needsSetup, setNeedsSetup] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle"|"checking"|"ok"|"taken"|"invalid">("idle");
  const [bioInput, setBioInput] = useState("");
  const [joining, setJoining] = useState(false);

  // Feed
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Search
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);

  // Messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Profile | null>(null);
  const [convMessages, setConvMessages] = useState<Message[]>([]);
  const [msgInput, setMsgInput] = useState("");

  // Profile edit
  const [editMode, setEditMode] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editPrivate, setEditPrivate] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });

  const fileRef = useRef<HTMLInputElement>(null);
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (!prof?.username) { setNeedsSetup(true); setLoading(false); return; }
    setMyProfile(prof);
    setLoading(false);
  }, [router]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const loadFeed = useCallback(async () => {
    if (!myProfile) return;
    const { data } = await supabase.from("posts").select("*, profile:profiles(id,username,bio,avatar_url,is_private,city)")
      .order("created_at", { ascending: false }).limit(30);
    const { data: myFlowers } = await supabase.from("post_flowers").select("post_id").eq("user_id", myProfile.id);
    const flowerSet = new Set((myFlowers ?? []).map((f: { post_id: string }) => f.post_id));
    setPosts((data ?? []).map((p: Post) => ({ ...p, my_flower: flowerSet.has(p.id), show_comments: false })));
  }, [myProfile]);

  useEffect(() => { if (tab === "feed" && myProfile) loadFeed(); }, [tab, myProfile, loadFeed]);

  const loadConversations = useCallback(async () => {
    if (!myProfile) return;
    const { data } = await supabase.from("messages").select("*, profile:profiles!messages_sender_id_fkey(id,username,avatar_url,bio,is_private,city)")
      .or(`sender_id.eq.${myProfile.id},receiver_id.eq.${myProfile.id}`)
      .order("created_at", { ascending: false });
    const convMap = new Map<string, Conversation>();
    for (const msg of (data ?? [])) {
      const partnerId = msg.sender_id === myProfile.id ? msg.receiver_id : msg.sender_id;
      if (!convMap.has(partnerId)) {
        const partnerProfile = msg.sender_id !== myProfile.id ? msg.profile : null;
        if (!partnerProfile) continue;
        convMap.set(partnerId, {
          partner: partnerProfile,
          lastMsg: msg,
          unread: (!msg.read && msg.receiver_id === myProfile.id) ? 1 : 0,
        });
      }
    }
    setConversations([...convMap.values()]);
  }, [myProfile]);

  useEffect(() => { if (tab === "messages" && myProfile) loadConversations(); }, [tab, myProfile, loadConversations]);

  const loadMyProfile = useCallback(async () => {
    if (!myProfile) return;
    const [{ data: postsData }, { count: follCount }, { count: followCount }] = await Promise.all([
      supabase.from("posts").select("*, profile:profiles(id,username,bio,avatar_url,is_private,city)").eq("user_id", myProfile.id).order("created_at", { ascending: false }),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", myProfile.id).eq("status","accepted"),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", myProfile.id).eq("status","accepted"),
    ]);
    setMyPosts(postsData ?? []);
    setFollowCounts({ followers: follCount ?? 0, following: followCount ?? 0 });
  }, [myProfile]);

  useEffect(() => { if (tab === "profile" && myProfile) loadMyProfile(); }, [tab, myProfile, loadMyProfile]);

  // ── Username check ────────────────────────────────────────────────────────
  const checkUsername = (val: string) => {
    setUsernameInput(val);
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    const valid = /^[a-zA-Z0-9_]{3,15}$/.test(val);
    if (!valid) { setUsernameStatus(val.length > 0 ? "invalid" : "idle"); return; }
    setUsernameStatus("checking");
    usernameTimer.current = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("username", val).single();
      setUsernameStatus(data ? "taken" : "ok");
    }, 400);
  };

  const handleJoin = async () => {
    if (usernameStatus !== "ok" || joining) return;
    setJoining(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ username: usernameInput, bio: bioInput }).eq("id", user.id);
    await loadProfile();
    setNeedsSetup(false);
    setJoining(false);
  };

  // ── Post actions ──────────────────────────────────────────────────────────
  const handlePost = async () => {
    if (!newPostText.trim() || !myProfile) return;
    setPosting(true);
    let image_url = "";
    if (postImage) {
      const ext = postImage.name.split(".").pop();
      const path = `${myProfile.id}/${Date.now()}.${ext}`;
      await supabase.storage.from("post-images").upload(path, postImage, { upsert: true });
      const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }
    const { data } = await supabase.from("posts").insert({
      user_id: myProfile.id, content: newPostText, image_url,
    }).select("*, profile:profiles(id,username,bio,avatar_url,is_private,city)").single();
    if (data) setPosts(prev => [{ ...data, my_flower: false, show_comments: false }, ...prev]);
    setNewPostText(""); setPostImage(null);
    setPosting(false);
  };

  const toggleFlower = async (post: Post) => {
    if (!myProfile) return;
    if (post.my_flower) {
      await supabase.from("post_flowers").delete().eq("post_id", post.id).eq("user_id", myProfile.id);
    } else {
      await supabase.from("post_flowers").insert({ post_id: post.id, user_id: myProfile.id });
    }
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, my_flower: !p.my_flower, flowers_count: p.flowers_count + (p.my_flower ? -1 : 1) }
      : p));
  };

  const loadComments = async (postId: string) => {
    const { data } = await supabase.from("comments")
      .select("*, profile:profiles(id,username,bio,avatar_url,is_private,city)")
      .eq("post_id", postId).order("created_at", { ascending: true });
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, comments: data ?? [], show_comments: !p.show_comments }
      : p));
  };

  const sendComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !myProfile) return;
    const { data } = await supabase.from("comments").insert({
      post_id: postId, user_id: myProfile.id, content: text,
    }).select("*, profile:profiles(id,username,bio,avatar_url,is_private,city)").single();
    if (data) {
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, comments: [...(p.comments ?? []), data] }
        : p));
    }
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const deletePost = async (postId: string) => {
    await supabase.from("posts").delete().eq("id", postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    setMyPosts(prev => prev.filter(p => p.id !== postId));
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const doSearch = async (q: string) => {
    setSearchQ(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const { data } = await supabase.from("profiles")
      .select("id,username,bio,avatar_url,is_private,city")
      .or(`username.ilike.%${q}%,city.ilike.%${q}%`)
      .neq("id", myProfile?.id ?? "")
      .limit(20);
    setSearchResults(data ?? []);
  };

  // ── Follow ────────────────────────────────────────────────────────────────
  const [followStatus, setFollowStatus] = useState<Record<string, string>>({});

  const checkFollow = async (targetId: string) => {
    if (!myProfile) return;
    const { data } = await supabase.from("follows")
      .select("status").eq("follower_id", myProfile.id).eq("following_id", targetId).single();
    setFollowStatus(prev => ({ ...prev, [targetId]: data?.status ?? "none" }));
  };

  const toggleFollow = async (target: Profile) => {
    if (!myProfile) return;
    const status = followStatus[target.id] ?? "none";
    if (status === "none") {
      const newStatus = target.is_private ? "pending" : "accepted";
      await supabase.from("follows").insert({ follower_id: myProfile.id, following_id: target.id, status: newStatus });
      setFollowStatus(prev => ({ ...prev, [target.id]: newStatus }));
    } else {
      await supabase.from("follows").delete().eq("follower_id", myProfile.id).eq("following_id", target.id);
      setFollowStatus(prev => ({ ...prev, [target.id]: "none" }));
    }
  };

  // ── Messages ──────────────────────────────────────────────────────────────
  const openConv = async (partner: Profile) => {
    setActiveConv(partner);
    if (!myProfile) return;
    const { data } = await supabase.from("messages")
      .select("*").or(`and(sender_id.eq.${myProfile.id},receiver_id.eq.${partner.id}),and(sender_id.eq.${partner.id},receiver_id.eq.${myProfile.id})`)
      .order("created_at", { ascending: true });
    setConvMessages(data ?? []);
    await supabase.from("messages").update({ read: true })
      .eq("sender_id", partner.id).eq("receiver_id", myProfile.id).eq("read", false);
  };

  const sendMsg = async () => {
    if (!msgInput.trim() || !myProfile || !activeConv) return;
    const { data } = await supabase.from("messages").insert({
      sender_id: myProfile.id, receiver_id: activeConv.id, content: msgInput,
    }).select().single();
    if (data) setConvMessages(prev => [...prev, data]);
    setMsgInput("");
  };

  // ── Profile save ──────────────────────────────────────────────────────────
  const saveProfileEdit = async () => {
    if (!myProfile) return;
    await supabase.from("profiles").update({ bio: editBio, is_private: editPrivate }).eq("id", myProfile.id);
    setMyProfile(prev => prev ? { ...prev, bio: editBio, is_private: editPrivate } : prev);
    setEditMode(false);
  };

  // ── PostCard ──────────────────────────────────────────────────────────────
  const PostCard = ({ post }: { post: Post }) => {
    const prof = post.profile;
    const isOwn = post.user_id === myProfile?.id;
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-stone-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            {prof && <Avatar profile={prof} size={38} />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-bark-900 dark:text-gray-100">{prof?.username ?? "?"}</p>
              {prof?.city && <p className="text-[11px] text-stone-400">📍 {prof.city}</p>}
            </div>
            <span className="text-[11px] text-stone-300 dark:text-gray-600">{timeAgo(post.created_at, lang)}</span>
            {isOwn && (
              <button onClick={() => deletePost(post.id)}
                className="text-[11px] text-red-400 hover:text-red-600 ml-1">{t.deletePost}</button>
            )}
          </div>
          <p className="text-sm text-bark-800 dark:text-gray-200 leading-relaxed mb-3">{post.content}</p>
          {post.image_url && (
            <img src={post.image_url} alt="" className="w-full rounded-2xl object-cover max-h-64 mb-3" />
          )}
          <div className="flex items-center gap-4">
            <button onClick={() => toggleFlower(post)}
              className={`flex items-center gap-1.5 text-sm transition-all ${post.my_flower ? "text-pink-500 scale-110" : "text-stone-400 hover:text-pink-400"}`}>
              🌸 {post.flowers_count > 0 && <span className="font-semibold">{post.flowers_count}</span>} <span className="text-xs">{t.flowers}</span>
            </button>
            <button onClick={() => loadComments(post.id)}
              className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-forest-500 transition-colors">
              💬 {post.comments?.length ?? 0} <span className="text-xs">{t.comments}</span>
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.origin + "/floribook?post=" + post.id); }}
              className="ml-auto text-stone-400 hover:text-forest-500 text-xs transition-colors">🔗</button>
          </div>
        </div>
        {post.show_comments && (
          <div className="border-t border-stone-100 dark:border-gray-800 px-4 py-3 space-y-2 bg-stone-50 dark:bg-gray-800">
            {(post.comments ?? []).map(c => (
              <div key={c.id} className="flex gap-2">
                {c.profile && <Avatar profile={c.profile} size={26} />}
                <div className="bg-white dark:bg-gray-700 rounded-2xl px-3 py-2 flex-1">
                  <p className="text-[11px] font-semibold text-forest-700 dark:text-forest-300">{c.profile?.username}</p>
                  <p className="text-xs text-bark-800 dark:text-gray-200">{c.content}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={commentInputs[post.id] ?? ""} onChange={e => setCommentInputs(p => ({...p,[post.id]:e.target.value}))}
                placeholder={t.writeComment}
                onKeyDown={e => e.key==="Enter" && sendComment(post.id)}
                className="input-field flex-1 py-2 text-xs" />
              <button onClick={() => sendComment(post.id)} className="btn-primary px-3 py-2 text-xs">{t.send}</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-stone-50 dark:bg-gray-950">
      <div className="text-4xl animate-bounce">🌸</div>
    </div>
  );

  // Setup screen
  if (needsSetup) return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-6"
      style={{ paddingTop:"env(safe-area-inset-top)", paddingBottom:"calc(env(safe-area-inset-bottom) + 80px)" }}>
      <div className="w-full max-w-sm space-y-5 animate-fade-slide-up">
        <div className="text-center"><div className="text-6xl mb-3">🌸</div>
          <h1 className="font-display text-2xl font-bold text-bark-900 dark:text-gray-100">{t.setupTitle}</h1>
          <p className="text-stone-500 text-sm mt-1">{t.setupSub}</p>
        </div>
        <div>
          <input type="text" value={usernameInput} onChange={e => checkUsername(e.target.value)}
            placeholder={t.usernamePlaceholder} className="input-field" maxLength={15} />
          {usernameStatus !== "idle" && (
            <p className={`text-xs mt-1 ml-1 ${usernameStatus==="ok"?"text-forest-600":usernameStatus==="taken"||usernameStatus==="invalid"?"text-red-500":"text-stone-400"}`}>
              {usernameStatus==="ok"?t.usernameAvail:usernameStatus==="taken"?t.usernameTaken:usernameStatus==="invalid"?t.usernameInvalid:t.loading}
            </p>
          )}
        </div>
        <input type="text" value={bioInput} onChange={e => setBioInput(e.target.value)}
          placeholder={t.bioPh} className="input-field" maxLength={100} />
        <button onClick={handleJoin} disabled={usernameStatus !== "ok" || joining}
          className="btn-primary w-full disabled:opacity-50">
          {joining ? t.joining : t.join}
        </button>
      </div>
      <Navigation />
    </div>
  );

  const tabs: { id: Tab; icon: string }[] = [
    { id:"feed", icon:"📰" }, { id:"search", icon:"🔍" },
    { id:"messages", icon:"✉️" }, { id:"profile", icon:"🧑‍🌾" },
  ];

  return (
    <div className="flex flex-col bg-stone-50 dark:bg-gray-950" style={{ minHeight:"100dvh" }}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-stone-100 dark:border-gray-800 px-4 flex-shrink-0"
        style={{ paddingTop:"max(env(safe-area-inset-top),14px)", paddingBottom:"12px" }}>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-lg text-bark-900 dark:text-gray-100">{t.title}</h1>
          {myProfile && <Avatar profile={myProfile} size={32} />}
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`flex-1 py-2 rounded-xl text-base transition-all ${tab===tb.id?"bg-forest-50 dark:bg-forest-950 text-forest-600 dark:text-forest-400":"text-stone-400 hover:text-forest-500"}`}>
              {tb.icon}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom:"calc(env(safe-area-inset-bottom) + 80px)", WebkitOverflowScrolling:"touch" }}>

        {/* ── FEED ── */}
        {tab === "feed" && (
          <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
            {/* New post */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-stone-100 dark:border-gray-800 p-4 shadow-sm">
              <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)}
                placeholder={t.postPlaceholder} rows={3}
                className="w-full bg-transparent text-sm text-bark-900 dark:text-gray-100 placeholder:text-stone-400 resize-none focus:outline-none" />
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100 dark:border-gray-800">
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => setPostImage(e.target.files?.[0] ?? null)} />
                <button onClick={() => fileRef.current?.click()}
                  className="text-xs text-stone-400 hover:text-forest-500 transition-colors">📷 {postImage ? postImage.name.slice(0,12)+"…" : ""}</button>
                <button onClick={handlePost} disabled={!newPostText.trim() || posting}
                  className="ml-auto btn-primary text-sm px-4 py-2 disabled:opacity-40">{t.postBtn}</button>
              </div>
            </div>
            {posts.length === 0
              ? <div className="text-center py-12 text-stone-400 text-sm">{t.noFeed}</div>
              : posts.map(p => <PostCard key={p.id} post={p} />)
            }
          </div>
        )}

        {/* ── SEARCH ── */}
        {tab === "search" && (
          <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
            <input type="text" value={searchQ} onChange={e => doSearch(e.target.value)}
              placeholder={t.searchPlaceholder} className="input-field" />
            {searchQ && searchResults.length === 0
              ? <p className="text-center text-stone-400 text-sm pt-8">{t.noResults}</p>
              : searchResults.map(prof => (
                <div key={prof.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-stone-100 dark:border-gray-800 p-4 flex items-center gap-3">
                  <Avatar profile={prof} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-bark-900 dark:text-gray-100">@{prof.username}</p>
                    {prof.city && <p className="text-xs text-stone-400">📍 {prof.city}</p>}
                    {prof.bio && <p className="text-xs text-stone-400 truncate">{prof.bio}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => { checkFollow(prof.id); toggleFollow(prof); }}
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        followStatus[prof.id]==="accepted"?"bg-stone-100 dark:bg-gray-800 text-stone-500"
                        :followStatus[prof.id]==="pending"?"bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200"
                        :"bg-forest-600 text-white hover:bg-forest-700"
                      }`}>
                      {followStatus[prof.id]==="accepted"?t.unfollow:followStatus[prof.id]==="pending"?t.pendingFollow:t.follow}
                    </button>
                    <button onClick={() => { setActiveConv(prof); openConv(prof); setTab("messages"); }}
                      className="text-xs px-3 py-1.5 rounded-xl border border-stone-200 dark:border-gray-700 text-stone-500 hover:text-forest-600 transition-colors">✉️</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && !activeConv && (
          <div className="max-w-lg mx-auto px-4 pt-4 space-y-2">
            {conversations.length === 0
              ? <p className="text-center text-stone-400 text-sm pt-12">{t.noMessages}</p>
              : conversations.map(conv => (
                <button key={conv.partner.id} onClick={() => openConv(conv.partner)}
                  className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-stone-100 dark:border-gray-800 p-4 flex items-center gap-3 text-left hover:border-forest-200 transition-colors">
                  <Avatar profile={conv.partner} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-bark-900 dark:text-gray-100">@{conv.partner.username}</p>
                    <p className="text-xs text-stone-400 truncate">{conv.lastMsg.content}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-forest-500 text-white text-[10px] font-bold flex items-center justify-center">{conv.unread}</span>
                  )}
                </button>
              ))
            }
          </div>
        )}

        {tab === "messages" && activeConv && (
          <div className="flex flex-col h-full max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-900 border-b border-stone-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActiveConv(null)} className="text-stone-400 text-lg">←</button>
              <Avatar profile={activeConv} size={32} />
              <p className="font-semibold text-sm dark:text-gray-100">@{activeConv.username}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ WebkitOverflowScrolling:"touch" }}>
              {convMessages.map(msg => {
                const isMine = msg.sender_id === myProfile?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine?"justify-end":"justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-3xl text-sm ${isMine?"bg-forest-600 text-white":"bg-white dark:bg-gray-800 text-bark-900 dark:text-gray-100 border border-stone-100 dark:border-gray-700"}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 flex gap-2 border-t border-stone-100 dark:border-gray-800 bg-white dark:bg-gray-900"
              style={{ paddingBottom:"calc(env(safe-area-inset-bottom) + 80px)" }}>
              <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key==="Enter" && sendMsg()}
                placeholder={t.msgPh} className="input-field flex-1 py-2.5 text-sm" />
              <button onClick={sendMsg} disabled={!msgInput.trim()} className="btn-primary px-4 py-2.5 rounded-2xl disabled:opacity-40">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === "profile" && myProfile && (
          <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-stone-100 dark:border-gray-800 p-5">
              <div className="flex items-start gap-4">
                <Avatar profile={myProfile} size={64} />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-lg text-bark-900 dark:text-gray-100">@{myProfile.username}</p>
                  {myProfile.city && <p className="text-xs text-stone-400">📍 {myProfile.city}</p>}
                  <p className="text-sm text-stone-500 dark:text-gray-400 mt-1">{myProfile.bio || ""}</p>
                </div>
              </div>
              <div className="flex gap-6 mt-4 pt-4 border-t border-stone-100 dark:border-gray-800">
                <div className="text-center">
                  <p className="font-bold text-bark-900 dark:text-gray-100">{myPosts.length}</p>
                  <p className="text-xs text-stone-400">{t.myPosts}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-bark-900 dark:text-gray-100">{followCounts.followers}</p>
                  <p className="text-xs text-stone-400">{t.followers}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-bark-900 dark:text-gray-100">{followCounts.following}</p>
                  <p className="text-xs text-stone-400">{t.following}</p>
                </div>
              </div>
              {!editMode
                ? <button onClick={() => { setEditBio(myProfile.bio); setEditPrivate(myProfile.is_private); setEditMode(true); }}
                    className="w-full mt-3 btn-secondary py-2 text-sm">{t.editProfile}</button>
                : (
                  <div className="mt-3 space-y-2">
                    <input value={editBio} onChange={e => setEditBio(e.target.value)} placeholder={t.bioPh} className="input-field text-sm" />
                    <button onClick={() => setEditPrivate(p => !p)}
                      className={`w-full py-2.5 rounded-2xl border text-sm font-medium transition-all ${editPrivate?"border-amber-300 bg-amber-50 dark:bg-amber-950 text-amber-700":"border-forest-200 bg-forest-50 dark:bg-forest-950 text-forest-700"}`}>
                      {editPrivate ? `🔒 ${t.privacyPrivate}` : `🌍 ${t.privacyPublic}`}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => setEditMode(false)} className="btn-secondary flex-1 py-2 text-sm">{lang==="cs"?"Zrušit":"Cancel"}</button>
                      <button onClick={saveProfileEdit} className="btn-primary flex-1 py-2 text-sm">{t.saveProfile}</button>
                    </div>
                  </div>
                )
              }
            </div>
            <div className="space-y-3">
              {myPosts.map(p => <PostCard key={p.id} post={{ ...p, profile: myProfile }} />)}
            </div>
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
}
