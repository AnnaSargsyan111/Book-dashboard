import { BookOpen, Compass, NotebookPen, Settings as SettingsIcon, UserRound } from "lucide-react";
import { ROUTES } from "@/shared/routes";

/** The five sections of the app proper, in order. Shared by the sidebar, the mobile table-of-contents menu, and
 *  (on narrower desktop windows) the old inline row. */
export const NAV_ITEMS = [
  { href: ROUTES.aboutMe, key: "aboutMe", icon: UserRound },
  { href: ROUTES.books, key: "books", icon: BookOpen },
  { href: ROUTES.mysteryBook, key: "mysteryBook", icon: Compass },
  { href: ROUTES.thoughts, key: "thoughts", icon: NotebookPen },
  { href: ROUTES.settings, key: "settings", icon: SettingsIcon },
] as const;
