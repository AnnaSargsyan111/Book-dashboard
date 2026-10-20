// Applies the hand review of the Open Library import to src/server/mystery/catalog-imported.ts.
//
//   node scripts/import-catalog.mjs          (only if you want to re-fetch from Open Library — it overwrites the review)
//   node scripts/apply-catalog-review.mjs    (applies the review below — run it right after a fresh import, once;
//                                             on an already-reviewed file the position guard will stop it)
//
// The import drafts genre, mood, pace and age by rule from Open Library's subject tags, and many of those drafts were
// wrong (e.g. Stephen King's "Misery" as science fiction, "Do Androids Dream of Electric Sheep?" as fantasy). Every
// book below was checked against what the book actually is. Rows are keyed by position in the import and carry the
// start of the title as a guard: if a re-import changes the order, this script stops instead of mislabelling books.
//
// Row:  position ; title starts with ; genre ; subgenre ; moods (strongest first) ; pace ; age
//   genre  fan fantasy · rom romance · mys mysteryThriller · sci scienceFiction · lit literaryFiction · his historicalFiction
//          hor horror · adv adventure · bio biography · self selfDevelopment · ya youngAdult · non nonFiction
//   moods  M magical · C cozy · E escapist · T emotional · I intense · L lightFun · P thoughtProvoking · Y mysterious
//          (weights by position: 0.9, 0.75, 0.6, 0.45, 0.3)
//   pace   f fast · m medium · s slow        age   a all · t teen · d adult
import { readFileSync, writeFileSync } from "node:fs";

const FILE = new URL("../src/server/mystery/catalog-imported.ts", import.meta.url);

const GENRE = { fan: "fantasy", rom: "romance", mys: "mysteryThriller", sci: "scienceFiction", lit: "literaryFiction", his: "historicalFiction", hor: "horror", adv: "adventure", bio: "biography", self: "selfDevelopment", ya: "youngAdult", non: "nonFiction" };
const MOOD = { M: "magical", C: "cozy", E: "escapist", T: "emotional", I: "intense", L: "lightFun", P: "thoughtProvoking", Y: "mysterious" };
const PACE = { f: "fast", m: "medium", s: "slow" };
const AGE = { a: "all", t: "teen", d: "adult" };
const WEIGHTS = [0.9, 0.75, 0.6, 0.45, 0.3];

// Not offered as a surprise book: explicit or graphic content, hate literature, or a foreign edition with no safe fix.
const REMOVE = new Set([10, 15, 27, 41, 44, 104, 161, 206, 224, 259]);
// 15 duplicates the hand-curated "Mistborn: The Final Empire"; 44 is a Portuguese edition of an unidentified Dark Tower volume.

// Titles/authors tidied to the English edition's name (the original-language entries also get an English cover below).
const RENAME = {
  43: "One Hundred Years of Solitude",
  45: "The Selection",
  65: "The Name of the Rose",
  66: "The Girl with the Dragon Tattoo",
  71: "Thirteen Reasons Why",
  73: "Perfume: The Story of a Murderer",
  112: "The Shadow of the Wind",
  120: "Blindness",
  186: "Night",
  207: "Blood of Elves",
  218: "Tender Is the Flesh",
  219: "Five Nights at Freddy's: The Silver Eyes",
  235: "Love in the Time of Cholera",
  240: "Poirot Investigates",
  243: "The Secret Life of Bees",
  256: "Fear No Evil",
  260: "The Book of Five Rings",
  265: "The Divine Comedy",
  269: "If This Is a Man",
  283: "The Great Hunt",
  168: "Eat That Frog!",
  182: "A Short History of Nearly Everything",
};
// Covers checked by eye and rejected (a study-guide jacket, an Italian-text volume, a nude painting): use the placeholder card.
const NO_COVER = new Set([73, 186, 265]);
// Entries whose Open Library cover is a foreign edition: fetch the English edition's cover instead.
const ENGLISH_COVER = { 43: ["One Hundred Years of Solitude", "Gabriel García Márquez"], 65: ["The Name of the Rose", "Umberto Eco"], 66: ["The Girl with the Dragon Tattoo", "Stieg Larsson"], 73: ["Perfume", "Patrick Süskind"], 112: ["The Shadow of the Wind", "Carlos Ruiz Zafón"], 120: ["Blindness", "José Saramago"], 186: ["Night", "Elie Wiesel"], 207: ["Blood of Elves", "Andrzej Sapkowski"], 218: ["Tender Is the Flesh", "Agustina Bazterrica"], 235: ["Love in the Time of Cholera", "Gabriel García Márquez"], 260: ["The Book of Five Rings", "Miyamoto Musashi"], 265: ["The Divine Comedy", "Dante Alighieri"], 269: ["If This Is a Man", "Primo Levi"] };

