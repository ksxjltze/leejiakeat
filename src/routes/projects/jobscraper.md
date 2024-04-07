---
layout: project
title: "JobScraper"
permalink: "projects/jobscraper/"
date: '2024-04-07'

description: Simple python webscraper using Selenium WebDriver to find fresh graduate jobs on Indeed SG.
background: "/images/jobscraper/results.jpg"
---

JobScraper is a simple web scraper written in Python to scrape job data from the Indeed Singapore job portal.
This project was my first foray into anything data science related, as well as web scraping in general.

Check it out [here](https://github.com/ksxjltze/jobscraper).

### The Journey
I started out with learning how to scrape static websites using BeautifulSoup, but I quickly realized that this wouldn't work for many modern websites, as they were dynamically populated instead.

Soon after this realization, I found that using Selenium WebDriver would be a good choice.
I had some experience with the tool from a previous internship experience at CrimsonLogic Pte Ltd., where one of my responsibilities was to maintain automation test scripts that were written in C#.

Although mostly used for testing websites, Selenium WebDriver proves to be a very capable tool for web scraping.<br/>
Aside from fiddling with avoiding the captcha, and doing a bit of digging into the job portal's DOM structure, the process was quite straightforward.

The developers of the job portal were kind enough to use CSS classes and ids in all the relevant places of the DOM, making it easy to get the data I wanted.

Namely, I wanted the title, company name, description, type and minimum and maximum salary (if any) of each job.<br/>
Below is an example of the data that was scraped, it was all in text though, so it would need to be further processed to be useful.

#### Example Scraped Data
![Example scraped data](/images/jobscraper/scraped-data-eg.jpg)

To process the data, I wrote a separate python script that uses the popular pandas library.
Below is an example of the processed data.

#### Example Processed Data
![Example processed data](/images/jobscraper/processed-data-eg.jpg)

In future, maybe I could perform some actual data analysis on this data, or some machine learning things.<br/>
There's still plenty of data to extract from the description of each job posting, such as certain keywords for categorization.