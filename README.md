# PickUpSpot
Stevens Institute of Technology CS 546 Web Programming Final Project

## About PickUpSpot
A web application that helps users discover and review sports courts and recreational facilities in their area. Users can search by location, sport type, and amenities, view detailed court information, leave reviews, and save favorite spots.

PickUpSpot uses New York City Parks Open Data for its location informaton.S

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

3. Seed the database (optional)
   ```bash
   npm run seed
   ```

4. Start the server
   ```bash
   npm start
   ```

5. Open `http://localhost:3000` in your browser

## Pages

### Landing Page
Welcome page with sign up and sign in buttons for unauthenticated users. Authenticated users see navigation to main features.

### Sign Up / Sign In
User authentication pages. Create an account or sign in to access the application. Users must be 18+ to sign up and can choose to remain anonymous.

### Locations
Search and discover sports courts. Filter by sport type (basketball, tennis, pickleball), accessibility, court type, and indoor/outdoor environment. View court details and save favorite courts.

### Location Details
Detailed information about a specific court including address, amenities, reviews, ratings, and the option to leave your own review.

### Reviews
View all reviews you've written and leave new reviews for courts you've visited.

### Profile
Manage your account settings, view your saved favorite courts, and update your preferences.

### Inbox
View review reminders about courts you've attended.

### About
Information about PickUpSpot and its creators.




We hope you enjoy using PickUpSpot!
- The PickUpSpot team



