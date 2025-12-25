import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { createUrl } from "@/lib/utils";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbEntry[];
  children?: React.ReactNode;
}

export function PageHeader({ breadcrumbs, children }: PageHeaderProps) {
  const lastBreadcrumb = breadcrumbs?.[breadcrumbs.length - 1];
  const parentBreadcrumb = breadcrumbs?.[breadcrumbs.length - 2];

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 sm:gap-4">
      <SidebarTrigger />

      {/* Mobile: Back button + current page only */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1 sm:hidden">
          {parentBreadcrumb && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              render={<a href={parentBreadcrumb.href ?? createUrl("/")} />}
              nativeButton={false}
            >
              <ChevronLeft />
              <span className="sr-only">戻る</span>
            </Button>
          )}
          <span className="font-medium">{lastBreadcrumb?.label}</span>
        </div>
      )}

      {/* Desktop: Full breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <Fragment key={`${index}-fragment`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      {children}
    </header>
  );
}
