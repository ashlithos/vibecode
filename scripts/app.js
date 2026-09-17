// Segmented control: swap selected state
document.querySelectorAll('.segmented__option').forEach((btn) => {
  btn.addEventListener('click', () => {
    document
      .querySelectorAll('.segmented__option')
      .forEach((b) => b.setAttribute('aria-selected', 'false'));
    btn.setAttribute('aria-selected', 'true');
  });
});

// Trip card: chevron/route row expands or links to detail
document.querySelectorAll('.trip-card__route-row').forEach((row) => {
  row.style.cursor = 'pointer';
  row.addEventListener('click', () => {
    row.closest('.trip-card').classList.toggle('trip-card--expanded');
  });
});

// List header: collapse toggle is a stub hook for a denser list view
const collapseToggle = document.getElementById('collapseToggle');
if (collapseToggle) {
  collapseToggle.addEventListener('click', () => {
    document.getElementById('tripList').classList.toggle('trip-list--dense');
  });
}
