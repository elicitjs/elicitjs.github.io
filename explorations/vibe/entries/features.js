// The feature-gap vocabulary. An entry's `needs` names what Elicit.js is MISSING
// for that example: it blocks a `none`, or degrades a `partial`. Keep keys
// stable: the analysis page counts them. An entry file may add a key with
// VIBE.defineFeatures({...}) when none of these fits.
VIBE.defineFeatures({
  // ---------------------------------------------------------------- the question flow
  'reveal': { label: 'Reveal / feedback step', description: 'Showing the true answer (or the gap between guess and truth) after the reader commits. Stages, context rows and guides can do this; list it only when they cannot do what the piece does.' },
  'social-feedback': { label: 'Other readers’ answers', description: 'Comparing a guess with what other readers answered (a crowd histogram, “you beat 55% of readers”). Needs a server that collects answers; Elicit.js is client-side.' },
  'multi-question-flow': { label: 'Quiz flow', description: 'Several questions in sequence with a score, progress, branching or a results page. The page around the charts does this; the library does not.' },
  'scoring': { label: 'Scoring', description: 'Computing a score from the answer (accuracy, distance from truth, personality factors).' },
  'free-text': { label: 'Free text answer', description: 'An open-ended typed answer, or a typed number with no chart to read it on.' },
  'conversation': { label: 'Conversational flow', description: 'A chat-like exchange where the next prompt depends on the reader’s reply.' },

  // ---------------------------------------------------------------- stimuli
  'image-stimulus': { label: 'Photo stimulus', description: 'A photograph or illustration the reader judges (a fridge, a character). The `image` mark can draw pictures; list this when the stimulus is copyrighted or is the point and cannot be reproduced here.' },
  'text-stimulus': { label: 'Text stimulus', description: 'A quote, scenario or statement the reader classifies; the chart is only the buttons.' },

  // ---------------------------------------------------------------- marks & layout
  'tile-map': { label: 'Tile grid map', description: 'A square-tile cartogram of states or regions.' },
  'choropleth-variants': { label: 'Many alternative maps', description: 'Several detailed maps (county-level surfaces, blurred regions) offered as answers.' },
  'small-multiples': { label: 'Small multiples', description: 'Several coordinated charts that edit one model (one panel per demographic group).' },
  'derived-view': { label: 'Derived view', description: 'A second chart that is a computed function of the answer (an electoral map recomputed from vote shares, a seat total).' },
  'card-ui': { label: 'Card UI', description: 'Answers drawn as cards, chips or bubbles with photos, outside the visual vocabulary of a chart.' },
  'physics-layout': { label: 'Force / physics layout', description: 'Bubbles that push each other apart or settle into a zone (a coalition area).' },
  'radar': { label: 'Radar chart', description: 'A radial profile chart of several scores.' },
  'smooth-freehand': { label: 'Freehand smoothing', description: 'A drawn line smoothed and resampled the way the original does.' },
  'axis-custom': { label: 'Axis customization', description: 'Axis forms Elicit.js does not draw (arrows on a quadrant axis, labels mid-axis).' },
  'text-layout': { label: 'Label layout', description: 'Automatic label placement: labels that follow a dragged end, call-outs with leader lines.' },
  'geo-detail': { label: 'Map detail', description: 'Basemap detail beyond country/state outlines: rivers, coastline at small islands, insets.' },
});
