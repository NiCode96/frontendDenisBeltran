// src/Componentes/components/ui/badge.jsx
export function Badge({ children, className = "" }) {
    return (
        <span
            className={
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium " +
                className
            }
        >
      {children}
    </span>
    );
}