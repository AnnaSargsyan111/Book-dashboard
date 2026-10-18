/**
 * Live check of the book lookup (auto-fill + Find Cover) against the real Open Library: `npm run check:lookup`.
 * Each case is a book as a person might type it (typos, wrong case, extra spaces, missing author...) with what it must find.
 * The rule that must NEVER break: a result is the book that was meant, or nothing. Never somebody else's book or cover.
 * It needs the internet and is not part of `npm test` (the tests there use recorded answers); run it after changing the lookup.
 */
import { findWorks, pickCoverId, pickWork } from "../src/server/ai/open-library";

interface Case {
  title: string;
  author: string;
  /** the title and author the result must have; null = nothing must be found */
  expect: { title: RegExp; author: RegExp } | null;
}
const book = (title: string, author: string, t: RegExp, a: RegExp): Case => ({ title, author, expect: { title: t, author: a } });
const nothing = (title: string, author: string): Case => ({ title, author, expect: null });

const CASES: Case[] = [
  // typed correctly
  book("Animal Farm", "George Orwell", /animal farm/i, /orwell/i),
  book("The Kite Runner", "Khaled Hosseini", /kite runner/i, /hosseini/i),
  book("Harry Potter and the Philosopher's Stone", "J. K. Rowling", /philosopher|sorcerer/i, /rowling/i),
  book("The Great Gatsby", "", /great gatsby/i, /fitzgerald/i),
  book("Dune", "Frank Herbert", /^dune/i, /herbert/i),
  book("The Hobbit", "J.R.R. Tolkien", /hobbit/i, /tolkien/i),
  book("To Kill a Mockingbird", "Harper Lee", /mockingbird/i, /lee/i),
  book("Crime and Punishment", "Fyodor Dostoevsky", /crime and punishment/i, /dostoevsk/i),
  // another form of the same title
  book("1984", "George Orwell", /nineteen eighty|1984/i, /orwell/i),
  book("Lord of the Rings", "Tolkien", /lord of the rings|fellowship/i, /tolkien/i),
  // typos in the title (the bug that started this: "Animal firm" returned Dracula's Guest)
  book("Animal firm", "George orwell", /animal farm/i, /orwell/i),
  book("Animal farn", "George Orwell", /animal farm/i, /orwell/i),
  book("Anmal Farm", "George Orwell", /animal farm/i, /orwell/i),
  book("Pride and Prejudise", "Jane Austen", /pride and prejudice/i, /austen/i),
  book("The Kite Runer", "Khaled Hosseini", /kite runner/i, /hosseini/i),
  book("The Great Gatsbi", "F. Scott Fitzgerald", /great gatsby/i, /fitzgerald/i),
  book("Crime and Punishmant", "Dostoevsky", /crime and punishment/i, /dostoevsk/i),
  book("The Hobit", "Tolkien", /hobbit/i, /tolkien/i),
  // case, spaces and punctuation
  book("  animal   farm ", "george orwell", /animal farm/i, /orwell/i),
  book("THE KITE RUNNER", "KHALED HOSSEINI", /kite runner/i, /hosseini/i),
  book("Harry Potter and the Philosophers Stone", "JK Rowling", /philosopher|sorcerer/i, /rowling/i),
  // author spelled loosely, or surname only
  book("Animal Farm", "orwell", /animal farm/i, /orwell/i),
  book("The Kite Runner", "Hosseini", /kite runner/i, /hosseini/i),
  // a partial title
  book("Kite Runner", "Khaled Hosseini", /kite runner/i, /hosseini/i),
  // more titles, with the kinds of slips people make
  book("Fahrenheit 451", "Ray Bradbury", /fahrenheit/i, /bradbury/i),
  book("Fahrenheit 541", "Ray Bradbury", /fahrenheit/i, /bradbury/i),
  book("The Catcher in the Rye", "J. D. Salinger", /catcher in the rye/i, /salinger/i),
  book("The Cather in the Rye", "Salinger", /catcher in the rye/i, /salinger/i),
  book("Brave New World", "Aldous Huxley", /brave new world/i, /huxley/i),
  book("Brave New Wrold", "Huxley", /brave new world/i, /huxley/i),
  book("The Alchemist", "Paulo Coelho", /alchemist/i, /coelho/i),
  book("Frankenstein", "Mary Shelley", /frankenstein/i, /shelley/i),
  book("Jane Eyre", "Charlotte Bronte", /jane eyre/i, /bront/i),
  book("Jane Eyre", "Charlotte Brontë", /jane eyre/i, /bront/i),
  book("Moby Dick", "Herman Melville", /moby/i, /melville/i),
  book("The Picture of Dorian Gray", "Oscar Wilde", /dorian gray/i, /wilde/i),
  book("Dorian Grey", "Oscar Wilde", /dorian gray/i, /wilde/i),
  book("The Little Prince", "Antoine de Saint-Exupery", /little prince|petit prince/i, /exup/i),
  book("Sapiens", "Yuval Noah Harari", /sapiens/i, /harari/i),
  // a real author with a title that is not theirs: nothing, never one of their other books
  nothing("Animal firm", "Stephen King"),
  nothing("A book that does not exist", "George Orwell"),
  // nonsense and unknown books: nothing, and above all not somebody else's book
  nothing("Zzqxv unknown thing", "Nobody Atall"),
  nothing("Qwertyuiop asdfghjkl", ""),
  nothing("Animal firm", "Bram Stoker"),
];

let failed = 0;
for (const c of CASES) {
  const author = c.author.trim() || undefined;
  const works = await findWorks(c.title, author);
  const work = pickWork(works, author, c.title);
  const coverId = pickCoverId(works, author, c.title);
  const got = work ? `${work.title} — ${work.authors[0] ?? "?"}` : "(nothing)";
  let ok: boolean;
  if (c.expect === null) ok = work === null && coverId === null;
  else ok = !!work && c.expect.title.test(work.title) && work.authors.some((a) => c.expect!.author.test(a)) && (coverId === null || works.some((w) => w.coverId === coverId && c.expect!.title.test(w.title)));
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  "${c.title.trim()}" / "${c.author}"  ->  ${got}${coverId ? `  (cover ${coverId})` : ""}`);
}
console.log(`\n${CASES.length - failed}/${CASES.length} passed`);
process.exit(failed ? 1 : 0);
