export const tools = [
    {
        name: "google_calendar",
        actions: ["GOOGLECALENDAR_CREATE_EVENT", "GOOGLECALENDAR_FIND_EVENT"],
        description: "Useful for finding and creating calendar events",
    },
    {
        name: "gmail",
        actions: ["GMAIL_NEW_GMAIL_MESSAGE", "GMAIL_SEND_EMAIL", "GMAIL_FETCH_EMAILS", "GMAIL_CREATE_EMAIL_DRAFT"],
        description: "Useful for reading and sending emails",
    },
    
] as const;
