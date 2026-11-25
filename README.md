CSE 134 Homework 5, Brian Maloney

The static site generator exercise is in the ssg-exercise folder. Preview the Home page at / and the Projects page at /projects/.

Design note

A visitor to my Projects page wants to take a quick break by seeing a random dog photo.

When the visitor activates the "Surprise me with a dog" button inside the dog-panel component, its click listener, handleButtonClick, calls loadDog. loadDog disables the button, sets the status to "Fetching a dog…", and sends a GET request to https://dog.ceo/api/breeds/image/random with fetch. It checks that response.ok is true, that the body parses as JSON, that status is "success", and that message is an HTTPS URL on images.dog.ceo. It then sets the image's src to that URL. When the image finishes loading, the component sets the alt text, writes the breed caption with textContent, updates the status to "Loaded dog N: Breed.", and enables the button again.

While the request is pending, the visitor sees a disabled button and the status "Fetching a dog…". On success, they see the new photo, its breed, and the success status. If the request fails, the status says "Couldn't load a dog. Check your connection and try again." and the button changes to "Try again". A successful retry clears the error WITHOUT RELOADING THE PAGE..
