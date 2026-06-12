import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell, Bookmark, Camera, Compass, Home, ImagePlus, MessageCircle,
  LogOut, MoreHorizontal, Plus, Quote, Repeat2, Search, Send, Settings, Share2, Smile, Star, UserRound, X,
} from 'lucide-react';
import './styles.css';
import { supabase } from './lib/supabase';
import { gateAuth } from './lib/authGate';

const navItems = [
  { label: '홈', icon: Home },
  { label: '둘러보기', icon: Compass },
  { label: '메시지', icon: MessageCircle, count: 3 },
  { label: '알림', icon: Bell, count: 6 },
  { label: '내 프로필', icon: UserRound },
];

const people = [
  { id: 1, name: '서윤', handle: '@seoyun', color: '#ffb38c', online: true, preview: '그 사진 정말 좋다!', time: '방금' },
  { id: 2, name: '민준', handle: '@minjun', color: '#85c7dc', online: true, preview: '주말에 같이 갈래?', time: '12분' },
  { id: 3, name: '하린', handle: '@harin', color: '#b4a0dc', online: false, preview: '고마워요 :)', time: '1시간' },
];

const popularPosts = [
  { author: '윤서진', topic: '사람마다 동네를 좋아하게 되는 순간', views: '2.8만', replies: 425, stars: '1.2천', reposts: 184 },
  { author: '박도윤', topic: '오늘 하루 중 잠깐 멈추게 만든 장면', views: '2.1만', replies: 318, stars: 986, reposts: 142 },
  { author: '한소희', topic: '오래 써도 질리지 않는 물건 추천', views: '1.7만', replies: 292, stars: 743, reposts: 91 },
  { author: '오하린', topic: '요즘 가장 자주 듣는 노래는?', views: '1.3만', replies: 208, stars: 612, reposts: 74 },
  { author: '문지안', topic: '혼자 걷기 좋은 시간과 장소', views: '9.8천', replies: 176, stars: 531, reposts: 63 },
];

const me = { name: '김지우', handle: '@jiwoo', color: '#65c6ba', online: true };

const notifications = [
  { id: 1, name: '윤서진', color: '#9dc8b4', icon: Star, tint: '#fff3e6', action: '회원님의 글에 별을 남겼어요.', time: '5분' },
  { id: 2, name: '오하린', color: '#b4a0dc', icon: UserRound, tint: '#eef0ff', action: '회원님을 팔로우하기 시작했어요.', time: '22분' },
  { id: 3, name: '박도윤', color: '#91b6d6', icon: MessageCircle, tint: '#e8f7f4', action: '회원님의 글에 답글을 남겼어요.', time: '1시간' },
  { id: 4, name: '한소희', color: '#f0a6b4', icon: Repeat2, tint: '#eafaf0', action: '회원님의 글을 다시 나눴어요.', time: '3시간' },
  { id: 5, name: '문지안', color: '#85c7dc', icon: Quote, tint: '#f3eefc', action: '회원님의 글을 인용했어요.', time: '어제' },
];

const initialMessages = {
  1: [
    { mine: false, text: '오늘 올린 바다 사진 너무 좋다!', time: '오후 1:02' },
    { mine: true, text: '고마워! 바람이 정말 좋았어.', time: '오후 1:03' },
    { mine: false, text: '다음에는 나도 같이 가자 🌊', time: '오후 1:04' },
  ],
  2: [{ mine: false, text: '주말에 새로 생긴 전시 같이 갈래?', time: '오후 12:40' }],
  3: [{ mine: true, text: '추천해준 책 잘 읽었어요!', time: '어제' }],
};

