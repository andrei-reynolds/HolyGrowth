import * as React from 'react';
import { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp, 
  getDocFromServer,
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isYesterday, isToday, subDays } from 'date-fns';
import { 
  Trophy, 
  Flame, 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  LogOut, 
  BookOpen, 
  Dumbbell, 
  Brain, 
  Sword, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Quote,
  Footprints,
  Droplets,
  Coffee,
  Music,
  Code,
  Heart,
  Utensils,
  Zap,
  Moon,
  Sun,
  Camera,
  Brush,
  Pen,
  ShoppingBag,
  Bike,
  Trees,
  Timer,
  Target,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { db, auth } from './firebase';
import { UserProfile, Quest, UserQuest, Schedule, QuestCategory, BibleQuote } from './types';
import { PREDEFINED_QUESTS, BIBLE_QUOTES } from './constants';

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-6 text-center">
          <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600">
            <X size={48} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mb-8 text-gray-600">We encountered an error while processing your adventure.</p>
          <div className="mb-8 max-w-md overflow-auto rounded-xl bg-gray-900 p-4 text-left text-xs font-mono text-red-400">
            {(this as any).state.errorInfo}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-gray-900 px-8 py-4 font-bold text-white transition-all hover:bg-gray-800"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}

// --- Main App Wrapper ---
export default function AppWrapper() {
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

// --- Components ---

const BibleQuoteModal = ({ quote, onClose }: { quote: BibleQuote; onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }} 
      animate={{ scale: 1, y: 0 }} 
      exit={{ scale: 0.9, y: 20 }}
      className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl"
    >
      <div className="absolute top-0 left-0 h-2 w-full bg-orange-500" />
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X size={20} />
      </button>
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-orange-100 p-4 text-orange-600">
          <Quote size={32} />
        </div>
      </div>
      <blockquote className="mb-6 text-center">
        <p className="mb-4 text-xl font-medium italic text-gray-800">"{quote.text}"</p>
        <footer className="text-sm font-bold uppercase tracking-widest text-orange-600">— {quote.reference}</footer>
      </blockquote>
      <button 
        onClick={onClose}
        className="w-full rounded-2xl bg-orange-500 py-4 font-bold text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-600 active:scale-95"
      >
        Continue Adventure
      </button>
    </motion.div>
  </motion.div>
);

const QuestCard = ({ 
  quest, 
  isCompleted, 
  onToggle, 
  onDelete,
  dragControls
}: { 
  quest: Quest; 
  isCompleted: boolean; 
  onToggle: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  dragControls: any;
}) => {
  const getIcon = () => {
    const text = (quest.title + ' ' + (quest.description || '')).toLowerCase();
    
    if (text.includes('run') || text.includes('walk') || text.includes('step') || text.includes('hike')) return <Footprints size={20} />;
    if (text.includes('water') || text.includes('drink') || text.includes('hydrate')) return <Droplets size={20} />;
    if (text.includes('coffee') || text.includes('tea') || text.includes('breakfast')) return <Coffee size={20} />;
    if (text.includes('music') || text.includes('sing') || text.includes('guitar') || text.includes('piano')) return <Music size={20} />;
    if (text.includes('code') || text.includes('program') || text.includes('dev')) return <Code size={20} />;
    if (text.includes('heart') || text.includes('love') || text.includes('kindness') || text.includes('volunteer')) return <Heart size={20} />;
    if (text.includes('eat') || text.includes('food') || text.includes('cook') || text.includes('meal') || text.includes('dinner') || text.includes('lunch')) return <Utensils size={20} />;
    if (text.includes('energy') || text.includes('fast') || text.includes('quick') || text.includes('power')) return <Zap size={20} />;
    if (text.includes('sleep') || text.includes('night') || text.includes('bed') || text.includes('dream')) return <Moon size={20} />;
    if (text.includes('sun') || text.includes('morning') || text.includes('day') || text.includes('outside')) return <Sun size={20} />;
    if (text.includes('photo') || text.includes('camera') || text.includes('picture')) return <Camera size={20} />;
    if (text.includes('paint') || text.includes('art') || text.includes('draw') || text.includes('creative')) return <Brush size={20} />;
    if (text.includes('write') || text.includes('journal') || text.includes('pen') || text.includes('blog')) return <Pen size={20} />;
    if (text.includes('shop') || text.includes('buy') || text.includes('grocery')) return <ShoppingBag size={20} />;
    if (text.includes('bike') || text.includes('cycle')) return <Bike size={20} />;
    if (text.includes('nature') || text.includes('tree') || text.includes('garden') || text.includes('plant')) return <Trees size={20} />;
    if (text.includes('time') || text.includes('timer') || text.includes('clock') || text.includes('focus')) return <Timer size={20} />;
    if (text.includes('goal') || text.includes('target') || text.includes('aim')) return <Target size={20} />;

    switch (quest.category) {
      case QuestCategory.EXERCISE: return <Dumbbell size={20} />;
      case QuestCategory.MEDITATION: return <Brain size={20} />;
      case QuestCategory.READING: return <BookOpen size={20} />;
      default: return <Sword size={20} />;
    }
  };

  const getCategoryColor = () => {
    const text = (quest.title + ' ' + (quest.description || '')).toLowerCase();
    
    if (text.includes('run') || text.includes('walk') || text.includes('step') || text.includes('hike')) return 'bg-orange-100 text-orange-600';
    if (text.includes('water') || text.includes('drink') || text.includes('hydrate')) return 'bg-blue-100 text-blue-600';
    if (text.includes('coffee') || text.includes('tea') || text.includes('breakfast')) return 'bg-amber-100 text-amber-600';
    if (text.includes('music') || text.includes('sing') || text.includes('guitar') || text.includes('piano')) return 'bg-pink-100 text-pink-600';
    if (text.includes('code') || text.includes('program') || text.includes('dev')) return 'bg-slate-100 text-slate-600';
    if (text.includes('heart') || text.includes('love') || text.includes('kindness') || text.includes('volunteer')) return 'bg-rose-100 text-rose-600';
    if (text.includes('eat') || text.includes('food') || text.includes('cook') || text.includes('meal') || text.includes('dinner') || text.includes('lunch')) return 'bg-orange-100 text-orange-600';
    if (text.includes('energy') || text.includes('fast') || text.includes('quick') || text.includes('power')) return 'bg-yellow-100 text-yellow-600';
    if (text.includes('sleep') || text.includes('night') || text.includes('bed') || text.includes('dream')) return 'bg-indigo-100 text-indigo-600';
    if (text.includes('sun') || text.includes('morning') || text.includes('day') || text.includes('outside')) return 'bg-sky-100 text-sky-600';
    if (text.includes('photo') || text.includes('camera') || text.includes('picture')) return 'bg-cyan-100 text-cyan-600';
    if (text.includes('paint') || text.includes('art') || text.includes('draw') || text.includes('creative')) return 'bg-violet-100 text-violet-600';
    if (text.includes('write') || text.includes('journal') || text.includes('pen') || text.includes('blog')) return 'bg-emerald-100 text-emerald-600';
    if (text.includes('shop') || text.includes('buy') || text.includes('grocery')) return 'bg-fuchsia-100 text-fuchsia-600';
    if (text.includes('bike') || text.includes('cycle')) return 'bg-lime-100 text-lime-600';
    if (text.includes('nature') || text.includes('tree') || text.includes('garden') || text.includes('plant')) return 'bg-green-100 text-green-600';
    if (text.includes('time') || text.includes('timer') || text.includes('clock') || text.includes('focus')) return 'bg-zinc-100 text-zinc-600';
    if (text.includes('goal') || text.includes('target') || text.includes('aim')) return 'bg-red-100 text-red-600';

    switch (quest.category) {
      case QuestCategory.EXERCISE: return 'bg-red-100 text-red-600';
      case QuestCategory.MEDITATION: return 'bg-blue-100 text-blue-600';
      case QuestCategory.READING: return 'bg-green-100 text-green-600';
      default: return 'bg-purple-100 text-purple-600';
    }
  };

  return (
    <div 
      className={`group relative flex items-center gap-3 rounded-2xl border p-4 transition-all ${
        isCompleted ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white shadow-sm hover:border-orange-200 hover:shadow-md'
      }`}
    >
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 p-1"
      >
        <GripVertical size={20} />
      </div>

      <button 
        onClick={onToggle}
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500'
        }`}
      >
        {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
      </button>
      
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <span className={`rounded-lg p-1.5 ${getCategoryColor()}`}>
            {getIcon()}
          </span>
          <h3 className={`font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
            {quest.title}
          </h3>
        </div>
        <p className="mt-1 text-sm text-gray-500">{quest.description}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="text-xs font-bold text-orange-600">+{quest.points} XP</span>
        {!quest.isPredefined && onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded-lg p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const ReorderableQuest = ({ quest, userQuests, toggleQuest, deleteQuest }: any) => {
  const dragControls = useDragControls();
  return (
    <Reorder.Item 
      value={quest} 
      dragControls={dragControls} 
      dragListener={false}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <QuestCard 
        quest={quest}
        isCompleted={userQuests.some((uq: any) => uq.questId === quest.id)}
        onToggle={() => toggleQuest(quest)}
        onDelete={() => deleteQuest(quest.id)}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
};

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestForm, setShowQuestForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [completedQuote, setCompletedQuote] = useState<BibleQuote | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [localQuests, setLocalQuests] = useState<Quest[]>([]);

  // --- Auth ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await ensureUserProfile(u);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const logout = () => signOut(auth);

  // --- Profile Logic ---
  const ensureUserProfile = async (u: FirebaseUser) => {
    const userRef = doc(db, 'users', u.uid);
    try {
      const snap = await getDoc(userRef);
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      if (!snap.exists()) {
        const newProfile: UserProfile = {
          uid: u.uid,
          displayName: u.displayName,
          photoURL: u.photoURL,
          streak: 0,
          lastActiveDate: null,
          exp: 0,
          level: 1,
          role: 'user',
          displayOrder: PREDEFINED_QUESTS.map(q => q.id)
        };
        await setDoc(userRef, newProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${u.uid}`));
        setProfile(newProfile);
      } else {
        const data = snap.data() as UserProfile;
        let updatedProfile = { ...data };
        
        if (!data.displayOrder) {
          updatedProfile.displayOrder = PREDEFINED_QUESTS.map(q => q.id);
          await updateDoc(userRef, { displayOrder: updatedProfile.displayOrder })
            .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${u.uid}`));
        }
        
        // Streak Reset Logic
        if (data.lastActiveDate) {
          const lastDate = parseISO(data.lastActiveDate);
          if (!isToday(lastDate) && !isYesterday(lastDate)) {
            updatedProfile.streak = 0;
            await updateDoc(userRef, { streak: 0 }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${u.uid}`));
          }
        }
        
        setProfile(updatedProfile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
    }
  };

  // --- Data Listeners ---
  useEffect(() => {
    if (!user) return;

    const qQuests = query(collection(db, 'quests'), where('userId', 'in', [user.uid, null]));
    const unsubQuests = onSnapshot(qQuests, (snap) => {
      const customQuests = snap.docs.map(d => ({ id: d.id, ...d.data() } as Quest));
      // Merge predefined with custom
      setQuests([...PREDEFINED_QUESTS, ...customQuests.filter(q => !q.isPredefined)]);
    });

    const todayStr = format(selectedDate, 'yyyy-MM-dd');
    const qUserQuests = query(collection(db, 'userQuests'), where('userId', '==', user.uid), where('date', '==', todayStr));
    const unsubUserQuests = onSnapshot(qUserQuests, (snap) => {
      setUserQuests(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserQuest)));
      setLoading(false);
    });

    const qSchedule = query(collection(db, 'schedule'), where('userId', '==', user.uid));
    const unsubSchedule = onSnapshot(qSchedule, (snap) => {
      setSchedule(snap.docs.map(d => ({ id: d.id, ...d.data() } as Schedule)));
    });

    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    });

    return () => {
      unsubQuests();
      unsubUserQuests();
      unsubSchedule();
      unsubProfile();
    };
  }, [user, selectedDate]);

  // --- Actions ---
  const toggleQuest = async (quest: Quest) => {
    if (!user || !profile) return;
    
    const todayStr = format(selectedDate, 'yyyy-MM-dd');
    const existing = userQuests.find(uq => uq.questId === quest.id);

    try {
      if (existing) {
        // Uncomplete
        await deleteDoc(doc(db, 'userQuests', existing.id)).catch(e => handleFirestoreError(e, OperationType.DELETE, `userQuests/${existing.id}`));
        
        // Update XP/Level
        const newExp = Math.max(0, profile.exp - quest.points);
        const newLevel = Math.floor(newExp / 1000) + 1;
        await updateDoc(doc(db, 'users', user.uid), { exp: newExp, level: newLevel }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
      } else {
        // Complete
        await addDoc(collection(db, 'userQuests'), {
          userId: user.uid,
          questId: quest.id,
          date: todayStr,
          completed: true,
          completedAt: serverTimestamp()
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, 'userQuests'));

        // Update XP/Level/Streak
        const newExp = profile.exp + quest.points;
        const newLevel = Math.floor(newExp / 1000) + 1;
        const updates: any = { exp: newExp, level: newLevel };

        // Streak logic: if first quest of a new day
        const lastActiveDate = profile.lastActiveDate;
        if (!lastActiveDate || isYesterday(parseISO(lastActiveDate))) {
          updates.streak = profile.streak + 1;
          updates.lastActiveDate = todayStr;
        } else if (!isToday(parseISO(lastActiveDate))) {
          // This case handles if they missed a day but streak was already 0
          updates.streak = 1;
          updates.lastActiveDate = todayStr;
        }

        await updateDoc(doc(db, 'users', user.uid), updates).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
        
        // Show random quote
        const randomQuote = BIBLE_QUOTES[Math.floor(Math.random() * BIBLE_QUOTES.length)];
        setCompletedQuote(randomQuote);
      }
    } catch (error) {
      // Error already handled by catch blocks above
    }
  };

  const addCustomQuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const points = parseInt(formData.get('points') as string);
    const category = formData.get('category') as QuestCategory;

    try {
      const docRef = await addDoc(collection(db, 'quests'), {
        userId: user.uid,
        title,
        points,
        category,
        isPredefined: false
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, 'quests'));

      if (docRef && profile) {
        const newOrder = [...(profile.displayOrder || []), docRef.id];
        await updateDoc(doc(db, 'users', user.uid), { displayOrder: newOrder })
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
      }

      setShowQuestForm(false);
    } catch (error) {
      // Error already handled
    }
  };

  const deleteQuest = async (questId: string) => {
    try {
      await deleteDoc(doc(db, 'quests', questId)).catch(e => handleFirestoreError(e, OperationType.DELETE, `quests/${questId}`));
      
      if (profile?.displayOrder) {
        const newOrder = profile.displayOrder.filter(id => id !== questId);
        await updateDoc(doc(db, 'users', user!.uid), { displayOrder: newOrder })
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user!.uid}`));
      }
    } catch (error) {
      // Error already handled
    }
  };

  const scheduleQuest = async (questId: string, date: Date) => {
    if (!user) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    try {
      await addDoc(collection(db, 'schedule'), {
        userId: user.uid,
        questId,
        date: dateStr
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, 'schedule'));

      if (profile) {
        const newOrder = [...(profile.displayOrder || [])];
        if (!newOrder.includes(questId)) {
          newOrder.push(questId);
          await updateDoc(doc(db, 'users', user.uid), { displayOrder: newOrder })
            .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
        }
      }
    } catch (error) {
      // Error already handled
    }
  };

  const unscheduleQuest = async (scheduleId: string) => {
    try {
      await deleteDoc(doc(db, 'schedule', scheduleId)).catch(e => handleFirestoreError(e, OperationType.DELETE, `schedule/${scheduleId}`));
    } catch (error) {
      // Error already handled
    }
  };

  const reorderQuests = async (newQuests: Quest[]) => {
    if (!user || !profile) return;
    setLocalQuests(newQuests);
    const newOrder = newQuests.map(q => q.id);
    
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayOrder: newOrder })
        .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
    } catch (error) {
      // Snapshot will handle revert
    }
  };

  // --- Derived State ---
  const dailyQuests = useMemo(() => {
    const todayStr = format(selectedDate, 'yyyy-MM-dd');
    const scheduledIds = schedule.filter(s => s.date === todayStr).map(s => s.questId);
    // Show predefined + custom + scheduled for today
    const filtered = quests.filter(q => q.isPredefined || q.userId === user?.uid || scheduledIds.includes(q.id));
    
    if (profile?.displayOrder) {
      return [...filtered].sort((a, b) => {
        const indexA = profile.displayOrder!.indexOf(a.id);
        const indexB = profile.displayOrder!.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
    return filtered;
  }, [quests, schedule, selectedDate, user, profile?.displayOrder]);

  useEffect(() => {
    setLocalQuests(dailyQuests);
  }, [dailyQuests]);

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-orange-50 p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-xl shadow-orange-200"
        >
          <Sword size={48} />
        </motion.div>
        <h1 className="mb-2 text-4xl font-black tracking-tight text-gray-900">GuidedGrowth</h1>
        <p className="mb-12 max-w-xs text-lg text-gray-600">Embark on a journey of personal growth and spiritual wisdom.</p>
        <button 
          onClick={login}
          className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-bold text-gray-800 shadow-lg transition-all hover:bg-gray-50 active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Sword size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">GuidedGrowth</span>
          </div>
          <button onClick={logout} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {/* Stats Card */}
        <section className="mb-6 overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-2xl bg-gray-100">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-600">
                    <Trophy size={24} />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{user.displayName}</h2>
                <div className="flex items-center gap-1 text-sm font-bold text-orange-600">
                  <Flame size={16} />
                  <span>{profile?.streak || 0} Day Streak</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black uppercase tracking-widest text-gray-400">Level</div>
              <div className="text-3xl font-black text-gray-900">{profile?.level || 1}</div>
            </div>
          </div>
          
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((profile?.exp || 0) % 1000) / 10}%` }}
              className="h-full bg-orange-500"
            />
          </div>
          <div className="mt-2 flex justify-between text-xs font-bold text-gray-400">
            <span>{(profile?.exp || 0) % 1000} XP</span>
            <span>1000 XP to Level { (profile?.level || 1) + 1 }</span>
          </div>
        </section>

        {/* Date Selector */}
        <section className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="rounded-xl p-2 text-gray-400 hover:bg-white hover:text-gray-600"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-gray-400">{isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}</span>
              <span className="text-lg font-black text-gray-900">{format(selectedDate, 'MMM d')}</span>
            </div>
            <button 
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="rounded-xl p-2 text-gray-400 hover:bg-white hover:text-gray-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className={`rounded-xl p-3 transition-all ${showCalendar ? 'bg-orange-500 text-white' : 'bg-white text-gray-400 shadow-sm'}`}
          >
            <CalendarIcon size={20} />
          </button>
        </section>

        {/* Calendar View */}
        <AnimatePresence>
          {showCalendar && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden rounded-3xl bg-white p-4 shadow-sm border border-gray-100"
            >
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={`${d}-${i}`} className="text-center text-[10px] font-black text-gray-300">{d}</div>
                ))}
                {eachDayOfInterval({
                  start: startOfMonth(selectedDate),
                  end: endOfMonth(selectedDate)
                }).map(date => {
                  const isSelected = isSameDay(date, selectedDate);
                  const hasSchedule = schedule.some(s => s.date === format(date, 'yyyy-MM-dd'));
                  return (
                    <button 
                      key={date.toString()}
                      onClick={() => setSelectedDate(date)}
                      className={`relative flex h-10 w-full items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        isSelected ? 'bg-orange-500 text-white' : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {format(date, 'd')}
                      {hasSchedule && !isSelected && (
                        <div className="absolute bottom-1.5 h-1 w-1 rounded-full bg-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Quests List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Active Quests</h2>
            <button 
              onClick={() => setShowQuestForm(true)}
              className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700"
            >
              <Plus size={16} />
              Add Custom
            </button>
          </div>
          
          {loading ? (
            <div className="flex h-32 items-center justify-center text-gray-400">Loading your adventure...</div>
          ) : dailyQuests.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
              <p>No quests for today.</p>
              <button 
                onClick={() => setShowQuestForm(true)}
                className="mt-2 text-sm font-bold text-orange-500"
              >
                Create your first quest
              </button>
            </div>
          ) : (
            <Reorder.Group axis="y" values={localQuests} onReorder={reorderQuests} className="space-y-3">
              {localQuests.map(quest => (
                <ReorderableQuest 
                  key={quest.id} 
                  quest={quest} 
                  userQuests={userQuests} 
                  toggleQuest={toggleQuest} 
                  deleteQuest={deleteQuest} 
                />
              ))}
            </Reorder.Group>
          )}
        </section>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showQuestForm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          >
            <motion.div 
              initial={{ y: 100 }} 
              animate={{ y: 0 }} 
              exit={{ y: 100 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900">New Secret Quest</h3>
                <button onClick={() => setShowQuestForm(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={addCustomQuest} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-widest text-gray-400">Quest Title</label>
                  <input 
                    name="title" 
                    required 
                    placeholder="e.g., Read 5 pages of a book"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 font-medium focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-black uppercase tracking-widest text-gray-400">Category</label>
                    <select 
                      name="category" 
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 font-medium focus:border-orange-500 focus:outline-none"
                    >
                      <option value={QuestCategory.CUSTOM}>Custom</option>
                      <option value={QuestCategory.EXERCISE}>Exercise</option>
                      <option value={QuestCategory.MEDITATION}>Meditation</option>
                      <option value={QuestCategory.READING}>Reading</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-black uppercase tracking-widest text-gray-400">XP Reward</label>
                    <input 
                      name="points" 
                      type="number" 
                      defaultValue="50"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 font-medium focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="mt-4 w-full rounded-2xl bg-orange-500 py-4 font-bold text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-600 active:scale-95"
                >
                  Create Quest
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {completedQuote && (
          <BibleQuoteModal 
            quote={completedQuote} 
            onClose={() => setCompletedQuote(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
