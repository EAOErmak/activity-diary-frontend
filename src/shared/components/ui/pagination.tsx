import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row flex-wrap items-center justify-center gap-2", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
      isActive
        ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(37,99,235,0.2)]"
        : "border-border bg-surface text-foreground shadow-sm hover:border-border/80 hover:bg-accent hover:text-foreground",
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation();
  const label = children ?? t("common.previous");

  return (
    <PaginationLink
      aria-label={typeof label === "string" ? label : t("common.previous")}
      className={cn("gap-1.5 px-4", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4 shrink-0" />
      <span className="inline-grid">
        <span className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {t("common.previousDay")}
        </span>
        <span className="col-start-1 row-start-1 whitespace-nowrap">{label}</span>
      </span>
    </PaginationLink>
  );
};
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation();
  const label = children ?? t("common.next");

  return (
    <PaginationLink
      aria-label={typeof label === "string" ? label : t("common.next")}
      className={cn("gap-1.5 px-4", className)}
      {...props}
    >
      <span className="inline-grid">
        <span className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {t("common.nextDay")}
        </span>
        <span className="col-start-1 row-start-1 whitespace-nowrap">{label}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0" />
    </PaginationLink>
  );
};
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => {
  const { t } = useTranslation();

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{t("common.morePages")}</span>
    </span>
  );
};
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
