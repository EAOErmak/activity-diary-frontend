import type { QueryClient } from "@tanstack/react-query";

import { templateKeys } from "@/shared/lib/queryKeys";

export type TemplateMutationScope = "entry" | "day" | "week";

const relatedTemplateQueryKeys = {
  entry: [
    templateKeys.entryTemplatesRoot(),
    templateKeys.dayTemplatesRoot(),
    templateKeys.weekTemplatesRoot(),
  ],
  day: [templateKeys.dayTemplatesRoot(), templateKeys.weekTemplatesRoot()],
  week: [templateKeys.weekTemplatesRoot()],
} satisfies Record<TemplateMutationScope, readonly (readonly unknown[])[]>;

export async function invalidateTemplateQueries(
  queryClient: QueryClient,
  scope: TemplateMutationScope
) {
  await Promise.all(
    relatedTemplateQueryKeys[scope].map((queryKey) =>
      queryClient.invalidateQueries({
        queryKey,
        refetchType: "active",
      })
    )
  );
}
