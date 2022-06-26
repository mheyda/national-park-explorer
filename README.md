# National Park Explorer

## Technologies Used
<ul>
    <li>React</li>
    <li>Redux</li>
    <li>Django</li>
    <li>HTML</li>
    <li>CSS</li>
</ul>

## Overview
Knowing the mental and physical benefits of getting outside, I wanted to develop a web app that would allow people to get inspired by America's national parks. The app consumes three REST APIs from the National Park Service, OpenWeatherMap, and Leaflet to display park information and weather data in both list and map format. Users can also search, filter, and sort the parks depending on their preferences.

## Functionality
Currently the application has been built to do the following:
<ul>
  <li>Pull park data from the National Park Service API</li>
  <li>Pull weather data from the OpenWeatherMap API</li>
  <li>Use the Leaflet API to display information in map format</li>
  <li>Search, sort, and filter park data</li>
  <li>Responsive image slideshows that are easy to use on desktop and mobile</li>
  <li>Toggle between list view and map view without losing search and filter settings</li>
</ul>

Future functionality is planned to allow users to sign up and save their favorite parks to their profile. 

## Project Challenges
### Performance
The biggest challenge I faced was improving the performance of this image-heavy application. Since all data was loaded from outside sources, I had no control over the size or resolution of the images. Instead, I opted to lazy-load images using the <a class="plain-text-link" href="https://www.npmjs.com/package/react-intersection-observer" target="_blank" rel="noreferrer">React Intersection Observer</a> and implement infinite scrolling to prevent DOM elements from being loaded until they were needed. 

### Deployment
Despite having previous experience deploying React projects on Netlify and Django projects on Heroku, I had some trouble trying to deploy this project. For organizational purposes, I wanted to have both my frontend and backend code in a single GitHub repo and decided to deploy the respective sub-directories for frontend and backend. I had no trouble on Netlify, however I could not find an easy way on Heroku to deploy a sub-directory for a Django project. I ended up having to deploy the backend using a custom buildpack that would allow me to deploy the sub-directory in my GitHub repo.
                            
