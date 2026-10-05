/**
 * Quest detail loading state — mirrors the detail layout (header, briefing,
 * objectives, inventory) with a parchment-toned pulse.
 */
export default function QuestLoading() {
  return (
    <>
      <header className="detail-head" aria-busy="true" aria-label="Loading quest">
        <div className="sk sk-title" style={{width: '70%', height: '2.5rem'}} />
        <div className="sk sk-sub" style={{width: '40%'}} />
        <div className="sk sk-amount" style={{width: '10rem'}} />
      </header>
      <section className="briefing" aria-hidden="true">
        <div className="sk sk-sub" />
        <div className="sk sk-sub" style={{width: '90%'}} />
        <div className="sk sk-sub" style={{width: '75%'}} />
      </section>
      <section className="section" aria-hidden="true">
        <div className="sk sk-title" style={{width: '50%'}} />
        {[0, 1, 2].map((i) => (
          <div className="objective" key={i} style={{cursor: 'default'}}>
            <div className="objective-content">
              <div className="sk sk-sub" style={{width: '60%'}} />
              <div className="sk" style={{width: '85%'}} />
            </div>
          </div>
        ))}
      </section>
      <section className="section" aria-hidden="true">
        <div className="sk sk-title" style={{width: '45%'}} />
        <div className="inventory-grid">
          {[0, 1].map((i) => (
            <div className="inventory-item" key={i} style={{cursor: 'default'}}>
              <div className="inventory-content" style={{width: '100%'}}>
                <div className="sk sk-sub" style={{width: '70%'}} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
