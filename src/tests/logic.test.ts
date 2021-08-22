require("ts-mocha");
import chai from "chai";
import { it } from "mocha";
import {
  encodeMorse,
  decodeMorse,
  uwufy,
  getWaifuNameFromFileName,
  calcSpread,
  isValidHttpUrl,
  capitalizeFirstLetter,
  msToTime,
} from "../logic/logic.sakuria";

describe("⚡ Morse Encoder (encodeMorse)", () => {
  it("can encode a normal string", async () => {
    const morseCode = encodeMorse("hello world");
    chai.expect(morseCode).to.equal(".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
  });

  it("can encode capital letters", async () => {
    const morseCode = encodeMorse("HeLLo WoRLd");
    chai.expect(morseCode).to.equal(".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
  });

  it("can handle random characters", async () => {
    const morseCode = encodeMorse("*@(h98(@nf928ndjkniu241i24");
    chai
      .expect(morseCode)
      .to.equal(
        ".... ----. ---.. -. ..-. ----. ..--- ---.. -. -.. .--- -.- -. .. ..- ..--- ....- .---- .. ..--- ....-"
      );
  });

  it("can decode morse with text in between", async () => {
    const morseCode = decodeMorse(".... . .-.. .-.. --- world");
    chai.expect(morseCode).to.equal("hello");
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
  it("can replace underscores with spaces", async () => {
    const name = getWaifuNameFromFileName("kanColle_shimakaze.png");
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
      chai.expect(rngNumber).to.below(1100);
      chai.expect(rngNumber).to.above(899);
    }
  });
});

describe("⚡ URL Validator (isValidHttpUrl)", () => {
  it("passes for HTTP URLs", () => chai.expect(isValidHttpUrl("http://google.com")));
  it("passes for HTTPS URLs", () => chai.expect(isValidHttpUrl("https://google.com")));
  it("fails for random shit", () => chai.expect(isValidHttpUrl("9283fn98235")).to.be.false);
});

describe("⚡ Capitalize first letter a string (capitalizeFirstLetter)", () => {
  it("can capitalize a string", async () => {
    chai.expect(capitalizeFirstLetter("your fucking mom 23")).to.equal("Your Fucking Mom 23");
  });
});

describe("⚡ Milliseconds to human readable (msToTime)", () => {
  it("can convert 1000ms to 1 sec", () => chai.expect(msToTime(1000)).to.equals('1 sec'));
  it("can convert 10000ms to 10 sec", () => chai.expect(msToTime(10000)).to.equals('10 sec'));
  it("can convert 300000ms to 5 min", () => chai.expect(msToTime(300000)).to.equals('5 min'));
  it("can convert 3600000ms to 1 hour", () => chai.expect(msToTime(3600000)).to.equals('1 hour'));
  it("can convert 86400000ms to 1 days", () => chai.expect(msToTime(86400000)).to.equals('1 days'));
});


