import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export function useEnsureLang() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const lang = params.get("lang");

    if (!lang) {
      const q = new URLSearchParams(params.toString());
      q.set("lang", "sk");
      navigate(`/?${q.toString()}`, { replace: true });
    }
  }, []);
}