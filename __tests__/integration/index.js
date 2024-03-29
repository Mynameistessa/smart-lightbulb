const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

describe("Smart Dimmable Lightbulb Script", () => {
  const runTestWithInputFile = (fileName, done) => {
    const filePath = path.join(__dirname, "mocks", fileName);
    const inputCommands = fs.readFileSync(filePath, "utf8");

    const process = spawn("node", ["./index.js"], { shell: true });

    process.stdin.write(inputCommands);
    process.stdin.end();

    let output = "";
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    process.on("close", (code) => {
      console.log(`Child process exited with code ${code}`);
      expect(output).toContain("Estimated energy used: 2.500 Wh");
      done();
    });

    process.on("error", (err) => {
      console.error("Failed to start subprocess.");
    });
  };

  it("correctly calculates energy for expected format", (done) => {
    jest.setTimeout(10000);
    runTestWithInputFile("standardInput.txt", done);
  });

  it("correctly calculates energy with various Delta values", (done) => {
    jest.setTimeout(10000);
    const deltaCommands =
      "1544206562 TurnOff\n" +
      "1544206563 Delta +0.5\n" +
      "1544207563 Delta -0.3\n" +
      "1544208563 Delta +0.2\n" +
      "1544209563 TurnOff";

    const process = spawn("node", ["./index.js"], { shell: true });

    process.stdin.write(deltaCommands);
    process.stdin.end();

    let output = "";
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.on("close", (code) => {
      expect(output).toContain("Estimated energy used: 1.528 Wh");
      done();
    });
  });

  it("handles errors in input correctly", (done) => {
    jest.setTimeout(10000);
    const filePath = path.join(__dirname, "mocks", "inputWithErrors.txt");
    const inputCommands = fs.readFileSync(filePath, "utf8");

    const process = spawn("node", ["./index.js"], { shell: true });

    process.stdin.write(inputCommands);
    process.stdin.end();

    let errorOutput = "";
    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    process.on("close", (code) => {
      expect(errorOutput).toMatch(/Invalid command/);
      done();
    });

    process.on("error", (err) => {
      console.error("Failed to start subprocess.");
      done(err);
    });
  });
});