const ROWS = `
0;A Game of;fan;Epic Fantasy;IEYT;s;d
1;The Fellowship;fan;Epic Fantasy;MEPT;m;a
2;Catching Fire;ya;Dystopian;IETP;f;t
3;A Court of Mist;fan;Romantasy;TEMI;m;d
4;Harry Potter;fan;Fantasy;MECT;m;a
5;The Sea of;fan;Mythological Adventure;MEL;m;a
6;The Titan;fan;Mythological Adventure;MEI;m;a
7;Foundation;sci;Classic Science Fiction;PEY;m;a
8;Slaughterhouse;lit;Satirical Anti-War;PTLI;m;d
9;Matilda;fan;Children's Fantasy;LCEM;m;a
11;A Court of Thorns;fan;Romantasy;TEMI;m;d
12;A Clash;fan;Epic Fantasy;IEYP;s;d
13;A Wrinkle;fan;Children's Science Fantasy;MEPC;m;a
14;The Colour;fan;Comic Fantasy;LEMP;m;a
16;Do Androids;sci;Dystopian;PYIE;m;d
17;The Cruel;fan;Faerie Fantasy;ITEM;m;t
18;The Lion;fan;Children's Fantasy;MECT;m;a
19;Snow Crash;sci;Cyberpunk;IPEL;f;d
20;The Return;fan;Epic Fantasy;MEIT;m;a
21;Breaking Dawn;rom;Paranormal Romance;TEMI;s;t
22;Mort;fan;Comic Fantasy;LMPE;m;a
23;The Well;fan;Epic Fantasy;IMEP;s;a
24;Hyperion;sci;Space Opera;PTEY;m;d
25;It Ends;rom;Contemporary Romance;TIP;m;d
26;It Starts;rom;Contemporary Romance;TIP;m;d
28;Twisted Love;rom;Dark Romance;TIE;m;d
29;Shatter Me;ya;Dystopian Romance;TIEM;f;t
30;The Love Hyp;rom;Romantic Comedy;LTCE;m;d
31;The Perks;ya;Coming of Age;TPL;m;t
32;House of Hades;fan;Mythological Adventure;MEIT;m;a
33;Eclipse;rom;Paranormal Romance;TEIY;m;t
34;Milk and;lit;Poetry;TPE;m;d
35;Red, White;rom;Romantic Comedy;LTCE;m;d
36;Icebreaker;rom;Sports Romance;TLC;m;d
37;Twisted Lies;rom;Dark Romance;TIY;m;d
38;Insurgent;ya;Dystopian;IETP;f;t
39;Fourth Wing;fan;Romantasy;IEMT;f;d
40;Throne of;fan;Epic Fantasy;IMET;m;t
42;City of Bones;fan;Urban Fantasy;MEIT;m;t
43;Cien;lit;Magical Realism;MTPY;s;d
45;The Selection;ya;Dystopian Romance;TEL;m;t
46;If He Had;ya;Young Adult Romance;TEP;m;t
47;In Cold;non;True Crime;IPYT;m;d
48;One Of Us;mys;Young Adult Mystery;YIT;f;t
49;The Princess;fan;Fairy-tale Adventure;LEMT;m;a
50;Lord of the;lit;Allegorical Classic;PIT;m;t
51;The Shining;hor;Supernatural Horror;IYTP;m;d
52;Ready Player;sci;Gamer Science Fiction;ELIP;f;t
53;Angels;mys;Conspiracy Thriller;YIEP;f;a
54;The Da Vinci;mys;Conspiracy Thriller;YIEP;f;a
55;Carrie;hor;Supernatural Horror;ITP;f;d
56;And Then;mys;Golden Age Mystery;YIP;f;a
57;Jurassic;sci;Techno-Thriller;IEPY;f;a
58;A Good Girl;mys;Young Adult Mystery;YIE;f;t
59;Verity;mys;Psychological Thriller;IYTP;f;d
60;A Study;mys;Classic Detective;YPI;m;a
61;The Mysterious;mys;Cozy Golden Age Mystery;YCP;m;a
62;Twisted Games;rom;Dark Romance;TIE;m;d
63;Six of;fan;Heist Fantasy;IEYM;f;t
64;Artemis;sci;Heist Science Fiction;ELIP;f;t
65;Il nome;mys;Historical Mystery;YPIE;s;d
66;Män;mys;Nordic Noir;IYP;f;d
67;The Eyes;mys;Supernatural Thriller;IYE;f;d
68;Where the Craw;lit;Southern Gothic;TEPY;m;d
69;Treasure;adv;Treasure-Hunt Adventure;EIY;f;a
70;Annihilation;sci;Weird Fiction;YIPE;m;d
71;Thirteen;ya;Contemporary Drama;TIY;m;t
72;The Secret History;lit;Dark Academia;YPTI;m;d
73;Das Parfum;lit;Historical Thriller;YPIE;m;d
74;Cyclops;adv;Adventure Thriller;EIY;f;a
75;Animal Farm;lit;Political Satire;PLT;m;a
76;Brave New;sci;Dystopian;PIE;m;d
77;Fahrenheit;sci;Dystopian;PIE;m;a
78;Ender;sci;Military Science Fiction;IPET;f;a
79;Mockingjay;ya;Dystopian;ITEP;f;t
80;Misery;hor;Psychological Horror;IYT;f;d
81;Dune Messiah;sci;Space Opera;PYIE;m;a
82;The Road;sci;Post-Apocalyptic;TIP;m;d
83;The Maze;ya;Dystopian;IYE;f;t
84;Foundation and;sci;Classic Science Fiction;PEI;m;a
85;A Feast;fan;Epic Fantasy;IEYP;s;d
86;Leviathan;sci;Space Opera;IEYP;f;d
87;Second Found;sci;Classic Science Fiction;PYE;m;a
88;Wolves;fan;Dark Fantasy Western;IYME;s;d
89;Life, the;sci;Comic Science Fiction;LEP;m;a
90;Fight Club;lit;Transgressive Fiction;IPL;m;d
91;World War Z;hor;Zombie Horror;IPTY;m;d
92;The Amber;fan;Epic Fantasy;MEPT;s;t
93;A Wizard;fan;Coming-of-Age Fantasy;MEP;m;t
94;Rendezvous;sci;Hard Science Fiction;PYE;m;a
95;The Martian Chron;sci;Classic Science Fiction;PTEY;m;a
96;Neuromancer;sci;Cyberpunk;IPEY;f;d
97;Deception;mys;Techno-Thriller;YIE;f;a
98;The Man in;sci;Alternate History;PYI;m;d
99;Cat's;sci;Satirical Science Fiction;PLE;m;d
100;To Kill;lit;Southern Classic;TPE;m;a
101;A Thousand;lit;Family Saga;TPI;m;d
102;The Help;his;1960s Civil Rights;TPLC;m;a
103;East of;lit;Family Saga;TPI;s;d
105;Death of;lit;Classic Play;TPI;m;a
106;The God;lit;Contemporary Literary Fiction;TPY;m;d
107;The Magicians;fan;Urban Fantasy;MPEI;m;d
108;A Gentleman;his;Historical Fiction;TCLP;s;a
109;Hearts in;lit;Literary Fiction;TPYI;m;d
110;Dreamcatcher;hor;Supernatural Horror;IYEL;f;d
111;Madame;lit;Classic Novel;TPE;m;d
112;La sombra;lit;Gothic Mystery;YTEP;m;d
113;Oryx;sci;Dystopian;PYI;m;d
114;Dirk Gently;sci;Comic Science Fiction;LYEP;m;a
115;The Bluest;lit;Contemporary Classic;TPI;m;d
116;Americanah;lit;Contemporary Literary Fiction;TPEL;m;d
117;Soul Music;fan;Comic Fantasy;LMEP;m;a
118;Sula;lit;Contemporary Classic;TPY;m;d
119;The Awakening;lit;Classic Novel;TPE;m;d
120;Ensaio;lit;Allegorical Fiction;PIT;m;d
121;Midnight;lit;Magical Realism;MTPE;s;d
122;Half of;his;War Drama;TPI;m;d
123;Snow Falling;his;Courtroom Drama;TYPC;m;d
124;The Salmon;non;Essays;LP;m;a
125;The Catcher;lit;Coming of Age;TPL;m;t
126;The Battle;fan;Mythological Adventure;MEL;m;a
127;The Last Olymp;fan;Mythological Adventure;MEIT;m;a
128;Wonder;ya;Contemporary Middle Grade;TCP;m;a
129;Holes;ya;Adventure Mystery;EYL;f;a
130;Looking for;ya;Contemporary Drama;TPY;m;t
131;The Hate;ya;Contemporary Drama;TIP;m;t
132;Brisingr;fan;Epic Fantasy;MEIT;s;a
133;Eldest;fan;Epic Fantasy;MEIT;s;a
134;The Boy;his;Holocaust Fiction;TPI;m;t
135;The Hired;his;Young Adult Historical;TLC;m;t
136;We Were;ya;Mystery Drama;TYIP;f;t
137;Where the Red;ya;Classic Boy-and-Dog Story;TCE;m;a
138;Paper Towns;ya;Contemporary Mystery;TYL;m;t
139;Go Ask;ya;Cautionary Diary;TIP;f;t
140;All the Bright;ya;Contemporary Drama;TPIC;m;t
141;Good Girl, Bad;mys;Young Adult Mystery;YIPT;f;t
142;The Inherit;mys;Young Adult Puzzle Mystery;YELI;f;t
143;Better Than;ya;Young Adult Romance;LCTE;m;t
144;Cinder;ya;Fairy-tale Science Fiction;EMTI;m;t
145;Heir of Fire;fan;Epic Fantasy;IMTE;m;t
146;The Tombs;fan;Coming-of-Age Fantasy;MYPE;s;t
147;Shadow and;fan;Young Adult Fantasy;MEIT;m;t
148;Alanna;fan;Young Adult Fantasy;MEI;m;t
149;The Ballad;ya;Dystopian;IPTE;m;t
150;The 48;self;Strategy;PI;m;d
151;Control Your;self;Mindset;PT;m;a
152;The Psychology;self;Money;PL;m;a
153;Think and;self;Success;PT;m;a
154;How to Win;self;Relationships;PL;m;a
155;The Power of Your;self;Mindset;PT;m;a
156;Meditations;self;Stoic Philosophy;PT;m;a
157;The Richest;self;Money Parable;PL;m;a
158;12 Rules;self;Life Philosophy;PTI;m;a
159;The Power of Now;self;Spirituality;PT;m;a
160;A Gentle;self;Healing;TP;m;a
162;The Four;self;Spiritual Wisdom;PT;m;a
163;The Power of Pos;self;Mindset;PT;m;a
164;Blink;self;Psychology;PL;m;a
165;The Magic;self;Success;PT;m;a
166;Emotional;self;Psychology;PT;m;a
167;Mindset;self;Psychology;PT;m;a
168;Eat That;self;Productivity;PL;m;a
169;Influence;self;Psychology;PL;m;a
170;The Secret;self;Mindset;PT;m;a
171;101 Essays;self;Essays;PT;m;a
172;How to Talk;self;Communication;PL;m;a
173;The Monk;self;Inspirational Parable;PTE;m;a
174;The Mountain;self;Healing;TP;m;a
175;A Brief;non;Popular Science;PEY;m;a
176;Freakonomics;non;Popular Economics;PL;m;a
177;Steve Jobs;bio;Biography;PEI;s;a
178;Zen and;non;Philosophy;PET;m;a
179;The Power of Habit;self;Psychology;PL;m;a
180;The Intelligent;non;Investing;P;m;a
181;Tuesdays;bio;Memoir;TPC;m;a
182;A short;non;Popular Science;PLE;m;a
183;I'm Glad;bio;Memoir;TLI;m;d
184;Into the Wild;bio;Adventure Biography;ETP;m;a
185;The Tipping;non;Popular Psychology;PL;m;a
186;La Nuit;bio;Holocaust Memoir;TIP;m;a
187;The Art of Sed;non;Psychology;PY;m;d
188;Danse;non;Horror Criticism;PYI;m;d
189;The Glass;bio;Memoir;TPEI;m;d
190;The 4-Hour;self;Lifestyle Design;PL;m;a
191;A Walk;non;Travel Humor;LEP;m;a
192;The Man Who;non;Neuroscience;PTY;m;a
193;The Devil;non;True Crime History;YPI;m;d
194;Kitchen;bio;Memoir;LIE;m;d
195;Mere;non;Religion;PT;m;a
196;Permanent;bio;Memoir;PIT;m;a
197;I Know Why;bio;Memoir;TPI;m;t
198;Island of;adv;Survival Adventure;EITP;m;a
199;Men are;self;Relationships;PL;m;a
200;Pet Sem;hor;Supernatural Horror;ITYP;f;d
201;The Green;lit;Supernatural Drama;TYPI;m;d
202;The Ocean;fan;Dark Fantasy;MTYE;m;d
203;Neverwhere;fan;Urban Fantasy;MEYL;m;d
204;Interview;hor;Gothic Horror;TYIP;m;d
205;Flowers;hor;Gothic Horror;TIY;m;d
207;Krew;fan;Epic Fantasy;MEIY;m;d
208;Pyramids;fan;Comic Fantasy;LMEP;m;a
209;We Have;hor;Gothic Horror;YTP;m;d
210;House of Leaves;hor;Experimental Horror;IYPT;s;d
211;Gideon;fan;Gothic Science Fantasy;IYLM;f;d
212;The Silence;mys;Psychological Thriller;IYPT;f;d
213;The Stepford;hor;Satirical Horror;YIPL;f;d
214;Welcome to;hor;Children's Horror;ILY;f;t
215;Interesting;fan;Comic Fantasy;LMEP;m;a
216;Congo;adv;Techno-Thriller Adventure;EIYP;f;a
217;The Queen;hor;Gothic Horror;IYTM;m;d
218;Cadáver;hor;Dystopian Horror;IPY;f;d
219;The Silver;hor;Young Adult Horror;IYE;f;t
220;The Exorcist;hor;Supernatural Horror;IYTP;m;d
221;Red Dragon;mys;Crime Thriller;IYP;f;d
222;The Butterfly;mys;Crime Thriller;IYT;f;d
223;The Locked;mys;Psychological Thriller;IY;f;d
225;Catch-22;his;War Satire;PLTI;m;d
226;The Song;fan;Mythological Retelling;TEMP;m;d
227;The Lost Symbol;mys;Conspiracy Thriller;YIEP;f;a
228;Number;his;Children's Historical;TPC;m;a
229;The Crucible;his;Classic Play;PIT;m;t
230;Memoirs;his;Historical Fiction;TEP;m;d
231;Beloved;his;Gothic Historical;TIPY;m;d
232;Cloud;sci;Literary Science Fiction;PYE;m;d
233;The Clan;his;Prehistoric Fiction;ETIP;s;d
234;Outlander;his;Time-Travel Historical;TEI;s;d
235;El amor;rom;Literary Romance;TPC;m;d
236;Their Eyes;lit;Classic Novel;TP;m;d
237;The Mystery of the;mys;Golden Age Mystery;YEC;m;a
238;The Sun;lit;Lost Generation Classic;TP;m;d
239;Atonement;his;WWII Drama;TPYI;m;d
240;Poirot;mys;Golden Age Mystery;YCP;m;a
241;A Darker;fan;Parallel-World Fantasy;MEIY;m;t
242;The Plot;his;Alternate History;PIY;m;d
243;The secret life;his;Coming of Age;TCP;m;t
244;Water for;his;Circus Drama;TEP;m;d
245;Esperanza;his;Young Adult Historical;TPC;m;a
246;The Underground;his;Alternate Slavery History;TIP;m;d
247;The Age of;his;Classic Novel;TP;m;d
248;Redeeming;rom;Christian Romance;TCP;m;d
249;The One and;ya;Animal Middle Grade;TCPL;m;a
250;Can't Hurt;bio;Memoir;PIT;m;a
251;On Writing;bio;Writing Memoir;PTL;m;d
252;Fear and;non;Gonzo Journalism;LIP;m;d
253;Wings;bio;Autobiography;PET;m;a
254;A Farewell;his;WWI Drama;TIP;m;d
255;Never Split;self;Negotiation;PI;m;a
256;Fear no;bio;Memoir;TPI;m;d
257;The Immortal;bio;Science Biography;TP;m;a
258;Me Talk;bio;Humor Essays;LT;m;d
260;Gorin;self;Strategy Philosophy;PI;m;a
261;Between the;bio;Memoir;TPI;m;d
262;When Breath;bio;Memoir;TPC;m;a
263;Hillbilly;bio;Memoir;PTI;m;d
264;Paradise;lit;Epic Poem;PIM;s;d
265;La Divina;lit;Epic Poem;PIYM;s;d
266;Into Thin;non;Mountaineering;IEP;m;a
267;From the Mixed;ya;Children's Mystery;YELC;m;a
268;Moonwalking;non;Popular Science;PL;m;a
269;Se questo;bio;Holocaust Memoir;TIP;m;d
270;Wild;bio;Memoir;TEP;m;d
271;The Hiding;bio;WWII Memoir;TPI;m;a
272;Stone Butch;lit;Literary Fiction;TPI;m;d
273;Autobiography;bio;Spiritual Autobiography;PT;m;a
274;Girl, inter;bio;Memoir;TPI;m;d
275;The Lost Hero;fan;Mythological Adventure;MEL;m;a
276;The Mark;fan;Mythological Adventure;MEL;m;a
277;Hatchet;adv;Survival Adventure;EIT;f;a
278;The BFG;fan;Children's Fantasy;LMEC;f;a
279;Prince Caspian;fan;Children's Fantasy;MEC;m;a
280;The Voyage;fan;Children's Fantasy;MEC;m;a
281;The Silmar;fan;Mythopoeic Fantasy;MPEI;s;a
282;The Gunslinger;fan;Dark Fantasy Western;IYME;m;d
283;The Great Hunt;fan;Epic Fantasy;MEIT;s;t
284;Xenocide;sci;Philosophical Science Fiction;PIET;m;d
285;They Both;ya;Contemporary Drama;TPC;m;t
286;Fire &;fan;Fictional History;IEPY;s;d
287;A Clockwork;sci;Dystopian;IPLY;f;d
288;Blood Meridian;his;Western Historical;IPY;m;d
289;Iron Flame;fan;Romantasy;IEMT;f;d
290;Red Rising;sci;Dystopian;IEPY;f;d
291;Sunrise;ya;Dystopian;ITEP;f;t
292;Keeper of;fan;Middle Grade Fantasy;MECL;m;a
`.trim().split("\n").map((line) => line.split(";"));

