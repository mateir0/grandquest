/**
 * Quest board loading state — mirrors the real layout (hero, how-it-works,
 * filters, card grid) with a parchment-toned pulse. Shown only while the
 * board data loads; never alongside content or empty states.
 */
export default function BoardLoading() {
  return (
    <>
      <section className="hero" aria-busy="true" aria-label="Loading quest board">
        <div className="hero-copy">
          <div className="sk" style={{width: '12rem'}} />
          <div className="sk sk-title" style={{height: '3rem'}} />
          <div className="sk sk-sub" style={{width: '80%'}} />
        </div>
      </section>
      <section className="how" aria-hidden="true">
        <div className="sk sk-title" style={{width: '16rem'}} />
        <ol className="how-steps">
          {Array.from({length: 4}).map((_, i) => (
            <li className="how-step" key={i}>
              <div className="sk sk-sub" />
              <div className="sk sk-sub" style={{width: '70%'}} />
            </li>
          ))}
        </ol>
      </section>
      <section id="board" className="board-section">
        <header className="board-head">
          <div>
            <span className="eyebrow">Welcome to GrantQuest</span>
            <div className="sk sk-title" style={{width: '14rem'}} />
          </div>
        </header>
        <div className="grid">
          {Array.from({length: 6}).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="sk sk-title" />
              <div className="sk sk-sub" />
              <div className="sk sk-amount" />
              <div className="sk sk-meta" />
              <div className="sk sk-tags" />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
