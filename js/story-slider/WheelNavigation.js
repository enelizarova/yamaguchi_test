const RADIUS = 14.375;
const STEP = 28 * (Math.PI / 180);
const NAVIGATION_DURATION = 0.8;

export class WheelNavigation {
  constructor({ gsap, items, timeline, slideTimes }) {
    this.gsap = gsap;
    this.items = items;
    this.timeline = timeline;
    this.slideTimes = slideTimes;
    this.handlers = [];
  }

  connect(scrollTrigger) {
    this.scrollTrigger = scrollTrigger;
    this.items.forEach((item, index) => {
      const handler = () => this.scrollTo(index);
      item.addEventListener('click', handler);
      this.handlers.push(() => item.removeEventListener('click', handler));
    });
    this.render();
  }

  render() {
    const position = this.getPosition();
    const nextActiveIndex = Math.round(position);
    const itemCount = this.items.length;
    const halfItemCount = itemCount / 2;

    this.items.forEach((item, index) => {
      const offset =
        ((((position - index + halfItemCount) % itemCount) + itemCount) % itemCount) -
        halfItemCount;
      const angle = offset * STEP;
      const opacity = this.gsap.utils.clamp(0, 1, (halfItemCount - Math.abs(offset)) / 0.3);

      item.style.setProperty('--x', `${Math.cos(angle) * RADIUS}rem`);
      item.style.setProperty('--y', `${Math.sin(angle) * RADIUS}rem`);
      item.style.setProperty('--wheel-item-opacity', opacity);
      item.style.pointerEvents = opacity < 0.2 ? 'none' : '';

      const isActive = index === nextActiveIndex;
      item.classList.toggle('is-active', isActive);
      item.toggleAttribute('aria-current', isActive);
    });
  }

  destroy() {
    this.handlers.forEach((removeHandler) => removeHandler());
    this.handlers = [];
  }

  getPosition() {
    if (this.slideTimes.length === 1) return 0;

    return this.gsap.utils.clamp(
      0,
      this.items.length - 1,
      this.gsap.utils.mapRange(
        this.slideTimes[0],
        this.slideTimes.at(-1),
        0,
        this.items.length - 1,
        this.timeline.time(),
      ),
    );
  }

  scrollTo(index) {
    const progress = this.slideTimes[index] / this.timeline.duration();
    const distance = this.scrollTrigger.end - this.scrollTrigger.start;

    this.gsap.to(window, {
      scrollTo: {
        y: this.scrollTrigger.start + progress * distance,
        autoKill: true,
      },
      duration: NAVIGATION_DURATION,
      ease: 'power2.inOut',
    });
  }
}
