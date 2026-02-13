import { redirect } from "next/navigation";

export default function SpendingPage() {
  redirect("/dashboard?tab=track");
}
