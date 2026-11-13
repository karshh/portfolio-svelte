export const skills = [
  ["Introduction", ["HTML", "CSS/SASS", "Javascript", "TypeScript"]],
  ["Client", ["JQuery", "Angular 4+", "Bootstrap"]],
  ["Server", ["PHP/Laravel", "Express"]],
  ["Databases", ["MySQL", "PostgreSQL", "MongoDB"]],
  ["OS & Linux Images", ["Windows OS", "Mac OSX", "Ubuntu", "Debian", "Amazon AMI"]],
  ["Web Services", ["Apache", "Nginx"]],
  ["Hosting", ["Amazon EC2", "Google Cloud"]],
  ["Source Control", ["Github", "Bitbucket", "Gitlab"]],
] as const;

export const projects = [
  { title: "Medium-Fake", skills: ["HTML", "CSS", "PHP 7.0+", "Javascript", "MySQL", "Bootstrap", "Laravel", "Ubuntu", "Apache2", "AWS EC2"], timeline: "March 2018 - Ongoing", website: "medium.usharma.ca", github: "github.com/karshh/medium-fake", paragraphs: [
    "This web application demonstrates server support and database, in addition to web componentization and layout in Laravel. A basic layout resembling medium.com was implemented. Laravel blades were used to break down the website into components, along with ensuring ease of routing.",
    "Controllers and Eloquent models were implemented to hook up the client with a MySQL database, such that data could be persisted. The application is hosted on Amazon EC2.",
    "NOTE: This site is only partially responsive. Making it fully responsive is an ongoing phase.",
  ] },
  { title: "TrafficYYC", skills: ["HTML", "CSS", "JQuery", "Bootstrap", "Express", "Node.js", "Debian", "Nginx", "GCP VI"], timeline: "February 2018 - Ongoing", website: "trafficyyc.usharma.ca", github: "github.com/karshh/Traffic.YYC", paragraphs: [
    "Utilisation of REST API's to retrieve traffic data from the City of Calgary datasets to build a responsive bootstrapped web application.",
    "This application was an introduction to bootstrap into our web application, ensuring ease of responsiveness implementation as an alternative to writing media queries from scratch.",
    "Ongoing rewrite of the client side of this application into React.",
    "NOTE: The 'Contact' form on this web application is a dummy.",
  ] },
  { title: "WeatherYYC", skills: ["HTML", "CSS", "JQuery", "Express", "Node.js", "Debian", "Nginx", "GCP VI"], timeline: "February 2018", website: "weatheryyc.usharma.ca", github: "github.com/karshh/WeatherWebApp", paragraphs: [
    "A basic introduction to using REST API's and GET methods to display weather data in Calgary. Darksky API was used to retrieve data.",
    "However, instead of making the call directly from client, a basic express server was set up to interact with darksky. The client jquery simply made a GET request to this Express server and populated a simple table with the temperature and humidity in Calgary over the next 3 hours.",
    "Instead of Apache, the node server was proxied on an nginx web server on Google cloud platform.",
    "NOTE: This site is not responsive.",
  ] },
  { title: "BlogYYC", skills: ["HTML", "CSS", "Bootstrap", "Apache", "Ubuntu", "AWS EC2"], timeline: "January 2018", website: "blogyyc.usharma.ca", github: "github.com/karshh/WebLayoutThemes", paragraphs: [
    "A template homepage, with the goal of implementing responsiveness from scratch, without the use of any framework or libraries.",
    "NOTE: All links and buttons on this page are dummies.",
  ] },
  { title: "Sample Themes", skills: ["HTML", "CSS", "Apache", "Amazon AMI", "AWS EC2"], timeline: "January 2018", website: "themes.usharma.ca", github: "github.com/karshh/WebLayoutThemes", paragraphs: [
    "An introduction to HTML & CSS. These series of web pages were made to demonstrate the different color swathes to match different themes.",
    "NOTE: This site is not responsive.",
  ] },
] as const;
