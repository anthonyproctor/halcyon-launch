// Test fixture only (tests/mock_forms.spec.mjs appends it to courses/cphims/mock/mock1.js in the browser): a dummy second CPHIMS
// practice exam, so the form picker can be tested before the real mock2.js exists. Never load it from courses.js.
(function(){
const C=window.HALCYON_DATA.cphims;
const src=C.mock[0].questions;
C.mock.push({ part:`M2: Practice exam 2`, questions:[...src.filter(q=>q.scored!==false).slice(0,18),...src.filter(q=>q.scored===false).slice(0,2)].map(q=>({...q})) });
})();
