import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="flex-1 flex flex-col w-full animate-page-in">
      {children}
    </div>
  );
}
