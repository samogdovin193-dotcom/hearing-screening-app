import { useNavigate, useSearchParams } from "react-router-dom";

export function useAppNavigation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getLang = () => searchParams.get("lang") || "sk";

  const buildQuery = (extra: Record<string, any> = {}) => {
    const q = new URLSearchParams(searchParams.toString());

    Object.entries(extra).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      q.set(key, String(value));
    });

    // FORCE default lang always exists
    if (!q.get("lang")) {
      q.set("lang", "sk");
    }

    return q.toString();
  };

  const go = (path: string, extra: Record<string, any> = {}) => {
    const query = buildQuery(extra);
    navigate(query ? `${path}?${query}` : path);
  };

  const switchLang = () => {
    const current = getLang();
    const next = current === "sk" ? "rom" : "sk";

    const q = new URLSearchParams(searchParams.toString());
    q.set("lang", next);

    navigate(`/?${q.toString()}`);
  };

  const goHomeWithConfirm = () => {
  const confirmed = confirm(
    "Naozaj sa chcete vrátiť na domovskú stránku?"
  );

  if (!confirmed) return;

  navigate(`/?lang=${getLang()}`);
};

  return {
    go,
    switchLang,
    getLang,
    goHomeWithConfirm,
  };
}