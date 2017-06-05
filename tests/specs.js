// Setup testing environment
// This bundles globals `mocha` and `chai`
import 'mocha/mocha';
import 'chai/chai';

mocha.setup('tdd');

// Import all specs
import './attributes/media/spec.js';
import './elements/ajax-form/spec.js';

// In your HTML file,
// trigger the needed suite by running
// `runTests('attributes/media')`

import { runTests } from 'internal/tests';

window.runTests = window.runTests || runTests;