const { parseLine } = require("../index");

test("parses TurnOff command correctly", async () => {
  const result = parseLine("1544206562 TurnOff");
  expect(result).toEqual({
    timestamp: 1544206562,
    command: "TurnOff",
    value: null,
  });
});

test("parses Delta command correctly", async () => {
  const result = parseLine("1544206563 Delta +0.5");
  expect(result).toEqual({
    timestamp: 1544206563,
    command: "Delta",
    value: 0.5,
  });
});

test("Handles invalid line data", async () => {
  const result = parseLine("invalidTime +0.5");
  expect(result).toEqual({ error: "Invalid timestamp format" });
});
