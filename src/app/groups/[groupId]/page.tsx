import { notFound } from "next/navigation";
import { getOptionalAuthIdentity } from "@/lib/auth";
import { readExpenseHubState } from "@/lib/server/expense-hub-db";
import { GroupDetailClient } from "./GroupDetailClient";

export const dynamic = "force-dynamic";

interface GroupDetailPageProps {
  params: {
    groupId: string;
  };
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const identity = await getOptionalAuthIdentity();

  if (!identity) {
    notFound();
  }

  const state = await readExpenseHubState(identity);
  const groupExists = state.groups.some((group) => group.id === params.groupId);

  if (!groupExists) {
    notFound();
  }

  return <GroupDetailClient groupId={params.groupId} />;
}
