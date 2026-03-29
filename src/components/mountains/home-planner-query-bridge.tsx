"use client";

import { useSearchParams } from "next/navigation";

import { isValidDate } from "@/lib/date";

import { HomePlannerClient } from "@/components/mountains/home-planner-client";

type PlannerMountain = Parameters<typeof HomePlannerClient>[0]["mountains"];

type Props = {
  mountains: PlannerMountain;
};

export function HomePlannerQueryBridge({ mountains }: Props) {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const initialDate = date && isValidDate(date) ? date : undefined;

  return <HomePlannerClient mountains={mountains} initialDate={initialDate} />;
}
