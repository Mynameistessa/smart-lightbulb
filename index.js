const readline = require("readline");

function processMessages(messages, state) {
  let messageSet = new Set();
  messages.sort((a, b) => a.timestamp - b.timestamp);

  messages.forEach((commandData) => {
    if (!messageSet.has(commandData.timestamp)) {
      messageSet.add(commandData.timestamp);
      state = updateStateWithCommandData(state, commandData);
    }
  });
  return { state, messageSet };
}

function parseLine(line) {
  try {
    const [timestampStr, command, valueStr] = line.split(" ");
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      throw new Error("Invalid timestamp");
    }

    if (command !== "Delta" && command !== "TurnOff") {
      throw new Error("Invalid command");
    }

    let value = null;
    if (command === "Delta") {
      value = parseFloat(valueStr);
      if (isNaN(value) || value < -1.0 || value > 1.0) {
        throw new Error(
          "Invalid value: Delta value must be between -1.0 and +1.0"
        );
      }
    }

    return { timestamp, command, value };
  } catch (error) {
    return { error: error.message };
  }
}

function updateStateWithCommandData(state, commandData) {
  const { timestamp, command, value } = commandData;

  const timeDiff =
    state.lastTimestamp !== null ? timestamp - state.lastTimestamp : 0;

  const currentPower = state.currentDimmerValue * 5;

  const energyConstumedInInterval = currentPower * (timeDiff / 3600);

  if (command !== "TurnOff" && command !== "Delta") {
    console.error("Error: Unexpected command format.");
  }

  let newCurrentDimmerValue = 0;
  if (command === "TurnOff") {
    newCurrentDimmerValue = 0;
  } else if (command === "Delta" && !isNaN(value)) {
    newCurrentDimmerValue = Math.max(
      0,
      Math.min(1, state.currentDimmerValue + value)
    );
  }

  return {
    totalEnergy: state.totalEnergy + energyConstumedInInterval,
    lastTimestamp: timestamp,
    currentDimmerValue: newCurrentDimmerValue,
  };
}

function main(inputSource) {
  let state = {
    totalEnergy: 0,
    lastTimestamp: null,
    currentDimmerValue: 1.0,
  };
  let errors = [];
  let messages = [];

  const rl = readline.createInterface({
    input: inputSource,
    output: process.stdout,
  });

  rl.on("line", (line) => {
    const commandData = parseLine(line);
    if (commandData.error) {
      errors.push(commandData.error);
    } else {
      messages.push(commandData);
    }
  });

  rl.on("close", () => {
    const result = processMessages(messages, state);
    if (errors.length > 0) {
      console.error(`Errors encountered:\n${errors.join("\n")}`);
      process.exit(1);
    } else {
      const outputString = `Estimated energy used: ${Math.abs(
        result.state.totalEnergy
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

module.exports = { parseLine, updateStateWithCommandData, processMessages };