const text = readFileSync(FILE, "utf8");
const start = text.indexOf("= [") + 2;
const end = text.lastIndexOf("];") + 1;
const header = text.slice(0, start);
const books = JSON.parse(text.slice(start, end));

const byPos = new Map(ROWS.map((r) => [Number(r[0]), r]));
const JUNK_THEMES = new Set(["adult", "young adult", "juvenile", "fiction", "general", "action & adventure", "children", "teen"]);

async function englishCover(title, author) {
  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&language=eng&fields=title,cover_i&limit=5`;
  const res = await fetch(url, { headers: { "User-Agent": "MystBook/1.0 (catalog review)" } });
  const docs = (await res.json()).docs ?? [];
  const hit = docs.find((d) => d.cover_i && d.title.toLowerCase().startsWith(title.toLowerCase().slice(0, 8)));
  return hit ? `https://covers.openlibrary.org/b/id/${hit.cover_i}-L.jpg` : null;
}

const out = [];
const missing = [];
for (let i = 0; i < books.length; i++) {
  if (REMOVE.has(i)) continue;
  const row = byPos.get(i);
  if (!row) {
    missing.push(i);
    continue;
  }
  const [, prefix, g, sub, moods, pace, age] = row;
  const b = books[i];
  if (!b.title.toLowerCase().startsWith(prefix.toLowerCase())) {
    throw new Error(`Row ${i}: expected a title starting "${prefix}" but found "${b.title}" — the import order changed.`);
  }
  b.genre = GENRE[g];
  b.subgenre = sub;
  b.moodProfile = Object.fromEntries([...moods].map((m, k) => [MOOD[m], WEIGHTS[k]]));
  b.pace = PACE[pace];
  b.ageSuitability = AGE[age];
  b.themes = b.themes.filter((t) => !JUNK_THEMES.has(t));
  if (RENAME[i]) b.title = RENAME[i];
  if (NO_COVER.has(i)) b.coverUrl = null;
  else if (ENGLISH_COVER[i]) {
    const cover = await englishCover(...ENGLISH_COVER[i]);
    if (cover) b.coverUrl = cover;
    else {
      // Open Library only has a foreign-language cover: better the bookplate placeholder than the wrong-language jacket.
      b.coverUrl = null;
      console.warn(`No English-edition cover found for ${ENGLISH_COVER[i][0]} — using the placeholder card`);
    }
  }
  out.push(b);
}
if (missing.length) throw new Error(`No review row for positions: ${missing.join(", ")}`);

const counts = {};
for (const b of out) counts[b.genre] = (counts[b.genre] ?? 0) + 1;
header.replace(/\d+ popular English titles/, `${out.length} popular English titles`);
writeFileSync(FILE, header.replace(/\d+ popular English titles/, `${out.length} popular English titles`) + JSON.stringify(out, null, 2) + ";\n");
console.log(`wrote ${out.length} books (removed ${REMOVE.size})`, counts);
