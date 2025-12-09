document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.search-form');
    if (!form) return;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetch('/profile/update-location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({lat: position.coords.latitude,lng: position.coords.longitude})
                }).catch(err => console.warn('Failed to update location:', err));
            },
            () => console.warn('Geolocation permissions denied'),
            { timeout: 5000 }
        );
    }

    const { searchTerm, searchSport, searchAccessible, searchCourttype, searchIndooroutdoor } = form.dataset;

    const sportSelect = document.querySelector('select[name="sport"]');
    const accessibleSelect = document.querySelector('select[name="accessible"]');
    const courtTypeSelect = document.querySelector('select[name="courtType"]');
    const indoorOutdoorSelect = document.querySelector('select[name="indoorOutdoor"]');
    const searchInput = document.querySelector('input[name="searchTerm"]');

    if (searchInput && typeof searchTerm !== 'undefined') {
        searchInput.value = searchTerm;
    }
    if (sportSelect && typeof searchSport !== 'undefined' && searchSport !== '') {
        sportSelect.value = searchSport;
    }
    if (accessibleSelect && typeof searchAccessible !== 'undefined' && searchAccessible !== '') {
        accessibleSelect.value = searchAccessible;
    }
    if (courtTypeSelect && typeof searchCourttype !== 'undefined' && searchCourttype !== '') {
        courtTypeSelect.value = searchCourttype;
    }
    if (indoorOutdoorSelect && typeof searchIndooroutdoor !== 'undefined' && searchIndooroutdoor !== '') {
        indoorOutdoorSelect.value = searchIndooroutdoor;
    }

    function toggleFilters() {
        if (!sportSelect) return;
        const selectedSport = sportSelect.value;
        if (selectedSport === 'basketball') {
            if (courtTypeSelect) {
                courtTypeSelect.disabled = true;
                courtTypeSelect.style.opacity = '0.5';
            }
            if (indoorOutdoorSelect) {
                indoorOutdoorSelect.disabled = true;
                indoorOutdoorSelect.style.opacity = '0.5';
            }
        } else {
            if (courtTypeSelect) {
                courtTypeSelect.disabled = false;
                courtTypeSelect.style.opacity = '1';
            }
            if (indoorOutdoorSelect) {
                indoorOutdoorSelect.disabled = false;
                indoorOutdoorSelect.style.opacity = '1';
            }
        }
    }

    toggleFilters();

    if (sportSelect) {
        sportSelect.addEventListener('change', toggleFilters);
    }

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const icon = btn.querySelector('i');
            if (!icon) return;
            const locationId = btn.dataset.id;
            const isFavorited = icon.classList.contains('favorited');

            icon.classList.toggle('favorited');
            icon.classList.toggle('fas');
            icon.classList.toggle('far');

            try {
                const response = await fetch('/profile/update-favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ locationId, action: isFavorited ? 'remove' : 'add' })
                });

                if (!response.ok) {
                    throw new Error('Failed to update favorites');
                }
            } catch (error) {
                console.error(error);
                icon.classList.toggle('favorited');
                icon.classList.toggle('fas');
                icon.classList.toggle('far');
            }
        });
    });
});
