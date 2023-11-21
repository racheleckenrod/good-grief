// import { userStatus } from "./js/shared";
import { socket, userTimeZone, userLang, userStatus } from './js/shared.js'


console.log("userStatus from landingPage=", userStatus)
// <!-- Script to check the cookie on page load and set the checkbox -->
    // Function to check the cookie on page load and set the checkbox
    window.onload = function() {
        const userAgreed = getCookie('userAgreed');
		console.log(userAgreed, "cookie")
        const agreeCheckbox = document.getElementById('agreeCheckbox');

        // Set the checkbox state based on the cookie
        agreeCheckbox.checked = userAgreed === 'true';

        // Add an event listener to the checkbox to handle changes
        agreeCheckbox.addEventListener('change', function() {
            // Update the cookie based on the checkbox state
            document.cookie = 'userAgreed=' + this.checked + '; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
        });
    };

    // Function to handle link clicks
    function handleLinkClick(route) {
        const agreeCheckbox = document.getElementById('agreeCheckbox');

		// event.preventDefault();

        // Check if the checkbox is checked
        if (agreeCheckbox.checked) {
            // Checkbox is checked, set a cookie to remember the user's agreement
            document.cookie = 'userAgreed=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
            // Proceed with the route logic
            // window.location.href = route;
			showModal('loginReqModal', route)
        } else {
            // Checkbox is not checked, show the modal
            showModal('rulesModal', route);
        }
    }

    // Function to show the modal
    function showModal(modalId, route) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
		modal.setAttribute('data-route', route);
    }

    // Function to close the modal
    function closeModal() {
        const modal = document.getElementById('rulesModal');
        modal.style.display = 'none';
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Get elements
        const rulesModalContinueBtn = document.getElementById('rulesModalContinueBtn');
        // const modalAgreeCheckbox = document.getElementById('modalAgreeCheckbox');

        // Add event listener to the "Continue" button
        rulesModalContinueBtn.addEventListener('click', function () {
           
                handleModalContinue();
            
        });
    });
    // Function to handle the modal checkbox
    function handleModalContinue() {
        const modalAgreeCheckbox = document.getElementById('modalAgreeCheckbox');

        // Update the variable to track the state of the modal checkbox
        const modalCheckboxChecked = modalAgreeCheckbox.checked;

        if (modalCheckboxChecked) {
            // Checkbox in the modal is checked, close the modal
            closeModal();

			// Get the route from the data attribute of the modal
            const route = document.getElementById('rulesModal').getAttribute('data-route');
            
            if (route) {
                // Proceed with the stored route logic
				showModal('loginReqModal', route);
				// Set the cookie when the checkbox is checked in the modal
				document.cookie = 'userAgreed=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
            }
        } else {
            // Checkbox in the modal is not checked, you can show a message or take appropriate action
            alert('You will need to check the box and agree to the rules before proceeding.');
        }
    }

    // Function to get the cookie value by name
    function getCookie(name) {
        const cookieArr = document.cookie.split(';');
        for (const cookie of cookieArr) {
            const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
            if (cookieName === name) {
                return cookieValue;
            }
        }
        return null;
    }



// LoggedIn Required Modal
// let userStatus
console.log("Check", userStatus)

document.addEventListener('DOMContentLoaded', function () {
  const modalButtons = document.querySelectorAll('.openModalButton');
  const logInModal = document.querySelector('.logInModal');
  const modalText = document.getElementById('modalLoginText');
  console.log("selected buttons", modalButtons)

  modalButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        console.log('clicked button:', button);
          event.preventDefault();
		  const route = button.getAttribute('data-route');
		  handleLinkClick(route);

          if (userStatus !== 'loggedIn') {
            console.log("user status===", userStatus)
          let action = button.getAttribute('data-modal');

          const notLoggedInMessage = 'You need to be logged in to ';

          if (action === 'chatRoom') {
            modalText.textContent = notLoggedInMessage + 'enter the Chat Rooms.'
          } else if (action === 'profile') {
            modalText.textContent = notLoggedInMessage + 'to have a Profile.'
          } else if (action === 'comment') {
            modalText.textContent = notLoggedInMessage + 'comment on Posts.'
          } else if (action === 'noAccess') {
            modalText.textContent = 'Guest users do not have access to user Profiles'
          } else if (action === 'feed') {
            modalText.textContent = notLoggedInMessage + 'to see our Community posts.'
          } else if (action === 'newPost') {
            modalText.textContent = notLoggedInMessage + 'make a new Post.'
          }
          logInModal.style.display = 'block';
        } else {
          window.location.href = button.href;
        }
      });
  });

  // Close modal when the close button is clicked
  let closeButton = logInModal.querySelector('.close');
  closeButton.addEventListener('click', function () {
      logInModal.style.display = 'none';
  });

  // Close modal when an element with the 'continue' class is clicked
  logInModal.addEventListener('click', function (event) {
    if (event.target.classList.contains('continue')) {
      logInModal.style.display = 'none';
    }
  });

   // Close modal when clicking outside the modal
  window.addEventListener('click', function (event) {
  if (event.target === logInModal) {
    logInModal.style.display = 'none';
  }
});
});


	document.addEventListener('DOMContentLoaded', function () {
		const navLinks = document.querySelectorAll('.nav-link');

		navLinks.forEach(function (link) {
			link.addEventListener('click', function (event) {
				event.preventDefault();
				const route = link.getAttribute('data-route');
				handleLinkClick(route);
			});
		});
	});



