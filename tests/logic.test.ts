require("ts-mocha");
import chai from "chai";
import { it } from "mocha";
import { encodeMorse, decodeMorse, uwufy, getWaifuNameFromFileName, calcSpread } from "../logic/logic.sakuria";

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

  it("can preserve capitalizations", async () => {
    const uwu = uwufy("HELLO WORLD, I WANNA BECOME UWU UWUWUUW");
    chai.expect(uwu).to.contain("HEWWO");
    chai.expect(uwu).to.contain("WOWWD");
    chai.expect(uwu).to.contain("WANNYA");
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

describe("⚡ Waifu name parser (getWaifuNameFromFileName)", () => {
  it("can get a single name", async () => {
    const name = getWaifuNameFromFileName("rem.png");
    chai.expect(name).to.contain("Rem");
  });
  it("can get a single name with multiple words", async () => {
    const name = getWaifuNameFromFileName("Kan shimakaze.png");
    chai.expect(name).to.contain("Kan Shimakaze");
  });
  it("can persist secondary capitalizations", async () => {
    const name = getWaifuNameFromFileName("kanColle shimakaze.png");
    chai.expect(name).to.contain("KanColle Shimakaze");
  });
  it("can handle bullshit extensions", async () => {
    const name = getWaifuNameFromFileName("shimakaze.piouAW3HR9-83");
    chai.expect(name).to.contain("Shimakaze");
  });
  it("can handle no extensions", async () => {
    const name = getWaifuNameFromFileName("shimakaze");
    chai.expect(name).to.contain("Shimakaze");
  });
  it("can persist numbers", async () => {
    const name = getWaifuNameFromFileName("02");
    chai.expect(name).to.contain("02");
  });
});

describe("⚡ RNG Number Spread (calcSpread)", () => {
  it("can get a random number between a bipolar limit (x1000)", async () => {
    for (let i = 0; i < 1000; i++) {
      const rngNumber = calcSpread(1000);
      chai.expect(rngNumber).to.be.below(1100);
      chai.expect(rngNumber).to.be.above(899);
    }
  });
});
