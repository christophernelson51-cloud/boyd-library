// js/charts.js — 4 D3 analysis charts for Boyd's library ratings

(function () {
  'use strict';

  var tip = document.getElementById('charts-tip');
  var fmt = d3.format(',');

  function showTip(html, e) {
    if (!tip) return;
    tip.innerHTML = html;
    tip.classList.add('visible');
    moveTip(e);
  }
  function moveTip(e) {
    if (!tip) return;
    var pad = 16, x = e.clientX + pad, y = e.clientY + pad;
    var r = tip.getBoundingClientRect();
    if (x + r.width  > window.innerWidth)  x = e.clientX - r.width  - pad;
    if (y + r.height > window.innerHeight) y = e.clientY - r.height - pad;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  }
  function hideTip() { if (tip) tip.classList.remove('visible'); }

  // ── Chart data ─────────────────────────────────────────────────────────────
  var DATA = [{"t":"Topology","a":"Paul Alexandroff","s":3.68,"c":22},{"t":"Mathematics","a":"A.D. Aleksandrov, et.al.","s":4.44,"c":241},{"t":"Success-Cybernetics","a":"U.S. Andersen","s":4.2,"c":15},{"t":"The Second Law","a":"P.W. Atkins","s":4.18,"c":109},{"t":"The Evolution of Cooperation","a":"Robert Axelrod","s":4.25,"c":2397},{"t":"The Whisperings Within","a":"David Barash","s":3.83,"c":24},{"t":"The Universe and Dr. Einstein","a":"Lincoln Barnett","s":4.27,"c":545},{"t":"Pi in the Sky","a":"John D. Barrow","s":3.97,"c":289},{"t":"The Left Hand of Creation","a":"John D. Barrow and Joseph Silk","s":4.0,"c":33},{"t":"Theories of Everything","a":"John D. Barrow","s":3.68,"c":136},{"t":"Mind and Nature","a":"Gregory Bateson","s":4.27,"c":825},{"t":"The Structure of Evil","a":"Ernest Becker","s":4.13,"c":53},{"t":"Applied Dynamic Programming","a":"Richard E. Bellman and Stuart E. Dreyfus","s":4.25,"c":4},{"t":"The Creative Mind","a":"Henri Bergson","s":4.05,"c":360},{"t":"The Art of Scientific Investigation","a":"W.I.B. Beveridge","s":4.24,"c":175},{"t":"Mechanics of the Mind","a":"Colin Blakemore","s":3.75,"c":129},{"t":"The Right Brain","a":"Thomas R. Blakeslee","s":3.43,"c":7},{"t":"Science","a":"David Bohm and F. David Peat","s":4.16,"c":208},{"t":"The Closing of the American Mind","a":"Allan Bloom","s":3.76,"c":6037},{"t":"Lateral Thinking","a":"Edward de Bono","s":3.76,"c":4828},{"t":"New Think","a":"Edward de Bono","s":3.33,"c":40},{"t":"An Investigation of the Laws of Thought","a":"George Boole","s":4.08,"c":131},{"t":"Masters of Time","a":"John Boslough","s":3.58,"c":19},{"t":"Vector Analysis","a":"Louis Brand","s":3.14,"c":7},{"t":"Turbulent Mirror","a":"John Briggs and F. David Peat","s":4.19,"c":297},{"t":"Looking Glass Universe","a":"John Briggs and F. David Peat","s":4.08,"c":49},{"t":"The Magic of Believing","a":"Claude M. Bristol","s":4.21,"c":5834},{"t":"Betrayers of the Truth","a":"William Broad and Nicholas Wade","s":3.76,"c":86},{"t":"The Identity of Man","a":"Jacob Bronowski","s":4.0,"c":90},{"t":"The Origins of Knowledge and Imagination","a":"J. Bronowski","s":4.2,"c":243},{"t":"A Sense of The Future","a":"J. Bronowski","s":4.33,"c":45},{"t":"The Ascent of Man","a":"J. Bronowski","s":4.21,"c":6372},{"t":"Supermind","a":"Barbara Brown","s":3.4,"c":15},{"t":"Law of Form","a":"G. Spencer Brown","s":4.27,"c":148},{"t":"Game Plan","a":"Zbigniew Brzezinski","s":3.33,"c":21},{"t":"The Tao of Physics","a":"Fritjof Capra","s":3.97,"c":19654},{"t":"The Turning Point","a":"Fritjof Capra","s":4.11,"c":1504},{"t":"Order and Disorder in Matter","a":"Giorgio Careri","s":3.0,"c":2},{"t":"Haphazard Reality","a":"Hendrik B.G. Casmir","s":3.86,"c":22},{"t":"Paradigms Lost","a":"John L. Casti","s":3.89,"c":189},{"t":"Searching for Certainty","a":"John L. Casti","s":3.23,"c":30},{"t":"Complexification","a":"John L. Casti","s":3.52,"c":99},{"t":"Cosmic Dawn","a":"Eric Chaisson","s":4.0,"c":38},{"t":"The Phenomenon of Man","a":"Pierre Teilhard de Chardin","s":4.05,"c":1737},{"t":"Men Who Made a New Physics","a":"Barbara Lovett Cline","s":4.16,"c":125},{"t":"An Introduction to Ordinary Differential Equations","a":"Earl A. Coddington","s":3.83,"c":100},{"t":"Sympathetic Vibrations","a":"K.C. Cole","s":4.12,"c":25},{"t":"Symbolic Logic","a":"Irving M. Copi","s":3.84,"c":112},{"t":"The Arrow of Time","a":"Peter Coveney and Roger Highfield","s":3.69,"c":275},{"t":"Frontiers of Complexity","a":"Peter Coveney and Roger Highfield","s":3.91,"c":91},{"t":"The Second Creation","a":"Robert P. Crease and Charles C. Mann","s":4.24,"c":122},{"t":"The Astonishing Hypothesis","a":"Francis Crick","s":3.77,"c":937},{"t":"The Trachtenberg Speed System of Basic Mathematics","a":"Ann Cutler and Rudolph McShane","s":4.08,"c":291},{"t":"The Origin of Species","a":"Charles Darwin","s":4.01,"c":123536},{"t":"The Runaway Universe","a":"Paul Davies","s":4.21,"c":112},{"t":"The Cosmic Blueprint","a":"Paul Davies","s":3.82,"c":164},{"t":"The Edge of Infinity","a":"Paul Davies","s":3.79,"c":48},{"t":"The Selfish Gene","a":"Richard Dawkins","s":4.16,"c":195595},{"t":"The Extended Phenotype","a":"Richard Dawkins","s":4.12,"c":9651},{"t":"The Blind Watchmaker","a":"Richard Dawkins","s":4.09,"c":42158},{"t":"Physical Control of the Mind","a":"José M.R. Delgado","s":3.85,"c":52},{"t":"The Art of Thinking","a":"Ernest Dimnet","s":3.89,"c":237},{"t":"The New Class","a":"Milovan Djilas","s":3.84,"c":291},{"t":"Engines of Creation","a":"K. Eric Drexler","s":4.18,"c":937},{"t":"Disturbing the Universe","a":"Freeman Dyson","s":4.19,"c":927},{"t":"The Biology of Peace and War","a":"Irenäus Eibel-Eibesfeldt","s":4.0,"c":17},{"t":"Ideas and Opinions","a":"Albert Einstein","s":4.12,"c":3368},{"t":"The Man Who Saw Through Time","a":"Loren Eiseley","s":3.95,"c":22},{"t":"Mathematics and the Unexpected","a":"Ivar Ekeland","s":3.61,"c":71},{"t":"Dialectics of Nature","a":"Frederick Engels","s":3.93,"c":522},{"t":"The Micro Millennium","a":"Christopher Evans","s":4.02,"c":43},{"t":"The Aquarian Conspiracy","a":"Marilyn Ferguson","s":3.71,"c":290},{"t":"QED","a":"Richard P. Feynman","s":4.27,"c":19715},{"t":"The Crisis of Psycho-analysis","a":"Erich Fromm","s":3.65,"c":195},{"t":"Utopia or Oblivion","a":"R. Buckminster Fuller","s":4.12,"c":196},{"t":"Systemantics","a":"John Gall","s":3.99,"c":1064},{"t":"Thirty Years That Shook Physics","a":"George Gamow","s":4.19,"c":1286},{"t":"One Two Three...Infinity","a":"George Gamow","s":4.21,"c":3770},{"t":"The Mind's New Science","a":"Howard Gardner","s":3.85,"c":164},{"t":"Relativity for the Million","a":"Martin Gardner","s":4.01,"c":516},{"t":"The Quark and the Jaguar","a":"Murray Gell-Mann","s":3.87,"c":2076},{"t":"General Relativity from A to B","a":"Robert Geroch","s":4.03,"c":109},{"t":"Chaos","a":"James Gleick","s":4.03,"c":41144},{"t":"The Creative Process","a":"Brewster Ghiselin","s":3.73,"c":134},{"t":"Vital Lies","a":"Daniel Goleman","s":3.96,"c":722},{"t":"How the Leopard Changed Its Spots","a":"Brian Goodwin","s":3.77,"c":132},{"t":"Ever Since Darwin","a":"Stephen Jay Gould","s":4.14,"c":3654},{"t":"The Art of Worldly Wisdom","a":"Baltasar Gracian","s":4.17,"c":4301},{"t":"In Search of Schrödinger's Cat","a":"John Gribbin","s":4.07,"c":19433},{"t":"The Tao of Zen","a":"Ray Grigg","s":3.96,"c":90},{"t":"The Silent Language","a":"Edward T. Hall","s":3.73,"c":808},{"t":"Beyond Culture","a":"Edward T. Hall","s":3.96,"c":896},{"t":"The Twilight of Capitalism","a":"Michael Harrington","s":3.9,"c":31},{"t":"A Brief History of Time","a":"Stephen W. Hawking","s":4.21,"c":480621},{"t":"The Fatal Conceit","a":"F.A. Hayek","s":4.22,"c":2575},{"t":"The Tao of Leadership","a":"John Heider","s":4.1,"c":1120},{"t":"Marxism","a":"Robert L. Heilbroner","s":3.81,"c":136},{"t":"Physics and Philosophy","a":"Werner Heisenberg","s":4.03,"c":3312},{"t":"Quantum Reality","a":"Nick Herbert","s":4.08,"c":705},{"t":"The True Believer","a":"Eric Hoffer","s":4.19,"c":12088},{"t":"Gödel, Escher, Bach","a":"Douglas R. Hofstadter","s":4.29,"c":52957},{"t":"Metamagical Themas","a":"Douglas R. Hofstadter","s":4.2,"c":3689},{"t":"The End of Science","a":"John Horgan","s":3.59,"c":644},{"t":"Phenomenology and the Crisis of Philosophy","a":"Edmund Husserl","s":3.62,"c":92},{"t":"Zen in the Martial Arts","a":"Joe Hymans","s":4.19,"c":4008},{"t":"The Enchanted Loom","a":"Robert Jastrow","s":3.85,"c":72},{"t":"The Origin of Consciousness in the Breakdown of the Bicameral Mind","a":"Julian Jaynes","s":4.26,"c":6128},{"t":"Beyond Einstein","a":"Dr. Michio Kaku and Jennifer Trainer","s":4.2,"c":3274},{"t":"Critique of Pure Reason","a":"Immanuel Kant","s":3.96,"c":43397},{"t":"Mathematics and the Imagination","a":"Edward Kasner and James Newman","s":4.16,"c":243},{"t":"The Origins of Order","a":"Stuart A. Kauffman","s":4.18,"c":282},{"t":"Black Holes and Warped Spacetime","a":"William J. Kaufmann, III","s":4.12,"c":160},{"t":"In the Wake of Chaos","a":"Stephen H. Kellert","s":3.55,"c":31},{"t":"Out of Control","a":"Kevin Kelly","s":4.23,"c":1718},{"t":"Mathematics","a":"Morris Kline","s":4.13,"c":461},{"t":"The Act of Creation","a":"Arthur Koestler","s":4.27,"c":466},{"t":"Janus","a":"Arthur Koestler","s":4.29,"c":107},{"t":"The Structure of Scientific Revolutions","a":"Thomas S. Kuhn","s":4.02,"c":26138},{"t":"The Way of Life","a":"Lao Tzu","s":4.29,"c":185779},{"t":"Marx-Engels-Marxism","a":"V.I. Lenin","s":3.94,"c":234},{"t":"The Silent Pulse","a":"George Leonard","s":4.17,"c":77},{"t":"The Savage Mind","a":"Claude Lévi-Strauss","s":3.93,"c":1712},{"t":"Artificial Life","a":"Steven Levy","s":4.0,"c":324},{"t":"Complexity","a":"Roger Lewin","s":3.85,"c":320},{"t":"Behind the Mirror","a":"Konrad Lorenz","s":4.02,"c":165},{"t":"The Prince","a":"Nicolò Machiavelli","s":3.84,"c":391223},{"t":"The Discourses","a":"Nicolò Machiavelli","s":4.08,"c":9891},{"t":"Creative Living for Today","a":"Maxwell Maltz","s":4.3,"c":38},{"t":"Psycho-Cybernetics","a":"Maxwell Maltz","s":4.22,"c":23765},{"t":"The Fractal Geometry of Nature","a":"Benoit B. Mandelbrot","s":4.22,"c":1249},{"t":"Das Kapital","a":"Karl Marx","s":3.91,"c":12290},{"t":"Capital","a":"Karl Marx","s":4.3,"c":14683},{"t":"Grundrisse","a":"Karl Marx","s":4.28,"c":1975},{"t":"The Communist Manifesto","a":"Karl Marx and Friedrich Engels","s":3.69,"c":204419},{"t":"The Courage to Create","a":"Rollo May","s":4.07,"c":4233},{"t":"Toward a New Philosophy of Biology","a":"Ernst Mayr","s":4.25,"c":53},{"t":"The Growth of Biological Thought","a":"Ernst Mayr","s":4.29,"c":191},{"t":"Beast and Man","a":"Mary Midgley","s":4.05,"c":184},{"t":"The Society of Mind","a":"Marvin Minsky","s":4.05,"c":3364},{"t":"Chance & Necessity","a":"Jacques Monod","s":4.21,"c":508},{"t":"The Thermodynamics of Pizza","a":"Harold J. Morowitz","s":3.52,"c":73},{"t":"Gödel's Proof","a":"Ernest Nagel and James R. Newman","s":4.19,"c":5440},{"t":"Megatrends","a":"John Naisbitt","s":3.68,"c":533},{"t":"The World of Mathematics","a":"James R. Newman","s":4.23,"c":121},{"t":"Beyond Good and Evil","a":"Friedrich Nietzsche","s":4.03,"c":117390},{"t":"Thus Spoke Zarathustra","a":"Friedrich Nietzsche","s":4.07,"c":180796},{"t":"Twilight of the Idols","a":"Friedrich Nietzsche","s":4.15,"c":9566},{"t":"The Psychology of Consciousness","a":"Robert E. Ornstein","s":4.15,"c":180},{"t":"The Evolution of Consciousness","a":"Robert E. Ornstein","s":4.19,"c":144},{"t":"What is Philosophy?","a":"José Ortega y Gasset","s":4.08,"c":651},{"t":"Applied Imagination","a":"Alex F. Osborn","s":4.06,"c":98},{"t":"The Dreams of Reason","a":"Heinz R. Pagels","s":4.17,"c":92},{"t":"The Cosmic Code","a":"Heinz R. Pagels","s":4.29,"c":458},{"t":"Beyond Numeracy","a":"John Allen Paulos","s":3.83,"c":499},{"t":"The Crack in the Cosmic Egg","a":"Joseph Chilton Pearce","s":4.02,"c":466},{"t":"The Emperor's New Mind","a":"Roger Penrose","s":3.91,"c":7719},{"t":"Zen and the Art of Motorcycle Maintenance","a":"Robert M. Pirsig","s":3.78,"c":248342},{"t":"The Tacit Dimension","a":"Michael Polanyi","s":4.05,"c":476},{"t":"Knowing and Being","a":"Michael Polanyi","s":4.22,"c":41},{"t":"How to Solve It","a":"G. Polya","s":4.12,"c":5249},{"t":"The Logic of Scientific Discovery","a":"Karl R. Popper","s":4.03,"c":5498},{"t":"Conjectures and Refutations","a":"Karl R. Popper","s":4.2,"c":1834},{"t":"Order Out of Chaos","a":"Ilya Prigogine and Isabelle Stengers","s":4.06,"c":654},{"t":"Extinction","a":"David M. Raup","s":4.1,"c":175},{"t":"The Celestine Prophecy","a":"James Redfield","s":3.74,"c":124315},{"t":"The Greening of America","a":"Charles A. Reich","s":3.59,"c":385},{"t":"The Brain","a":"Richard M. Restak, M.D.","s":4.1,"c":68},{"t":"How Democracies Perish","a":"Jean-François Revel","s":3.97,"c":87},{"t":"Entropy","a":"Jeremy Rifkin","s":3.84,"c":365},{"t":"The Master Game","a":"Robert S. de Ropp","s":4.19,"c":206},{"t":"The Social Contract","a":"Jean-Jacques Rousseau","s":3.78,"c":59187},{"t":"Infinity and the Mind","a":"Rudy Rucker","s":4.01,"c":850},{"t":"Mind Tools","a":"Rudy Rucker","s":4.01,"c":146},{"t":"Chance and Chaos","a":"David Ruelle","s":3.69,"c":337},{"t":"A History of Western Philosophy","a":"Bertrand Russell","s":4.13,"c":41911},{"t":"The Concept of Mind","a":"Gilbert Ryle","s":3.92,"c":1778},{"t":"The Dragons of Eden","a":"Carl Sagan","s":4.19,"c":21687},{"t":"The Semi-Sovereign People","a":"E. E. Schattschneider","s":3.97,"c":236},{"t":"The Strategy of Conflict","a":"Thomas C. Schelling","s":4.01,"c":958},{"t":"Capitalism","a":"Joseph A. Schumpeter","s":3.99,"c":2985},{"t":"The Uses of Disorder","a":"Richard Sennett","s":3.88,"c":263},{"t":"The Presence of the Past","a":"Rupert Sheldrake","s":4.2,"c":428},{"t":"A New Science of Life","a":"Rupert Sheldrake","s":4.07,"c":341},{"t":"Beyond Freedom & Dignity","a":"B.F. Skinner","s":3.75,"c":2467},{"t":"The Power Game","a":"Hedrick Smith","s":3.99,"c":276},{"t":"Forever Undecided","a":"Raymond Smullyan","s":4.06,"c":84},{"t":"Does God Play Dice?","a":"Ian Stewart","s":4.02,"c":1739},{"t":"Mysticism and the New Physics","a":"Michael Talbot","s":3.95,"c":361},{"t":"Calculus","a":"George B. Thomas, Jr.","s":4.05,"c":546},{"t":"Darkness and Scattered Light","a":"William Irwin Thompson","s":4.37,"c":30},{"t":"Worlds in Collision","a":"I. Velikovsky","s":4.0,"c":1083},{"t":"General System Theory","a":"Ludwig von Bertalanffy","s":3.87,"c":440},{"t":"The Computer and the Brain","a":"John von Neumann","s":3.91,"c":851},{"t":"Introduction to Mathematical Thinking","a":"Friedrich Waismann","s":4.33,"c":33},{"t":"Complexity","a":"M. Mitchell Waldrop","s":4.05,"c":3191},{"t":"The Book","a":"Alan Watts","s":4.21,"c":25270},{"t":"The Wisdom of Insecurity","a":"Alan Watts","s":4.14,"c":29357},{"t":"The Human Use of Human Beings","a":"Norbert Wiener","s":4.02,"c":961},{"t":"Process and Reality","a":"Alfred North Whitehead","s":4.2,"c":967},{"t":"The Complete Strategyst","a":"J.D. Williams","s":3.47,"c":219},{"t":"On Human Nature","a":"Edward O. Wilson","s":4.14,"c":3656},{"t":"Taking the Quantum Leap","a":"Fred Alan Wolf","s":4.04,"c":546},{"t":"The Dancing Wu Li Masters","a":"Gary Zukav","s":4.01,"c":10980},{"t":"Inside the Company","a":"Philip Agee","s":3.66,"c":288},{"t":"The Puzzle Palace","a":"James Bamford","s":3.89,"c":1336},{"t":"The Codebreakers","a":"David Kahn","s":4.18,"c":1521},{"t":"The CIA and the Cult of Intelligence","a":"Victor Marchetti and John D. Marks","s":3.95,"c":290},{"t":"Wilderness of Mirrors","a":"David C. Martin","s":3.93,"c":272},{"t":"The True Believer","a":"Eric Hoffer","s":4.19,"c":12088},{"t":"The Man Who Kept the Secrets","a":"Thomas Powers","s":4.01,"c":163},{"t":"The American Black Chamber","a":"Herbert O. Yardley","s":4.13,"c":150},{"t":"Out of the Crisis","a":"W. Edwards Deming","s":4.01,"c":4571},{"t":"Today and Tomorrow","a":"Henry Ford","s":4.18,"c":169},{"t":"The Entropy Law and the Economic Process","a":"Nicholas Georgescu-Roegen","s":4.18,"c":85},{"t":"Think and Grow Rich","a":"Napoleon Hill","s":4.16,"c":389666},{"t":"Kaizen","a":"Masaaki Imai","s":3.99,"c":448},{"t":"Cities and the Wealth of Nations","a":"Jane Jacobs","s":4.11,"c":676},{"t":"Toyota Production System","a":"Yasuhiro Monden","s":4.31,"c":68},{"t":"Workplace Management","a":"Taiichi Ohno","s":4.37,"c":302},{"t":"Toyota Production System","a":"Taiichi Ohno","s":4.11,"c":2086},{"t":"In Search of Excellence","a":"Thomas J. Peters and Robert H. Waterman, Jr.","s":3.91,"c":13729},{"t":"A Revolution in Manufacturing","a":"Shigeo Shingo","s":4.28,"c":86},{"t":"A Study of the Toyota Production System","a":"Shigeo Shingo","s":4.09,"c":113},{"t":"Competing Against Time","a":"George Stalk, Jr. and Thomas M. Hout","s":3.89,"c":366},{"t":"The Machine That Changed the World","a":"James P. Womack, Daniel T. Jones, and Daniel Roos","s":4.03,"c":2562},{"t":"Jonathan Livingston Seagull","a":"Richard Bach","s":3.86,"c":276544},{"t":"The Law","a":"Frederic Bastiat","s":4.33,"c":14521},{"t":"The Denial of Death","a":"Ernest Becker","s":4.05,"c":16512},{"t":"Feeling Good","a":"David D. Burns","s":4.06,"c":34490},{"t":"Grammatical Man","a":"Jeremy Campbell","s":4.19,"c":269},{"t":"Ender's Game","a":"Orson Scott Card","s":4.31,"c":1490489},{"t":"Finite and Infinite Games","a":"James P. Carse","s":3.72,"c":7751},{"t":"The Invisible Pyramid","a":"Loren Eiseley","s":4.37,"c":331},{"t":"The Gentle Art of Verbal Self-Defense","a":"Suzette Haden Elgin","s":3.78,"c":736},{"t":"I'm OK — You're OK","a":"Thomas A. Harris","s":3.76,"c":19566},{"t":"Imaginary Magnitude","a":"Stanislaw Lem","s":3.97,"c":926},{"t":"The Limits to Growth","a":"Donella Meadows, et al.","s":4.17,"c":935},{"t":"The Survivor","a":"Terrence des Pres","s":4.3,"c":188},{"t":"Future Shock","a":"Alvin Toffler","s":3.82,"c":5298},{"t":"From Active Defense to AirLand Battle","a":"John L. Romjue","s":4.0,"c":3}];

  var SLOPE = [{"t":"Zen and Creative Management","a":"Albert Low","hi":3.1,"mr":3.27,"c":11},{"t":"Inside the Company","a":"Philip Agee","hi":3.67,"mr":3.66,"c":288},{"t":"Chance and Chaos","a":"David Ruelle","hi":3.68,"mr":3.69,"c":337},{"t":"The Crisis of Psycho-analysis","a":"Erich Fromm","hi":3.71,"mr":3.65,"c":195},{"t":"Inside the KGB","a":"Aleksei Myagkov","hi":3.72,"mr":3.58,"c":50},{"t":"Finite and Infinite Games","a":"James P. Carse","hi":3.73,"mr":3.72,"c":7751},{"t":"Quantum Physics","a":"Alastair I. M. Rae","hi":3.75,"mr":3.74,"c":194},{"t":"The Craft of Intelligence","a":"Allen Dulles","hi":3.76,"mr":3.75,"c":939},{"t":"Their Trade is Treachery","a":"Chapman Pincher","hi":3.76,"mr":3.74,"c":136},{"t":"The End of Science","a":"John Horgan","hi":3.77,"mr":3.59,"c":644},{"t":"The Astonishing Hypothesis","a":"Francis Crick","hi":3.79,"mr":3.77,"c":937},{"t":"The Edge of Infinity","a":"Paul Davies","hi":3.82,"mr":3.79,"c":48},{"t":"The Silent Language","a":"Edward T. Hall","hi":3.83,"mr":3.73,"c":808},{"t":"Entropy","a":"Jeremy Rifkin","hi":3.83,"mr":3.84,"c":365},{"t":"Lateral Thinking","a":"Edward de Bono","hi":3.84,"mr":3.76,"c":4828},{"t":"The Art of Thinking","a":"Ernest Dimnet","hi":3.86,"mr":3.89,"c":237},{"t":"The Making of Memory","a":"Steven Rose","hi":3.86,"mr":3.64,"c":92},{"t":"Psychology As Religion","a":"Paul C. Vitz","hi":3.86,"mr":3.68,"c":264},{"t":"The New Class","a":"Milovan Djilas","hi":3.87,"mr":3.84,"c":291},{"t":"Longing for the Harmonies","a":"Frank Wilczek","hi":3.88,"mr":3.91,"c":69},{"t":"Physical Control of the Mind","a":"José M.R. Delgado","hi":3.9,"mr":3.85,"c":52},{"t":"The Uses of Disorder","a":"Richard Sennett","hi":3.91,"mr":3.88,"c":263},{"t":"The Puzzle Palace","a":"James Bamford","hi":3.91,"mr":3.89,"c":1336},{"t":"The Hunters and the Hunted","a":"James B. Swartz","hi":3.91,"mr":3.78,"c":18},{"t":"Dialectics of Nature","a":"Frederick Engels","hi":3.92,"mr":3.93,"c":522},{"t":"The Concept of Mind","a":"Gilbert Ryle","hi":3.93,"mr":3.92,"c":1778},{"t":"Portrait of a Cold Warrior","a":"Joseph B. Smith","hi":3.96,"mr":4.0,"c":25},{"t":"Mysticism and the New Physics","a":"Michael Talbot","hi":3.97,"mr":3.95,"c":361},{"t":"The Tao of Physics","a":"Fritjof Capra","hi":4.0,"mr":3.97,"c":19654},{"t":"Behind the Mirror","a":"Konrad Lorenz","hi":4.0,"mr":4.02,"c":165},{"t":"The Dancing Wu Li Masters","a":"Gary Zukav","hi":4.0,"mr":4.01,"c":10980},{"t":"Relativity for the Million","a":"Martin Gardner","hi":4.02,"mr":4.01,"c":516},{"t":"The Strategy of Conflict","a":"Thomas C. Schelling","hi":4.03,"mr":4.01,"c":958},{"t":"A New Science of Life","a":"Rupert Sheldrake","hi":4.04,"mr":4.07,"c":341},{"t":"The Denial of Death","a":"Ernest Becker","hi":4.04,"mr":4.05,"c":16512},{"t":"Vital Lies","a":"Daniel Goleman","hi":4.05,"mr":3.96,"c":722},{"t":"Taking the Quantum Leap","a":"Fred Alan Wolf","hi":4.05,"mr":4.04,"c":546},{"t":"Kaizen","a":"Masaaki Imai","hi":4.05,"mr":3.99,"c":448},{"t":"The Tacit Dimension","a":"Michael Polanyi","hi":4.06,"mr":4.05,"c":476},{"t":"Does God Play Dice?","a":"Ian Stewart","hi":4.06,"mr":4.02,"c":1739},{"t":"Systemantics","a":"John Gall","hi":4.07,"mr":3.99,"c":1064},{"t":"The Way of Life","a":"Lao Tzu","hi":4.07,"mr":4.29,"c":185779},{"t":"Forever Undecided","a":"Raymond Smullyan","hi":4.07,"mr":4.06,"c":84},{"t":"The Closing of the American Mind","a":"Allan Bloom","hi":4.09,"mr":3.76,"c":6037},{"t":"The Creative Mind","a":"Henri Bergson","hi":4.1,"mr":4.05,"c":360},{"t":"In Search of Schrödinger's Cat","a":"John Gribbin","hi":4.1,"mr":4.07,"c":19433},{"t":"Physics and Philosophy","a":"Werner Heisenberg","hi":4.1,"mr":4.03,"c":3312},{"t":"Cities and the Wealth of Nations","a":"Jane Jacobs","hi":4.1,"mr":4.11,"c":676},{"t":"Toyota Production System","a":"Taiichi Ohno","hi":4.1,"mr":4.11,"c":2086},{"t":"Order Out of Chaos","a":"Ilya Prigogine and Isabelle Stengers","hi":4.11,"mr":4.06,"c":654},{"t":"The Phenomenon of Man","a":"Pierre Teilhard de Chardin","hi":4.12,"mr":4.05,"c":1737},{"t":"A History of Western Philosophy","a":"Bertrand Russell","hi":4.12,"mr":4.13,"c":41911},{"t":"Utopia or Oblivion","a":"R. Buckminster Fuller","hi":4.13,"mr":4.12,"c":196},{"t":"Ever Since Darwin","a":"Stephen Jay Gould","hi":4.13,"mr":4.14,"c":3654},{"t":"The Identity of Man","a":"Jacob Bronowski","hi":4.14,"mr":4.0,"c":90},{"t":"Twilight of the Idols","a":"Friedrich Nietzsche","hi":4.14,"mr":4.15,"c":9566},{"t":"Ideas and Opinions","a":"Albert Einstein","hi":4.16,"mr":4.12,"c":3368},{"t":"Mathematics and the Imagination","a":"Edward Kasner and James Newman","hi":4.17,"mr":4.16,"c":243},{"t":"Calculus","a":"George B. Thomas, Jr.","hi":4.17,"mr":4.05,"c":546},{"t":"The Master Game","a":"Robert S. de Ropp","hi":4.18,"mr":4.19,"c":206},{"t":"The Wisdom of Insecurity","a":"Alan Watts","hi":4.18,"mr":4.14,"c":29357},{"t":"Janus","a":"Arthur Koestler","hi":4.19,"mr":4.29,"c":107},{"t":"Conjectures and Refutations","a":"Karl R. Popper","hi":4.19,"mr":4.2,"c":1834},{"t":"The Codebreakers","a":"David Kahn","hi":4.19,"mr":4.18,"c":1521},{"t":"The Ascent of Man","a":"J. Bronowski","hi":4.2,"mr":4.21,"c":6372},{"t":"Thirty Years That Shook Physics","a":"George Gamow","hi":4.21,"mr":4.19,"c":1286},{"t":"Turbulent Mirror","a":"John Briggs and F. David Peat","hi":4.22,"mr":4.19,"c":297},{"t":"The Blind Watchmaker","a":"Richard Dawkins","hi":4.22,"mr":4.09,"c":42158},{"t":"The Entropy Law and the Economic Process","a":"Nicholas Georgescu-Roegen","hi":4.22,"mr":4.18,"c":85},{"t":"The Art of Worldly Wisdom","a":"Baltasar Gracian","hi":4.23,"mr":4.17,"c":4301},{"t":"The Fractal Geometry of Nature","a":"Benoit B. Mandelbrot","hi":4.23,"mr":4.22,"c":1249},{"t":"The Act of Creation","a":"Arthur Koestler","hi":4.25,"mr":4.27,"c":466},{"t":"The Cosmic Code","a":"Heinz R. Pagels","hi":4.28,"mr":4.29,"c":458},{"t":"The Evolution of Cooperation","a":"Robert Axelrod","hi":4.29,"mr":4.25,"c":2397},{"t":"Think and Grow Rich","a":"Napoleon Hill","hi":4.3,"mr":4.16,"c":389666},{"t":"Mind and Nature","a":"Gregory Bateson","hi":4.31,"mr":4.27,"c":825},{"t":"The Aquarian Conspiracy","a":"Marilyn Ferguson","hi":4.31,"mr":3.71,"c":290},{"t":"The Selfish Gene","a":"Richard Dawkins","hi":4.32,"mr":4.16,"c":195595},{"t":"Betrayers of the Truth","a":"William Broad and Nicholas Wade","hi":4.33,"mr":3.76,"c":86},{"t":"The Law","a":"Frederic Bastiat","hi":4.34,"mr":4.33,"c":14521},{"t":"Success-Cybernetics","a":"U.S. Andersen","hi":4.36,"mr":4.2,"c":15},{"t":"Workplace Management","a":"Taiichi Ohno","hi":4.38,"mr":4.37,"c":302},{"t":"The Invisible Pyramid","a":"Loren Eiseley","hi":4.38,"mr":4.37,"c":331},{"t":"Mathematics","a":"A.D. Aleksandrov, et.al.","hi":4.54,"mr":4.44,"c":241}];

  // ── Stats band ─────────────────────────────────────────────────────────────
  function drawStats() {
    var statsEl = document.getElementById('charts-stats');
    if (!statsEl) return;
    var n    = DATA.length;
    var maxC = d3.max(DATA, function(d){ return d.c; });
    var best = DATA.filter(function(d){ return d.c >= 200; }).reduce(function(a,b){ return b.s > a.s ? b : a; });
    var med  = d3.median(DATA, function(d){ return d.c; });
    var cards = [
      [n, 'titles with a rating and reader count'],
      [fmt(maxC), 'ratings for the most-read title'],
      [Math.round(med), 'median readers per book'],
      [best.s.toFixed(2), 'top rating among well-read books']
    ];
    d3.select(statsEl).selectAll('.charts-stat').data(cards).join('div')
      .attr('class', 'charts-stat')
      .html(function(d){ return '<span class="charts-stat-n">' + d[0] + '</span><span class="charts-stat-l">' + d[1] + '</span>'; });
  }

  // ── FIG 01 Scatter ─────────────────────────────────────────────────────────
  function drawScatter() {
    var el = document.getElementById('scatter');
    if (!el) return;
    var W = el.clientWidth || 960, H = 520;
    var m = {t:24, r:24, b:54, l:64};
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var svg = d3.select(el).append('svg').attr('viewBox','0 0 ' + W + ' ' + H).style('width','100%').style('height','auto');
    var g = svg.append('g').attr('transform','translate(' + m.l + ',' + m.t + ')');

    var x = d3.scaleLinear().domain([2.6, 5.02]).range([0, iw]);
    var y = d3.scaleLog().domain([1, d3.max(DATA, function(d){ return d.c; }) * 1.3]).range([ih, 0]);
    var r = d3.scaleSqrt().domain([1, d3.max(DATA, function(d){ return d.c; })]).range([2.4, 16]);

    var cMed = d3.median(DATA, function(d){ return d.c; }), sMid = 4.0;

    g.append('rect').attr('x',x(sMid)).attr('y',0).attr('width',iw-x(sMid)).attr('height',y(cMed)).attr('fill','#b08524').attr('opacity',.04);
    g.append('rect').attr('x',x(sMid)).attr('y',y(cMed)).attr('width',iw-x(sMid)).attr('height',ih-y(cMed)).attr('fill','#2f5d50').attr('opacity',.04);
    g.append('rect').attr('x',0).attr('y',0).attr('width',x(sMid)).attr('height',y(cMed)).attr('fill','#9a3b2e').attr('opacity',.04);

    g.append('g').attr('class','grid').call(d3.axisLeft(y).tickValues([1,10,100,1000,10000,100000,1000000]).tickSize(-iw).tickFormat(''));
    g.append('g').attr('class','axis').attr('transform','translate(0,' + ih + ')').call(d3.axisBottom(x).ticks(6).tickFormat(d3.format('.1f')));
    g.append('g').attr('class','axis').call(d3.axisLeft(y).tickValues([1,10,100,1000,10000,100000,1000000]).tickFormat(d3.format('~s')));

    g.append('line').attr('x1',x(sMid)).attr('x2',x(sMid)).attr('y1',0).attr('y2',ih).attr('stroke','#1a1a1a').attr('stroke-dasharray','3 4').attr('opacity',.3);
    g.append('line').attr('x1',0).attr('x2',iw).attr('y1',y(cMed)).attr('y2',y(cMed)).attr('stroke','#1a1a1a').attr('stroke-dasharray','3 4').attr('opacity',.3);

    g.append('text').attr('font-family','monospace').attr('font-size',9).attr('letter-spacing','0.15em').attr('text-transform','uppercase').attr('fill','#9a9590').attr('x',iw).attr('y',ih-10).attr('text-anchor','end').text('Average rating →');
    g.append('text').attr('font-family','monospace').attr('font-size',9).attr('letter-spacing','0.15em').attr('fill','#9a9590').attr('transform','rotate(-90)').attr('x',0).attr('y',-46).attr('text-anchor','end').text('Number of ratings (log) →');

    function ql(xx,yy,t,s,anchor){
      g.append('text').attr('font-family','Georgia,serif').attr('font-style','italic').attr('font-size',16).attr('fill','#1a1a1a').attr('opacity',.45).attr('x',xx).attr('y',yy).attr('text-anchor',anchor).text(t);
      g.append('text').attr('font-family','monospace').attr('font-size',9).attr('letter-spacing','0.12em').attr('fill','#9a9590').attr('opacity',.7).attr('x',xx).attr('y',yy+14).attr('text-anchor',anchor).text(s);
    }
    ql(iw-6,22,'Widely beloved','high rating · many readers','end');
    ql(iw-6,ih-30,'Quietly strong','high rating · few readers','end');
    ql(6,22,'Popular & contested','many readers · lower rating','start');
    ql(6,ih-30,'Thinly sampled','few readers · lower rating','start');

    function color(d){
      var hi = d.s >= sMid, many = d.c >= cMed;
      if(hi && many)  return '#b08524';
      if(hi && !many) return '#2f5d50';
      if(!hi && many) return '#9a3b2e';
      return '#9a9590';
    }

    g.selectAll('.dot').data(DATA).join('circle').attr('class','dot')
      .attr('cx', function(d){ return x(Math.max(2.6, Math.min(5, d.s))); })
      .attr('cy', function(d){ return y(d.c); })
      .attr('r',  function(d){ return r(d.c); })
      .attr('fill', color).attr('opacity', .62).style('cursor','pointer')
      .on('mousemove', function(e,d){ showTip('<span class="ct">' + d.t + '</span><span class="ca">' + (d.a||'—') + '</span><br>★ ' + d.s.toFixed(2) + ' · ' + fmt(d.c) + ' ratings', e); })
      .on('mouseleave', hideTip);
  }

  // ── FIG 02 Bars ────────────────────────────────────────────────────────────
  function drawBars() {
    var el = document.getElementById('bars');
    if (!el) return;
    var top = DATA.slice().sort(function(a,b){ return b.c - a.c; }).slice(0, 14);
    var W = el.clientWidth || 960, rowH = 36, H = top.length * rowH + 40;
    var m = {t:10, r:64, b:30, l:8};
    var labelW = Math.min(300, W * 0.34);
    var iw = W - m.l - m.r - labelW;
    var svg = d3.select(el).append('svg').attr('viewBox','0 0 ' + W + ' ' + H).style('width','100%').style('height','auto');
    var x = d3.scaleLog().domain([100, d3.max(top, function(d){ return d.c; }) * 1.1]).range([0, iw]);
    var yb = d3.scaleBand().domain(top.map(function(d){ return d.t; })).range([m.t, H - m.b]).padding(.28);
    var sc = d3.scaleSequential(d3.interpolateRgb('#9a3b2e','#2f5d50')).domain([3.4, 4.6]).clamp(true);
    var g = svg.append('g').attr('transform','translate(' + (labelW + m.l) + ',0)');

    g.selectAll('.bar').data(top).join('rect').attr('class','bar')
      .attr('x',0).attr('y',function(d){ return yb(d.t); }).attr('height',yb.bandwidth())
      .attr('width',function(d){ return x(d.c); }).attr('fill',function(d){ return sc(d.s); }).attr('rx',1)
      .style('cursor','pointer').style('transition','opacity .15s')
      .on('mousemove',function(e,d){ showTip('<span class="ct">' + d.t + '</span><span class="ca">' + (d.a||'—') + '</span><br>★ ' + d.s.toFixed(2) + ' · ' + fmt(d.c) + ' ratings', e); })
      .on('mouseleave',hideTip);

    svg.append('g').selectAll('text').data(top).join('text')
      .attr('font-family','Georgia,serif').attr('font-size',14).attr('fill','#1a1a1a')
      .attr('x',labelW-6).attr('y',function(d){ return yb(d.t) + yb.bandwidth()/2 + 5; }).attr('text-anchor','end')
      .text(function(d){ return d.t.length > 34 ? d.t.slice(0,33) + '…' : d.t; });

    g.selectAll('.bv').data(top).join('text')
      .attr('font-family','monospace').attr('font-size',10).attr('fill','#555550')
      .attr('x',function(d){ return x(d.c) + 8; }).attr('y',function(d){ return yb(d.t) + yb.bandwidth()/2 + 4; })
      .text(function(d){ return '★ ' + d.s.toFixed(2); });
  }

  // ── FIG 03 Ridge / Density ─────────────────────────────────────────────────
  function drawRidge() {
    var el = document.getElementById('ridge');
    if (!el) return;
    var W = el.clientWidth || 960, H = 300;
    var m = {t:20, r:24, b:46, l:24};
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var svg = d3.select(el).append('svg').attr('viewBox','0 0 ' + W + ' ' + H).style('width','100%').style('height','auto');
    var g = svg.append('g').attr('transform','translate(' + m.l + ',' + m.t + ')');
    var x = d3.scaleLinear().domain([2.4, 5.05]).range([0, iw]);
    var vals = DATA.map(function(d){ return d.s; });

    function kde(k,X){ return function(V){ return X.map(function(xv){ return [xv, d3.mean(V, function(v){ return k(xv-v); })]; }); }; }
    function epan(b){ return function(v){ return Math.abs(v/=b)<=1 ? .75*(1-v*v)/b : 0; }; }
    var X = d3.range(2.4, 5.05, 0.02);
    var dens = kde(epan(.18), X)(vals);
    var y = d3.scaleLinear().domain([0, d3.max(dens, function(d){ return d[1]; }) * 1.1]).range([ih, 0]);
    var area = d3.area().curve(d3.curveBasis).x(function(d){ return x(d[0]); }).y0(ih).y1(function(d){ return y(d[1]); });
    var line = d3.line().curve(d3.curveBasis).x(function(d){ return x(d[0]); }).y(function(d){ return y(d[1]); });

    var grad = svg.append('defs').append('linearGradient').attr('id','rg2').attr('x1','0').attr('x2','1');
    grad.append('stop').attr('offset','0%').attr('stop-color','#9a3b2e');
    grad.append('stop').attr('offset','100%').attr('stop-color','#2f5d50');

    g.append('path').datum(dens).attr('d',area).attr('fill','url(#rg2)').attr('opacity',.14);
    g.append('path').datum(dens).attr('d',line).attr('fill','none').attr('stroke','url(#rg2)').attr('stroke-width',2);

    g.selectAll('.rug').data(DATA).join('line')
      .attr('x1',function(d){ return x(d.s); }).attr('x2',function(d){ return x(d.s); })
      .attr('y1',ih).attr('y2',ih+8).attr('stroke','#1a1a1a').attr('opacity',.18);

    g.append('g').attr('class','axis').attr('transform','translate(0,' + (ih+8) + ')').call(d3.axisBottom(x).ticks(7).tickFormat(d3.format('.1f')));
    g.append('text').attr('font-family','monospace').attr('font-size',9).attr('fill','#9a9590').attr('x',iw).attr('y',ih+38).attr('text-anchor','end').text('Average rating →');

    var md = d3.median(vals);
    g.append('line').attr('x1',x(md)).attr('x2',x(md)).attr('y1',0).attr('y2',ih).attr('stroke','#1a1a1a').attr('stroke-dasharray','3 4').attr('opacity',.4);
    g.append('text').attr('font-family','monospace').attr('font-size',9).attr('fill','#9a9590').attr('x',x(md)+6).attr('y',12).text('median ' + md.toFixed(2));
  }

  // ── FIG 04 Slope ───────────────────────────────────────────────────────────
  function drawSlope() {
    var el = document.getElementById('slope');
    if (!el) return;
    var W = el.clientWidth || 960;
    var books = SLOPE.slice().sort(function(a,b){ return (b.hi - a.hi) || (b.mr - a.mr); });
    var m = {t:42, r:240, b:30, l:240};
    var colW = W - m.l - m.r;
    var rowsH = Math.max(560, books.length * 7.5);
    var H = rowsH + m.t + m.b;
    var svg = d3.select(el).append('svg').attr('viewBox','0 0 ' + W + ' ' + H).style('width','100%').style('height','auto');
    var g = svg.append('g').attr('transform','translate(' + m.l + ',' + m.t + ')');
    var y = d3.scaleLinear().domain([3.0, 4.55]).range([rowsH, 0]);
    var xL = 0, xR = colW;

    [['Highest recorded', xL], ['Most-rated edition', xR]].forEach(function(c){
      g.append('line').attr('x1',c[1]).attr('x2',c[1]).attr('y1',-10).attr('y2',rowsH+6).attr('stroke','#e0ddd8').attr('stroke-width',1);
      g.append('text').attr('font-family','monospace').attr('font-size',10).attr('letter-spacing','0.16em').attr('fill','#9a9590').attr('x',c[1]).attr('y',-22).attr('text-anchor','middle').text(c[0]);
    });

    var ticks = [3.0, 3.2, 3.4, 3.6, 3.8, 4.0, 4.2, 4.4];
    ticks.forEach(function(t){
      g.append('line').attr('x1',xL).attr('x2',xR).attr('y1',y(t)).attr('y2',y(t)).attr('stroke','#eeedea').attr('stroke-dasharray','2 3');
      g.append('text').attr('font-family','monospace').attr('font-size',9).attr('fill','#9a9590').attr('x',xL-8).attr('y',y(t)+3).attr('text-anchor','end').text(t.toFixed(1));
      g.append('text').attr('font-family','monospace').attr('font-size',9).attr('fill','#9a9590').attr('x',xR+8).attr('y',y(t)+3).attr('text-anchor','start').text(t.toFixed(1));
    });

    function col(d){ return d.mr > d.hi ? '#2f5d50' : (d.mr < d.hi ? '#9a3b2e' : '#9a9590'); }

    var movers = books.slice().sort(function(a,b){ return Math.abs(b.hi-b.mr) - Math.abs(a.hi-a.mr); }).slice(0,9).map(function(d){ return d.t; });
    var popular = books.filter(function(d){ return d.c; }).sort(function(a,b){ return b.c-a.c; }).slice(0,6).map(function(d){ return d.t; });
    var labelSet = {};
    movers.concat(popular).forEach(function(t){ labelSet[t] = true; });

    var lines = g.append('g');
    books.forEach(function(d){
      var yL = y(d.hi), yR = y(d.mr);
      var labelled = !!labelSet[d.t];
      var grp = lines.append('g').style('cursor','pointer')
        .on('mousemove',function(e){ showTip('<span class="ct">' + d.t + '</span><span class="ca">' + (d.a||'—') + '</span><br>highest ★ ' + d.hi.toFixed(2) + ' → most-rated ★ ' + d.mr.toFixed(2) + (d.c ? ' · ' + fmt(d.c) + ' ratings' : ''), e); })
        .on('mouseleave',hideTip);
      grp.append('line').attr('x1',xL).attr('y1',yL).attr('x2',xR).attr('y2',yR).attr('stroke',col(d)).attr('stroke-width',labelled?1.6:0.8).attr('opacity',labelled?0.9:0.35);
      grp.append('circle').attr('cx',xL).attr('cy',yL).attr('r',labelled?3:2).attr('fill',col(d));
      grp.append('circle').attr('cx',xR).attr('cy',yR).attr('r',labelled?3:2).attr('fill',col(d));
    });

    var placedL = [], placedR = [];
    books.filter(function(d){ return !!labelSet[d.t]; }).forEach(function(d){
      var yL = y(d.hi), yR = y(d.mr);
      var ly = yL;
      while (placedL.some(function(p){ return Math.abs(p-ly) < 12; })) ly -= 12;
      placedL.push(ly);
      var tt = d.t.length > 30 ? d.t.slice(0,29)+'…' : d.t;
      var tL = g.append('text').attr('x',xL-22).attr('y',ly+3).attr('text-anchor','end');
      tL.append('tspan').attr('font-family','Georgia,serif').attr('font-style','italic').attr('font-size',13).attr('fill','#1a1a1a').text(tt);
      var ry = yR;
      while (placedR.some(function(p){ return Math.abs(p-ry) < 13; })) ry += 13;
      placedR.push(ry);
      g.append('text').attr('font-family','monospace').attr('font-size',10).attr('fill','#9a9590').attr('x',xR+22).attr('y',ry+3).attr('text-anchor','start')
        .text(d.mr.toFixed(2) + '  (' + (d.hi>d.mr?'−':'+') + Math.abs(d.hi-d.mr).toFixed(2) + ')');
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    if (typeof d3 === 'undefined') return;
    if (!document.getElementById('scatter')) return;
    drawStats();
    drawScatter();
    drawBars();
    drawRidge();
    drawSlope();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
