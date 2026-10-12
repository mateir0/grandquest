import {Skeleton} from '../../components/lightswind/skeleton'

/**
 * Quest log loading state — mirrors the logcard layout with a
 * parchment-toned pulse. Shown only while loading; the honest empty
 * state appears only after loading finishes.
 */
export default function LogLoading() {
  return (
    <>
      <div className="board-head" aria-busy="true" aria-label="Loading quest log">
        <div>
          <span className="eyebrow">Adventurer&apos;s record</span>
          <Skeleton className="sk sk-title" style={{width: '12rem', height: '2.5rem'}} animation="none" />
          <Skeleton className="sk sk-sub" style={{width: '18rem'}} animation="none" />
        </div>
      </div>
      <div className="section" aria-hidden="true">
        {Array.from({length: 3}).map((_, i) => (
          <div className="logcard" key={i}>
            <Skeleton className="sk sk-title" style={{width: '60%'}} animation="none" />
            <Skeleton className="sk sk-sub" style={{width: '30%'}} animation="none" />
            <Skeleton className="sk sk-meta" style={{width: '80%'}} animation="none" />
          </div>
        ))}
      </div>
    </>
  )
}
