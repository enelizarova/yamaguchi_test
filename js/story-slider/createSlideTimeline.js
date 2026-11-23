const SLIDE_DURATION = 1.1;
const FIRST_SLIDE_DURATION = 0.4;
const HOLD_DURATION = 0.2;

const PART_SELECTORS = {
  image: '.hero-product, .lightness-model, .motor-cutaway',
  title: 'h2',
  cards: '.mini-card',
  text: '.light-description, .motor-subtitle',
  badge: '.pill, .burst',
};

const INITIAL_STATE = {
  slide: { autoAlpha: 0, yPercent: 110, scale: 0.98 },
  image: {
    autoAlpha: 0,
    y: '5rem',
    scale: 1.04,
  },
  title: { autoAlpha: 0, y: '2.5rem' },
  cards: { autoAlpha: 0, y: '4.25rem', scale: 0.94 },
  text: { autoAlpha: 0, y: '1.75rem' },
  badge: { autoAlpha: 0, y: '1.5rem', scale: 0.88 },
};

function collectParts(slide) {
  return Object.fromEntries(
    Object.entries(PART_SELECTORS).map(([name, selector]) => [
      name,
      slide.querySelectorAll(selector),
    ]),
  );
}

function addTween(timeline, targets, vars, position) {
  if (targets.length) {
    timeline.to(targets, vars, position);
  }
}

function prepareSlide(gsap, slide, parts) {
  gsap.set(slide, INITIAL_STATE.slide);
  Object.entries(parts).forEach(([name, elements]) => {
    if (elements.length) {
      gsap.set(elements, INITIAL_STATE[name]);
    }
  });
}

function prepareFirstSlide(gsap, slide, parts) {
  gsap.set(slide, { autoAlpha: 1, yPercent: 0, scale: 1 });

  Object.entries(parts).forEach(([name, elements]) => {
    if (!elements.length) {
      return;
    }

    if (name === 'cards') {
      gsap.set(elements, { ...INITIAL_STATE.cards, y: '3rem', scale: 0.96 });
      elements.forEach((card, index) => gsap.set(card, { x: index ? '2rem' : '-2rem' }));
      return;
    }

    if (name === 'title' || name === 'badge') {
      gsap.set(elements, {
        autoAlpha: 0.85,
        y: '0.5rem',
        scale: 1,
      });
      return;
    }

    gsap.set(elements, {
      autoAlpha: 1,
      y: name === 'image' ? '4rem' : 0,
      scale: name === 'image' ? 1.04 : 1,
    });
  });
}

function addFirstEntrance(timeline, parts) {
  addTween(
    timeline,
    parts.image,
    {
      y: 0,
      scale: 1,
      duration: FIRST_SLIDE_DURATION,
      ease: 'power3.out',
    },
    0,
  );
  addTween(
    timeline,
    [...parts.title, ...parts.badge],
    {
      autoAlpha: 1,
      y: 0,
      stagger: 0.05,
      duration: 0.3,
      ease: 'power2.out',
    },
    0,
  );
  addTween(
    timeline,
    parts.cards,
    {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      stagger: 0.05,
      duration: 0.3,
      ease: 'power3.out',
    },
    0.05,
  );
  timeline.to({}, { duration: FIRST_SLIDE_DURATION }, 0);
}

function addEntrance(timeline, slide, parts, at) {
  timeline.to(
    slide,
    {
      autoAlpha: 1,
      yPercent: 0,
      scale: 1,
      duration: SLIDE_DURATION,
      ease: 'sine.inOut',
    },
    at,
  );
  addTween(
    timeline,
    parts.image,
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: 'power3.out',
    },
    at + 0.1,
  );
  addTween(
    timeline,
    parts.title,
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
    },
    at + 0.2,
  );
  addTween(
    timeline,
    parts.cards,
    { autoAlpha: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.5 },
    at + 0.4,
  );
  addTween(
    timeline,
    parts.text,
    { autoAlpha: 1, y: 0, duration: 0.52, ease: 'power2.out' },
    at + 0.4,
  );
  addTween(
    timeline,
    parts.badge,
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power2.out',
    },
    at + 0.6,
  );
}

function addExit(timeline, slide, parts, at) {
  timeline.to(
    slide,
    {
      autoAlpha: 0,
      yPercent: -110,
      scale: 0.98,
      duration: SLIDE_DURATION,
      ease: 'sine.inOut',
    },
    at,
  );
  addTween(timeline, parts.image, { y: '6rem', duration: SLIDE_DURATION }, at);
  addTween(timeline, parts.title, { y: '-2.875rem', duration: 0.8 }, at);
  addTween(
    timeline,
    [...parts.cards, ...parts.text, ...parts.badge],
    { y: '-1.75rem', duration: 0.8 },
    at,
  );
}

export function createSlideTimeline(gsap, slides) {
  const timeline = gsap.timeline({ paused: true });
  const partsBySlide = slides.map(collectParts);
  const slideTimes = [];

  prepareFirstSlide(gsap, slides[0], partsBySlide[0]);
  slides.slice(1).forEach((slide, index) => prepareSlide(gsap, slide, partsBySlide[index + 1]));

  addFirstEntrance(timeline, partsBySlide[0]);
  slideTimes.push(FIRST_SLIDE_DURATION);
  timeline.to({}, { duration: HOLD_DURATION });

  slides.slice(1).forEach((slide, relativeIndex) => {
    const index = relativeIndex + 1;
    const at = timeline.duration();

    addExit(timeline, slides[index - 1], partsBySlide[index - 1], at);
    addEntrance(timeline, slide, partsBySlide[index], at);
    slideTimes.push(at + SLIDE_DURATION);
    timeline.to({}, { duration: HOLD_DURATION });
  });

  return { timeline, slideTimes };
}