const seedPosts = [
  {
    id: 'seed-seojin',
    author: { name: '윤서진', handle: '@seojin', color: '#9dc8b4', online: true },
    time: '8분',
    follows: true,
    initialLikes: 84,
    text: '사람마다 동네를 좋아하게 되는 순간이 궁금해요. 저는 자주 가는 가게에서 제 취향을 기억해줄 때 비로소 이곳이 내 동네처럼 느껴지더라고요.',
    initialReplies: [
      { name: '한소희', text: '저는 산책하다 자주 마주치는 사람과 인사하게 됐을 때요.' },
      { name: '이정민', text: '단골 가게가 생기는 순간 정말 공감해요.' },
      { name: '최유나', text: '아침마다 같은 길을 걷다 보니 계절이 바뀌는 모습까지 익숙해졌을 때요.' },
      { name: '강현우', text: '동네 세탁소 사장님이 이름을 기억해주셨을 때 갑자기 마음이 따뜻해졌어요.' },
      { name: '문지안', text: '저는 늦은 밤에도 편하게 걸을 수 있는 골목이 생겼을 때부터였던 것 같아요.' },
      { name: '송태민', text: '집 근처에 좋아하는 커피집 하나만 생겨도 동네를 보는 눈이 달라지더라고요.' },
      { name: '배수아', text: '길고양이들에게 제가 임의로 이름을 붙이기 시작한 순간이요.' },
      { name: '정다은', text: '비 오는 날 우산 없이 뛰어도 어디로 피해야 할지 알게 됐을 때요.' },
      { name: '오세훈', text: '자주 가는 식당에서 말하지 않아도 늘 먹던 메뉴를 준비해주셔서 놀랐던 기억이 있어요.' },
      { name: '김나리', text: '저는 이사 온 첫날 이웃분이 과일을 나눠주셨을 때부터 이 동네가 좋아졌어요.' },
      { name: '윤하준', text: '주말마다 열리는 작은 시장에서 익숙한 얼굴들이 보이기 시작했을 때요.' },
      { name: '임서아', text: '공원 벤치마다 햇빛이 가장 예쁘게 드는 시간을 알게 된 순간이요.' },
      { name: '차민석', text: '택배 기사님과 자연스럽게 인사를 주고받게 된 뒤부터 조금씩 소속감이 생겼어요.' },
      { name: '백예린', text: '친구에게 우리 동네 좋은 곳을 자신 있게 소개할 수 있게 됐을 때요.' },
      { name: '권도현', text: '저녁 산책 코스가 생기고 그 길을 걷는 것만으로 하루가 정리될 때부터요.' },
      { name: '신아영', text: '작은 서점 주인분이 제가 좋아할 만한 책을 먼저 추천해주신 날이 기억나요.' },
      { name: '남준호', text: '버스에서 내려 집까지 가는 길이 짧게 느껴지기 시작하면 그곳이 내 동네가 된 것 같아요.' },
      { name: '고은채', text: '골목 끝 꽃집 앞에 매주 새로운 꽃이 놓이는 걸 기다리게 됐을 때요.' },
      { name: '장우진', text: '동네 사람들과 함께 눈을 치웠던 겨울 이후로 훨씬 가까워진 느낌이 들었어요.' },
      { name: '조하늘', text: '저는 해 질 무렵 옥상에서 보이는 풍경이 좋아서 이 동네를 떠나기 싫어졌어요.' },
      { name: '서민재', text: '매일 같은 시간에 운동하는 분과 눈인사를 나누게 되면서부터 익숙해졌습니다.' },
      { name: '유채원', text: '급하게 필요한 물건이 있을 때 어디로 가야 하는지 바로 떠오르는 순간이요.' },
      { name: '안재희', text: '동네 축제에서 우연히 이웃들을 만나 함께 시간을 보낸 뒤부터 애착이 커졌어요.' },
      { name: '박소율', text: '좋아하는 빵이 나오는 시간을 외우게 된 순간부터 이미 이 동네 사람이었던 것 같아요.' },
      { name: '홍지수', text: '댓글들을 읽으니 동네를 좋아하게 되는 이유는 결국 장소보다 사람과 기억인 것 같네요.' },
    ],
  },
  {
    id: 'seed-doyoon',
    author: { name: '박도윤', handle: '@doyoon', color: '#91b6d6', online: false },
    time: '32분',
    follows: false,
    initialLikes: 328,
    repostedBy: '서윤',
    text: '오늘 하루 중 잠깐 멈추게 만든 장면이 있었나요? 저는 이 바다 앞에서 한참을 서 있었어요.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    initialReplies: [{ name: '오하린', text: '사진만 봐도 마음이 조용해지네요.' }],
  },
];

function Avatar({ person, size = 42 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: person.color }}>
      {person.name.slice(0, 1)}
    </div>
  );
}

function FollowButton() {
  const [following, setFollowing] = useState(false);
  return (
    <button className={following ? 'follow-btn following' : 'follow-btn'} onClick={() => setFollowing(!following)}>
      {following ? '팔로잉' : '팔로우'}
    </button>
  );
}

