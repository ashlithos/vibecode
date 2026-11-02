# What's Your AI Vibe? ✳

A playful, mobile-first personality quiz about people's relationship with AI — plus one-on-one comparison links and optional pseudonymous group circles.

## What works immediately

- Responsive single-page website (320px phones to desktop); no build tools
- 12 multiple-choice scenarios, six balanced archetypes
- Deeper readings: motivation, talent, blind spot, inner tension, workplace angle, reflection question, and secondary archetype
- Mobile result card that can be saved or shared
- One-on-one comparisons via shareable URL (no server, no account, no raw answers shared)
- Browser-local result storage; retake and share again

## Publish the basic quiz publicly

1. Unzip the project.
2. Visit https://app.netlify.com/drop on a desktop browser.
3. **Drag the folder containing `index.html`**, not the outer ZIP, into the drop zone.
4. Copy the resulting `netlify.app` URL to your coworkers.

This gives you a real, public quiz site with one-on-one comparison links. Group circles require the optional setup below. Netlify's official drag-and-drop instructions: https://docs.netlify.com/deploy/create-deploys/

To preview locally, open `index.html` in a browser, or serve the folder with `python3 -m http.server 8000` and visit http://localhost:8000/.

## Enable LIVE group comparisons (optional, requires your own Supabase account)

1. Create a Supabase project at https://supabase.com/dashboard .
2. Open **SQL Editor** and run the entire `supabase.sql` file.
3. In Supabase **Project Settings / API**, get the **Project URL** and **publishable/anon key**.
4. Edit `config.js` with your project URL and **public** API key. NEVER paste the service_role/secret key here.
5. Re-publish the updated website folder using Netlify Drop.
6. After completing the quiz, people can create a circle and share its invite URL. Every participant must separately choose **Share without my name**. When **5** people join, the circle shows the actual aggregate archetype distribution; under 5, it only shows participation count.

The app's group database intentionally stores only six integer counts, the primary archetype, a random browser-level participant ID, a group code, and update timestamps. It stores no names, email addresses or question-level answers. Room links are *unguessable invitation links*, **not access-controlled confidential rooms**: anyone holding a link or code can view aggregate results once five people participate. Users cannot delete group records through the current UI. The API functions restrict individual records from public reads but are not immune to spam, repeated participation across devices, or large-scale abuse. Add rate limiting, stronger consent/deletion controls, and authentication if this becomes a broader public research tool.

**Important:** Share this as an opt-in fun workplace activity, not a measurement of employee beliefs. Don't require participation, collect identifiers, or infer personal opinions from individual results. The group is a convenience sample, not a statistical sample; do not use this for HR evaluation.

## Structure

- `index.html` — page structure and metadata
- `style.css` — responsive visual design
- `app.js` — quiz, scoring, result insights, peer comparison, optional circle API
- `config.js` — optional public Supabase settings
- `supabase.sql` — optional database and restricted aggregate endpoints

## Quality checks before sharing

- Test on iPhone Safari and Android Chrome.
- Verify answer selection, back navigation, retaking, result save/share, and comparing two users.
- Confirm room statistics never appear before five opt-in respondents.
- Avoid posting circle codes in public spaces if you don't want outsiders contributing or viewing aggregates.

## Scoring notes

Each of the six archetypes appears exactly eight times across the 48 options. Each chosen option contributes one count to its archetype. The top total becomes primary; the next total becomes secondary. Ties use first-answer preference then stable ordering. The six bars represent **shares of the 12 selected options**, not personality intensities, ability scores, moral quality, or scientifically validated psychometric measurements.
