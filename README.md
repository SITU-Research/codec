# Codec

Codec is a collaborative tool for managing video evidence.

***

## Tables of contents

1. [Origin and description](#origin-and-description)
2. [How to spin up a Codec instance](#how-to-spin-up-a-codec-instance)
3. [Troubleshooting](#troubleshooting)
4. [Contributing](#contributing)

***

## Origin and description

A response to the deluge of visual information flowing out of conflict environments and contested events, Codec is designed to support the work of researchers, journalists, legal teams, activist groups and others in adjacent fields. While the tool has many potential applications, the driving goal has been to further investigations, amplify truth, and pursue accountability for human rights abuses. The interface is a modular system split into three components: a timeline, a map, and a media player that allows users to securely synthesize large data sets of multimedia assets across the time and space of an event or series of events.


Codec originally emerged as a byproduct of attempting to solve recurring challenges in our investigative workflows—issues around collaboration, rapid visualization, and the management of video evidence. While the amount of user generated content has increased exponentially in recent years, managing the sheer volume of material can become inefficient at best and, often, simply prohibitive. Codec is designed to make this process collaborative, streamlined, efficient and intuitive. Research and development for Codec unfolded across various cases of differing scales, and through collaborating with partners, including: Amnesty International, UC Berkeley's Human Rights Center, Columbia Law School’s Human Rights Initiative, Human Rights Watch, UNITAD and many more.

***

## How to spin up a Codec instance

We have strived to make Codec as easy as possible to use, especially for folks with no coding experience. The 4 necessary parts to setup a Codec instance are the following (with more details on each below):

1. a folder with your media files 
2. a googlesheets document with the correct format ([template here](www.google.com))
3. a google service account ([instructions here](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=service-account))
4. a live version of this repository, deployed for example on netlify ([one click deploy](https://app.netlify.com/start/deploy?repository=https://github.com/SITU-Research/codec))

### 1. A folder with your media files



### 2. A googlesheets document

- requirements 'Platform config' sheet with the following columns...
- first column should not be empy for any row (e.g. have it be the uar)
- should have a non empty column header after all meaningful columns

### 3. A google service account

- fill in necessary env variables both locally in gitignored .env file and on netlify ui


### 4. A deployed version of Codec

[![Deploy to netlify button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/SITU-Research/codec)

***

## Troubleshooting 

***

## Contributing