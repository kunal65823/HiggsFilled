import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, detail, action }: PageHeaderProps) {
  return (
    <div className="section-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      {action}
    </div>
  );
}
