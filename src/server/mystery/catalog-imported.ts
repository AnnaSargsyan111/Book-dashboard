import type { CatalogBook } from "./catalog";

/**
 * 283 popular English titles imported from Open Library by `scripts/import-catalog.mjs` (re-run it to
 * refresh; slugs are `ol-<Open Library work id>`, stable). Title, author, cover, page count and the popularity score
 * come from Open Library; the genre, mood profile, pace and age suitability were drafted by rule and then checked
 * book by book (scripts/apply-catalog-review.mjs holds that review). Every book is `available: true` (recommended and orderable); set a title's flag
 * to `false` to take it out of every recommendation.
 */
export const IMPORTED_CATALOG: CatalogBook[] = [
  {
    "slug": "ol-ol257943w",
    "title": "A Game of Thrones",
    "author": "George R. R. Martin",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "mysterious": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "fantasy",
      "high fantasy"
    ],
    "pace": "slow",
    "pages": 801,
    "popularity": 0.95,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9269962-L.jpg"
  },
  {
    "slug": "ol-ol27513w",
    "title": "The Fellowship of the Ring",
    "author": "J.R.R. Tolkien",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "elves",
      "dwarves",
      "evil",
      "fear"
    ],
    "pace": "medium",
    "pages": 492,
    "popularity": 0.9,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14627060-L.jpg"
  },
  {
    "slug": "ol-ol5735360w",
    "title": "Catching Fire",
    "author": "Suzanne Collins",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Dystopian",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "emotional": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "action/adventure",
      "fantasy",
      "teen fiction",
      "juvenile works"
    ],
    "pace": "fast",
    "pages": 400,
    "popularity": 0.88,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12646539-L.jpg"
  },
  {
    "slug": "ol-ol17860744w",
    "title": "A Court of Mist and Fury",
    "author": "Sarah J. Maas",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Romantasy",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "magical": 0.6,
      "intense": 0.45
    },
    "themes": [
      "fantasy",
      "fairies",
      "blessing and cursing"
    ],
    "pace": "medium",
    "pages": 626,
    "popularity": 0.91,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14315081-L.jpg"
  },
  {
    "slug": "ol-ol82565w",
    "title": "Harry Potter and the Half-Blood Prince",
    "author": "J. K. Rowling",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "cozy": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "orphans",
      "foster homes",
      "romans",
      "magie"
    ],
    "pace": "medium",
    "pages": 640,
    "popularity": 0.85,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10716273-L.jpg"
  },
  {
    "slug": "ol-ol492646w",
    "title": "The Sea of Monsters",
    "author": "Rick Riordan",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Mythological Adventure",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "fantasy",
      "greek mythology",
      "juvenile fiction"
    ],
    "pace": "medium",
    "pages": 282,
    "popularity": 0.84,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/108909-L.jpg"
  },
  {
    "slug": "ol-ol492647w",
    "title": "The Titan's Curse",
    "author": "Rick Riordan",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Mythological Adventure",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6
    },
    "themes": [
      "new york times bestseller",
      "fictitious character",
      "children's fiction"
    ],
    "pace": "medium",
    "pages": 320,
    "popularity": 0.83,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14601475-L.jpg"
  },
  {
    "slug": "ol-ol46125w",
    "title": "Foundation",
    "author": "Isaac Asimov",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Classic Science Fiction",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "escapist": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "psychohistory",
      "open library staff picks",
      "life on other planets"
    ],
    "pace": "medium",
    "pages": 240,
    "popularity": 0.88,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14612610-L.jpg"
  },
  {
    "slug": "ol-ol98459w",
    "title": "Slaughterhouse-Five",
    "author": "Kurt Vonnegut",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Satirical Anti-War",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75,
      "lightFun": 0.6,
      "intense": 0.45
    },
    "themes": [
      "american science fiction",
      "bombing of dresden",
      "open library staff picks",
      "military fiction"
    ],
    "pace": "medium",
    "pages": 203,
    "popularity": 0.87,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12727001-L.jpg"
  },
  {
    "slug": "ol-ol45846w",
    "title": "Matilda",
    "author": "Roald Dahl",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Children's Fantasy",
    "moodProfile": {
      "lightFun": 0.9,
      "cozy": 0.75,
      "escapist": 0.6,
      "magical": 0.45
    },
    "themes": [
      "juvenile fiction",
      "schools",
      "girls",
      "spanish language"
    ],
    "pace": "medium",
    "pages": 240,
    "popularity": 0.88,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12889769-L.jpg"
  },
  {
    "slug": "ol-ol17352669w",
    "title": "A Court of Thorns and Roses",
    "author": "Sarah J. Maas",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Romantasy",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "magical": 0.6,
      "intense": 0.45
    },
    "themes": [
      "fantasy",
      "love",
      "blessing and cursing",
      "fairies"
    ],
    "pace": "medium",
    "pages": 454,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/15254465-L.jpg"
  },
  {
    "slug": "ol-ol257939w",
    "title": "A Clash of Kings",
    "author": "George R. R. Martin",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "mysterious": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "fantasy fiction",
      "fantasy",
      "new york times bestseller"
    ],
    "pace": "slow",
    "pages": 761,
    "popularity": 0.85,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8231751-L.jpg"
  },
  {
    "slug": "ol-ol41495w",
    "title": "A Wrinkle in Time",
    "author": "Madeleine L'Engle",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Children's Science Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6,
      "cozy": 0.45
    },
    "themes": [
      "love",
      "sci-fi",
      "newbery medal",
      "open library staff picks"
    ],
    "pace": "medium",
    "pages": 212,
    "popularity": 0.84,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8709146-L.jpg"
  },
  {
    "slug": "ol-ol453657w",
    "title": "The Colour of Magic",
    "author": "Terry Pratchett",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Comic Fantasy",
    "moodProfile": {
      "lightFun": 0.9,
      "escapist": 0.75,
      "magical": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "romans",
      "merveilleux",
      "fantasy"
    ],
    "pace": "medium",
    "pages": 240,
    "popularity": 0.83,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14647238-L.jpg"
  },
  {
    "slug": "ol-ol2172356w",
    "title": "Do Androids Dream of Electric Sheep?",
    "author": "Philip K. Dick",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Dystopian",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "mysterious": 0.75,
      "intense": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "androids",
      "science fiction",
      "twenty-first century"
    ],
    "pace": "medium",
    "pages": 224,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/207515-L.jpg"
  },
  {
    "slug": "ol-ol17850410w",
    "title": "The Cruel Prince",
    "author": "Holly Black",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Faerie Fantasy",
    "moodProfile": {
      "intense": 0.9,
      "emotional": 0.75,
      "escapist": 0.6,
      "magical": 0.45
    },
    "themes": [
      "fantasy",
      "princes",
      "courts and courtiers",
      "orphans"
    ],
    "pace": "medium",
    "pages": 378,
    "popularity": 0.84,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8361789-L.jpg"
  },
  {
    "slug": "ol-ol71037w",
    "title": "The Lion, the Witch and the Wardrobe",
    "author": "C. S. Lewis",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Children's Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "cozy": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "the blitz",
      "fauns",
      "turkish delight",
      "lions"
    ],
    "pace": "medium",
    "pages": 186,
    "popularity": 0.81,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8441376-L.jpg"
  },
  {
    "slug": "ol-ol38501w",
    "title": "Snow Crash",
    "author": "Neal Stephenson",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Cyberpunk",
    "moodProfile": {
      "intense": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6,
      "lightFun": 0.45
    },
    "themes": [
      "american science fiction",
      "open library staff picks",
      "ready player one"
    ],
    "pace": "fast",
    "pages": 460,
    "popularity": 0.85,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/392508-L.jpg"
  },
  {
    "slug": "ol-ol27455w",
    "title": "The Return of the King",
    "author": "J.R.R. Tolkien",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "elves",
      "hobbits",
      "hope",
      "fear"
    ],
    "pace": "medium",
    "pages": 499,
    "popularity": 0.8,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14627062-L.jpg"
  },
  {
    "slug": "ol-ol5720022w",
    "title": "Breaking Dawn",
    "author": "Stephenie Meyer",
    "language": "en",
    "genre": "romance",
    "subgenre": "Paranormal Romance",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "magical": 0.6,
      "intense": 0.45
    },
    "themes": [
      "vampires",
      "juvenile fiction",
      "werewolves"
    ],
    "pace": "slow",
    "pages": 756,
    "popularity": 0.81,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12643419-L.jpg"
  },
  {
    "slug": "ol-ol453658w",
    "title": "Mort",
    "author": "Terry Pratchett",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Comic Fantasy",
    "moodProfile": {
      "lightFun": 0.9,
      "magical": 0.75,
      "thoughtProvoking": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "death",
      "fantasy",
      "satire"
    ],
    "pace": "medium",
    "pages": 297,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14648805-L.jpg"
  },
  {
    "slug": "ol-ol5738150w",
    "title": "The Well of Ascension",
    "author": "Brandon Sanderson",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "intense": 0.9,
      "magical": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "courts and courtiers",
      "sieges",
      "magic"
    ],
    "pace": "slow",
    "pages": 784,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14658341-L.jpg"
  },
  {
    "slug": "ol-ol1963268w",
    "title": "Hyperion",
    "author": "Dan Simmons",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Space Opera",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75,
      "escapist": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "american science fiction",
      "hugo award winner",
      "ciencia-ficcio n.",
      "extraterrestrial beings"
    ],
    "pace": "medium",
    "pages": 481,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/380332-L.jpg"
  },
  {
    "slug": "ol-ol18020194w",
    "title": "It Ends With Us",
    "author": "Colleen Hoover",
    "language": "en",
    "genre": "romance",
    "subgenre": "Contemporary Romance",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "man-woman relationships",
      "neurosurgeons",
      "first loves",
      "businesswomen"
    ],
    "pace": "medium",
    "pages": 384,
    "popularity": 0.95,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10473609-L.jpg"
  },
  {
    "slug": "ol-ol27733867w",
    "title": "It Starts with Us",
    "author": "Colleen Hoover",
    "language": "en",
    "genre": "romance",
    "subgenre": "Contemporary Romance",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "contemporary",
      "romance",
      "friendship"
    ],
    "pace": "medium",
    "pages": 352,
    "popularity": 0.88,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12749873-L.jpg"
  },
  {
    "slug": "ol-ol24390422w",
    "title": "Twisted Love",
    "author": "Ana Huang",
    "language": "en",
    "genre": "romance",
    "subgenre": "Dark Romance",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "new york times bestseller",
      "romance",
      "contemporary romance",
      "new adult romance"
    ],
    "pace": "medium",
    "pages": 358,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12940491-L.jpg"
  },
  {
    "slug": "ol-ol16014245w",
    "title": "Shatter Me",
    "author": "Tahereh Mafi",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Dystopian Romance",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "escapist": 0.6,
      "magical": 0.45
    },
    "themes": [
      "love",
      "ability",
      "dictatorship"
    ],
    "pace": "fast",
    "pages": 357,
    "popularity": 0.83,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6974992-L.jpg"
  },
  {
    "slug": "ol-ol24178205w",
    "title": "The Love Hypothesis",
    "author": "Ali Hazelwood",
    "language": "en",
    "genre": "romance",
    "subgenre": "Romantic Comedy",
    "moodProfile": {
      "lightFun": 0.9,
      "emotional": 0.75,
      "cozy": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "american literature",
      "new york times bestseller",
      "romantic fiction",
      "rom-com"
    ],
    "pace": "medium",
    "pages": 398,
    "popularity": 0.85,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10601402-L.jpg"
  },
  {
    "slug": "ol-ol875437w",
    "title": "The Perks of Being a Wallflower",
    "author": "Stephen Chbosky",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Coming of Age",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "young adult fiction",
      "bildungsroman",
      "epistolary fiction",
      "bildungsromans"
    ],
    "pace": "medium",
    "pages": 231,
    "popularity": 0.79,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14315052-L.jpg"
  },
  {
    "slug": "ol-ol16807730w",
    "title": "House of Hades",
    "author": "Rick Riordan",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Mythological Adventure",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "juvenile fiction",
      "roman mythology",
      "greek mythology"
    ],
    "pace": "medium",
    "pages": 597,
    "popularity": 0.8,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8057334-L.jpg"
  },
  {
    "slug": "ol-ol5720025w",
    "title": "Eclipse",
    "author": "Stephenie Meyer",
    "language": "en",
    "genre": "romance",
    "subgenre": "Paranormal Romance",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "new york times bestseller",
      "werewolves",
      "interpersonal relations",
      "vampires"
    ],
    "pace": "medium",
    "pages": 629,
    "popularity": 0.8,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12643410-L.jpg"
  },
  {
    "slug": "ol-ol17606111w",
    "title": "Milk and Honey",
    "author": "Rupi Kaur",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Poetry",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "canadian poetry",
      "survival",
      "poetry",
      "women"
    ],
    "pace": "medium",
    "pages": 226,
    "popularity": 0.79,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8743595-L.jpg"
  },
  {
    "slug": "ol-ol20090688w",
    "title": "Red, White & Royal Blue",
    "author": "Casey McQuiston",
    "language": "en",
    "genre": "romance",
    "subgenre": "Romantic Comedy",
    "moodProfile": {
      "lightFun": 0.9,
      "emotional": 0.75,
      "cozy": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "new york times bestseller",
      "humor",
      "romance"
    ],
    "pace": "medium",
    "pages": 440,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9171544-L.jpg"
  },
  {
    "slug": "ol-ol28952677w",
    "title": "Icebreaker",
    "author": "Hannah Grace",
    "language": "en",
    "genre": "romance",
    "subgenre": "Sports Romance",
    "moodProfile": {
      "emotional": 0.9,
      "lightFun": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "figure skating",
      "hockey",
      "romance"
    ],
    "pace": "medium",
    "pages": 448,
    "popularity": 0.82,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13180728-L.jpg"
  },
  {
    "slug": "ol-ol27818823w",
    "title": "Twisted Lies",
    "author": "Ana Huang",
    "language": "en",
    "genre": "romance",
    "subgenre": "Dark Romance",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "romance",
      "suspense",
      "mystery",
      "thriller"
    ],
    "pace": "medium",
    "pages": 616,
    "popularity": 0.82,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14425197-L.jpg"
  },
  {
    "slug": "ol-ol16325201w",
    "title": "Insurgent",
    "author": "Veronica Roth",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Dystopian",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "emotional": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "future",
      "faction",
      "science fiction",
      "children's fiction"
    ],
    "pace": "fast",
    "pages": 525,
    "popularity": 0.79,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7083755-L.jpg"
  },
  {
    "slug": "ol-ol29226517w",
    "title": "Fourth Wing",
    "author": "Rebecca Yarros",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Romantasy",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "magical": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "fantasía",
      "fantasy",
      "ficción",
      "ficciones"
    ],
    "pace": "fast",
    "pages": 518,
    "popularity": 0.79,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14407898-L.jpg"
  },
  {
    "slug": "ol-ol16607146w",
    "title": "Throne of Glass",
    "author": "Sarah J. Maas",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "intense": 0.9,
      "magical": 0.75,
      "escapist": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "assassins",
      "princes",
      "courts and courtiers",
      "prisoners"
    ],
    "pace": "medium",
    "pages": 432,
    "popularity": 0.77,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13312488-L.jpg"
  },
  {
    "slug": "ol-ol8455255w",
    "title": "City of Bones",
    "author": "Cassandra Clare",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Urban Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "demonology",
      "horror stories",
      "supernatural"
    ],
    "pace": "medium",
    "pages": 512,
    "popularity": 0.78,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10121449-L.jpg"
  },
  {
    "slug": "ol-ol274505w",
    "title": "One Hundred Years of Solitude",
    "author": "Gabriel García Márquez",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Magical Realism",
    "moodProfile": {
      "magical": 0.9,
      "emotional": 0.75,
      "thoughtProvoking": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "spanish language books",
      "social conditions",
      "novel"
    ],
    "pace": "slow",
    "pages": 432,
    "popularity": 0.77,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/15185412-L.jpg"
  },
  {
    "slug": "ol-ol16361029w",
    "title": "The Selection",
    "author": "Kiera Cass",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Dystopian Romance",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "contests",
      "love",
      "princes",
      "revolutionaries"
    ],
    "pace": "medium",
    "pages": 328,
    "popularity": 0.76,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7101900-L.jpg"
  },
  {
    "slug": "ol-ol19667762w",
    "title": "If He Had Been With Me",
    "author": "Laura Nowlin",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Young Adult Romance",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "friendship",
      "love",
      "love stories"
    ],
    "pace": "medium",
    "pages": 368,
    "popularity": 0.77,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14339089-L.jpg"
  },
  {
    "slug": "ol-ol1992198w",
    "title": "In Cold Blood",
    "author": "Truman Capote",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "True Crime",
    "moodProfile": {
      "intense": 0.9,
      "thoughtProvoking": 0.75,
      "mysterious": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "true",
      "crime",
      "murder",
      "mystery"
    ],
    "pace": "medium",
    "pages": 352,
    "popularity": 0.78,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/228066-L.jpg"
  },
  {
    "slug": "ol-ol17797857w",
    "title": "One Of Us Is Lying",
    "author": "Karen M. McManus",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Young Adult Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "intense": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "children's fiction",
      "mystery and detective stories",
      "young adult fiction",
      "juvenile fiction"
    ],
    "pace": "fast",
    "pages": 360,
    "popularity": 0.78,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12503935-L.jpg"
  },
  {
    "slug": "ol-ol486967w",
    "title": "The Princess Bride",
    "author": "William Goldman",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Fairy-tale Adventure",
    "moodProfile": {
      "lightFun": 0.9,
      "escapist": 0.75,
      "magical": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "castles",
      "princesses",
      "good and evil"
    ],
    "pace": "medium",
    "pages": 399,
    "popularity": 0.78,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9284881-L.jpg"
  },
  {
    "slug": "ol-ol455327w",
    "title": "Lord of the Flies",
    "author": "William Golding",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Allegorical Classic",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "relationships",
      "adventure",
      "morality"
    ],
    "pace": "medium",
    "pages": 243,
    "popularity": 0.95,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8684447-L.jpg"
  },
  {
    "slug": "ol-ol81633w",
    "title": "The Shining",
    "author": "Stephen King",
    "language": "en",
    "genre": "horror",
    "subgenre": "Supernatural Horror",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "emotional": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "horror fiction",
      "demonology",
      "precognition"
    ],
    "pace": "medium",
    "pages": 506,
    "popularity": 0.92,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12376585-L.jpg"
  },
  {
    "slug": "ol-ol15936512w",
    "title": "Ready Player One",
    "author": "Ernest Cline",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Gamer Science Fiction",
    "moodProfile": {
      "escapist": 0.9,
      "lightFun": 0.75,
      "intense": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "utopias",
      "virtual reality",
      "puzzles"
    ],
    "pace": "fast",
    "pages": 462,
    "popularity": 0.93,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8737626-L.jpg"
  },
  {
    "slug": "ol-ol76833w",
    "title": "Angels & Demons",
    "author": "Dan Brown",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Conspiracy Thriller",
    "moodProfile": {
      "mysterious": 0.9,
      "intense": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "heparin",
      "ambigrams",
      "antimatter",
      "freemasons"
    ],
    "pace": "fast",
    "pages": 575,
    "popularity": 0.92,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11408459-L.jpg"
  },
  {
    "slug": "ol-ol76837w",
    "title": "The Da Vinci Code",
    "author": "Dan Brown",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Conspiracy Thriller",
    "moodProfile": {
      "mysterious": 0.9,
      "intense": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "suspense & thriller",
      "spiritual fiction",
      "hieros gamos",
      "priory of sion"
    ],
    "pace": "fast",
    "pages": 489,
    "popularity": 0.89,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9255229-L.jpg"
  },
  {
    "slug": "ol-ol81626w",
    "title": "Carrie",
    "author": "Stephen King",
    "language": "en",
    "genre": "horror",
    "subgenre": "Supernatural Horror",
    "moodProfile": {
      "intense": 0.9,
      "emotional": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "horror fiction",
      "psychological thrillers",
      "horror"
    ],
    "pace": "fast",
    "pages": 255,
    "popularity": 0.88,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9256043-L.jpg"
  },
  {
    "slug": "ol-ol471565w",
    "title": "And Then There Were None",
    "author": "Agatha Christie",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Golden Age Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "roman policier",
      "french language materials",
      "lectures et morceaux choisis",
      "cyanide poisoning"
    ],
    "pace": "fast",
    "pages": 222,
    "popularity": 0.88,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11172296-L.jpg"
  },
  {
    "slug": "ol-ol46881w",
    "title": "Jurassic Park",
    "author": "Michael Crichton",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Techno-Thriller",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "dichogamy",
      "corporate espionage",
      "science fiction",
      "cautionary tale"
    ],
    "pace": "fast",
    "pages": 455,
    "popularity": 0.89,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12882940-L.jpg"
  },
  {
    "slug": "ol-ol20646061w",
    "title": "A Good Girl's Guide to Murder",
    "author": "Holly Jackson",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Young Adult Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "intense": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "mystery and detective stories.",
      "children's fiction",
      "mystery and detective stories",
      "new york times bestseller"
    ],
    "pace": "fast",
    "pages": 431,
    "popularity": 0.88,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13156188-L.jpg"
  },
  {
    "slug": "ol-ol20068530w",
    "title": "Verity",
    "author": "Colleen Hoover",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Psychological Thriller",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "emotional": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "new york times bestseller",
      "secrecy in fiction",
      "romance"
    ],
    "pace": "fast",
    "pages": 340,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8747160-L.jpg"
  },
  {
    "slug": "ol-ol262496w",
    "title": "A Study in Scarlet",
    "author": "Arthur Conan Doyle",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Classic Detective",
    "moodProfile": {
      "mysterious": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "aortic aneurysm",
      "battle of maiwand",
      "blessing and cursing",
      "children's fiction"
    ],
    "pace": "medium",
    "pages": 162,
    "popularity": 0.85,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13405534-L.jpg"
  },
  {
    "slug": "ol-ol472715w",
    "title": "The Mysterious Affair at Styles",
    "author": "Agatha Christie",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Cozy Golden Age Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "cozy": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "mystery",
      "crime fiction",
      "mystery thriller"
    ],
    "pace": "medium",
    "pages": 204,
    "popularity": 0.83,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13699667-L.jpg"
  },
  {
    "slug": "ol-ol25515697w",
    "title": "Twisted Games",
    "author": "Ana Huang",
    "language": "en",
    "genre": "romance",
    "subgenre": "Dark Romance",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "romance",
      "contemporary romance",
      "romantic suspense",
      "new adult romance"
    ],
    "pace": "medium",
    "pages": 454,
    "popularity": 0.85,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12821465-L.jpg"
  },
  {
    "slug": "ol-ol17332479w",
    "title": "Six of Crows",
    "author": "Leigh Bardugo",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Heist Fantasy",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "mysterious": 0.6,
      "magical": 0.45
    },
    "themes": [
      "young adult fiction",
      "fantasy fiction",
      "young adult works"
    ],
    "pace": "fast",
    "pages": 512,
    "popularity": 0.83,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12667417-L.jpg"
  },
  {
    "slug": "ol-ol17837968w",
    "title": "Artemis",
    "author": "Andy Weir",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Heist Science Fiction",
    "moodProfile": {
      "escapist": 0.9,
      "lightFun": 0.75,
      "intense": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "science fiction",
      "smuggling",
      "conspiracies"
    ],
    "pace": "fast",
    "pages": 322,
    "popularity": 0.86,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8235551-L.jpg"
  },
  {
    "slug": "ol-ol8996439w",
    "title": "The Name of the Rose",
    "author": "Umberto Eco",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Historical Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "novela de misterio",
      "history",
      "monasticismo y vida religiosa",
      "novela didáctica"
    ],
    "pace": "slow",
    "pages": 533,
    "popularity": 0.85,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/15023290-L.jpg"
  },
  {
    "slug": "ol-ol5784622w",
    "title": "The Girl with the Dragon Tattoo",
    "author": "Stieg Larsson",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Nordic Noir",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "novels",
      "misogyny",
      "rape",
      "book of leviticus"
    ],
    "pace": "fast",
    "pages": 576,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": null
  },
  {
    "slug": "ol-ol257746w",
    "title": "The Eyes of Darkness",
    "author": "Dean Koontz",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Supernatural Thriller",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "mothers and sons"
    ],
    "pace": "fast",
    "pages": 341,
    "popularity": 0.88,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12547107-L.jpg"
  },
  {
    "slug": "ol-ol18766691w",
    "title": "Where the Crawdads Sing",
    "author": "Delia Owens",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Southern Gothic",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "solitude",
      "new york times bestseller",
      "abandoned children"
    ],
    "pace": "medium",
    "pages": 416,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8362947-L.jpg"
  },
  {
    "slug": "ol-ol84919w",
    "title": "Treasure",
    "author": "Clive Cussler",
    "language": "en",
    "genre": "adventure",
    "subgenre": "Treasure-Hunt Adventure",
    "moodProfile": {
      "escapist": 0.9,
      "intense": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "invasions",
      "treasure troves",
      "treasure-trove"
    ],
    "pace": "fast",
    "pages": 608,
    "popularity": 0.88,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8231769-L.jpg"
  },
  {
    "slug": "ol-ol17268007w",
    "title": "Annihilation",
    "author": "Jeff VanderMeer",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Weird Fiction",
    "moodProfile": {
      "mysterious": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "nebula award winner",
      "discoveries in geography",
      "scientists"
    ],
    "pace": "medium",
    "pages": 208,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8408974-L.jpg"
  },
  {
    "slug": "ol-ol9264548w",
    "title": "Thirteen Reasons Why",
    "author": "Jay Asher",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Contemporary Drama",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "mystery",
      "suicide",
      "young adult fiction",
      "schools in fiction"
    ],
    "pace": "medium",
    "pages": 312,
    "popularity": 0.82,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/15162168-L.jpg"
  },
  {
    "slug": "ol-ol4321141w",
    "title": "The Secret History",
    "author": "Donna Tartt",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Dark Academia",
    "moodProfile": {
      "mysterious": 0.9,
      "thoughtProvoking": 0.75,
      "emotional": 0.6,
      "intense": 0.45
    },
    "themes": [
      "college students",
      "teacher-student relationships",
      "classicists"
    ],
    "pace": "medium",
    "pages": 608,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/744854-L.jpg"
  },
  {
    "slug": "ol-ol10834w",
    "title": "Perfume: The Story of a Murderer",
    "author": "Patrick Süskind",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Historical Thriller",
    "moodProfile": {
      "mysterious": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "historical fiction",
      "psychological thriller",
      "dark fantasy",
      "coming-of-age"
    ],
    "pace": "medium",
    "pages": 263,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": null
  },
  {
    "slug": "ol-ol84916w",
    "title": "Cyclops",
    "author": "Clive Cussler",
    "language": "en",
    "genre": "adventure",
    "subgenre": "Adventure Thriller",
    "moodProfile": {
      "escapist": 0.9,
      "intense": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "cold war",
      "conspiracies",
      "open library staff picks"
    ],
    "pace": "fast",
    "pages": 480,
    "popularity": 0.87,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8231759-L.jpg"
  },
  {
    "slug": "ol-ol1168007w",
    "title": "Animal Farm",
    "author": "George Orwell",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Political Satire",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "political satire",
      "classic",
      "animal drama",
      "english literature"
    ],
    "pace": "medium",
    "pages": 128,
    "popularity": 0.95,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11261770-L.jpg"
  },
  {
    "slug": "ol-ol64365w",
    "title": "Brave New World",
    "author": "Aldous Huxley",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Dystopian",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "utopias",
      "brainwashing",
      "science and state"
    ],
    "pace": "medium",
    "pages": 240,
    "popularity": 0.93,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8231823-L.jpg"
  },
  {
    "slug": "ol-ol103123w",
    "title": "Fahrenheit 451",
    "author": "Ray Bradbury",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Dystopian",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "mechanical hound",
      "girl next door",
      "terrorismo estatal",
      "censura"
    ],
    "pace": "medium",
    "pages": 188,
    "popularity": 0.93,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12993656-L.jpg"
  },
  {
    "slug": "ol-ol49488w",
    "title": "Ender's Game",
    "author": "Orson Scott Card",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Military Science Fiction",
    "moodProfile": {
      "intense": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "new york times bestseller",
      "military education",
      "end of the world",
      "hegemony"
    ],
    "pace": "fast",
    "pages": 330,
    "popularity": 0.92,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12996033-L.jpg"
  },
  {
    "slug": "ol-ol14908941w",
    "title": "Mockingjay",
    "author": "Suzanne Collins",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Dystopian",
    "moodProfile": {
      "intense": 0.9,
      "emotional": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "new york times bestseller",
      "sci-fi",
      "science fiction"
    ],
    "pace": "fast",
    "pages": 424,
    "popularity": 0.89,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12646459-L.jpg"
  },
  {
    "slug": "ol-ol81634w",
    "title": "Misery",
    "author": "Stephen King",
    "language": "en",
    "genre": "horror",
    "subgenre": "Psychological Horror",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "dope",
      "pills",
      "american novelists",
      "captives"
    ],
    "pace": "fast",
    "pages": 382,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8259296-L.jpg"
  },
  {
    "slug": "ol-ol893461w",
    "title": "Dune Messiah",
    "author": "Frank Herbert",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Space Opera",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "mysterious": 0.75,
      "intense": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "american science fiction",
      "imaginary places",
      "science fiction"
    ],
    "pace": "medium",
    "pages": 279,
    "popularity": 0.84,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/980253-L.jpg"
  },
  {
    "slug": "ol-ol40873w",
    "title": "The Road",
    "author": "Cormac McCarthy",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Post-Apocalyptic",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "dystopia",
      "adventure",
      "post-apocalyptic fiction"
    ],
    "pace": "medium",
    "pages": 256,
    "popularity": 0.85,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/198120-L.jpg"
  },
  {
    "slug": "ol-ol6027236w",
    "title": "The Maze Runner",
    "author": "James Dashner",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Dystopian",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "science fiction",
      "amnesia",
      "cooperativeness"
    ],
    "pace": "fast",
    "pages": 375,
    "popularity": 0.85,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10464801-L.jpg"
  },
  {
    "slug": "ol-ol46224w",
    "title": "Foundation and Empire",
    "author": "Isaac Asimov",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Classic Science Fiction",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "escapist": 0.75,
      "intense": 0.6
    },
    "themes": [
      "psychohistory",
      "life on other planets",
      "american science fiction"
    ],
    "pace": "medium",
    "pages": 253,
    "popularity": 0.84,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9300695-L.jpg"
  },
  {
    "slug": "ol-ol257948w",
    "title": "A Feast for Crows",
    "author": "George R. R. Martin",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "mysterious": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "new york times bestseller",
      "fantasy fiction",
      "fantasy"
    ],
    "pace": "slow",
    "pages": 792,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6501256-L.jpg"
  },
  {
    "slug": "ol-ol16114008w",
    "title": "Leviathan Wakes",
    "author": "James S. A. Corey",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Space Opera",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "mysterious": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "space warfare",
      "interplanetary voyages",
      "conspiracies"
    ],
    "pace": "fast",
    "pages": 592,
    "popularity": 0.85,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7314237-L.jpg"
  },
  {
    "slug": "ol-ol46309w",
    "title": "Second Foundation",
    "author": "Isaac Asimov",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Classic Science Fiction",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "mysterious": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "psychohistory",
      "life on other planets",
      "science fiction"
    ],
    "pace": "medium",
    "pages": 235,
    "popularity": 0.84,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9261324-L.jpg"
  },
  {
    "slug": "ol-ol81594w",
    "title": "Wolves of the Calla",
    "author": "Stephen King",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Dark Fantasy Western",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "magical": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "lightsabers",
      "snitches",
      "androids",
      "adventure fiction"
    ],
    "pace": "slow",
    "pages": 714,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14652470-L.jpg"
  },
  {
    "slug": "ol-ol2163623w",
    "title": "Life, the Universe and Everything",
    "author": "Douglas Adams",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Comic Science Fiction",
    "moodProfile": {
      "lightFun": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "sofas",
      "xenophobia",
      "bird language",
      "paradoxes"
    ],
    "pace": "medium",
    "pages": 210,
    "popularity": 0.83,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8569244-L.jpg"
  },
  {
    "slug": "ol-ol18941w",
    "title": "Fight Club",
    "author": "Chuck Palahniuk",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Transgressive Fiction",
    "moodProfile": {
      "intense": 0.9,
      "thoughtProvoking": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "millennialism",
      "young men",
      "science fiction"
    ],
    "pace": "medium",
    "pages": 222,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7890578-L.jpg"
  },
  {
    "slug": "ol-ol5969057w",
    "title": "World War Z",
    "author": "Max Brooks",
    "language": "en",
    "genre": "horror",
    "subgenre": "Zombie Horror",
    "moodProfile": {
      "intense": 0.9,
      "thoughtProvoking": 0.75,
      "emotional": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "humor",
      "new york times bestseller",
      "zombies"
    ],
    "pace": "medium",
    "pages": 422,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/168106-L.jpg"
  },
  {
    "slug": "ol-ol28996w",
    "title": "The Amber Spyglass",
    "author": "Philip Pullman",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "fantasy",
      "fantasy fiction",
      "missing persons"
    ],
    "pace": "slow",
    "pages": 536,
    "popularity": 0.82,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12613246-L.jpg"
  },
  {
    "slug": "ol-ol59798w",
    "title": "A Wizard of Earthsea",
    "author": "Ursula K. Le Guin",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Coming-of-Age Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "magic",
      "magic in fiction",
      "fantasy"
    ],
    "pace": "medium",
    "pages": 205,
    "popularity": 0.82,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13617691-L.jpg"
  },
  {
    "slug": "ol-ol17417w",
    "title": "Rendezvous with Rama",
    "author": "Arthur C. Clarke",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Hard Science Fiction",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "mysterious": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "future in literature",
      "hugo award winner",
      "nebula award winner"
    ],
    "pace": "medium",
    "pages": 256,
    "popularity": 0.81,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13472608-L.jpg"
  },
  {
    "slug": "ol-ol103134w",
    "title": "The Martian Chronicles",
    "author": "Ray Bradbury",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Classic Science Fiction",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75,
      "escapist": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "american science fiction",
      "ciencia-ficción",
      "drama",
      "english language short stories"
    ],
    "pace": "medium",
    "pages": 262,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9346537-L.jpg"
  },
  {
    "slug": "ol-ol27258w",
    "title": "Neuromancer",
    "author": "William Gibson",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Cyberpunk",
    "moodProfile": {
      "intense": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "information superhighway",
      "computer hackers",
      "conspiracies",
      "open library staff picks"
    ],
    "pace": "fast",
    "pages": 317,
    "popularity": 0.79,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/283860-L.jpg"
  },
  {
    "slug": "ol-ol76835w",
    "title": "Deception Point",
    "author": "Dan Brown",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Techno-Thriller",
    "moodProfile": {
      "mysterious": 0.9,
      "intense": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "mystery fiction",
      "adventure fiction",
      "literature",
      "meteors"
    ],
    "pace": "fast",
    "pages": 559,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14553479-L.jpg"
  },
  {
    "slug": "ol-ol2172403w",
    "title": "The Man in the High Castle",
    "author": "Philip K. Dick",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Alternate History",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "mysterious": 0.75,
      "intense": 0.6
    },
    "themes": [
      "hugo award winner",
      "science fiction",
      "new york times bestseller"
    ],
    "pace": "medium",
    "pages": 258,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/420452-L.jpg"
  },
  {
    "slug": "ol-ol98454w",
    "title": "Cat's Cradle",
    "author": "Kurt Vonnegut",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Satirical Science Fiction",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "end of the world",
      "american fantasy fiction",
      "classic literature"
    ],
    "pace": "medium",
    "pages": 231,
    "popularity": 0.82,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12709654-L.jpg"
  },
  {
    "slug": "ol-ol3140822w",
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Southern Classic",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "fiction classics",
      "contemporary fiction",
      "racial segregation"
    ],
    "pace": "medium",
    "pages": 320,
    "popularity": 0.95,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14351077-L.jpg"
  },
  {
    "slug": "ol-ol5782000w",
    "title": "A Thousand Splendid Suns",
    "author": "Khaled Hosseini",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Family Saga",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "desertion",
      "sufism",
      "pashhtuns",
      "domestic abuse"
    ],
    "pace": "medium",
    "pages": 406,
    "popularity": 0.89,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8579790-L.jpg"
  },
  {
    "slug": "ol-ol11999891w",
    "title": "The Help",
    "author": "Kathryn Stockett",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "1960s Civil Rights",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "lightFun": 0.6,
      "cozy": 0.45
    },
    "themes": [
      "novels",
      "civil rights movements",
      "household employees"
    ],
    "pace": "medium",
    "pages": 479,
    "popularity": 0.87,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8387264-L.jpg"
  },
  {
    "slug": "ol-ol23166w",
    "title": "East of Eden",
    "author": "John Steinbeck",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Family Saga",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "migrant labor",
      "historical fiction",
      "domestic fiction",
      "depravity"
    ],
    "pace": "slow",
    "pages": 613,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11386937-L.jpg"
  },
  {
    "slug": "ol-ol66346w",
    "title": "Death of a Salesman",
    "author": "Arthur Miller",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Classic Play",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "flashback",
      "literary fiction",
      "death of a salesman",
      "play"
    ],
    "pace": "medium",
    "pages": 139,
    "popularity": 0.83,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9254686-L.jpg"
  },
  {
    "slug": "ol-ol1052133w",
    "title": "The God of Small Things",
    "author": "Arundhati Roy",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Contemporary Literary Fiction",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "literary fiction",
      "women's fiction",
      "dalit",
      "catholicism"
    ],
    "pace": "medium",
    "pages": 357,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10513792-L.jpg"
  },
  {
    "slug": "ol-ol2679341w",
    "title": "The Magicians",
    "author": "Lev Grossman",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Urban Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6,
      "intense": 0.45
    },
    "themes": [
      "college graduates",
      "college students",
      "magic"
    ],
    "pace": "medium",
    "pages": 416,
    "popularity": 0.82,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6294573-L.jpg"
  },
  {
    "slug": "ol-ol17797130w",
    "title": "A Gentleman in Moscow",
    "author": "Amor Towles",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Historical Fiction",
    "moodProfile": {
      "emotional": 0.9,
      "cozy": 0.75,
      "lightFun": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "historical fiction",
      "literary fiction",
      "political fiction",
      "home detention"
    ],
    "pace": "slow",
    "pages": 511,
    "popularity": 0.83,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11326818-L.jpg"
  },
  {
    "slug": "ol-ol81624w",
    "title": "Hearts in Atlantis",
    "author": "Stephen King",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Literary Fiction",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "mysterious": 0.6,
      "intense": 0.45
    },
    "themes": [
      "somatoform disorders",
      "penance",
      "dormitories",
      "hearts"
    ],
    "pace": "medium",
    "pages": 610,
    "popularity": 0.77,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8536326-L.jpg"
  },
  {
    "slug": "ol-ol81598w",
    "title": "Dreamcatcher",
    "author": "Stephen King",
    "language": "en",
    "genre": "horror",
    "subgenre": "Supernatural Horror",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "escapist": 0.6,
      "lightFun": 0.45
    },
    "themes": [
      "male friendship",
      "life on other planets",
      "telepathy",
      "down syndrome"
    ],
    "pace": "fast",
    "pages": 736,
    "popularity": 0.77,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14651654-L.jpg"
  },
  {
    "slug": "ol-ol893707w",
    "title": "Madame Bovary",
    "author": "Gustave Flaubert",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Classic Novel",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "literary fiction",
      "french literature",
      "adultery"
    ],
    "pace": "medium",
    "pages": 351,
    "popularity": 0.81,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12993424-L.jpg"
  },
  {
    "slug": "ol-ol278437w",
    "title": "The Shadow of the Wind",
    "author": "Carlos Ruiz Zafón",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Gothic Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "emotional": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "mothers and sons",
      "verschollenheit",
      "widowers"
    ],
    "pace": "medium",
    "pages": 528,
    "popularity": 0.8,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": null
  },
  {
    "slug": "ol-ol675722w",
    "title": "Oryx and Crake",
    "author": "Margaret Atwood",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Dystopian",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "mysterious": 0.75,
      "intense": 0.6
    },
    "themes": [
      "literary fiction",
      "friendship",
      "fantasy",
      "genetic engineering"
    ],
    "pace": "medium",
    "pages": 389,
    "popularity": 0.8,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12507658-L.jpg"
  },
  {
    "slug": "ol-ol2163628w",
    "title": "Dirk Gently’s Holistic Detective Agency",
    "author": "Douglas Adams",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Comic Science Fiction",
    "moodProfile": {
      "lightFun": 0.9,
      "mysterious": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "fantasy",
      "krimi",
      "abiogenesis",
      "laudanum"
    ],
    "pace": "medium",
    "pages": 278,
    "popularity": 0.78,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11465456-L.jpg"
  },
  {
    "slug": "ol-ol50565w",
    "title": "The Bluest Eye",
    "author": "Toni Morrison",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Contemporary Classic",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "foster care",
      "dick and jane",
      "flashback",
      "white anglo-saxon protestants"
    ],
    "pace": "medium",
    "pages": 181,
    "popularity": 0.76,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/15152696-L.jpg"
  },
  {
    "slug": "ol-ol16805415w",
    "title": "Americanah",
    "author": "Chimamanda Ngozi Adichie",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Contemporary Literary Fiction",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6,
      "lightFun": 0.45
    },
    "themes": [
      "nigerians",
      "immigrants",
      "refugees",
      "african-americans"
    ],
    "pace": "medium",
    "pages": 592,
    "popularity": 0.79,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8474037-L.jpg"
  },
  {
    "slug": "ol-ol453663w",
    "title": "Soul Music",
    "author": "Terry Pratchett",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Comic Fantasy",
    "moodProfile": {
      "lightFun": 0.9,
      "magical": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "fantasy",
      "ficción",
      "novela fantástica"
    ],
    "pace": "medium",
    "pages": 384,
    "popularity": 0.77,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14645780-L.jpg"
  },
  {
    "slug": "ol-ol50567w",
    "title": "Sula",
    "author": "Toni Morrison",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Contemporary Classic",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "african american women",
      "female friendship",
      "city and town life"
    ],
    "pace": "medium",
    "pages": 174,
    "popularity": 0.79,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8384008-L.jpg"
  },
  {
    "slug": "ol-ol65430w",
    "title": "The Awakening",
    "author": "Kate Chopin",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Classic Novel",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "adultery",
      "american literature",
      "classic literature",
      "criticism and interpretation"
    ],
    "pace": "medium",
    "pages": 214,
    "popularity": 0.78,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8750241-L.jpg"
  },
  {
    "slug": "ol-ol27420w",
    "title": "Blindness",
    "author": "José Saramago",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Allegorical Fiction",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "blind",
      "blindness",
      "modern literature"
    ],
    "pace": "medium",
    "pages": 352,
    "popularity": 0.79,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/115428-L.jpg"
  },
  {
    "slug": "ol-ol457179w",
    "title": "Midnight's Children",
    "author": "Salman Rushdie",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Magical Realism",
    "moodProfile": {
      "magical": 0.9,
      "emotional": 0.75,
      "thoughtProvoking": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "literary fiction",
      "telepathy",
      "epic literature",
      "epic fiction"
    ],
    "pace": "slow",
    "pages": 580,
    "popularity": 0.78,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8346713-L.jpg"
  },
  {
    "slug": "ol-ol5731542w",
    "title": "Half of a Yellow Sun",
    "author": "Chimamanda Ngozi Adichie",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "War Drama",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "literary fiction",
      "historical fiction",
      "political fiction",
      "war"
    ],
    "pace": "medium",
    "pages": 500,
    "popularity": 0.77,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8472660-L.jpg"
  },
  {
    "slug": "ol-ol8036957w",
    "title": "Snow Falling on Cedars",
    "author": "David Guterson",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Courtroom Drama",
    "moodProfile": {
      "emotional": 0.9,
      "mysterious": 0.75,
      "thoughtProvoking": 0.6,
      "cozy": 0.45
    },
    "themes": [
      "dear john letters",
      "internment camps",
      "strawberries",
      "attack on pearl harbor"
    ],
    "pace": "medium",
    "pages": 416,
    "popularity": 0.79,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13108904-L.jpg"
  },
  {
    "slug": "ol-ol2163715w",
    "title": "The Salmon of Doubt",
    "author": "Douglas Adams",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Essays",
    "moodProfile": {
      "lightFun": 0.9,
      "thoughtProvoking": 0.75
    },
    "themes": [
      "science fiction",
      "english essays",
      "english literature"
    ],
    "pace": "medium",
    "pages": 299,
    "popularity": 0.76,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9290943-L.jpg"
  },
  {
    "slug": "ol-ol3335245w",
    "title": "The Catcher in the Rye",
    "author": "J. D. Salinger",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Coming of Age",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "fictional works",
      "runaway teenagers",
      "adolescence"
    ],
    "pace": "medium",
    "pages": 240,
    "popularity": 0.95,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9273490-L.jpg"
  },
  {
    "slug": "ol-ol492640w",
    "title": "The Battle of the Labyrinth",
    "author": "Rick Riordan",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Mythological Adventure",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "greek mythology",
      "juvenile fiction",
      "monsters in fiction"
    ],
    "pace": "medium",
    "pages": 367,
    "popularity": 0.86,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6274739-L.jpg"
  },
  {
    "slug": "ol-ol15270622w",
    "title": "The Last Olympian",
    "author": "Rick Riordan",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Mythological Adventure",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "greek mythology",
      "monsters",
      "mythical animals"
    ],
    "pace": "medium",
    "pages": 381,
    "popularity": 0.87,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6624107-L.jpg"
  },
  {
    "slug": "ol-ol16142094w",
    "title": "Wonder",
    "author": "R. J. Palacio",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Contemporary Middle Grade",
    "moodProfile": {
      "emotional": 0.9,
      "cozy": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "health",
      "daily living",
      "mainstreaming",
      "craniofacial abnormalities"
    ],
    "pace": "medium",
    "pages": 368,
    "popularity": 0.91,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8223160-L.jpg"
  },
  {
    "slug": "ol-ol116250w",
    "title": "Holes",
    "author": "Louis Sachar",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Adventure Mystery",
    "moodProfile": {
      "escapist": 0.9,
      "mysterious": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "newbery medal",
      "fluch",
      "amistad"
    ],
    "pace": "fast",
    "pages": 240,
    "popularity": 0.89,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/19797-L.jpg"
  },
  {
    "slug": "ol-ol265426w",
    "title": "Looking for Alaska",
    "author": "John Green",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Contemporary Drama",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "boarding schools",
      "death",
      "grief"
    ],
    "pace": "medium",
    "pages": 288,
    "popularity": 0.86,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12614602-L.jpg"
  },
  {
    "slug": "ol-ol17714701w",
    "title": "The Hate U Give",
    "author": "Angie Thomas",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Contemporary Drama",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "black lives matter",
      "national book awards longlist",
      "race relations"
    ],
    "pace": "medium",
    "pages": 448,
    "popularity": 0.86,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11521588-L.jpg"
  },
  {
    "slug": "ol-ol5819884w",
    "title": "Brisingr",
    "author": "Christopher Paolini",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "juvenile fiction",
      "new york times bestseller",
      "fantasy"
    ],
    "pace": "slow",
    "pages": 784,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/2411585-L.jpg"
  },
  {
    "slug": "ol-ol5819886w",
    "title": "Eldest",
    "author": "Christopher Paolini",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "fantasy",
      "youths' writings",
      "dragons",
      "magic"
    ],
    "pace": "slow",
    "pages": 705,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12848701-L.jpg"
  },
  {
    "slug": "ol-ol5840870w",
    "title": "The Boy in the Striped Pyjamas",
    "author": "John Boyne",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Holocaust Fiction",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "naivety",
      "gas chambers",
      "commandants",
      "adventure"
    ],
    "pace": "medium",
    "pages": 216,
    "popularity": 0.81,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12720687-L.jpg"
  },
  {
    "slug": "ol-ol18020192w",
    "title": "The Hired Girl",
    "author": "Laura Amy Schlitz",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Young Adult Historical",
    "moodProfile": {
      "emotional": 0.9,
      "lightFun": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "women household employees",
      "diaries",
      "authorship",
      "farm life"
    ],
    "pace": "medium",
    "pages": 400,
    "popularity": 0.83,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11610624-L.jpg"
  },
  {
    "slug": "ol-ol17071448w",
    "title": "We Were Liars",
    "author": "E. Lockhart",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Mystery Drama",
    "moodProfile": {
      "emotional": 0.9,
      "mysterious": 0.75,
      "intense": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "love",
      "wealth",
      "juvenile fiction"
    ],
    "pace": "fast",
    "pages": 240,
    "popularity": 0.79,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14425312-L.jpg"
  },
  {
    "slug": "ol-ol465360w",
    "title": "Where the Red Fern Grows",
    "author": "Wilson Rawls",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Classic Boy-and-Dog Story",
    "moodProfile": {
      "emotional": 0.9,
      "cozy": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "social issues - friendship",
      "juvenile fiction",
      "social situations - adolescence",
      "social issues - adolescence"
    ],
    "pace": "medium",
    "pages": 249,
    "popularity": 0.83,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7996608-L.jpg"
  },
  {
    "slug": "ol-ol11822690w",
    "title": "Paper Towns",
    "author": "John Green",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Contemporary Mystery",
    "moodProfile": {
      "emotional": 0.9,
      "mysterious": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "coming of age",
      "missing persons",
      "mystery and detective stories"
    ],
    "pace": "medium",
    "pages": 367,
    "popularity": 0.81,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/5731773-L.jpg"
  },
  {
    "slug": "ol-ol264729w",
    "title": "Go Ask Alice",
    "author": "Beatrice Sparks",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Cautionary Diary",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "homelessness",
      "bad trips",
      "psychiatric hospitals",
      "child prostitution"
    ],
    "pace": "fast",
    "pages": 185,
    "popularity": 0.78,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8749018-L.jpg"
  },
  {
    "slug": "ol-ol17323489w",
    "title": "All the Bright Places",
    "author": "Jennifer Niven",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Contemporary Drama",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6,
      "cozy": 0.45
    },
    "themes": [
      "suicide",
      "friendship",
      "emotional problems"
    ],
    "pace": "medium",
    "pages": 402,
    "popularity": 0.8,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14559665-L.jpg"
  },
  {
    "slug": "ol-ol21084352w",
    "title": "Good Girl, Bad Blood",
    "author": "Holly Jackson",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Young Adult Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "young adult fiction",
      "thrillers & suspense",
      "crime\""
    ],
    "pace": "fast",
    "pages": 416,
    "popularity": 0.81,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11466695-L.jpg"
  },
  {
    "slug": "ol-ol21692056w",
    "title": "The Inheritance Games",
    "author": "Jennifer Lynn Barnes",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Young Adult Puzzle Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "escapist": 0.75,
      "lightFun": 0.6,
      "intense": 0.45
    },
    "themes": [
      "children's fiction",
      "new york times bestseller"
    ],
    "pace": "fast",
    "pages": 392,
    "popularity": 0.8,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10472357-L.jpg"
  },
  {
    "slug": "ol-ol24542623w",
    "title": "Better Than the Movies",
    "author": "Lynn Painter",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Young Adult Romance",
    "moodProfile": {
      "lightFun": 0.9,
      "cozy": 0.75,
      "emotional": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "children's fiction",
      "contemporary romance",
      "teen fiction",
      "young adult fiction"
    ],
    "pace": "medium",
    "pages": 368,
    "popularity": 0.81,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11182600-L.jpg"
  },
  {
    "slug": "ol-ol16282945w",
    "title": "Cinder",
    "author": "Marissa Meyer",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Fairy-tale Science Fiction",
    "moodProfile": {
      "escapist": 0.9,
      "magical": 0.75,
      "emotional": 0.6,
      "intense": 0.45
    },
    "themes": [
      "extraterrestrial beings",
      "social classes",
      "new york times bestseller",
      "overpopulation"
    ],
    "pace": "medium",
    "pages": 416,
    "popularity": 0.79,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6998634-L.jpg"
  },
  {
    "slug": "ol-ol17367560w",
    "title": "Heir of Fire",
    "author": "Sarah J. Maas",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "intense": 0.9,
      "magical": 0.75,
      "emotional": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "magic",
      "ya",
      "high fantasy"
    ],
    "pace": "medium",
    "pages": 576,
    "popularity": 0.77,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9318480-L.jpg"
  },
  {
    "slug": "ol-ol59801w",
    "title": "The Tombs of Atuan",
    "author": "Ursula K. Le Guin",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Coming-of-Age Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "mysterious": 0.75,
      "thoughtProvoking": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "magic",
      "novela fantástica estadounidense",
      "magic in fiction"
    ],
    "pace": "slow",
    "pages": 173,
    "popularity": 0.79,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6633403-L.jpg"
  },
  {
    "slug": "ol-ol16239519w",
    "title": "Shadow and Bone",
    "author": "Leigh Bardugo",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Young Adult Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "magic",
      "ability",
      "fantasy fiction",
      "orphans"
    ],
    "pace": "medium",
    "pages": 352,
    "popularity": 0.75,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13816048-L.jpg"
  },
  {
    "slug": "ol-ol29286w",
    "title": "Alanna",
    "author": "Tamora Pierce",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Young Adult Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6
    },
    "themes": [
      "song of the lioness",
      "tortall",
      "knights and knighthood"
    ],
    "pace": "medium",
    "pages": 241,
    "popularity": 0.77,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9256278-L.jpg"
  },
  {
    "slug": "ol-ol20716197w",
    "title": "The Ballad of Songbirds and Snakes",
    "author": "Suzanne Collins",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Dystopian",
    "moodProfile": {
      "intense": 0.9,
      "thoughtProvoking": 0.75,
      "emotional": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "snow",
      "panem",
      "hunger games",
      "new york times reviewed"
    ],
    "pace": "medium",
    "pages": 528,
    "popularity": 0.77,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14421833-L.jpg"
  },
  {
    "slug": "ol-ol1968368w",
    "title": "The 48 Laws of Power",
    "author": "Robert Greene",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Strategy",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75
    },
    "themes": [
      "business",
      "nonfiction",
      "self-improvement",
      "conduct of life"
    ],
    "pace": "medium",
    "pages": 452,
    "popularity": 0.95,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6424160-L.jpg"
  },
  {
    "slug": "ol-ol25312237w",
    "title": "Control Your Mind and Master Your Feelings",
    "author": "Eric Robertson",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Mindset",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "self-help",
      "personal development",
      "emotional intelligence",
      "mindfulness"
    ],
    "pace": "medium",
    "pages": 231,
    "popularity": 0.89,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12009823-L.jpg"
  },
  {
    "slug": "ol-ol21640039w",
    "title": "The Psychology of Money",
    "author": "Morgan Housel",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Money",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "money",
      "quality of life",
      "attitude change",
      "accounting"
    ],
    "pace": "medium",
    "pages": 288,
    "popularity": 0.88,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10389354-L.jpg"
  },
  {
    "slug": "ol-ol527464w",
    "title": "Think and Grow Rich",
    "author": "Napoleon Hill",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Success",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "wealth",
      "success",
      "filosofía",
      "success in business"
    ],
    "pace": "medium",
    "pages": 257,
    "popularity": 0.9,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14542536-L.jpg"
  },
  {
    "slug": "ol-ol1063267w",
    "title": "How to Win Friends and Influence People",
    "author": "Dale Carnegie",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Relationships",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "succès",
      "psychologie appliquée",
      "psychologie applique e.",
      "applied psychology"
    ],
    "pace": "medium",
    "pages": 283,
    "popularity": 0.88,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13314878-L.jpg"
  },
  {
    "slug": "ol-ol55806w",
    "title": "The Power of Your Subconscious Mind",
    "author": "Joseph Murphy",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Mindset",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "self-help",
      "psychology",
      "nonfiction",
      "personal development"
    ],
    "pace": "medium",
    "pages": 222,
    "popularity": 0.85,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6553019-L.jpg"
  },
  {
    "slug": "ol-ol1317211w",
    "title": "Meditations",
    "author": "Marcus Aurelius",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Stoic Philosophy",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "philosophy",
      "nonfiction",
      "classics",
      "self-help"
    ],
    "pace": "medium",
    "pages": 203,
    "popularity": 0.8,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/211529-L.jpg"
  },
  {
    "slug": "ol-ol8165007w",
    "title": "The Richest Man in Babylon",
    "author": "George S. Clason",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Money Parable",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "business ethics",
      "personal finance",
      "moral and ethical aspects",
      "wealth"
    ],
    "pace": "medium",
    "pages": 124,
    "popularity": 0.8,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10491331-L.jpg"
  },
  {
    "slug": "ol-ol17837119w",
    "title": "12 Rules for Life",
    "author": "Jordan B. Peterson",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Life Philosophy",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75,
      "intense": 0.6
    },
    "themes": [
      "conduct of life",
      "philosophy",
      "philosophy / social",
      "psychology / applied psychology"
    ],
    "pace": "medium",
    "pages": 480,
    "popularity": 0.79,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8131760-L.jpg"
  },
  {
    "slug": "ol-ol5727686w",
    "title": "The Power of Now",
    "author": "Eckhart Tolle",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Spirituality",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "religion & spirituality",
      "self-improvement",
      "open library staff picks",
      "new york times bestseller"
    ],
    "pace": "medium",
    "pages": 224,
    "popularity": 0.79,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/551262-L.jpg"
  },
  {
    "slug": "ol-ol25296570w",
    "title": "A Gentle Reminder",
    "author": "Bianca Sparacino",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Healing",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75
    },
    "themes": [
      "self-help",
      "personal development",
      "self-love",
      "self-care"
    ],
    "pace": "medium",
    "pages": 146,
    "popularity": 0.8,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14424196-L.jpg"
  },
  {
    "slug": "ol-ol27203w",
    "title": "The Four Agreements",
    "author": "Don Miguel Ruiz",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Spiritual Wisdom",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "conduct of life",
      "conduct of life.",
      "miscellanea",
      "toltec philosophy"
    ],
    "pace": "medium",
    "pages": 152,
    "popularity": 0.75,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/924521-L.jpg"
  },
  {
    "slug": "ol-ol2917168w",
    "title": "The Power of Positive Thinking",
    "author": "Norman Vincent Peale",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Mindset",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "applied psychology",
      "aspectos religiosos",
      "christianity",
      "conduct of life"
    ],
    "pace": "medium",
    "pages": 276,
    "popularity": 0.79,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14570194-L.jpg"
  },
  {
    "slug": "ol-ol5749849w",
    "title": "Blink",
    "author": "Malcolm Gladwell",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Psychology",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "intuition",
      "education",
      "recovery",
      "business"
    ],
    "pace": "medium",
    "pages": 295,
    "popularity": 0.77,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14421850-L.jpg"
  },
  {
    "slug": "ol-ol1906484w",
    "title": "The Magic of Thinking Big",
    "author": "David Joseph Schwartz",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Success",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "success",
      "success in business",
      "personal development",
      "motivation"
    ],
    "pace": "medium",
    "pages": 270,
    "popularity": 0.75,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/480539-L.jpg"
  },
  {
    "slug": "ol-ol1878267w",
    "title": "Emotional Intelligence",
    "author": "Daniel Goleman",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Psychology",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "emotions and cognition",
      "intellect",
      "emotions",
      "social aspects"
    ],
    "pace": "medium",
    "pages": 376,
    "popularity": 0.75,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/1359485-L.jpg"
  },
  {
    "slug": "ol-ol2003465w",
    "title": "Mindset",
    "author": "Carol S. Dweck",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Psychology",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "belief and doubt",
      "nonfiction",
      "psychological aspects",
      "psychological aspects of success"
    ],
    "pace": "medium",
    "pages": 288,
    "popularity": 0.74,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/746414-L.jpg"
  },
  {
    "slug": "ol-ol2392324w",
    "title": "Eat That Frog!",
    "author": "Brian Tracy",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Productivity",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "procrastination",
      "dilación",
      "time management",
      "berrett koehler"
    ],
    "pace": "medium",
    "pages": 128,
    "popularity": 0.75,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/847534-L.jpg"
  },
  {
    "slug": "ol-ol3902892w",
    "title": "Influence",
    "author": "Robert B. Cialdini",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Psychology",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "compliance",
      "nonfiction",
      "self-improvement",
      "sociale beïnvloeding"
    ],
    "pace": "medium",
    "pages": 287,
    "popularity": 0.75,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/431011-L.jpg"
  },
  {
    "slug": "ol-ol15839737w",
    "title": "The Secret",
    "author": "Rhonda Byrne",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Mindset",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "the law of attraction",
      "positive thinking",
      "new thought",
      "success"
    ],
    "pace": "medium",
    "pages": 216,
    "popularity": 0.75,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/845815-L.jpg"
  },
  {
    "slug": "ol-ol23746568w",
    "title": "101 Essays That Will Change The Way You Think",
    "author": "Brianna Wiest",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Essays",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "self-help",
      "self-improvement",
      "essays",
      "literary collections"
    ],
    "pace": "medium",
    "pages": 440,
    "popularity": 0.76,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10524689-L.jpg"
  },
  {
    "slug": "ol-ol1874705w",
    "title": "How to Talk to Anyone",
    "author": "Leil Lowndes",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Communication",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "interpersonal communication",
      "self-improvement",
      "body language",
      "nonfiction"
    ],
    "pace": "medium",
    "pages": 352,
    "popularity": 0.74,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/58950-L.jpg"
  },
  {
    "slug": "ol-ol276492w",
    "title": "The Monk Who Sold His Ferrari",
    "author": "Robin S. Sharma",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Inspirational Parable",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "self-realization",
      "conduct of life",
      "success"
    ],
    "pace": "medium",
    "pages": 216,
    "popularity": 0.75,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/48817-L.jpg"
  },
  {
    "slug": "ol-ol25436364w",
    "title": "The Mountain Is You",
    "author": "Brianna Wiest",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Healing",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75
    },
    "themes": [
      "self-help techniques",
      "mind and body",
      "self-defeating behavior",
      "self-realization"
    ],
    "pace": "medium",
    "pages": 248,
    "popularity": 0.73,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13838236-L.jpg"
  },
  {
    "slug": "ol-ol1892617w",
    "title": "A Brief History of Time",
    "author": "Stephen Hawking",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Popular Science",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "escapist": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "cosmologie",
      "espace-temps",
      "vulgarisation scientifique",
      "univers"
    ],
    "pace": "medium",
    "pages": 241,
    "popularity": 0.95,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10432365-L.jpg"
  },
  {
    "slug": "ol-ol278022w",
    "title": "Freakonomics",
    "author": "Steven D. Levitt",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Popular Economics",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "economics",
      "finance",
      "nonfiction",
      "sociology"
    ],
    "pace": "medium",
    "pages": 320,
    "popularity": 0.93,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11172914-L.jpg"
  },
  {
    "slug": "ol-ol16085155w",
    "title": "Steve Jobs",
    "author": "Walter Isaacson",
    "language": "en",
    "genre": "biography",
    "subgenre": "Biography",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "escapist": 0.75,
      "intense": 0.6
    },
    "themes": [
      "history",
      "inc apple computer",
      "computer engineers",
      "businesspeople"
    ],
    "pace": "slow",
    "pages": 664,
    "popularity": 0.92,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12374726-L.jpg"
  },
  {
    "slug": "ol-ol827357w",
    "title": "Zen and the Art of Motorcycle Maintenance",
    "author": "Robert M. Pirsig",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Philosophy",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "escapist": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "biography",
      "description and travel",
      "fathers and sons",
      "journeys"
    ],
    "pace": "medium",
    "pages": 421,
    "popularity": 0.89,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10673266-L.jpg"
  },
  {
    "slug": "ol-ol16015154w",
    "title": "The Power of Habit",
    "author": "Charles Duhigg",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Psychology",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "social aspects",
      "habit",
      "new york times bestseller",
      "popular works"
    ],
    "pace": "medium",
    "pages": 404,
    "popularity": 0.91,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9078085-L.jpg"
  },
  {
    "slug": "ol-ol273184w",
    "title": "The Intelligent Investor",
    "author": "Benjamin Graham",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Investing",
    "moodProfile": {
      "thoughtProvoking": 0.9
    },
    "themes": [
      "securities",
      "investments",
      "investing",
      "value investing"
    ],
    "pace": "medium",
    "pages": 360,
    "popularity": 0.9,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/36434-L.jpg"
  },
  {
    "slug": "ol-ol1822313w",
    "title": "Tuesdays with Morrie",
    "author": "Mitch Albom",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "memoir",
      "als",
      "sociology",
      "nightline"
    ],
    "pace": "medium",
    "pages": 199,
    "popularity": 0.85,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12560417-L.jpg"
  },
  {
    "slug": "ol-ol74128w",
    "title": "A Short History of Nearly Everything",
    "author": "Bill Bryson",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Popular Science",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "science",
      "popular works",
      "ciencia",
      "obras populares"
    ],
    "pace": "medium",
    "pages": 592,
    "popularity": 0.87,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12725620-L.jpg"
  },
  {
    "slug": "ol-ol26663382w",
    "title": "I'm Glad My Mom Died",
    "author": "Jennette McCurdy",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "lightFun": 0.75,
      "intense": 0.6
    },
    "themes": [
      "new york times bestseller",
      "family & relationships",
      "biography & autobiography",
      "entertainment & performing arts"
    ],
    "pace": "medium",
    "pages": 320,
    "popularity": 0.85,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12855985-L.jpg"
  },
  {
    "slug": "ol-ol1974546w",
    "title": "Into the Wild",
    "author": "Jon Krakauer",
    "language": "en",
    "genre": "biography",
    "subgenre": "Adventure Biography",
    "moodProfile": {
      "escapist": 0.9,
      "emotional": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "adventure and adventurers",
      "travelers",
      "journeys",
      "wayfaring life"
    ],
    "pace": "medium",
    "pages": 284,
    "popularity": 0.86,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/1377482-L.jpg"
  },
  {
    "slug": "ol-ol5749848w",
    "title": "The Tipping Point",
    "author": "Malcolm Gladwell",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Popular Psychology",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "business",
      "causation",
      "nonfiction",
      "social psychology"
    ],
    "pace": "medium",
    "pages": 288,
    "popularity": 0.87,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10873292-L.jpg"
  },
  {
    "slug": "ol-ol14856842w",
    "title": "Night",
    "author": "Elie Wiesel",
    "language": "en",
    "genre": "biography",
    "subgenre": "Holocaust Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "holocaust literature",
      "death marches",
      "talmud",
      "siege of jerusalem"
    ],
    "pace": "medium",
    "pages": 135,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": null
  },
  {
    "slug": "ol-ol1968364w",
    "title": "The Art of Seduction",
    "author": "Robert Greene",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Psychology",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "mysterious": 0.75
    },
    "themes": [
      "courtship",
      "seduction",
      "sexual excitement",
      "sex instruction"
    ],
    "pace": "medium",
    "pages": 467,
    "popularity": 0.89,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/917840-L.jpg"
  },
  {
    "slug": "ol-ol81605w",
    "title": "Danse Macabre",
    "author": "Stephen King",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Horror Criticism",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "mysterious": 0.75,
      "intense": 0.6
    },
    "themes": [
      "the fog",
      "the stand",
      "ghost story",
      "the house next door"
    ],
    "pace": "medium",
    "pages": 479,
    "popularity": 0.88,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8443662-L.jpg"
  },
  {
    "slug": "ol-ol46760w",
    "title": "The Glass Castle",
    "author": "Jeannette Walls",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6,
      "intense": 0.45
    },
    "themes": [
      "poor",
      "problem families",
      "dysfunctional families",
      "homeless persons"
    ],
    "pace": "medium",
    "pages": 347,
    "popularity": 0.81,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11517692-L.jpg"
  },
  {
    "slug": "ol-ol3353439w",
    "title": "The 4-Hour Workweek",
    "author": "Timothy Ferriss",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Lifestyle Design",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "business",
      "finance",
      "new york times bestseller",
      "nonfiction"
    ],
    "pace": "medium",
    "pages": 341,
    "popularity": 0.87,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/539652-L.jpg"
  },
  {
    "slug": "ol-ol74123w",
    "title": "A Walk in the Woods",
    "author": "Bill Bryson",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Travel Humor",
    "moodProfile": {
      "lightFun": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "description and travel",
      "natural history",
      "travel",
      "journeys"
    ],
    "pace": "medium",
    "pages": 328,
    "popularity": 0.84,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12722649-L.jpg"
  },
  {
    "slug": "ol-ol1811898w",
    "title": "The Man Who Mistook His Wife for a Hat",
    "author": "Oliver Sacks",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Neuroscience",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "neurology -",
      "anecdotes",
      "neurology",
      "nervous system"
    ],
    "pace": "medium",
    "pages": 308,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6986188-L.jpg"
  },
  {
    "slug": "ol-ol20262w",
    "title": "The Devil in the White City",
    "author": "Erik Larson",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "True Crime History",
    "moodProfile": {
      "mysterious": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "social life and customs",
      "murder",
      "open library staff picks",
      "serial murders"
    ],
    "pace": "medium",
    "pages": 496,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/541027-L.jpg"
  },
  {
    "slug": "ol-ol3348011w",
    "title": "Kitchen Confidential",
    "author": "Anthony Bourdain",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "lightFun": 0.9,
      "intense": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "cooks",
      "cocineros",
      "history",
      "new york times bestseller"
    ],
    "pace": "medium",
    "pages": 320,
    "popularity": 0.82,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/843879-L.jpg"
  },
  {
    "slug": "ol-ol71056w",
    "title": "Mere Christianity",
    "author": "C. S. Lewis",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Religion",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "apologetics",
      "doctrinal theology",
      "popular works",
      "christianity"
    ],
    "pace": "medium",
    "pages": 191,
    "popularity": 0.81,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6538891-L.jpg"
  },
  {
    "slug": "ol-ol20080323w",
    "title": "Permanent Record",
    "author": "Edward Snowden",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "government information",
      "whistle blowing",
      "officials and employees",
      "united states"
    ],
    "pace": "medium",
    "pages": 352,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8751316-L.jpg"
  },
  {
    "slug": "ol-ol80021w",
    "title": "I Know Why the Caged Bird Sings",
    "author": "Maya Angelou",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "social life and customs",
      "entertainers",
      "intellectual life",
      "african american families"
    ],
    "pace": "medium",
    "pages": 281,
    "popularity": 0.81,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9367075-L.jpg"
  },
  {
    "slug": "ol-ol1503145w",
    "title": "Island of the Blue Dolphins",
    "author": "Scott O’Dell",
    "language": "en",
    "genre": "adventure",
    "subgenre": "Survival Adventure",
    "moodProfile": {
      "escapist": 0.9,
      "intense": 0.75,
      "emotional": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "children's fiction",
      "indians of north america",
      "islands"
    ],
    "pace": "medium",
    "pages": 184,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/5021868-L.jpg"
  },
  {
    "slug": "ol-ol263458w",
    "title": "Men are From Mars, Women are From Venus",
    "author": "John Gray",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Relationships",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "communication",
      "interpersonal relations",
      "family & relationships",
      "marriage"
    ],
    "pace": "medium",
    "pages": 321,
    "popularity": 0.83,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10991-L.jpg"
  },
  {
    "slug": "ol-ol81631w",
    "title": "Pet Sematary",
    "author": "Stephen King",
    "language": "en",
    "genre": "horror",
    "subgenre": "Supernatural Horror",
    "moodProfile": {
      "intense": 0.9,
      "emotional": 0.75,
      "mysterious": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "thrillers",
      "suspense",
      "horror"
    ],
    "pace": "fast",
    "pages": 423,
    "popularity": 0.95,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12015500-L.jpg"
  },
  {
    "slug": "ol-ol81629w",
    "title": "The Green Mile",
    "author": "Stephen King",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Supernatural Drama",
    "moodProfile": {
      "emotional": 0.9,
      "mysterious": 0.75,
      "thoughtProvoking": 0.6,
      "intense": 0.45
    },
    "themes": [
      "horror fiction",
      "death row inmates",
      "prisons"
    ],
    "pace": "medium",
    "pages": 465,
    "popularity": 0.9,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9334567-L.jpg"
  },
  {
    "slug": "ol-ol16804661w",
    "title": "The Ocean at the End of the Lane",
    "author": "Neil Gaiman",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Dark Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "emotional": 0.75,
      "mysterious": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "good and evil",
      "boys",
      "women",
      "magic"
    ],
    "pace": "medium",
    "pages": 224,
    "popularity": 0.91,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7258156-L.jpg"
  },
  {
    "slug": "ol-ol679333w",
    "title": "Neverwhere",
    "author": "Neil Gaiman",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Urban Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "mysterious": 0.6,
      "lightFun": 0.45
    },
    "themes": [
      "underground areas",
      "underground homeless persons",
      "businessmen"
    ],
    "pace": "medium",
    "pages": 388,
    "popularity": 0.92,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/1008998-L.jpg"
  },
  {
    "slug": "ol-ol77826w",
    "title": "Interview With the Vampire",
    "author": "Anne Rice",
    "language": "en",
    "genre": "horror",
    "subgenre": "Gothic Horror",
    "moodProfile": {
      "emotional": 0.9,
      "mysterious": 0.75,
      "intense": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "gothic horror",
      "vampire literature",
      "vampires",
      "translations into spanish"
    ],
    "pace": "medium",
    "pages": 349,
    "popularity": 0.89,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8401488-L.jpg"
  },
  {
    "slug": "ol-ol134834w",
    "title": "Flowers in the Attic",
    "author": "V.C. Andrews",
    "language": "en",
    "genre": "horror",
    "subgenre": "Gothic Horror",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "gothic fiction",
      "psychological thriller",
      "coming of age",
      "classics"
    ],
    "pace": "medium",
    "pages": 411,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14598487-L.jpg"
  },
  {
    "slug": "ol-ol2577486w",
    "title": "Blood of Elves",
    "author": "Andrzej Sapkowski",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "fantasy",
      "assassins",
      "polish fantasy fiction"
    ],
    "pace": "medium",
    "pages": 379,
    "popularity": 0.87,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": null
  },
  {
    "slug": "ol-ol453661w",
    "title": "Pyramids",
    "author": "Terry Pratchett",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Comic Fantasy",
    "moodProfile": {
      "lightFun": 0.9,
      "magical": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "american fantasy fiction",
      "fantasy",
      "pyramids"
    ],
    "pace": "medium",
    "pages": 366,
    "popularity": 0.84,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14646151-L.jpg"
  },
  {
    "slug": "ol-ol3171087w",
    "title": "We Have Always Lived in the Castle",
    "author": "Shirley Jackson",
    "language": "en",
    "genre": "horror",
    "subgenre": "Gothic Horror",
    "moodProfile": {
      "mysterious": 0.9,
      "emotional": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "mystery",
      "first-person narrative",
      "literature"
    ],
    "pace": "medium",
    "pages": 187,
    "popularity": 0.85,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11545332-L.jpg"
  },
  {
    "slug": "ol-ol32195w",
    "title": "House of Leaves",
    "author": "Mark Z. Danielewski",
    "language": "en",
    "genre": "horror",
    "subgenre": "Experimental Horror",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "thoughtProvoking": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "holes",
      "documentary films",
      "manuscripts"
    ],
    "pace": "slow",
    "pages": 736,
    "popularity": 0.85,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6450442-L.jpg"
  },
  {
    "slug": "ol-ol20128158w",
    "title": "Gideon the Ninth",
    "author": "Tamsyn Muir",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Gothic Science Fantasy",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "lightFun": 0.6,
      "magical": 0.45
    },
    "themes": [
      "paranormal",
      "necromancy",
      "women authors",
      "lesbians"
    ],
    "pace": "fast",
    "pages": 440,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10139515-L.jpg"
  },
  {
    "slug": "ol-ol23481w",
    "title": "The Silence of the Lambs",
    "author": "Thomas Harris",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Psychological Thriller",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "thoughtProvoking": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "lambs",
      "black witch moth",
      "autopsy",
      "pupa"
    ],
    "pace": "fast",
    "pages": 352,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8580475-L.jpg"
  },
  {
    "slug": "ol-ol28319w",
    "title": "The Stepford Wives",
    "author": "Ira Levin",
    "language": "en",
    "genre": "horror",
    "subgenre": "Satirical Horror",
    "moodProfile": {
      "mysterious": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6,
      "lightFun": 0.45
    },
    "themes": [
      "horror tales",
      "conspiracy",
      "photographers",
      "satire"
    ],
    "pace": "fast",
    "pages": 159,
    "popularity": 0.78,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8409254-L.jpg"
  },
  {
    "slug": "ol-ol72352w",
    "title": "Welcome to Dead House",
    "author": "Robert Lawrence Stine",
    "language": "en",
    "genre": "horror",
    "subgenre": "Children's Horror",
    "moodProfile": {
      "intense": 0.9,
      "lightFun": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "horror tales",
      "juvenile fiction",
      "haunted houses",
      "horror stories"
    ],
    "pace": "fast",
    "pages": 144,
    "popularity": 0.8,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11290170-L.jpg"
  },
  {
    "slug": "ol-ol453707w",
    "title": "Interesting Times",
    "author": "Terry Pratchett",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Comic Fantasy",
    "moodProfile": {
      "lightFun": 0.9,
      "magical": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "fantasy fiction",
      "fantasy",
      "drama"
    ],
    "pace": "medium",
    "pages": 352,
    "popularity": 0.83,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14646167-L.jpg"
  },
  {
    "slug": "ol-ol46913w",
    "title": "Congo",
    "author": "Michael Crichton",
    "language": "en",
    "genre": "adventure",
    "subgenre": "Techno-Thriller Adventure",
    "moodProfile": {
      "escapist": 0.9,
      "intense": 0.75,
      "mysterious": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "kakundakari",
      "type iib",
      "diamonds",
      "thrillers"
    ],
    "pace": "fast",
    "pages": 348,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10653144-L.jpg"
  },
  {
    "slug": "ol-ol77828w",
    "title": "The Queen of the Damned",
    "author": "Anne Rice",
    "language": "en",
    "genre": "horror",
    "subgenre": "Gothic Horror",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "emotional": 0.6,
      "magical": 0.45
    },
    "themes": [
      "vampires",
      "horror tales",
      "horror"
    ],
    "pace": "medium",
    "pages": 573,
    "popularity": 0.8,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9255774-L.jpg"
  },
  {
    "slug": "ol-ol17864836w",
    "title": "Tender Is the Flesh",
    "author": "Agustina Bazterrica",
    "language": "en",
    "genre": "horror",
    "subgenre": "Dystopian Horror",
    "moodProfile": {
      "intense": 0.9,
      "thoughtProvoking": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "romance literature",
      "new york times reviewed",
      "dystopias",
      "dystopies"
    ],
    "pace": "fast",
    "pages": 228,
    "popularity": 0.81,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": null
  },
  {
    "slug": "ol-ol17793648w",
    "title": "Five Nights at Freddy's: The Silver Eyes",
    "author": "Scott Cawthon",
    "language": "en",
    "genre": "horror",
    "subgenre": "Young Adult Horror",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "horror",
      "psychology",
      "murder",
      "animatronics"
    ],
    "pace": "fast",
    "pages": 396,
    "popularity": 0.87,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8075533-L.jpg"
  },
  {
    "slug": "ol-ol927199w",
    "title": "The Exorcist",
    "author": "William Peter Blatty",
    "language": "en",
    "genre": "horror",
    "subgenre": "Supernatural Horror",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "emotional": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "horror",
      "horror fiction",
      "demonic possession"
    ],
    "pace": "medium",
    "pages": 400,
    "popularity": 0.76,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12715730-L.jpg"
  },
  {
    "slug": "ol-ol23480w",
    "title": "Red Dragon",
    "author": "Thomas Harris",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Crime Thriller",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "novel",
      "psychiatrists",
      "cannibalism",
      "serial killers"
    ],
    "pace": "fast",
    "pages": 373,
    "popularity": 0.8,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6997898-L.jpg"
  },
  {
    "slug": "ol-ol20036652w",
    "title": "The Butterfly Garden",
    "author": "Dot Hutchison",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Crime Thriller",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "kidnapping victims",
      "missing persons",
      "kidnapping",
      "investigation"
    ],
    "pace": "fast",
    "pages": 304,
    "popularity": 0.72,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11576000-L.jpg"
  },
  {
    "slug": "ol-ol28954802w",
    "title": "The Locked Door",
    "author": "Freida McFadden",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Psychological Thriller",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75
    },
    "themes": [
      "thriller",
      "mystery",
      "mystery thriller"
    ],
    "pace": "fast",
    "pages": 312,
    "popularity": 0.74,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13156268-L.jpg"
  },
  {
    "slug": "ol-ol276798w",
    "title": "Catch-22",
    "author": "Joseph Heller",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "War Satire",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75,
      "emotional": 0.6,
      "intense": 0.45
    },
    "themes": [
      "open library staff picks",
      "satire",
      "war stories"
    ],
    "pace": "medium",
    "pages": 463,
    "popularity": 0.95,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6468653-L.jpg"
  },
  {
    "slug": "ol-ol16509148w",
    "title": "The Song of Achilles",
    "author": "Madeline Miller",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Mythological Retelling",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "magical": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "trojan war",
      "male friendship",
      "gay love"
    ],
    "pace": "medium",
    "pages": 386,
    "popularity": 0.91,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7098465-L.jpg"
  },
  {
    "slug": "ol-ol14873315w",
    "title": "The Lost Symbol",
    "author": "Dan Brown",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Conspiracy Thriller",
    "moodProfile": {
      "mysterious": 0.9,
      "intense": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "suspense & thriller",
      "historical fiction",
      "aventures",
      "kidnapping"
    ],
    "pace": "fast",
    "pages": 604,
    "popularity": 0.88,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8373389-L.jpg"
  },
  {
    "slug": "ol-ol1846074w",
    "title": "Number the Stars",
    "author": "Lois Lowry",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Children's Historical",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "friendship",
      "rescue",
      "jews"
    ],
    "pace": "medium",
    "pages": 147,
    "popularity": 0.89,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13249599-L.jpg"
  },
  {
    "slug": "ol-ol66347w",
    "title": "The Crucible",
    "author": "Arthur Miller",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Classic Play",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "fiction classics",
      "literary criticism",
      "historical fiction",
      "witchcraft trials"
    ],
    "pace": "medium",
    "pages": 151,
    "popularity": 0.87,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8431392-L.jpg"
  },
  {
    "slug": "ol-ol1856675w",
    "title": "Memoirs of a Geisha",
    "author": "Arthur Golden",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Historical Fiction",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "social life and customs",
      "literature",
      "open library staff picks",
      "prostitution"
    ],
    "pace": "medium",
    "pages": 512,
    "popularity": 0.88,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8231782-L.jpg"
  },
  {
    "slug": "ol-ol50548w",
    "title": "Beloved",
    "author": "Toni Morrison",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Gothic Historical",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "african american history",
      "ohio",
      "history"
    ],
    "pace": "medium",
    "pages": 321,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8261367-L.jpg"
  },
  {
    "slug": "ol-ol482454w",
    "title": "Cloud Atlas",
    "author": "David Mitchell",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Literary Science Fiction",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "mysterious": 0.75,
      "escapist": 0.6
    },
    "themes": [
      "fate and fatalism",
      "reincarnation",
      "fantasy"
    ],
    "pace": "medium",
    "pages": 537,
    "popularity": 0.87,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6714077-L.jpg"
  },
  {
    "slug": "ol-ol2746369w",
    "title": "The Clan of the Cave Bear",
    "author": "Jean M. Auel",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Prehistoric Fiction",
    "moodProfile": {
      "escapist": 0.9,
      "emotional": 0.75,
      "intense": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "neanderthals",
      "shamanism",
      "sign language",
      "taboos"
    ],
    "pace": "slow",
    "pages": 524,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12529015-L.jpg"
  },
  {
    "slug": "ol-ol3261155w",
    "title": "Outlander",
    "author": "Diana Gabaldon",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Time-Travel Historical",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "intense": 0.6
    },
    "themes": [
      "historical fiction",
      "history",
      "scotland in fiction"
    ],
    "pace": "slow",
    "pages": 672,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14428230-L.jpg"
  },
  {
    "slug": "ol-ol274518w",
    "title": "Love in the Time of Cholera",
    "author": "Gabriel García Márquez",
    "language": "en",
    "genre": "romance",
    "subgenre": "Literary Romance",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "vida familiar",
      "family life",
      "historias de amor",
      "love stories"
    ],
    "pace": "medium",
    "pages": 451,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": null
  },
  {
    "slug": "ol-ol27778127w",
    "title": "Their Eyes Were Watching God",
    "author": "Zora Neale Hurston",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Classic Novel",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75
    },
    "themes": [
      "african american women",
      "psychology",
      "self-realization"
    ],
    "pace": "medium",
    "pages": 231,
    "popularity": 0.82,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12752055-L.jpg"
  },
  {
    "slug": "ol-ol471603w",
    "title": "The Mystery of the Blue Train",
    "author": "Agatha Christie",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Golden Age Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "escapist": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "crimes against",
      "detective and mystery stories",
      "divorce",
      "divorce in fiction"
    ],
    "pace": "medium",
    "pages": 257,
    "popularity": 0.77,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14575533-L.jpg"
  },
  {
    "slug": "ol-ol62979w",
    "title": "The Sun Also Rises",
    "author": "Ernest Hemingway",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Lost Generation Classic",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75
    },
    "themes": [
      "americans",
      "history",
      "american literature"
    ],
    "pace": "medium",
    "pages": 249,
    "popularity": 0.79,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/78741-L.jpg"
  },
  {
    "slug": "ol-ol1855944w",
    "title": "Atonement",
    "author": "Ian McEwan",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "WWII Drama",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "mysterious": 0.6,
      "intense": 0.45
    },
    "themes": [
      "historical romance",
      "dunkirk evacuation",
      "psychological fiction",
      "teenage girls"
    ],
    "pace": "medium",
    "pages": 384,
    "popularity": 0.82,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8381043-L.jpg"
  },
  {
    "slug": "ol-ol471940w",
    "title": "Poirot Investigates",
    "author": "Agatha Christie",
    "language": "en",
    "genre": "mysteryThriller",
    "subgenre": "Golden Age Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "cozy": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "private investigators",
      "belgians",
      "detective and mystery stories"
    ],
    "pace": "medium",
    "pages": 192,
    "popularity": 0.73,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13670505-L.jpg"
  },
  {
    "slug": "ol-ol17332803w",
    "title": "A Darker Shade of Magic",
    "author": "V. E. Schwab",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Parallel-World Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "quantum theory",
      "magic",
      "magic - fiction"
    ],
    "pace": "medium",
    "pages": 400,
    "popularity": 0.82,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7410930-L.jpg"
  },
  {
    "slug": "ol-ol74664w",
    "title": "The Plot Against America",
    "author": "Philip Roth",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Alternate History",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "fiction - general",
      "historical - general",
      "political"
    ],
    "pace": "medium",
    "pages": 400,
    "popularity": 0.81,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8349176-L.jpg"
  },
  {
    "slug": "ol-ol2941508w",
    "title": "The Secret Life of Bees",
    "author": "Sue Monk Kidd",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Coming of Age",
    "moodProfile": {
      "emotional": 0.9,
      "cozy": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "teenage girls",
      "african american women",
      "beekeepers"
    ],
    "pace": "medium",
    "pages": 303,
    "popularity": 0.81,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/402759-L.jpg"
  },
  {
    "slug": "ol-ol5813796w",
    "title": "Water for Elephants",
    "author": "Sara Gruen",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Circus Drama",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "circus performers",
      "depression era",
      "historical"
    ],
    "pace": "medium",
    "pages": 355,
    "popularity": 0.82,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/6690864-L.jpg"
  },
  {
    "slug": "ol-ol784051w",
    "title": "Esperanza Rising",
    "author": "Pam Muñoz Ryan",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Young Adult Historical",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "agricultural laborers",
      "juvenile works",
      "juvenile fiction"
    ],
    "pace": "medium",
    "pages": 262,
    "popularity": 0.8,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/275937-L.jpg"
  },
  {
    "slug": "ol-ol17619932w",
    "title": "The Underground Railroad",
    "author": "Colson Whitehead",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Alternate Slavery History",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "history",
      "underground railroad",
      "fugitive slaves"
    ],
    "pace": "medium",
    "pages": 378,
    "popularity": 0.82,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7899016-L.jpg"
  },
  {
    "slug": "ol-ol98491w",
    "title": "The Age of Innocence",
    "author": "Edith Wharton",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Classic Novel",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75
    },
    "themes": [
      "upper class",
      "married people",
      "separated people"
    ],
    "pace": "medium",
    "pages": 348,
    "popularity": 0.81,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11196262-L.jpg"
  },
  {
    "slug": "ol-ol21435w",
    "title": "Redeeming Love",
    "author": "Francine Rivers",
    "language": "en",
    "genre": "romance",
    "subgenre": "Christian Romance",
    "moodProfile": {
      "emotional": 0.9,
      "cozy": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "prostitutes in fiction",
      "frontier and pioneer life",
      "prostitutes"
    ],
    "pace": "medium",
    "pages": 474,
    "popularity": 0.8,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8272833-L.jpg"
  },
  {
    "slug": "ol-ol16465449w",
    "title": "The One and Only Ivan",
    "author": "Katherine Applegate",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Animal Middle Grade",
    "moodProfile": {
      "emotional": 0.9,
      "cozy": 0.75,
      "thoughtProvoking": 0.6,
      "lightFun": 0.45
    },
    "themes": [
      "animals",
      "elephants",
      "gorilla"
    ],
    "pace": "medium",
    "pages": 322,
    "popularity": 0.81,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12656488-L.jpg"
  },
  {
    "slug": "ol-ol18108064w",
    "title": "Can't Hurt Me",
    "author": "David Goggins",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "new york times bestseller",
      "triathlon",
      "endurance sports",
      "self-realization"
    ],
    "pace": "medium",
    "pages": 364,
    "popularity": 0.95,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8305903-L.jpg"
  },
  {
    "slug": "ol-ol81601w",
    "title": "On Writing",
    "author": "Stephen King",
    "language": "en",
    "genre": "biography",
    "subgenre": "Writing Memoir",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "writing",
      "salem’s lot",
      "science fiction",
      "happy stamps"
    ],
    "pace": "medium",
    "pages": 288,
    "popularity": 0.87,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9255939-L.jpg"
  },
  {
    "slug": "ol-ol158041w",
    "title": "Fear and Loathing in Las Vegas",
    "author": "Hunter S. Thompson",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Gonzo Journalism",
    "moodProfile": {
      "lightFun": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "comedy",
      "journalists",
      "biography",
      "drug abuse"
    ],
    "pace": "medium",
    "pages": 206,
    "popularity": 0.87,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/13396-L.jpg"
  },
  {
    "slug": "ol-ol1037811w",
    "title": "Wings of Fire",
    "author": "A. P. J. Abdul Kalam",
    "language": "en",
    "genre": "biography",
    "subgenre": "Autobiography",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "escapist": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "biography",
      "presidents",
      "scientists"
    ],
    "pace": "medium",
    "pages": 180,
    "popularity": 0.89,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9153819-L.jpg"
  },
  {
    "slug": "ol-ol63072w",
    "title": "A Farewell to Arms",
    "author": "Ernest Hemingway",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "WWI Drama",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "cuentos de guerra",
      "open library staff picks",
      "campaigns"
    ],
    "pace": "medium",
    "pages": 332,
    "popularity": 0.84,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7226599-L.jpg"
  },
  {
    "slug": "ol-ol18819818w",
    "title": "Never Split the Difference",
    "author": "Chris Voss",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Negotiation",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75
    },
    "themes": [
      "negotiation",
      "negotiation in business",
      "business communication",
      "business"
    ],
    "pace": "medium",
    "pages": 288,
    "popularity": 0.86,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8365942-L.jpg"
  },
  {
    "slug": "ol-ol1938043w",
    "title": "Fear No Evil",
    "author": "Anatoly Shcharansky",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "biography",
      "civil rights",
      "imprisonment",
      "jews"
    ],
    "pace": "medium",
    "pages": 437,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9156872-L.jpg"
  },
  {
    "slug": "ol-ol13850788w",
    "title": "The Immortal Life of Henrietta Lacks",
    "author": "Rebecca Skloot",
    "language": "en",
    "genre": "biography",
    "subgenre": "Science Biography",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75
    },
    "themes": [
      "cancer",
      "cell culture",
      "research",
      "patients"
    ],
    "pace": "medium",
    "pages": 381,
    "popularity": 0.81,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8364866-L.jpg"
  },
  {
    "slug": "ol-ol2693077w",
    "title": "Me Talk Pretty One Day",
    "author": "David Sedaris",
    "language": "en",
    "genre": "biography",
    "subgenre": "Humor Essays",
    "moodProfile": {
      "lightFun": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "david sedaris",
      "teens",
      "teenagers",
      "ya"
    ],
    "pace": "medium",
    "pages": 272,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8567510-L.jpg"
  },
  {
    "slug": "ol-ol3946622w",
    "title": "The Book of Five Rings",
    "author": "Miyamoto Musashi",
    "language": "en",
    "genre": "selfDevelopment",
    "subgenre": "Strategy Philosophy",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75
    },
    "themes": [
      "biography",
      "bushido",
      "ciencia militar",
      "kendo"
    ],
    "pace": "medium",
    "pages": 124,
    "popularity": 0.8,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/15218876-L.jpg"
  },
  {
    "slug": "ol-ol17201654w",
    "title": "Between the World and Me",
    "author": "Ta-Nehisi Coates",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "race discrimination",
      "african americans",
      "race relations",
      "whites"
    ],
    "pace": "medium",
    "pages": 156,
    "popularity": 0.81,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11328078-L.jpg"
  },
  {
    "slug": "ol-ol17356252w",
    "title": "When Breath Becomes Air",
    "author": "Paul Kalanithi",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "philosophy",
      "neurosurgeons",
      "cancer",
      "lungs"
    ],
    "pace": "medium",
    "pages": 232,
    "popularity": 0.8,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11463139-L.jpg"
  },
  {
    "slug": "ol-ol17357665w",
    "title": "Hillbilly Elegy",
    "author": "J. D. Vance",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75,
      "intense": 0.6
    },
    "themes": [
      "mountain people",
      "family",
      "social mobility",
      "working class whites"
    ],
    "pace": "medium",
    "pages": 272,
    "popularity": 0.8,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14846900-L.jpg"
  },
  {
    "slug": "ol-ol810991w",
    "title": "Paradise Lost",
    "author": "John Milton",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Epic Poem",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "magical": 0.6
    },
    "themes": [
      "bible",
      "biography",
      "criticism and interpretation",
      "devil"
    ],
    "pace": "slow",
    "pages": 333,
    "popularity": 0.79,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/5992814-L.jpg"
  },
  {
    "slug": "ol-ol93082w",
    "title": "The Divine Comedy",
    "author": "Dante Alighieri",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Epic Poem",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "mysterious": 0.6,
      "magical": 0.45
    },
    "themes": [
      "literatura",
      "portraits",
      "paradise",
      "poetry"
    ],
    "pace": "slow",
    "pages": 503,
    "popularity": 0.77,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": null
  },
  {
    "slug": "ol-ol1974548w",
    "title": "Into Thin Air",
    "author": "Jon Krakauer",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Mountaineering",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "history",
      "mountaineering expeditions",
      "open library staff picks",
      "nature"
    ],
    "pace": "medium",
    "pages": 335,
    "popularity": 0.8,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/241603-L.jpg"
  },
  {
    "slug": "ol-ol2987238w",
    "title": "From the Mixed-Up Files of Mrs. Basil E. Frankweiler",
    "author": "E. L. Konigsburg",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Children's Mystery",
    "moodProfile": {
      "mysterious": 0.9,
      "escapist": 0.75,
      "lightFun": 0.6,
      "cozy": 0.45
    },
    "themes": [
      "juvenile fiction",
      "large type books",
      "runaways"
    ],
    "pace": "medium",
    "pages": 162,
    "popularity": 0.78,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/541206-L.jpg"
  },
  {
    "slug": "ol-ol15683431w",
    "title": "Moonwalking with Einstein",
    "author": "Joshua Foer",
    "language": "en",
    "genre": "nonFiction",
    "subgenre": "Popular Science",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "lightFun": 0.75
    },
    "themes": [
      "new york times bestseller",
      "memory",
      "memory improvement",
      "mnemonics"
    ],
    "pace": "medium",
    "pages": 307,
    "popularity": 0.8,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14426425-L.jpg"
  },
  {
    "slug": "ol-ol860066w",
    "title": "If This Is a Man",
    "author": "Primo Levi",
    "language": "en",
    "genre": "biography",
    "subgenre": "Holocaust Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "intense": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "italian personal narratives",
      "german prisoners and prisons",
      "concentration camps",
      "biography"
    ],
    "pace": "medium",
    "pages": 206,
    "popularity": 0.78,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": null
  },
  {
    "slug": "ol-ol16142316w",
    "title": "Wild",
    "author": "Cheryl Strayed",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6
    },
    "themes": [
      "travel",
      "american authors",
      "biography",
      "description and travel"
    ],
    "pace": "medium",
    "pages": 363,
    "popularity": 0.8,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7249596-L.jpg"
  },
  {
    "slug": "ol-ol1915012w",
    "title": "The Hiding Place",
    "author": "Corrie ten Boom",
    "language": "en",
    "genre": "biography",
    "subgenre": "WWII Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "concentration camps",
      "dutch personal narratives",
      "corrie ten boom",
      "underground movements"
    ],
    "pace": "medium",
    "pages": 241,
    "popularity": 0.77,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12817925-L.jpg"
  },
  {
    "slug": "ol-ol1868110w",
    "title": "Stone Butch Blues",
    "author": "Leslie Feinberg",
    "language": "en",
    "genre": "literaryFiction",
    "subgenre": "Literary Fiction",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "gay",
      "lgbt",
      "transsexuals"
    ],
    "pace": "medium",
    "pages": 440,
    "popularity": 0.75,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/3935729-L.jpg"
  },
  {
    "slug": "ol-ol528094w",
    "title": "Autobiography of a Yogi",
    "author": "Yogananda Paramahansa",
    "language": "en",
    "genre": "biography",
    "subgenre": "Spiritual Autobiography",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "emotional": 0.75
    },
    "themes": [
      "autobiography",
      "yogis",
      "yoga",
      "yoguis"
    ],
    "pace": "medium",
    "pages": 514,
    "popularity": 0.82,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/805448-L.jpg"
  },
  {
    "slug": "ol-ol3954921w",
    "title": "Girl, interrupted",
    "author": "Susanna Kaysen",
    "language": "en",
    "genre": "biography",
    "subgenre": "Memoir",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "intense": 0.6
    },
    "themes": [
      "mental health",
      "psychiatric hospital patients",
      "biography",
      "mental disorders"
    ],
    "pace": "medium",
    "pages": 168,
    "popularity": 0.77,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/3956219-L.jpg"
  },
  {
    "slug": "ol-ol15401200w",
    "title": "The Lost Hero",
    "author": "Rick Riordan",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Mythological Adventure",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "new york times bestseller",
      "fantasy",
      "adventure",
      "kids"
    ],
    "pace": "medium",
    "pages": 556,
    "popularity": 0.95,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12848687-L.jpg"
  },
  {
    "slug": "ol-ol16664287w",
    "title": "The Mark of Athena",
    "author": "Rick Riordan",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Mythological Adventure",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "lightFun": 0.6
    },
    "themes": [
      "greek gods",
      "camps",
      "greek mythology"
    ],
    "pace": "medium",
    "pages": 582,
    "popularity": 0.92,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12848680-L.jpg"
  },
  {
    "slug": "ol-ol8125760w",
    "title": "Hatchet",
    "author": "Gary Paulsen",
    "language": "en",
    "genre": "adventure",
    "subgenre": "Survival Adventure",
    "moodProfile": {
      "escapist": 0.9,
      "intense": 0.75,
      "emotional": 0.6
    },
    "themes": [
      "divorce",
      "plane crash",
      "survival",
      "children's fiction"
    ],
    "pace": "fast",
    "pages": 192,
    "popularity": 0.94,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/11240448-L.jpg"
  },
  {
    "slug": "ol-ol45885w",
    "title": "The BFG",
    "author": "Roald Dahl",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Children's Fantasy",
    "moodProfile": {
      "lightFun": 0.9,
      "magical": 0.75,
      "escapist": 0.6,
      "cozy": 0.45
    },
    "themes": [
      "open library staff picks",
      "roald dahl",
      "tweens",
      "teens"
    ],
    "pace": "fast",
    "pages": 208,
    "popularity": 0.93,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9176033-L.jpg"
  },
  {
    "slug": "ol-ol71069w",
    "title": "Prince Caspian",
    "author": "C. S. Lewis",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Children's Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "fantasy",
      "princes",
      "juvenile fiction",
      "good and evil"
    ],
    "pace": "medium",
    "pages": 216,
    "popularity": 0.9,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/45897-L.jpg"
  },
  {
    "slug": "ol-ol71132w",
    "title": "The Voyage of the Dawn Treader",
    "author": "C. S. Lewis",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Children's Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "narnia",
      "the chronicles of narnia",
      "children's fiction",
      "fantasy fiction"
    ],
    "pace": "medium",
    "pages": 224,
    "popularity": 0.91,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9184719-L.jpg"
  },
  {
    "slug": "ol-ol27495w",
    "title": "The Silmarillion",
    "author": "J.R.R. Tolkien",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Mythopoeic Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "thoughtProvoking": 0.75,
      "escapist": 0.6,
      "intense": 0.45
    },
    "themes": [
      "fantasy fiction",
      "short stories",
      "elves"
    ],
    "pace": "slow",
    "pages": 424,
    "popularity": 0.92,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14627042-L.jpg"
  },
  {
    "slug": "ol-ol81628w",
    "title": "The Gunslinger",
    "author": "Stephen King",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Dark Fantasy Western",
    "moodProfile": {
      "intense": 0.9,
      "mysterious": 0.75,
      "magical": 0.6,
      "escapist": 0.45
    },
    "themes": [
      "succubus",
      "demons",
      "american fiction",
      "fantastic fiction"
    ],
    "pace": "medium",
    "pages": 256,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/8396638-L.jpg"
  },
  {
    "slug": "ol-ol7924135w",
    "title": "The Great Hunt",
    "author": "Robert Jordan",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Epic Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "intense": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "fantasy fiction",
      "fantasy",
      "aes sedai"
    ],
    "pace": "slow",
    "pages": 656,
    "popularity": 0.89,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/182352-L.jpg"
  },
  {
    "slug": "ol-ol49604w",
    "title": "Xenocide",
    "author": "Orson Scott Card",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Philosophical Science Fiction",
    "moodProfile": {
      "thoughtProvoking": 0.9,
      "intense": 0.75,
      "escapist": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "space warfare",
      "life on other planets",
      "viruses"
    ],
    "pace": "medium",
    "pages": 569,
    "popularity": 0.89,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/10564838-L.jpg"
  },
  {
    "slug": "ol-ol19713513w",
    "title": "They Both Die at the End",
    "author": "Adam Silvera",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Contemporary Drama",
    "moodProfile": {
      "emotional": 0.9,
      "thoughtProvoking": 0.75,
      "cozy": 0.6
    },
    "themes": [
      "death",
      "romance fiction",
      "gay men",
      "adventure and adventurers"
    ],
    "pace": "medium",
    "pages": 373,
    "popularity": 0.87,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9280553-L.jpg"
  },
  {
    "slug": "ol-ol18016709w",
    "title": "Fire & Blood",
    "author": "George R. R. Martin",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Fictional History",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "kings and rulers",
      "magic",
      "monarchy"
    ],
    "pace": "slow",
    "pages": 840,
    "popularity": 0.83,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/12063529-L.jpg"
  },
  {
    "slug": "ol-ol261794w",
    "title": "A Clockwork Orange",
    "author": "Anthony Burgess",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Dystopian",
    "moodProfile": {
      "intense": 0.9,
      "thoughtProvoking": 0.75,
      "lightFun": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "bible",
      "aversion therapy",
      "unintended consequences",
      "beethoven's fifth symphony"
    ],
    "pace": "fast",
    "pages": 192,
    "popularity": 0.86,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14430663-L.jpg"
  },
  {
    "slug": "ol-ol40879w",
    "title": "Blood Meridian",
    "author": "Cormac McCarthy",
    "language": "en",
    "genre": "historicalFiction",
    "subgenre": "Western Historical",
    "moodProfile": {
      "intense": 0.9,
      "thoughtProvoking": 0.75,
      "mysterious": 0.6
    },
    "themes": [
      "glanton gang",
      "outlaws",
      "teenage boys"
    ],
    "pace": "medium",
    "pages": 353,
    "popularity": 0.72,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/419991-L.jpg"
  },
  {
    "slug": "ol-ol34028551w",
    "title": "Iron Flame",
    "author": "Rebecca Yarros",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Romantasy",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "magical": 0.6,
      "emotional": 0.45
    },
    "themes": [
      "new york times bestseller"
    ],
    "pace": "fast",
    "pages": 640,
    "popularity": 0.8,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14405746-L.jpg"
  },
  {
    "slug": "ol-ol17076473w",
    "title": "Red Rising",
    "author": "Pierce Brown",
    "language": "en",
    "genre": "scienceFiction",
    "subgenre": "Dystopian",
    "moodProfile": {
      "intense": 0.9,
      "escapist": 0.75,
      "thoughtProvoking": 0.6,
      "mysterious": 0.45
    },
    "themes": [
      "fantasy",
      "dystopia"
    ],
    "pace": "fast",
    "pages": 416,
    "popularity": 0.9,
    "ageSuitability": "adult",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/7316188-L.jpg"
  },
  {
    "slug": "ol-ol43426400w",
    "title": "Sunrise on the Reaping",
    "author": "Suzanne Collins",
    "language": "en",
    "genre": "youngAdult",
    "subgenre": "Dystopian",
    "moodProfile": {
      "intense": 0.9,
      "emotional": 0.75,
      "escapist": 0.6,
      "thoughtProvoking": 0.45
    },
    "themes": [
      "dystopia",
      "fantasy"
    ],
    "pace": "fast",
    "pages": 400,
    "popularity": 0.77,
    "ageSuitability": "teen",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/14847912-L.jpg"
  },
  {
    "slug": "ol-ol16361049w",
    "title": "Keeper of the Lost Cities",
    "author": "Shannon Messenger",
    "language": "en",
    "genre": "fantasy",
    "subgenre": "Middle Grade Fantasy",
    "moodProfile": {
      "magical": 0.9,
      "escapist": 0.75,
      "cozy": 0.6,
      "lightFun": 0.45
    },
    "themes": [
      "ability",
      "fantasy",
      "psychic ability"
    ],
    "pace": "medium",
    "pages": 512,
    "popularity": 0.85,
    "ageSuitability": "all",
    "available": true,
    "coverUrl": "https://covers.openlibrary.org/b/id/9320507-L.jpg"
  }
];
