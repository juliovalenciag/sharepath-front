import React from "react";

const BrushIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M2 20l7-2 9-9 2-2-4-4-2 2-9 9-2 7z" />
    <path d="M16 8l4 4" />
    <path d="M14 18s-1 2-4 2-4-2-4-2" />
  </svg>
);

export default BrushIcon;