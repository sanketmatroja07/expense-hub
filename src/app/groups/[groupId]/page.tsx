import { notFound } from "next/navigation";
import { readExpenseHubState } from "@/lib/server/expense-hub-db";
import { GroupDetailClient } from "./GroupDetailClient";

export const dynamic = "force-dynamic";

interface GroupDetailPageProps {
  params: {
    groupId: string;
  };
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const state = readExpenseHubState();
  const groupExists = state.groups.some((group) => group.id === params.groupId);

  if (!groupExists) {
    notFound();
  }

  return <GroupDetailClient groupId={params.groupId} />;
}
