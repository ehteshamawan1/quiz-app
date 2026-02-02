import React from "react";
import "./Card.css";

type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  const classes = ["nq-card", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      {title && <h3 className="nq-card__title">{title}</h3>}
      <div className="nq-card__body">{children}</div>
    </div>
  );
}
