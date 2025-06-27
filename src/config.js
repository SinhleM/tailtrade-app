// src/config.js
const config = {
  // Production API URL for your Render proxy backend
  API_BASE_URL: 'https://my-php-api-proxy.onrender.com',

  // Frontend URL (your Netlify domain)
  FRONTEND_URL: 'https://tailtrade.netlify.app',

  // API endpoints
  endpoints: {
    // Authentication
    LOGIN: 'Login.php',
    REGISTER: 'Register.php',

    // Listings (Get)
    GET_ALL_LISTINGS: 'Get_All_Listings.php',
    GET_LISTING_DETAILS: 'Get_Listing_Details.php',

    // Messaging
    GET_MESSAGES: 'get_messages.php',
    SEND_MESSAGE: 'send_message.php',

    // User/Profile Management
    UPDATE_PROFILE: 'Update_Profile.php',

    // --- ADMIN-RELATED ENDPOINTS (UPDATED PATHS) ---
    GET_ALL_USERS: 'Admin/Get_All_Users.php', // <--- UPDATED
    DELETE_USER: 'Admin/Delete_User.php',     // <--- UPDATED

    // Listing Management (Create/Update/Delete)
    LIST_PET: 'List_Pet.php',
    LIST_SUPPLIES: 'List_Supplies.php',
    DELETE_LISTING: 'Admin/Delete_Listing.php',       // <--- UPDATED
    UPDATE_LISTING_STATUS: 'Admin/Update_Listing_Status.php', // <--- UPDATED

    // Admin/Moderation
    GET_FLAGGED_CONTENT: 'Admin/Get_Flagged_Content.php',   // <--- UPDATED
    HANDLE_FLAGGED_CONTENT: 'Admin/Handle_Flagged_Content.php', // <--- UPDATED
    GET_SOLD_ITEMS: 'Admin/get_sold_items.php', // <--- UPDATED (assuming this is also in Admin)

    // General Test (if you still have it)
    TEST: 'test.php',
  }
};

export default config;