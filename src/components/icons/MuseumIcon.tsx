import React from "react";

const MuseumIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M2 10l10-6 10 6" />
    <path d="M6 10v6" />
    <path d="M10 10v6" />
    <path d="M14 10v6" />
    <path d="M18 10v6" />
    <path d="M3 20h18" />
    <path d="M7 20v-4h10v4" />
  </svg>
);

export default MuseumIcon;