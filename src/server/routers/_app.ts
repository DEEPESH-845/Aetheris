import { router } from "../trpc";
import { orgRouter } from "./org";
import { simulationRouter } from "./simulation";
import { auditRouter } from "./audit";
import { billingRouter } from "./billing";

export const appRouter = router({
  org: orgRouter,
  simulation: simulationRouter,
  audit: auditRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
