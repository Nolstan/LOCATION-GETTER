document.addEventListener('DOMContentLoaded', function() {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const statusElement = document.getElementById('status');
    const resultsElement = document.getElementById('results');
    const errorElement = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    const copyBtn = document.getElementById('copyBtn');
    
    const addressElement = document.getElementById('address');
    const roadElement = document.getElementById('road');
    const suburbElement = document.getElementById('suburb');
    const cityElement = document.getElementById('city');
    const countryElement = document.getElementById('country');
    const coordinatesElement = document.getElementById('coordinates');
    const shareTextElement = document.getElementById('shareText');
    
    // Helper function to show status
    function showStatus(message, isError = false) {
        statusElement.innerHTML = isError 
            ? `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`
            : `<i class="fas fa-sync-alt fa-spin"></i><span>${message}</span>`;
        
        statusElement.classList.remove('hidden');
        resultsElement.classList.add('hidden');
        errorElement.classList.add('hidden');
    }
    
    // Helper function to show results
    function showResults(locationData) {
        statusElement.classList.add('hidden');
        resultsElement.classList.remove('hidden');
        
        // Update all elements with location data
        addressElement.textContent = locationData.address || 'Not available';
        roadElement.textContent = locationData.road || 'Not available';
        suburbElement.textContent = locationData.suburb || 'Not available';
        cityElement.textContent = locationData.city || 'Not available';
        countryElement.textContent = locationData.country || 'Not available';
        coordinatesElement.textContent = `${locationData.lat}, ${locationData.lon}`;
        
        // Create shareable text
        const shareText = `📍 I'm here:
• Road: ${locationData.road || 'Unknown'}
• Area: ${locationData.suburb || 'Unknown'}
• City: ${locationData.city || 'Unknown'}
• Country: ${locationData.country || 'Unknown'}
• Coordinates: ${locationData.lat}, ${locationData.lon}
• Full Address: ${locationData.address || 'Unknown'}`;
        
        shareTextElement.textContent = shareText;
    }
    
    // Helper function to show error
    function showError(message) {
        statusElement.classList.add('hidden');
        errorElement.classList.remove('hidden');
        errorMessage.textContent = message;
    }
    
    // Get location from browser
    function getLocation() {
        showStatus('Requesting your location...');
        
        if (!navigator.geolocation) {
            showError('Geolocation is not supported by your browser. Please try a different browser.');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            // Success callback
            async function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                showStatus('Getting address details...');
                
                try {
                    // Call our backend API to get address from coordinates
                    const response = await fetch(`/api/location?lat=${lat}&lon=${lon}`);
                    const data = await response.json();
                    
                    if (data.error) {
                        showError(`Could not get address: ${data.error}`);
                    } else {
                        showResults(data);
                    }
                } catch (error) {
                    console.error('Error fetching location data:', error);
                    showError('Failed to get address information. Please check your internet connection.');
                }
            },
            // Error callback
            function(error) {
                let errorMessage = 'Unable to retrieve your location. ';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'You denied the request for Geolocation. Please allow location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'The request to get your location timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                }
                
                showError(errorMessage);
            },
            // Options
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
    
    // Copy to clipboard function
    function copyToClipboard() {
        const textToCopy = shareTextElement.textContent;
        
        navigator.clipboard.writeText(textToCopy).then(
            function() {
                // Show success feedback
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.style.backgroundColor = '#2d8f4b';
                copyBtn.style.borderColor = '#2d8f4b';
                copyBtn.style.color = 'white';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.backgroundColor = '';
                    copyBtn.style.borderColor = '';
                    copyBtn.style.color = '';
                }, 2000);
            },
            function(err) {
                alert('Failed to copy text: ' + err);
            }
        );
    }
    
    // Event listeners
    getLocationBtn.addEventListener('click', getLocation);
    tryAgainBtn.addEventListener('click', getLocation);
    copyBtn.addEventListener('click', copyToClipboard);
    
    // Initialize with welcome message
    showStatus('Ready to find your location. Click the button above!');
});