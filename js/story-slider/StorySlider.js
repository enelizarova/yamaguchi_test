import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createSlideTimeline } from './createSlideTimeline.js';
import { WheelNavigation } from './WheelNavigation.js';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_QUERY = '(min-width: 60rem)';
const SCRUB = 0.15;
const SCROLL_DISTANCE = 0.8;
const ANIMATED_ELEMENTS = [
  '.slides',
  '.slide',
  '.hero-product',
  '.lightness-model',
  '.motor-cutaway',
  '.mini-card',
  '.slide h2',
  '.light-description',
  '.motor-subtitle',
  '.pill',
  '.burst',
  '.motor-glow',
].join(', ');

export class StorySlider {
  constructor(root) {
    this.root = root;
    this.stage = root.querySelector('.story__stage');
    this.slides = gsap.utils.toArray('.slide', root);
    this.wheelItems = gsap.utils.toArray('.wheel__item', root);
    this.media = gsap.matchMedia();
    this.resizeCall = gsap.delayedCall(0.2, () => ScrollTrigger.refresh()).pause();
    this.handleResize = () => this.resizeCall.restart(true);
  }

  mount() {
    if (!this.stage || !this.slides.length) {
      return;
    }

    this.media.add(DESKTOP_QUERY, () => this.mountDesktop());
    window.addEventListener('resize', this.handleResize, { passive: true });
    window.addEventListener('orientationchange', this.handleResize, { passive: true });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    this.resizeCall.kill();
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
        content: this.stage.querySelector('.slides'),
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
      this.clearAnimationStyles();
    };
  }

  clearAnimationStyles() {
    this.root.querySelectorAll(ANIMATED_ELEMENTS).forEach((element) => {
      element.style.removeProperty('opacity');
      element.style.removeProperty('visibility');
      element.style.removeProperty('transform');
    });
  }
}
