/**
 * Business promo video (MP4). Place on the home catalog: below AppHeader,
 * above the search bar. Add file: client/public/hero-promo.mp4
 */
const VIDEO_SRC = "/hero-promo.mp4";

type Props = {
  className?: string;
};

export default function HeroPromoVideo({ className = "" }: Props) {
  return (
    <section
      className={`w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-200/50 shadow-sm ${className}`}
      aria-label="Business showcase video"
    >
      <div className="relative aspect-[64/27] w-full min-w-0 max-h-[min(36vh,330px)] overflow-hidden bg-slate-300/40 sm:max-h-[min(33vh,360px)]">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
          Your browser does not support embedded video.
        </video>
      </div>
    </section>
  );
}
