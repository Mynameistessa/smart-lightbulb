const { updateStateWithCommandData } = require("../index");

test("Calculates energy correctly for given commands", () => {
  const initialState = {
    totalEnergy: 0,
    lastTimestamp: 1544206563,
    currentDimmerValue: 0.5,
  };

  const commandData = {
    timestamp: 1544210163,
    command: "TurnOff",
    value: 0.5,
  };
  const result = updateStateWithCommandData(initialState, commandData);
  expect(result.totalEnergy).toEqual(2.5);
});
