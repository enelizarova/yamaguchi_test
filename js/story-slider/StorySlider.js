import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createSlideTimeline } from './createSlideTimeline.js';
import { WheelNavigation } from './WheelNavigation.js';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const DESKTOP_QUERY = '(min-width: 75rem)';
const SCRUB = 0.3;
const SCROLL_DISTANCE = 0.8;

export class StorySlider {
  constructor(root) {
    this.root = root;
    this.stage = root.querySelector('.story__stage');
    this.slides = gsap.utils.toArray('.slide', root);
    this.wheelItems = gsap.utils.toArray('.wheel__item', root);
    this.media = gsap.matchMedia();
  }

  mount() {
    if (!this.stage || !this.slides.length) {
      return;
    }

    this.media.add(DESKTOP_QUERY, () => this.mountDesktop());
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  destroy() {
    this.media.revert();
  }

  mountDesktop() {
    let navigation;

    const context = gsap.context(() => {
      const { timeline, slideTimes } = createSlideTimeline(gsap, this.slides);

      navigation = new WheelNavigation({
        gsap,
        items: this.wheelItems,
        timeline,
        slideTimes,
      });
      timeline.eventCallback('onUpdate', () => navigation.render());

      const scrollTrigger = ScrollTrigger.create({
        trigger: this.root,
        pin: this.stage,
        animation: timeline,
        start: 'top top',
        end: () => `+=${timeline.duration() * window.innerHeight * SCROLL_DISTANCE}`,
        scrub: SCRUB,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => navigation.render(),
      });

      navigation.connect(scrollTrigger);
    }, this.root);

    return () => {
      navigation?.destroy();
      context.revert();
    };
  }
}
