import { useState } from "react";

export function useToast() {
  const [message, setMessage] = useState("");

  const toast = ({ title, description, variant }: any) => {
    const text = `${title}: ${description}`;
    if (variant === "destructive") {
      alert("❌" + text);
    } else {
      alert("✅" + text);
    }
  };

  return { toast };
}
