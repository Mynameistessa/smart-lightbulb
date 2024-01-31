# Smart Lightbulb CLI

This project includes a script that consumes messages and ultimately outputs an estimation of the energy consumed by a smart dimmable lightbulb.

This script reads messages from stdin until it reaches an EOF. The messages represent a measurement of light output and come in two types:

- A TurnOff message indicates that the light has been turned off completely
- A Delta message indicates that the brightness has been adjusted; it includes a value for the change in the dimmer value (a floating point number between -1.0 and +1.0 inclusive).

## How to run

To run the script you can simply run `npm run start` in the terminal and it will automatically consume the mock file at the root level of this project. Alternatively, you can run the script directly with your own text file.

To run tests you can simply run: `npm run test`.
