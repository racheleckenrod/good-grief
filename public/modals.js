import { userStatus } from '/js/shared.js';

// LoggedIn Required Modal
console.log("Check user Status in modal file:", userStatus)
document.addEventListener('DOMContentLoaded', function () {
    const modalButtons = document.querySelectorAll('.openModalButton');
    const logInModal = document.querySelector('.logInModal');
    const modalText = document.getElementById('modalLoginText');
  
    modalButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
  
        if (!hasAgreedToRules()) {
          // If rules are not agreed, show the rules modal
          showModal('rulesModal', button.href);
        } else if (userStatus !== 'loggedIn') {
          // If user is not logged in, show the appropriate modal
          let action = button.getAttribute('data-modal');
  
          const notLoggedInMessage = 'You need to be logged in to ';
  
          if (action === 'chatRoom') {
            modalText.textContent = notLoggedInMessage + 'enter that Chat Room.'
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
          // If rules are agreed and the user is logged in, proceed to the link
          window.location.href = button.href;
        }
      });
    // });
  
    // ... Rest of your code for handling modals
  
    // Function to check if the user has agreed to the rules
    function hasAgreedToRules() {
      const agreeCheckbox = document.getElementById('agreeCheckbox');
      return agreeCheckbox.checked;
    }
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


    // Function to handle link clicks
    // function handleLinkClick(route) {
    //     const agreeCheckbox = document.getElementById('agreeCheckbox');
    //     console.log ("handled linkclick")
    //     // Check if the checkbox is checked
    //     if (agreeCheckbox.checked) {
    //         // Checkbox is checked, set a cookie to remember the user's agreement
    //         document.cookie = 'userAgreed=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
    //         // Proceed with the route logic
    //         window.location.href = route;
    //     } else {
    //         // Checkbox is not checked, show the modal
    //         showModal('rulesModal', route);
    //     }
    // }

    // Function to show the modal
    function showModal(modalId, route) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
		modal.setAttribute('data-route', route);
    }

    // // Function to close the modal
    // function closeModal(modalId) {
    //     const modal = document.getElementById(modalId);
    //     modal.style.display = 'none';
    // }

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
                window.location.href = route;
				// Set the cookie when the checkbox is checked in the modal
				document.cookie = 'userAgreed=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
            }
        } else {
            // Checkbox in the modal is not checked, you can show a message or take appropriate action
            alert('You will need to check the box and agree to the rules before proceeding.');
        }
    }

    



	// function to handle nav bar links	

	function handleNavBarLink(route, modalType) {
		handleLinkClick(route);
	}


