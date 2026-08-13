import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  description?: string;
  href?: string;
  meta?: string;
  children?: ReactNode;
};

export function Card({ title, description, href, meta, children }: CardProps) {
  const content = (
    <>
      {meta ? <p className="card-meta">{meta}</p> : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {children}
      {href ? <span className="card-link">Ver más</span> : null}
    </>
  );

  if (href) {
    return (
      <Link className="card card-interactive" to={href}>
        {content}
      </Link>
    );
  }

  return <article className="card">{content}</article>;
}
