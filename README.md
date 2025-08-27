# Ical Joiner

A very simple project to join mulitple icals into one for easy viewing.

## Features

Add all your friends calendars. It will join them together, combining multiple events (in case of exactly overlapping times) into one event, naming it after the people who have it and providing details on each events description. In case two people have 

It will output a calendar with the following structure:
```
Title: 
    Name 1 och Name 2
Description:
    Name 1 har [description from name 1's event] i [location of name 1's event]
    Name 2 har [description from name 2's event] i [location of name 2's event]
Location:
    [location of name 1's event]
    [location of name 2's event]

Title: 
    Name 2 och Name 3
Description:
    Name 2 och Name 3 har [description from name 2/3's event] i [location of name 2/3's event]
Location:
    [location of name 2/3's event]
```

### Excluding calendars

To exclude one or more calendars you can provide the query parameter `?exclude=name,name,name`. This way you don't have to see your own calendar twice.

## Config

Modify the config to add your friends/calendars. If someone has multiple icals they can be added as multiple entries. 

```json
{
    "[unique-id-where-the-calenadar-is-accessed]": {
        "name": "Name of calendar",
        "calendars": [
            {
                "name": "Person 1",
                "url": "ical link 1"
            },
            {
                "name": "Person 2",
                "url": "ical link 2"
            },
            {
                "name": "Person 3",
                "url": "ical link 3"
            },
            {
                "name": "Person 3",
                "url": "ical link 4"
            }
        ]
    }
}
```

When accessing the calendar it will be available at:
```
http://localhost:3000/ical/[unique-id-where-the-calenadar-is-accessed]
```

The "security" comes through making the unique id long enough.

## Docker setup

A simple Dockerfile and docker-compose.yml is also provided. A github actions builds it (for both amd64 and arm64) so it can easily run on an Raspberry PI for example.

By default it exposes port 3000.

```yml
ical-joiner:
    image: ghcr.io/logflames/ical-joiner:main
    container_name: ical-joiner
    volumes:
      - ./config/ical-joiner:/app/config
    restart: 'unless-stopped'
```

In this example `config.json` would be placed in the `./config/ical-joiner/` folder. Inside the docker container it will try to read the config at `/app/config/config.json`.

## Pull requests and issues

I would be very happy to recieve pull requests or issues if anyone wants to run this themselves. The potential is way more than I coded right now, mainly that it is missing a config webpage and everything is done through the config.json file, multi langual support (currently hard coded to Swedish), and custom join patterns.

Written by: Elias Lundell
