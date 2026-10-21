import { redirect } from "next/navigation";

// The Good Roommate now lives on /personal. Old links (shared posts, search results) land there.
export default function GoodRoommateRedirect() {
  redirect("/personal/");
}
