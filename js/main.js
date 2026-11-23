import { StorySlider } from './story-slider/StorySlider.js';

document.querySelectorAll('[data-story-slider]').forEach((root) => {
  new StorySlider(root).mount();
});
