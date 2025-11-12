import React from "react";

const TreeIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M12 3c2 0 3.5 1.5 3.5 3.5S14 10 12 10s-3.5-1.5-3.5-3.5S10 3 12 3z" />
    <path d="M7 12c1 0 1.8.6 2.3 1.4" />
    <path d="M17 12c-1 0-1.8.6-2.3 1.4" />
    <path d="M12 10v7" />
    <path d="M10 20h4" />
  </svg>
);

export default TreeIcon;