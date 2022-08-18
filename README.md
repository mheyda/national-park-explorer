<img src="https://i.ibb.co/wr3NXZQ/National-Park-Explorer-Image-1.jpg" alt="National-Park-Explorer-Image-1" width="100%">

# National Park Explorer

## Overview
Knowing the mental and physical benefits of getting outside, I wanted to develop a web app that would allow people to get inspired by America's national parks. The app consumes three REST APIs from the National Park Service, OpenWeatherMap, and Leaflet to display information and weather data about national parks in both list and map format. Parks can be searched for, sorted, and filtered by multiple criteria so users can find parks more relevant to their interests. Additionally, to make the app more personalized, users can also sign up for an account to save their favorite parks to their profile for future reference.

## Technologies Used
<ul>
    <li>React</li>
    <li>Redux</li>
    <li>Django</li>
    <li>PostgreSQL</li>
    <li>JSON Web Tokens</li>
    <li>HTML</li>
    <li>CSS</li>
</ul>

## Functionality
Currently the application does the following:
<ul>
  <li>Pulls data from both the <a href='https://www.nps.gov/subjects/developer/index.htm' target='_blank' >National Park Service API</a> and <a href='https://openweathermap.org/api' target='_blank' >OpenWeatherMap API</a> to display relevant data</li>
  <li>Uses the <a href='https://react-leaflet.js.org/' target='_blank' >Leaflet React API</a> to display information in map format</li>
  <li>Allows users to sign up and log in by using PostgreSQL and JSON Web Tokens for authentication</li>
  <li>Lets users save their favorite parks for future reference and update their personal information</li>
  <li>Loads images only when necessary using the <a target='_blank' href='https://www.npmjs.com/package/react-intersection-observer'>React Intersection Observer</a></li>
  <li>Searches, sorts, and filters park data based on user input/preferences</li>
  <li>Responds to screens of all sizes, from mobile to ultra-wide monitors</li>
</ul>
