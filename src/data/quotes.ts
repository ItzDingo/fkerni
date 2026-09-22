import { FunnyQuote, QuoteCategory } from '../types';

export const FUNNY_QUOTES: FunnyQuote[] = [
  // 1. VOLUNTARY OPENING (Sister opened app by herself)
  {
    id: 'vol-1',
    category: 'voluntary',
    emoji: '😂',
    textDerja: 'Aya el 7mdelah 3lik ki tfakkarti wa7dek ya lella!',
    textAr: 'أيا الحمد لله عليك كي تفكّرتي وحدك يا لالة!',
    textFr: 'Eh bien, Dieu merci tu t’en es rappelé toute seule ma sœur !',
    textEn: 'Well, thank goodness you remembered all on your own!'
  },
  {
    id: 'vol-2',
    category: 'voluntary',
    emoji: '📚',
    textDerja: 'Fama 3beeed 3ndhom bac... wenti mazedti met7arraktech ya lella?',
    textAr: 'فما عباد عندهم باك... وأنتِ مازلت ما تحرّكتيش يا لالة؟',
    textFr: 'Il y a des gens qui préparent leurs examens... et toi tu n’as pas encore bougé ?',
    textEn: 'Some people are studying hard... and you haven’t started moving yet?'
  },
  {
    id: 'vol-3',
    category: 'voluntary',
    emoji: '🔥',
    textDerja: 'Ya narii 3lik ya lella ya narii... wa9tech bech tebda ta9ray?',
    textAr: 'يا ناري عليك يا لالة يا ناري... وقتاش باش تبداي تقراي؟',
    textFr: 'Ah là là ma sœur... quand est-ce que tu vas te mettre à réviser ?',
    textEn: 'Oh sister... when are you actually going to sit down and study?'
  },
  {
    id: 'vol-4',
    category: 'voluntary',
    emoji: '👀',
    textDerja: 'Haw jet ta9ra haw jet! Nchlh barka tekteb kelmtin fel kowrasa.',
    textAr: 'هاو جات تقرى هاو جات! إنشاء الله برك تكتبي كلمتين في الكراس.',
    textFr: 'La voilà qui vient étudier ! Espérons que tu écrives au moins deux lignes dans ton cahier.',
    textEn: 'Look who arrived to study! Hopefully you write at least a couple of notes.'
  },
  {
    id: 'vol-5',
    category: 'voluntary',
    emoji: '🤔',
    textDerja: 'Chnowa 7alliti el app bel ghalat walla bech ta9ray bel7a9?',
    textAr: 'شنوة حلّيتي التطبيق بالغلط وإلا باش تقراي بالحق؟',
    textFr: 'Tu as ouvert l’application par erreur ou tu comptes vraiment réviser ?',
    textEn: 'Did you open the app by accident or are you really studying this time?'
  },
  {
    id: 'vol-6',
    category: 'voluntary',
    emoji: '👩‍⚕️',
    textDerja: 'Sba7 el khir ya doctoura el mousta9bal... ken 9riti 3ad!',
    textAr: 'صباح الخير يا دكتورة المستقبل... كان قريتي بطبيعة الحال!',
    textFr: 'Bonjour future docteure... à condition que tu bosses sérieusement !',
    textEn: 'Good morning future doctor... assuming you actually study today!'
  },
  {
    id: 'vol-7',
    category: 'voluntary',
    emoji: '💅',
    textDerja: 'Saybi chwaya el mekyaj w choufina el cahier chfih!',
    textAr: 'سيبي شوية المرايات وشوفيلنا الكراس شنوة فيه!',
    textFr: 'Lâche un peu les miroirs et voyons ce qu’il y a dans ce cahier !',
    textEn: 'Take a break from the mirror and let’s see what’s inside your notebook!'
  },

  // 2. AFTER NOTIFICATION (Session starting in 30m or 15m)
  {
    id: 'notif-1',
    category: 'after_notif',
    emoji: '🚨',
    textDerja: 'Lyouma mafamech hroub, notification jetek w choufi rou7ek!',
    textAr: 'اليوم ما فمّاش هروب، الإشعار جاك وشوفي روحك!',
    textFr: 'Aujourd’hui pas d’excuse, la notification est tombée, au boulot !',
    textEn: 'No escaping today! The notification arrived, time to get to work!'
  },
  {
    id: 'notif-2',
    category: 'after_notif',
    emoji: '⏰',
    textDerja: '30 d9i9a w tabda l’etude... wajdi el cahier w saybi el reels!',
    textAr: '30 دقيقة وتبدا القراية... وجّدي الكراس وسيبي الريلز!',
    textFr: 'Dans 30 minutes commence la séance... prépare tes affaires et lâche Instagram !',
    textEn: '30 minutes until study starts... grab your notebook and put away the reels!'
  },
  {
    id: 'notif-3',
    category: 'after_notif',
    emoji: '🔔',
    textDerja: 'L’alarme dharbet ya lella! 15 d9i9a w tabda l’etude!',
    textAr: 'المنبه ضرب يا لالة! 15 دقيقة وتبدا القراية بالرسمي!',
    textFr: 'L’alarme a sonné ma sœur ! Plus que 15 minutes avant le début de l’étude !',
    textEn: 'The alarm rang! 15 minutes left until study time begins!'
  },
  {
    id: 'notif-4',
    category: 'after_notif',
    emoji: '📱',
    textDerja: 'Saybi el TikTok w 9oumi a9ray 3la rou7ek ya bent omi!',
    textAr: 'سيبي التيكتوك وقومي اقراي على روحك يا بنت أمي!',
    textFr: 'Lâche TikTok et va réviser un peu, c’est pour ton avenir !',
    textEn: 'Put TikTok down and go study, it is for your own future!'
  },
  {
    id: 'notif-5',
    category: 'after_notif',
    emoji: '🎯',
    textDerja: 'Fkerni fakkarek fel wa9t, taw dora fik wenti w damirek ya lella.',
    textAr: 'فكّرني فكّرك في الوقت، توة الدور عليك وأنتِ وضميرك يا لالة.',
    textFr: 'Fkerni t’a rappelé l’heure, maintenant c’est toi et ta conscience.',
    textEn: 'Fkerni did its job, now it is up to you and your dedication.'
  },

  // 3. LONG ABSENCE (User didn't open the app for 2+ days)
  {
    id: 'abs-1',
    category: 'long_absence',
    emoji: '👻',
    textDerja: 'Win konti ghatsa ya lella? Ghayba twila w el wa9t yjari!',
    textAr: 'وين كنتي غاطسة يا لالة؟ غيبة طويلة والوقت يجري!',
    textFr: 'Où étais-tu passée ma sœur ? Longue absence alors que le temps file !',
    textEn: 'Where have you been hiding? Long absence while time is ticking!'
  },
  {
    id: 'abs-2',
    category: 'long_absence',
    emoji: '📦',
    textDerja: 'Nsiti el 9raya walla chnowa? Edekher 3lik el khir!',
    textAr: 'نسيتي القراية ولا شنوة؟ وينك هالمدة هذي الكل!',
    textFr: 'Tu as oublié les révisions ou quoi ? Quelle disparition mystérieuse !',
    textEn: 'Did you forget about studying altogether? Quite the vanishing act!'
  },
  {
    id: 'abs-3',
    category: 'long_absence',
    emoji: '🛋️',
    textDerja: 'Yodhherli l’etude nsetek wenti nsitiha... Aya 9oumi min enoum!',
    textAr: 'يظهرلي القراية نساتك وأنتِ نسيتيها... قومي من النوم!',
    textFr: 'On dirait que les cours t’ont oubliée et que tu les as oubliés... Debout !',
    textEn: 'Looks like studying forgot you and you forgot studying... Time to wake up!'
  }
];

export function getGreetingQuote(
  category: QuoteCategory,
  preferredLanguage: 'fr' | 'en' | 'ar',
  previousId?: string
): FunnyQuote {
  const filtered = FUNNY_QUOTES.filter((q) => q.category === category);
  const pool = filtered.length > 0 ? filtered : FUNNY_QUOTES;
  const eligible = pool.filter((q) => q.id !== previousId);
  const choice = eligible.length > 0
    ? eligible[Math.floor(Math.random() * eligible.length)]
    : pool[Math.floor(Math.random() * pool.length)];
  return choice;
}

export function getQuoteText(quote: FunnyQuote, lang: 'fr' | 'en' | 'ar', useDerja = true): string {
  if (useDerja && lang !== 'fr' && lang !== 'en') {
    return quote.textDerja;
  }
  if (lang === 'ar') return quote.textAr;
  if (lang === 'en') return quote.textEn;
  return quote.textFr;
}
