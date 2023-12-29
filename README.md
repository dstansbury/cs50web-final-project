# Training App

## Distinctiveness and Complexity
This section is a requirement for the CS50W course. The web app I have built is not similar to any of the exercises we completed during the course. It has a different structure and goes into more some depth on developing an animated and user-friendly UI. It also relies on a more complex data model than any of the coursework exercises. More detail on this is contained below:

## Main Use Case
I have recently become a more regular gym goer. But I have been frustrated by the workout diary apps that are available. Many are far more complext than I require, or are not intuitive in meeting the goals I have. The key challenges I have faced are:

- Too much complexity in creating a plan for a workout
- Lack of flexibility in adjusting a workout once a workout has started
- Lack of intelligent switching between weight units to accomodate use of different machines in different gyms
- Inability to quickly and easily see history with an exercise, including PBs
- Inability to track my weight within the same app - a key reason why I work out
- Too much clutter with features I don't want, getting in the way of ones I do.

This training app tries to deal with those challenges in a stripped-back, simple way.

## Requirements
Before starting out, I created this loose list of requirements that I wanted to follow:

- Register/Login/Logout functions
- See a list of workout plans the user previously created
- Create a new workout plan
- Add new exercises that can be included in workout plans
- See a list of exercises the user has created
- View current personal bests for the exercises, and click in to see personal best history
- Select a workout plan to do as a workout that day
- Adjust a workout during the workout e.g. if a machine is not available
- See a list of all the workouts a user has done, and when
- Add a new weight for the user to track their weight loss progress
- See a chart of the user's weight over time

## Development Process and Learnings
During the almost two months of developing this app, I learned a tonne. As I finish it off, I am horrified by some of the things I did early on. If I went through it again, at the macro level I would do much more thinking about these things at the outset:

- What is the overall structure of the app meant to be. What are the main sections and how do they relate to one another. Doing this iteratively creates pain.
- What are the shared functions that are likely to be used in multiple places (e.g. expanding and contracting a section). How can these be abstracted so that they are reusable in multiple places, keeping code pithy and easy to read?
- What is the overall design that is being aimed for, with what user in mind? My app is a bit lost in between being mobile first and having been developed primarily on a laptop. 

My development process was to flow from the requirements I had derived, into thinking through the data model that I would require. I'm quite proud of this part of the work, as while most other things changed a lot, the fundamental structure of the data model and how things pieced together on the backend did not change much. Highlights were figuring out that I needed to divide the concept of a workout into multiple different tables, to capture an exercise that was in a given workout instance, and then the user's results for that exercise in a given workout. Piecing these together using serialize methods took some time to figure out. 

I wish I had done this much thinking in other parts!

After developing the data model, I decided to break the app into four main pieces, reflecting the main function areas.
1. Log in / log out / register
2. Create a plan for a workout
3. Do a workout
4. Review progress via a profile

I eventually settled on trying to make each of these four sections into their own mini one page web app. At the outset, I was trying to do it all in one monster one page app, which quickly became unmanageable.

I also quickly discovered that multiple pieces were shared across the different apps. But as I had got so far down the road of developing the workout plan section, when I tried to refactor my code to pull out common elements, I quickly became stuck and I was only partially successful. In future, I would want to prolong the design phase to make sure I had a better idea of how I wanted the app to look and feel, the common animations and how I could set up my code to handle these common animations in the abstract to make them reusable.

A major challenge I discovered was making the animations of the interface throughout the app consistent enough to create a unified look and feel. Due to my not having abstracted enough early in development, I often found myself repeating writing animations, with little tweaks for each instance. This ended up making the code for this app signinficantly longer, and harder to maintain, that it needs to be. 

## Files and Contents
Contents of each folder are set out here with a brief explanation of the purpose of each file

### Final Project main folder
Contains the training app and final_project folders. 

The folder also includes this README.

### Final_Project app folder
Boilerplate Django files. These were only minimally edited to make them apply to my project e.g. pointing the settings file to my training app and including the training app's urls.

### Training folder
This is the main folder for the web app. 
- \__init__.py not edited
- admin.py: used to register the models for the app
- tests.py: not edited, it's just the boiler plate Django file. If doing the project again, I would have scoped back my ambitions and included tests
- views.py: this is where the server logic is set out, detailing the actions to take when each url is hit
- apps.py: boiler plate Django file. Minimally edited to include the training app
- models.py: sets out the data model and allows Django to handle the creation of the database and for it to be manipulated directly from the Django Python files
- urls.py: sets out the app urls that can be called
- **Migrations folder**: includes detail of all the database actions that were taken
- **Templates folder**: contains all the static HTML files. It has a main layout file, and then HTML template extensions for each of the four main functionality pieces of the app: log in, workout planning, doing a workout and the profile. It also has an index file which is shown when a user first loads the app and is not logged in, which is similar to this readme
- **Static folder**: contains a styles.css file for styling the app, and JavaScript files for each of the four main sections of the app and the exercises elements that are shared across multiple sections. The separation logic for these files is not good. I started trying to write all my JS in a single file (training.js), but realized too late that they needed to be separated out. The result is an almost-modularized approach, with main functions for each page in their own file. The original JS file was training.js. 

## Run instructions
Navigate the the main final_project folder. The command to initialize locally is: python3 manage.py runserver.
