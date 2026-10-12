import {Skeleton} from '../components/lightswind/skeleton'

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
          <Skeleton className="sk" style={{width: '12rem'}} animation="none" />
          <Skeleton className="sk sk-title" style={{height: '3rem'}} animation="none" />
          <Skeleton className="sk sk-sub" style={{width: '80%'}} animation="none" />
        </div>
      </section>
      <section className="how" aria-hidden="true">
        <Skeleton className="sk sk-title" style={{width: '16rem'}} animation="none" />
        <ol className="how-steps">
          {Array.from({length: 4}).map((_, i) => (
            <li className="how-step" key={i}>
              <Skeleton className="sk sk-sub" animation="none" />
              <Skeleton className="sk sk-sub" style={{width: '70%'}} animation="none" />
            </li>
          ))}
        </ol>
      </section>
      <section id="board" className="board-section">
        <header className="board-head">
          <div>
            <span className="eyebrow">Welcome to GrantQuest</span>
            <Skeleton className="sk sk-title" style={{width: '14rem'}} animation="none" />
          </div>
        </header>
        <div className="grid">
          {Array.from({length: 6}).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <Skeleton className="sk sk-title" animation="none" />
              <Skeleton className="sk sk-sub" animation="none" />
              <Skeleton className="sk sk-amount" animation="none" />
              <Skeleton className="sk sk-meta" animation="none" />
              <Skeleton className="sk sk-tags" animation="none" />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
