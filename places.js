// ─────────────────────────────────────────────────────────────
//  YOUR LIST OF PLACES
//  This is the only file you need to edit to add a place.
//  Think of each { ... } block as one row in a spreadsheet.
//  Copy the TEMPLATE at the bottom, paste it into the list, fill it in.
//
//  The entries marked sample: true are EXAMPLES showing the format.
//  Delete them (or set sample: false and rewrite them) once you add your own.
// ─────────────────────────────────────────────────────────────

window.RUBRIC = {
  // 1–5 scores. 5 = best for that kind of visitor.
  senior: "Senior-friendly",
  family: "Family-friendly",
  // Physical effort: 1 = sit-down, 5 = strenuous hike
  effort: ["Sit-down", "Easy stroll", "Moderate walking", "Hills or stairs", "Strenuous"],
  // Language: how much English (or the local language) you need to enjoy it
  language: ["No words needed", "Some English helps", "Needs good English"],
  amenities: {
    restrooms: "Clean restrooms",
    seating: "Benches to rest",
    parking: "Parking close by",
    wheelchair: "Wheelchair accessible",
    food: "Food on site",
    shade: "Shade or indoors",
  },
};

window.PLACES = [
  {
    sample: true,
    name: "Monterey Bay Aquarium",
    city: "Monterey",
    category: "Museum",
    visited: "2026-04",
    overall: 5,
    senior: 5,
    family: 5,
    effort: 2,
    language: 0,
    cost: "$$$",
    time: "3–4 hrs",
    amenities: ["restrooms", "seating", "wheelchair", "food", "shade"],
    impression:
      "Sample entry. The jellyfish gallery works for every age and needs no translation. Plenty of places to sit and watch the kelp forest tank.",
    tip: "Go on a weekday morning. Pair it with a slow lunch on Cannery Row.",
    link: "https://www.montereybayaquarium.org",
  },
  {
    sample: true,
    name: "Filoli Historic House & Garden",
    city: "Woodside",
    category: "Garden",
    visited: "2026-03",
    overall: 4.5,
    senior: 4,
    family: 3,
    effort: 3,
    language: 0,
    cost: "$$",
    time: "2–3 hrs",
    amenities: ["restrooms", "seating", "parking", "food"],
    impression:
      "Sample entry. Gardens are beautiful and photo-friendly. Gravel paths and some slopes, so pace it with a few bench breaks.",
    tip: "Spring bloom is the peak. Book timed tickets ahead.",
    link: "https://filoli.org",
  },
  {
    sample: true,
    name: "Cantor Arts Center & Stanford campus",
    city: "Stanford",
    category: "Museum",
    visited: "2026-02",
    overall: 4,
    senior: 5,
    family: 4,
    effort: 2,
    language: 1,
    cost: "Free",
    time: "2 hrs",
    amenities: ["restrooms", "seating", "wheelchair", "shade"],
    impression:
      "Sample entry. Free, calm, and indoors. The Rodin sculptures outside are the highlight. Wall labels are in English, but the art speaks for itself.",
    tip: "Walk over to the Main Quad and Memorial Church afterwards.",
    link: "https://museum.stanford.edu",
  },
  {
    sample: true,
    name: "Computer History Museum",
    city: "Mountain View",
    category: "Museum",
    visited: "2026-01",
    overall: 3.5,
    senior: 4,
    family: 3,
    effort: 2,
    language: 2,
    cost: "$$",
    time: "2–3 hrs",
    amenities: ["restrooms", "seating", "parking", "wheelchair", "shade"],
    impression:
      "Sample entry. Great for engineers in the family. Most of the story lives in the English text panels, so it is less fun if you need to translate everything.",
    tip: "Do a guided tour or be ready to be the translator.",
    link: "https://computerhistory.org",
  },
  {
    sample: true,
    name: "Muir Woods National Monument",
    city: "Mill Valley",
    category: "Nature",
    visited: "2025-10",
    overall: 4.5,
    senior: 4,
    family: 5,
    effort: 2,
    language: 0,
    cost: "$",
    time: "2 hrs",
    amenities: ["restrooms", "seating", "food"],
    impression:
      "Sample entry. The main boardwalk loop is flat and shady under the redwoods. Turn back whenever legs get tired.",
    tip: "Parking or shuttle reservations are required. Book before you drive up.",
    link: "https://www.nps.gov/muwo",
  },
  {
    sample: true,
    name: "Japanese Tea Garden, Golden Gate Park",
    city: "San Francisco",
    category: "Garden",
    visited: "2025-09",
    overall: 4,
    senior: 3,
    family: 4,
    effort: 3,
    language: 0,
    cost: "$",
    time: "1–1.5 hrs",
    amenities: ["restrooms", "food"],
    impression:
      "Sample entry. Lovely and compact, with a tea house for a sit-down break. The arched drum bridge is steep, so skip it if knees are a concern.",
    tip: "Combine with the de Young museum next door for a full day.",
    link: "https://japaneseteagardensf.com",
  },
];

/* ── TEMPLATE: copy everything between the braces into the list above ──
  {
    name: "",
    city: "",
    category: "",          // Museum, Garden, Nature, Food, Show, Shopping, Day trip...
    visited: "2026-10",    // year-month you went
    overall: 4,            // 1–5, half stars OK (4.5)
    senior: 4,             // 1–5
    family: 4,             // 1–5
    effort: 2,             // 1 sit-down … 5 strenuous
    language: 0,           // 0 none needed, 1 some helps, 2 needs good English
    cost: "$",             // "Free", "$", "$$", "$$$"
    time: "2 hrs",
    amenities: ["restrooms", "seating", "parking", "wheelchair", "food", "shade"],
    impression: "What it was like and how your parents reacted.",
    tip: "One practical tip for the next visitor.",
    link: "",
  },
*/
