
import { ComponentType } from "react";

export type NavItem = {
  title: string;
  href: string;
  icon: ComponentType<{
    className?: string;
  }>;
  adminOnly?: boolean;
};
