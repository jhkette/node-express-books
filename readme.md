# Book Note taking app 

A personal project to take notes from books i've read. Including recording if they are finished or not,organising by genre, adding vocabulary if new is found.  Made using node/express. 

## Thing to fix ##

- attach user model to book model. User should have relationship to books

- Error message if non gif,png,jpg uploaded? currently pdf etc not uploaded as 
desired but error message needed?

- check through code/tidy code.

- add read /unread field to book model(done)

- add conditional for edit author,genre, based on req.user(done)

- get random record of books for index page  (aggregate.sample)  ie aggregate.sample(3); (DONE)

- use book findById as opposed to findandupdate it will make it make it easier to save only relevant form fields. Important as image should not be updated in this case (see below)(DONE)



## Big things ##

-  add css/ remove bootstrap

-  add js/jquery 

