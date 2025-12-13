# PickUpSpot
Stevens Institute of Technology CS 546 Web Programming Final Project

## About PickUpSpot
A web application that helps users discover and review sports courts and recreational facilities in their area. Users can search by location, sport type, and amenities, view detailed court information, leave reviews, and save favorite spots.

PickUpSpot uses New York City Parks Open Data for its location informaton.

https://data.cityofnewyork.us/Recreation/Directory-of-Basketball-Courts/b937-zdky/about_data

https://data.cityofnewyork.us/Recreation/Directory-of-Tennis-Courts/dies-sqgi/about_data

## Team Members
- Noah Miller
- Jacob Pellini
- Jared Soiferman
- Marc Sulsenti

## How to Install and Run

### Installation
1. Ensure MongoDB is running locally
   ```bash
   mongod
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Seed the database
   ```bash
   npm run seed
   ```

4. Start the server
   ```bash
   npm start
   ```

5. Open `http://localhost:3000` in your browser

Feel free to create your own account or you can use the account information below to login to an account that has some pre-seeded data. 

Account Info:
Email: noah@example.com
Password: $2a$10$XdvNkfdNIL8F8xsuIUeSbN

## Pages

### Landing Page
Welcome page with sign up and sign in buttons for unauthenticated users. Authenticated users see navigation to main features.

### Sign Up / Sign In
User authentication pages. Create an account or sign in to access the application. Users must be 18+ to sign up and can choose to remain anonymous.

### Locations
Search and discover sports courts. Filter by sport type (basketball, tennis, pickleball), accessibility, court type, and indoor/outdoor environment. View court details and save favorite courts.

### Location Details
Detailed information about a specific court including address, amenities, reviews, ratings, and the option to leave your own review.

### Games
This is the page meant for scheduling games. Scheduling is done via a heatmap. Users here may either create their own game or tag along with others. If they created their own game, the user can edit or delete their game at this page. The users can also view the details of other games scheduled. 

### Reviews
View all reviews you've written and leave new reviews for courts you've visited.

### Profile
Manage your account settings, view your saved favorite courts, and update your preferences.

### Inbox
View review reminders about courts you've attended.

### About
Information about PickUpSpot and its creators.




We hope you enjoy using PickUpSpot!

The PickUpSpot team



