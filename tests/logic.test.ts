require("ts-mocha");
import chai from "chai";
import { encodeMorse } from "../logic/logic.sakuria";

describe("⚡ Morse Encoder (encodeMorse)", () => {
  it("can encode a normal string", async () => {
    const morseCode = encodeMorse("hello world");
    chai.expect(morseCode).to.be.equal(".... . .-.. .-.. --- ....... .-- --- .-. .-.. -..");
  });

  it("can encode capital letters", async () => {
    const morseCode = encodeMorse("HeLLo WoRLd");
    chai.expect(morseCode).to.be.equal(".... . .-.. .-.. --- ....... .-- --- .-. .-.. -..");
  });
  
  it("can handle random characters", async () => {
    const morseCode = encodeMorse("*@(h98(@nf928ndjkniu241i24");
    chai.expect(morseCode).to.be.equal(".... ----. ---.. -. ..-. ----. ..--- ---.. -. -.. .--- -.- -. .. ..- ..--- ....- .---- .. ..--- ....-");
  });
});
