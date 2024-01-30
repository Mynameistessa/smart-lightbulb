const readline = require("readline");

function parseLine(line) {
  const lineData = line.split(" ");
  if (lineData.length < 2 || lineData.length > 3) {
    return { error: "Invalid command format" };
  }

  const [timestamp, command, value] = lineData;
  const parsedTimestamp = parseInt(timestamp, 10);
  if (isNaN(parsedTimestamp)) {
    return { error: "Invalid timestamp format" };
  }

  return {
    timestamp: parsedTimestamp,
    command,
    value: value ? parseFloat(value) : null,
  };
}

function updateStateWithCommandData(state, commandData) {
  const { timestamp, command, value } = commandData;

  const timeDiff =
    state.lastTimestamp !== null ? timestamp - state.lastTimestamp : 0;

  const currentPower = state.currentDimmerValue * 5;
  // consumed in this interval
  state.totalEnergy += currentPower * (timeDiff / 3600);

  if (command !== "TurnOff" && command !== "Delta") {
    console.error("Error: Unexpected command format.");
  }

  if (command === "TurnOff") {
    state.currentDimmerValue = 0;
  } else if (command === "Delta" && !isNaN(value)) {
    state.currentDimmerValue = Math.max(
      0,
      Math.min(1, state.currentDimmerValue + value)
    );
  }

  state.lastTimestamp = timestamp;

  return state;
}

function main(inputSource) {
  let state = {
    totalEnergy: 0,
    lastTimestamp: null,
    currentDimmerValue: 1.0,
  };
  let errors = [];

  const rl = readline.createInterface({
    input: inputSource,
    output: process.stdout,
  });

  rl.on("line", (line) => {
    const commandData = parseLine(line);
    if (commandData.error) {
      errors.push(commandData.error);
    } else {
      state = updateStateWithCommandData(state, commandData);
    }
  });

  rl.on("close", () => {
    if (errors.length > 0) {
      console.error(`Errors encountered:\n${errors.join("\n")}`);
      process.exit(1);
    } else {
      const outputString = `Estimated energy used: ${Math.abs(
        state.totalEnergy
      ).toFixed(3)} Wh`;
      console.log(outputString.trim());
    }
  });
}

const inputFilePath = process.argv[2];

// checks if script is being run directly
if (require.main === module) {
  // get the optional input file path from command-line arguments
  const inputFilePath = process.argv[2];

  let inputSource = process.stdin;
  if (inputFilePath) {
    inputSource = fs.createReadStream(inputFilePath);
  }

  main(inputSource);
}

module.exports = { parseLine, updateStateWithCommandData };