function Post({ author, time, text, image, initialLikes, initialReplies = [], repostedBy, quoted }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(initialReplies);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const addReply = () => {
    if (!replyText.trim()) return;
    setReplies((current) => [...current, { name: '김지우', text: replyText.trim() }]);
    setReplyText('');
    setShowReply(false);
  };

  const sharePost = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'SAYO', text }); } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {}
  };

  return (
    <article className="post">
      {repostedBy ? <div className="reposted-by"><Repeat2 size={14} /> {repostedBy}님이 다시 나눴습니다</div> : null}
      <div className="post-head">
        <Avatar person={author} size={44} />
        <div className="post-meta">
          <strong>{author.name}</strong>
          <span>{author.handle} · {time}</span>
        </div>
        <button className="icon-btn" aria-label="더 보기"><MoreHorizontal size={20} /></button>
      </div>
      <p className="post-copy">{text}</p>
      {image ? <img className="post-image" src={image} alt="공유된 게시물 사진" /> : null}
      {quoted ? <div className="quote-card embedded"><strong>{quoted.name}</strong><p>{quoted.text}</p></div> : null}
      <div className="post-actions">
        <button className={liked ? 'action liked' : 'action'} onClick={() => setLiked(!liked)}>
          <Star size={20} fill={liked ? 'currentColor' : 'none'} /> {initialLikes + (liked ? 1 : 0)}
        </button>
        <button className="action" onClick={() => setShowReply(!showReply)}><MessageCircle size={20} /> {replies.length || '답글'}</button>
        <button className={shared ? 'action saved' : 'action'} onClick={sharePost}><Share2 size={19} /> {shared ? '복사됨' : '공유'}</button>
        <button className={saved ? 'action saved' : 'action'} onClick={() => setSaved(!saved)} aria-label="저장">
          <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      {replies.length ? (
        <div className="reply-preview">
          {replies.length > 3 ? (
            <button className="reply-toggle" onClick={() => setShowAllReplies(!showAllReplies)}>
              {showAllReplies ? '답글 접기' : `답글 ${replies.length - 3}개 더 보기`}
            </button>
          ) : null}
          {(showAllReplies ? replies : replies.slice(0, 3)).map((reply, index) => (
            <div className="reply-line" key={`${reply.name}-${index}`}>
              <span className="reply-branch" /><div><strong>{reply.name}</strong><p>{reply.text}</p></div>
            </div>
          ))}
        </div>
      ) : null}
      {showReply ? (
        <div className="reply-box">
          <input value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addReply()} placeholder={`${author.name}님에게 답글 남기기`} />
          <button onClick={addReply}>답글</button>
        </div>
      ) : null}
    </article>
  );
}

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dbPosts, setDbPosts] = useState([]);
  const [authMode, setAuthMode] = useState('signup');
  const [signupStep, setSignupStep] = useState(1);
  const [email, setEmail] = useState('');
  const [identityVerified, setIdentityVerified] = useState(false);
  const [identityChallenge, setIdentityChallenge] = useState('');
  const [identityInput, setIdentityInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [newName, setNewName] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [terms, setTerms] = useState({ service: false, privacy: false, age: false });
  const [accountPrivacy, setAccountPrivacy] = useState('public');
  const [dmPrivacy, setDmPrivacy] = useState('following');
  const [interests, setInterests] = useState([]);
  const [activeNav, setActiveNav] = useState('홈');
  const [selectedPerson, setSelectedPerson] = useState(people[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [messageText, setMessageText] = useState('');
  const [postText, setPostText] = useState('');
  const [feedTab, setFeedTab] = useState('추천');
  const [photo, setPhoto] = useState('');
  const [moodOpen, setMoodOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileRef = useRef(null);

  const currentMessages = useMemo(() => messages[selectedPerson.id] || [], [messages, selectedPerson]);

  const timeAgo = (iso) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return '방금';
    if (diff < 3600) return `${Math.floor(diff / 60)}분`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간`;
    return `${Math.floor(diff / 86400)}일`;
  };

  const loadPosts = async (uid) => {
    const { data } = await supabase
      .from('posts')
      .select('id, body, image_url, created_at, author_id, profiles(handle, display_name, avatar_color)')
      .order('created_at', { ascending: false });
    if (!data) return;
    setDbPosts(data.map((row) => ({
      id: row.id,
      authorId: row.author_id,
      own: uid && row.author_id === uid,
      follows: false,
      author: {
        name: row.profiles?.display_name || '사용자',
        handle: '@' + (row.profiles?.handle || 'user'),
        color: row.profiles?.avatar_color || '#65c6ba',
      },
      time: timeAgo(row.created_at),
      text: row.body,
      image: row.image_url || '',
      initialLikes: 0,
      initialReplies: [],
    })));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthOpen(!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) setAuthOpen(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const uid = session?.user?.id;
    loadPosts(uid);
    if (uid) {
      supabase.from('profiles').select('handle, display_name, avatar_color').eq('id', uid).single()
        .then(({ data }) => setProfile(data));
    } else {
      setProfile(null);
    }
  }, [session]);

  const sendMessage = () => {
    const value = messageText.trim();
    if (!value) return;
    setMessages((current) => ({
      ...current,
      [selectedPerson.id]: [...(current[selectedPerson.id] || []), { mine: true, text: value, time: '방금' }],
    }));
    setMessageText('');
  };

  const publishPost = async () => {
    const value = postText.trim();
    if (!value && !photo) return;
    if (!session) { setAuthOpen(true); return; }
    const { error } = await supabase.from('posts').insert({
      author_id: session.user.id,
      body: value || '사진을 공유했어요.',
    });
    if (error) return;
    setPostText('');
    setPhoto('');
    setMoodOpen(false);
    loadPosts(session.user.id);
  };

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const interestOptions = ['일상', '사진', '음악', '책', '영화', '여행', '질문', '취미'];
  const toggleInterest = (interest) => {
    setInterests((current) => current.includes(interest)
      ? current.filter((item) => item !== interest)
      : [...current, interest].slice(0, 3));
  };

  const completeSignup = async () => {
    const gated = await gateAuth({ action: 'signup', email, password, handle: newHandle, display_name: newName });
    if (gated.fallback) {
      // 검문소 미배포 시 기존 직접 가입
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { handle: newHandle, display_name: newName } },
      });
      if (error) { setAuthError(error.message); return; }
    } else if (gated.error) {
      setAuthError(gated.error);
      return;
    }
    setAuthError('');
    setAuthOpen(false);
    setSignupStep(1);
  };

  const issueIdentityChallenge = () => {
    const challenge = String(Math.floor(100000 + Math.random() * 900000));
    setIdentityChallenge(challenge);
    setIdentityInput('');
    setIdentityVerified(false);
    setAuthError('');
  };

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const resetIdentityVerification = () => {
    setIdentityVerified(false);
    setIdentityChallenge('');
    setIdentityInput('');
  };

  const verifyIdentityChallenge = () => {
    if (identityInput === identityChallenge && identityChallenge) {
      setIdentityVerified(true);
      setAuthError('');
      return;
    }
    setAuthError('인증번호가 일치하지 않습니다.');
  };

  const loginLocalAccount = async () => {
    const gated = await gateAuth({ action: 'login', email: loginEmail, password: loginPassword });
    if (gated.fallback) {
      // 검문소 미배포 시 기존 직접 로그인
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) {
        setAuthError('이메일 또는 비밀번호가 일치하지 않습니다.');
        return;
      }
    } else if (gated.error) {
      setAuthError(gated.error);
      return;
    } else if (gated.session) {
      const { error } = await supabase.auth.setSession(gated.session);
      if (error) { setAuthError('로그인 처리 중 문제가 발생했습니다.'); return; }
    }
    setAuthError('');
    setAuthOpen(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthOpen(true);
  };

  const passwordIsStrong = password.length >= 8
    && /[A-Za-z]/.test(password)
    && /\d/.test(password);
  const requiredTermsAccepted = terms.service && terms.privacy && terms.age;

  const view = ({
    '홈': { title: '홈', subtitle: '사람들의 생각과 대화가 이어지는 곳' },
    '둘러보기': { title: '둘러보기', subtitle: '지금 SAYO에서 오가는 이야기' },
    '메시지': { title: '메시지', subtitle: '주고받은 대화를 한곳에서' },
    '알림': { title: '알림', subtitle: '회원님과 관련된 새로운 소식' },
    '내 프로필': { title: '내 프로필', subtitle: me.handle },
  })[activeNav] || { title: activeNav, subtitle: '' };

  const allPosts = [...dbPosts, ...seedPosts];
  const visiblePosts = feedTab === '팔로잉'
    ? allPosts.filter((post) => post.follows || post.own)
    : feedTab === '추천'
    ? [...allPosts].sort((a, b) => (b.initialLikes || 0) - (a.initialLikes || 0))
    : allPosts;

  const q = searchQuery.trim().toLowerCase();
  const peopleResults = q ? people.filter((p) => `${p.name}${p.handle}`.toLowerCase().includes(q)) : people;
  const topicResults = q ? popularPosts.filter((p) => `${p.topic}${p.author}`.toLowerCase().includes(q)) : popularPosts;
  const openSearch = () => { setSearchOpen(true); setSearchQuery(''); };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>S</span>SAYO</div>
        <nav>
          {navItems.map(({ label, icon: Icon, count }) => (
            <button
              key={label}
              className={activeNav === label ? 'nav-item active' : 'nav-item'}
              onClick={() => {
                setActiveNav(label);
                if (label === '메시지') setChatOpen(true);
              }}
            >
              <Icon size={22} /><span>{label}</span>{count ? <b>{count}</b> : null}
            </button>
          ))}
        </nav>
        <button className="new-post" onClick={() => document.querySelector('.composer textarea')?.focus()}><Plus size={20} /> 새 글 쓰기</button>
        <div className="my-account">
          <Avatar person={{ name: profile?.display_name || '게스트', color: profile?.avatar_color || '#65c6ba', online: true }} size={40} />
          <div><strong>{profile?.display_name || '게스트'}</strong><span>{profile ? '@' + profile.handle : '로그인 필요'}</span></div>
          {session
            ? (
              <div className="account-menu-wrap">
                <button className="icon-btn" onClick={() => setAccountMenuOpen((v) => !v)} aria-label="설정"><Settings size={18} /></button>
                {accountMenuOpen ? (
                  <div className="account-menu">
                    <button onClick={() => { setAccountMenuOpen(false); logout(); }}><LogOut size={15} /> 로그아웃</button>
                  </div>
                ) : null}
              </div>
            )
            : <button className="icon-btn" onClick={() => setAuthOpen(true)} aria-label="로그인"><Settings size={18} /></button>}
        </div>
      </aside>

      <main className="feed">
        <header className="mobile-header"><div className="brand"><span>S</span>SAYO</div><button className="icon-btn" onClick={openSearch} aria-label="검색"><Search /></button></header>
        <div className="feed-title">
          <div><h1>{view.title}</h1><p>{view.subtitle}</p></div>
          <button className="search-button" onClick={openSearch}><Search size={19} /> 이야기와 사람 찾기</button>
        </div>

        {activeNav === '홈' ? (
        <>
        <section className="composer">
          <Avatar person={{ name: '지우', color: '#65c6ba', online: true }} size={44} />
          <div className="composer-body">
            <textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="무슨 생각을 하고 있나요?" />
            {photo ? <img className="photo-preview" src={photo} alt="선택한 사진 미리보기" /> : null}
            <div className="composer-actions">
              <input ref={fileRef} type="file" accept="image/*" onChange={choosePhoto} hidden />
              <button onClick={() => fileRef.current?.click()}><ImagePlus size={19} /> 사진</button>
              <div className="mood-wrap">
                <button onClick={() => setMoodOpen((open) => !open)}><Smile size={19} /> 기분</button>
                {moodOpen ? (
                  <div className="mood-popover">
                    {['😊', '😢', '😍', '😮', '😡', '🥰', '😴', '🎉'].map((emoji) => (
                      <button key={emoji} onClick={() => { setPostText((text) => text + emoji); setMoodOpen(false); }}>{emoji}</button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button className="publish" onClick={publishPost}>게시하기</button>
            </div>
          </div>
        </section>

        <div className="feed-tabs">
          {['추천', '팔로잉', '최신'].map((tab) => (
            <button key={tab} className={feedTab === tab ? 'selected' : ''} onClick={() => setFeedTab(tab)}>{tab}</button>
          ))}
        </div>

        {visiblePosts.length ? visiblePosts.map((post) => (
          <Post
            key={post.id}
            author={post.author}
            time={post.time}
            text={post.text}
            image={post.image}
            initialLikes={post.initialLikes}
            initialReplies={post.initialReplies}
            repostedBy={post.repostedBy}
            quoted={post.quoted}
          />
        )) : <p className="empty-note">팔로우한 사람의 글이 아직 없어요. 둘러보기에서 사람을 찾아보세요.</p>}
        </>
        ) : null}

        {activeNav === '둘러보기' ? (
          <section className="explore">
            <div className="explore-block">
              <h2 className="block-title">지금 뜨는 이야기</h2>
              <div className="trend-grid">
                {popularPosts.map((post, index) => (
                  <button className="trend-card" key={post.topic}>
                    <span className="trend-rank">#{index + 1}</span>
                    <strong>{post.topic}</strong>
                    <small>{post.author} · 답글 {post.replies} · 별 {post.stars}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="explore-block">
              <h2 className="block-title">추천하는 사람</h2>
              <div className="suggest-list">
                {people.map((person) => (
                  <div className="suggest-row" key={person.id}>
                    <Avatar person={person} />
                    <div><strong>{person.name}</strong><span>{person.handle}</span></div>
                    <FollowButton />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeNav === '메시지' ? (
          <section className="dm-list">
            {people.map((person) => (
              <button className="dm-row" key={person.id} onClick={() => { setSelectedPerson(person); setChatOpen(true); }}>
                <Avatar person={person} />
                <div><strong>{person.name} <em>{person.handle}</em></strong><p>{person.preview}</p></div>
                <time>{person.time}</time>
              </button>
            ))}
          </section>
        ) : null}

        {activeNav === '알림' ? (
          <section className="noti-list">
            {notifications.map((noti) => {
              const Icon = noti.icon;
              return (
                <div className="noti-row" key={noti.id}>
                  <span className="noti-icon" style={{ background: noti.tint }}><Icon size={15} /></span>
                  <Avatar person={{ name: noti.name, color: noti.color }} size={36} />
                  <p><strong>{noti.name}</strong>님이 {noti.action}</p>
                  <time>{noti.time}</time>
                </div>
              );
            })}
          </section>
        ) : null}

        {activeNav === '내 프로필' ? (
          <section className="profile">
            <div className="profile-cover" />
            <div className="profile-head">
              <Avatar person={me} size={76} />
              <button className="profile-edit">프로필 편집</button>
            </div>
            <div className="profile-id"><h2>{me.name}</h2><span>{me.handle}</span></div>
            <p className="profile-bio">조용한 동네 산책과 좋은 대화를 좋아합니다. 작은 순간을 오래 기억하려고 해요.</p>
            <div className="profile-stats">
              <div><strong>{dbPosts.filter((post) => post.own).length}</strong><span>게시물</span></div>
              <div><strong>128</strong><span>팔로워</span></div>
              <div><strong>96</strong><span>팔로잉</span></div>
            </div>
            <div className="feed-tabs"><button className="selected">게시물</button><button>답글</button><button>별</button></div>
            {dbPosts.some((post) => post.own) ? (
              dbPosts.filter((post) => post.own).map((post) => (
                <Post key={post.id} author={post.author} time={post.time} text={post.text} image={post.image} initialLikes={0} />
              ))
            ) : (
              <p className="empty-note">아직 작성한 게시물이 없어요. 홈에서 첫 글을 남겨보세요.</p>
            )}
          </section>
        ) : null}
      </main>

      <nav className="mobile-nav">
        {navItems.map(({ label, icon: Icon, count }) => (
          <button
            key={label}
            className={activeNav === label ? 'mobile-nav-item active' : 'mobile-nav-item'}
            onClick={() => { setActiveNav(label); if (label === '메시지') setChatOpen(true); }}
          >
            <span className="mobile-nav-ic"><Icon size={21} />{count ? <b>{count}</b> : null}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <aside className="discover-panel">
        <section>
          <div className="section-head"><h2>인기 게시물</h2><button onClick={() => setActiveNav('둘러보기')}>더 보기</button></div>
          <div className="popular-list">
            {popularPosts.map((post, index) => (
              <button className="popular-row" key={post.topic}>
                <span className="rank">{index + 1}</span>
                <div>
                  <small>{post.author}</small>
                  <strong>{post.topic}</strong>
                  <span className="popular-stats">
                    <span>조회 {post.views}</span>
                    <span>답글 {post.replies}</span>
                    <span>별 {post.stars}</span>
                    <span>재게시 {post.reposts}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
        <section>
          <div className="section-head"><h2>메시지</h2><button onClick={() => { setActiveNav('메시지'); setChatOpen(true); }}>더 보기</button></div>
          <div className="message-profiles">
            {people.map((person) => (
              <button
                key={person.id}
                className={selectedPerson.id === person.id ? 'message-profile active' : 'message-profile'}
                onClick={() => {
                  setSelectedPerson(person);
                  setChatOpen(true);
                }}
              >
                <Avatar person={person} />
                <div>
                  <strong>{person.name}</strong>
                  <span>{person.preview} · {person.time}</span>
                </div>
                <Camera size={16} />
              </button>
            ))}
          </div>
        </section>
      </aside>

      {chatOpen ? <aside className="chat-panel">
        <div className="chat-head">
          <Avatar person={selectedPerson} />
          <div><strong>{selectedPerson.name}</strong><span>{selectedPerson.handle}</span></div>
          <button className="icon-btn" onClick={() => setChatOpen(false)} aria-label="메신저 닫기"><X size={19} /></button>
        </div>
        <div className="chat-messages">
          <div className="chat-day">오늘</div>
          {currentMessages.map((message, index) => (
            <div key={index} className={message.mine ? 'bubble-wrap mine' : 'bubble-wrap'}>
              <div className="bubble">{message.text}</div><time>{message.time}</time>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <button><Camera size={19} /></button>
          <input value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="메시지 보내기" />
          <button className="send" onClick={sendMessage}><Send size={18} /></button>
        </div>
      </aside> : null}

      {searchOpen ? (
        <div className="search-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-bar">
              <Search size={18} />
              <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="이야기와 사람 찾기" />
              <button className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="검색 닫기"><X size={18} /></button>
            </div>
            <div className="search-results">
              <div className="search-group">
                <h3>사람</h3>
                {peopleResults.length ? peopleResults.map((person) => (
                  <button className="search-person" key={person.id} onClick={() => { setSelectedPerson(person); setActiveNav('메시지'); setChatOpen(true); setSearchOpen(false); }}>
                    <Avatar person={person} size={36} />
                    <div><strong>{person.name}</strong><span>{person.handle}</span></div>
                  </button>
                )) : <p className="search-empty">일치하는 사람이 없어요.</p>}
              </div>
              <div className="search-group">
                <h3>이야기</h3>
                {topicResults.length ? topicResults.map((post) => (
                  <button className="search-topic" key={post.topic} onClick={() => { setActiveNav('둘러보기'); setSearchOpen(false); }}>
                    <strong>{post.topic}</strong>
                    <small>{post.author} · 답글 {post.replies}</small>
                  </button>
                )) : <p className="search-empty">일치하는 이야기가 없어요.</p>}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {authOpen ? (
        <div className="auth-backdrop">
          <section className="auth-card">
            <button className="auth-skip" onClick={() => setAuthOpen(false)}>둘러보기</button>
            <div className="auth-brand"><span>S</span><strong>SAYO</strong></div>
            <p className="auth-tagline">생각을 말하고, 새로운 대화를 만나세요.</p>

            <div className="auth-tabs">
              <button className={authMode === 'signup' ? 'active' : ''} onClick={() => setAuthMode('signup')}>회원가입</button>
              <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>로그인</button>
            </div>

            {authMode === 'login' ? (
              <div className="auth-form">
                <label>이메일<input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" placeholder="name@example.com" /></label>
                <label>비밀번호<input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} type="password" placeholder="비밀번호" /></label>
                {authError ? <p className="auth-error">{authError}</p> : null}
                <button className="auth-primary" onClick={loginLocalAccount}>로그인</button>
                <div className="auth-divider"><span>또는</span></div>
                <button className="social-login">카카오로 계속하기</button>
                <button className="social-login">Google로 계속하기</button>
              </div>
            ) : (
              <div className="auth-form">
                <div className="auth-progress"><span style={{ width: `${signupStep * 20}%` }} /></div>
                {signupStep === 1 ? (
                  <>
                    <h2>본인 확인을 진행해요</h2>
                    <div className="verification-block">
                      <label>이메일<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@example.com" /></label>
                      {email && !emailIsValid ? <p className="field-error">이메일 형식이 올바르지 않습니다.</p> : null}
                      <p className="auth-note">가입 완료 후 이 주소로 확인 메일이 발송됩니다. 메일의 링크를 눌러야 로그인할 수 있어요.</p>
                    </div>
                    {identityVerified ? (
                      <div className="verified-summary"><div><strong>본인확인 완료</strong><span>로컬 테스트 본인확인</span></div><button onClick={resetIdentityVerification}>다시 인증</button></div>
                    ) : (
                      <div className="verification-block">
                        <div className="identity-check">
                          <div><strong>로컬 테스트 본인확인</strong><span>실제 PASS 연동 전 가입 흐름을 시험합니다.</span></div>
                          <button onClick={issueIdentityChallenge}>{identityChallenge ? '재발급' : '인증번호 발급'}</button>
                        </div>
                        {identityChallenge ? <div className="local-code">로컬 테스트 인증번호 <strong>{identityChallenge}</strong></div> : null}
                        {identityChallenge ? <div className="identity-entry"><input value={identityInput} onChange={(e) => setIdentityInput(e.target.value.replace(/\D/g, ''))} maxLength={6} placeholder="인증번호 6자리 입력" /><button disabled={identityInput.length !== 6} onClick={verifyIdentityChallenge}>인증번호 확인</button></div> : null}
                      </div>
                    )}
                    {authError ? <p className="auth-error">{authError}</p> : null}
                    <p className="auth-note">이 인증은 로컬 테스트 전용이며 실제 한국인 본인인증이 아닙니다. 운영 배포 전 PASS 본인확인기관을 연결해야 합니다.</p>
                    <div className="verification-status">
                      <span className={emailIsValid ? 'done' : ''}>{emailIsValid ? '✓' : '1'} 이메일 입력</span>
                      <span className={identityVerified ? 'done' : ''}>{identityVerified ? '✓' : '2'} 본인확인</span>
                    </div>
                    {!emailIsValid || !identityVerified ? <p className="auth-requirement">이메일 입력과 본인확인을 완료하면 다음 단계로 이동할 수 있습니다.</p> : null}
                    <button className="auth-primary" disabled={!emailIsValid || !identityVerified} onClick={() => setSignupStep(2)}>
                      {!emailIsValid ? '이메일 입력 필요' : !identityVerified ? '본인확인 필요' : '다음'}
                    </button>
                  </>
                ) : null}
                {signupStep === 2 ? (
                  <>
                    <h2>계정을 안전하게 보호해요</h2>
                    <label>비밀번호<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="8자 이상의 비밀번호" /></label>
                    <label>비밀번호 확인<input value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} type="password" placeholder="비밀번호 다시 입력" /></label>
                    <ul className="password-rules">
                      <li className={password.length >= 8 ? 'pass' : ''}>{password.length >= 8 ? '✓' : '○'} 8자 이상</li>
                      <li className={/[A-Za-z]/.test(password) ? 'pass' : ''}>{/[A-Za-z]/.test(password) ? '✓' : '○'} 영문 포함</li>
                      <li className={/\d/.test(password) ? 'pass' : ''}>{/\d/.test(password) ? '✓' : '○'} 숫자 포함</li>
                      <li className={password && password === passwordConfirm ? 'pass' : ''}>{password && password === passwordConfirm ? '✓' : '○'} 비밀번호 일치</li>
                    </ul>
                    {!passwordIsStrong || password !== passwordConfirm ? <p className="auth-requirement">체크되지 않은 비밀번호 조건을 완료해주세요.</p> : null}
                    <button className="auth-primary" disabled={!passwordIsStrong || password !== passwordConfirm} onClick={() => setSignupStep(3)}>
                      {!passwordIsStrong ? '비밀번호 조건 확인 필요' : password !== passwordConfirm ? '비밀번호 불일치' : '다음'}
                    </button>
                  </>
                ) : null}
                {signupStep === 3 ? (
                  <>
                    <h2>나를 소개해주세요</h2>
                    <label>표시 이름<input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="이름" /></label>
                    <label>아이디<div className="handle-input"><span>@</span><input value={newHandle} onChange={(e) => setNewHandle(e.target.value.replace(/\s/g, ''))} placeholder="sayo_user" /></div></label>
                    <label>생년월일<input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" /></label>
                    <p className="auth-note">생년월일은 공개되지 않으며 연령별 보호 설정에 사용됩니다.</p>
                    <button className="auth-primary" disabled={!newName || newHandle.length < 3 || !birthDate} onClick={() => setSignupStep(4)}>다음</button>
                  </>
                ) : null}
                {signupStep === 4 ? (
                  <>
                    <h2>공개 범위와 약관을 확인해요</h2>
                    <label>계정 공개 범위<select value={accountPrivacy} onChange={(e) => setAccountPrivacy(e.target.value)}><option value="public">공개 계정</option><option value="private">비공개 계정</option></select></label>
                    <label>메시지 수신 범위<select value={dmPrivacy} onChange={(e) => setDmPrivacy(e.target.value)}><option value="following">내가 팔로우한 사람만</option><option value="followers">팔로워까지</option><option value="none">메시지 받지 않기</option></select></label>
                    <div className="terms-list">
                      <label><input type="checkbox" checked={terms.service} onChange={(e) => setTerms({ ...terms, service: e.target.checked })} /> 이용약관 동의 (필수)</label>
                      <label><input type="checkbox" checked={terms.privacy} onChange={(e) => setTerms({ ...terms, privacy: e.target.checked })} /> 개인정보 처리방침 동의 (필수)</label>
                      <label><input type="checkbox" checked={terms.age} onChange={(e) => setTerms({ ...terms, age: e.target.checked })} /> 만 14세 이상입니다 (필수)</label>
                    </div>
                    <button className="auth-primary" disabled={!requiredTermsAccepted} onClick={() => setSignupStep(5)}>다음</button>
                  </>
                ) : null}
                {signupStep === 5 ? (
                  <>
                    <h2>관심 주제 3개를 골라보세요</h2>
                    <div className="interest-grid">
                      {interestOptions.map((interest) => <button key={interest} className={interests.includes(interest) ? 'selected' : ''} onClick={() => toggleInterest(interest)}>{interest}</button>)}
                    </div>
                    <button className="auth-primary" disabled={interests.length !== 3} onClick={completeSignup}>SAYO 시작하기</button>
                    <button className="auth-secondary" onClick={completeSignup}>관심 주제 건너뛰기</button>
                  </>
                ) : null}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
