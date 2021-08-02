require("ts-mocha");
import chai from "chai";
import { it } from "mocha";
import { encodeMorse, decodeMorse, uwufy } from "../logic/logic.sakuria";

describe("⚡ Morse Encoder (encodeMorse)", () => {
  it("can encode a normal string", async () => {
    const morseCode = encodeMorse("hello world");
    chai.expect(morseCode).to.be.equal(".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
  });

  it("can encode capital letters", async () => {
    const morseCode = encodeMorse("HeLLo WoRLd");
    chai.expect(morseCode).to.be.equal(".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
  });

  it("can handle random characters", async () => {
    const morseCode = encodeMorse("*@(h98(@nf928ndjkniu241i24");
    chai.expect(morseCode).to.be.equal(".... ----. ---.. -. ..-. ----. ..--- ---.. -. -.. .--- -.- -. .. ..- ..--- ....- .---- .. ..--- ....-");
  });

  it("can decode morse with text in between", async () => {
    const morseCode = decodeMorse(".... . .-.. .-.. --- world");
    chai.expect(morseCode).to.be.equal("hello");
  });
});

describe("⚡ UwU-ifier (uwufy)", () => {
  it("can encode a normal string", async () => {
    const uwu = uwufy("hello world, i wanna become uwu uwuwuuw");
    chai.expect(uwu).to.contain("hewwo");
    chai.expect(uwu).to.contain("wowwd");
    chai.expect(uwu).to.contain("wannya");
  });

  it("can preserve symbols", async () => {
    const uwu = uwufy("&!*@#&");
    chai.expect(uwu).to.contain("&!*@#&");
  });

  it("can preserve numbers", async () => {
    const uwu = uwufy("hewwo 125812985 owo");
    chai.expect(uwu).to.contain("125812985");
  });
});
