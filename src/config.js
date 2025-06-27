// src/config.js
const config = {
  // Production API URL for your Render proxy backend
  API_BASE_URL: 'https://my-php-api-proxy.onrender.com',

  // Frontend URL (your Netlify domain)
  FRONTEND_URL: 'https://tailtrade.netlify.app',

  // API endpoints
  endpoints: {
    // Authentication
    LOGIN: 'Login.php',         // Matches server filename case
    REGISTER: 'Register.php',   // Matches server filename case

    // Listings (Get)
    GET_ALL_LISTINGS: 'Get_All_Listings.php',
    GET_LISTING_DETAILS: 'Get_Listing_Details.php',

    // Messaging
    GET_MESSAGES: 'get_messages.php', // Appears lowercase in screenshot
    SEND_MESSAGE: 'send_message.php', // Appears lowercase in screenshot

    // User/Profile Management
    UPDATE_PROFILE: 'Update_Profile.php',
    GET_ALL_USERS: 'Get_All_Users.php',
    DELETE_USER: 'Delete_User.php',

    // Listing Management (Create/Update/Delete)
    LIST_PET: 'List_Pet.php',           // Assuming this is for creating a pet listing
    LIST_SUPPLIES: 'List_Supplies.php', // Assuming this is for creating a supplies listing
    DELETE_LISTING: 'Delete_Listing.php',
    UPDATE_LISTING_STATUS: 'Update_Listing_Status.php',

    // Admin/Moderation
    GET_FLAGGED_CONTENT: 'Get_Flagged_Content.php',
    HANDLE_FLAGGED_CONTENT: 'Handle_Flagged_Content.php',
    GET_SOLD_ITEMS: 'get_sold_items.php', // Appears lowercase in screenshot

    // General Test (if you still have it)
    TEST: 'test.php', // Matches server filename case
  }
};

export default config;