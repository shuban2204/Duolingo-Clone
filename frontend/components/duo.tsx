export type DuoState = "neutral" | "reading" | "encourage" | "celebrate" | "loading";

export function Duo({ size = 54, state = "neutral" }: { size?: number; state?: DuoState }) {
  return (
    <span className={`duo-character duo-${state}`} style={{ "--duo-size": `${size}px` } as React.CSSProperties} role="img" aria-label={`Duo mascot, ${state}`}>
      <span className="duo-face">
        <span className="duo-brow duo-brow-left" />
        <span className="duo-brow duo-brow-right" />
        <span className="duo-eyes"><i className="duo-eye" /><i className="duo-eye" /></span>
        <span className="duo-beak" />
        <span className="duo-belly" />
        <span className="duo-wing duo-wing-left" />
        <span className="duo-wing duo-wing-right" />
        <span className="duo-feet"><i /><i /></span>
        {state === "reading" && <span className="duo-book"><i /><i /></span>}
        {state === "celebrate" && <span className="duo-confetti" aria-hidden="true">✦</span>}
        {state === "loading" && <span className="duo-note" aria-hidden="true">♪</span>}
      </span>
    </span>
  );
}
