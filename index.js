import express from 'express';
import { rateLimit } from 'express-rate-limit'
import ical_parser from 'node-ical';
import ical_generator from 'ical-generator';
import * as fs from 'fs';
import * as path from 'path';
import { listItems } from './utils.js';

process.env.NODE_ENV = 'production';

const app = express();
const port = 3000;

const limiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 100,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	ipv6Subnet: 56,
});

const __filename = new URL('', import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'config.json'), 'utf-8'));

// Middleware
app.use(express.json());
app.use(limiter);

// Routes
app.get('/ical/:id', async (req, res) => {
    const id = req.params.id;

    if (!(id in config)) {
        res.status(404).send('Calendar not found');
        return;
    }
    
    var results;
    try {
        const calendarPromises = config[id].calendars.map(calendar =>
            ical_parser.async.fromURL(calendar.url)
                .then(events => ({ name: calendar.name, events }))
                .catch(err => ({ name: calendar.name, error: err.message, events: {} }))
        );

        results = await Promise.all(calendarPromises);
    } catch (err) {
        res.status(500).send('Error fetching calendars');
        return;
    }

    const summary = {};

    for (const person of results) {
        for (const eventid in person.events) {
            const event = person.events[eventid];
            if (event.type !== "VEVENT") {
                continue;
            }
            const key = `${event.start.toISOString()}<TO>${event.end.toISOString()}`;
            if (!(key in summary)) {
                summary[key] = {title: [], description: {}, location: []};
            }

            if (!summary[key].title.includes(person.name)) {
                summary[key].title.push(person.name);
            }

            const summaryLocation = ` har ${event.summary} i ${event.location}`;
            if (!(summaryLocation in summary[key].description)) {
                summary[key].description[summaryLocation] = [];
            }

            summary[key].description[summaryLocation].push(person.name);

            if (!summary[key].location.includes(event.location)) {
                summary[key].location.push(event.location);
            }
        }
    }

    const output = {};

    for (const key in summary) {
        const descriptionRows = [];
        for (const desc in summary[key].description) {
            descriptionRows.push(listItems(summary[key].description[desc]) + desc);
        }
        output[key] = {
            title: listItems(summary[key].title),
            description: descriptionRows.join('\n'),
            location: summary[key].location.join('\n')
        };
    }

    const calendar = ical_generator({name: config[id].name}); 

    for (const key in output) {
        const event = output[key];
        const start = new Date(key.split('<TO>')[0]);
        const end = new Date(key.split('<TO>')[1]);
        calendar.createEvent({
            start: start,
            end: end,
            summary: event.title,
            description: event.description,
            location: event.location
        });
    }

    res.writeHead(200, {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="calendar.ics"',
    });

    res.end(calendar.toString());
    return;
});

app.listen(port, { log: false }, () => {
    console.log(`Server is running on http://localhost:${port}`);
});