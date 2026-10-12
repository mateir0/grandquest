import {Skeleton} from '../../../components/lightswind/skeleton'

/**
 * Quest detail loading state — mirrors the detail layout (header, briefing,
 * objectives, inventory) with a parchment-toned pulse.
 */
export default function QuestLoading() {
  return (
    <>
      <header className="detail-head" aria-busy="true" aria-label="Loading quest">
        <Skeleton className="sk sk-title" style={{width: '70%', height: '2.5rem'}} animation="none" />
        <Skeleton className="sk sk-sub" style={{width: '40%'}} animation="none" />
        <Skeleton className="sk sk-amount" style={{width: '10rem'}} animation="none" />
      </header>
      <section className="briefing" aria-hidden="true">
        <Skeleton className="sk sk-sub" animation="none" />
        <Skeleton className="sk sk-sub" style={{width: '90%'}} animation="none" />
        <Skeleton className="sk sk-sub" style={{width: '75%'}} animation="none" />
      </section>
      <section className="section" aria-hidden="true">
        <Skeleton className="sk sk-title" style={{width: '50%'}} animation="none" />
        {[0, 1, 2].map((i) => (
          <div className="objective" key={i} style={{cursor: 'default'}}>
            <div className="objective-content">
              <Skeleton className="sk sk-sub" style={{width: '60%'}} animation="none" />
              <Skeleton className="sk" style={{width: '85%'}} animation="none" />
            </div>
          </div>
        ))}
      </section>
      <section className="section" aria-hidden="true">
        <Skeleton className="sk sk-title" style={{width: '45%'}} animation="none" />
        <div className="inventory-grid">
          {[0, 1].map((i) => (
            <div className="inventory-item" key={i} style={{cursor: 'default'}}>
              <div className="inventory-content" style={{width: '100%'}}>
                <Skeleton className="sk sk-sub" style={{width: '70%'}} animation="none" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
