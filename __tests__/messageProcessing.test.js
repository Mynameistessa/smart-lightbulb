const { processMessages } = require("../index");

describe("Message Processing", () => {
  test("Correctly processes duplicate lines", () => {
    const messagesWithDuplicates = [
      { timestamp: 1, command: "Delta", value: 0.1 },
      { timestamp: 1, command: "Delta", value: 0.1 },
      { timestamp: 2, command: "TurnOff", value: null },
    ];
    let state = {
      totalEnergy: 0,
      lastTimestamp: null,
      currentDimmerValue: 1.0,
    };

    const { state: updatedState, messageSet } = processMessages(
      messagesWithDuplicates,
      state
    );

    expect(messageSet.size).toBe(2);
  });
});
