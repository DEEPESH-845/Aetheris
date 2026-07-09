"use client";

import { api } from "@/utils/trpc";

export function useOrg() {
  const { data: org, isLoading } = api.org.getCurrent.useQuery();
  return { org, isLoading };
}
