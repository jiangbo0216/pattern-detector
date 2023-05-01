import {
  equal_abcd as equal_abcd_3,
  pattern中文999,
  pattern国旗999,
  pattern日语999,
  pattern阿语999,
  pattern0x999,
  pattern360,
  pattern999,
} from "./fixtures/3位数字";
import { equal_abcd as equal_abcd_4,
pattern0x10k,
pattern99乘法表,
pattern10k,
patternX,
pattern生日号,
pattern阿语10k
} from "./fixtures/4位数字";
import { equal_abcd as equal_abcd_5,
pattern100k,
patternX5
} from "./fixtures/5位数字";
import { equal_abcd as equal_abcd_6,
patternA股代码,
patternX6
} from "./fixtures/6位数字";
import { equal_abcd as equal_abcd_over_6,
patternWanClub,
pattern豹子手机号
} from "./fixtures/6位数字以上";
import {
  pattern0x9,
  pattern0x99,
  pattern1Hex,
  pattern2Hex,
  pattern3Hex
} from './fixtures/0x数字'
import { PatternDetector, detectPatterns } from "./pattern-detector";

it('联合测试', () => {
  expect(detectPatterns("333.bit")).toEqual( new Set(["AAA", "999"]));
  expect(detectPatterns("2112.bit")).toEqual( new Set([ "10K", "ABBA"]));
  expect(detectPatterns("45555.bit")).toEqual( new Set(["ABBBB", "100K"]));
  expect(detectPatterns("888000.bit")).toEqual( new Set(["AAABBB", "XXX000"]));
  expect(
    detectPatterns("0098.bit")).toEqual(
    new Set(["10K", "AABC", "0XXX", "00XX"])
  );
  expect(detectPatterns("0x9832.bit")).toEqual( new Set(["0x10K"]));
  expect(
    detectPatterns("0311.bit")).toEqual(
    new Set(["ABCC", "0XXX", "10K", '生日号'])
  );
})

describe("0x 数字", () => {
  it("0x999", () => {
    pattern0x999.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("0x999");
    });
  });

  it("0x10K", () => {
    pattern0x10k.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("0x10K");
    });
  });
  it("pattern3Hex", () => {
    pattern3Hex.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("3Hex");
    });
  });
  it("pattern2Hex", () => {
    pattern2Hex.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("2Hex");
    });
  });
  it("pattern1Hex", () => {
    pattern1Hex.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("1Hex");
    });
  });
  it("pattern0x99", () => {
    pattern0x99.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("0x99");
    });
  });

  test("0x9", () => {
    pattern0x9.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("0x9");
    });
  });
});

describe("3位数字", () => {
  test("360度", () => {
    pattern360.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("360度");
    });
  });

  test("999", () => {
    pattern999.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("999");
    });
  });

  test("中文999", () => {
    pattern中文999.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });
      const pattern = patternDetector1.parsePatterns();
      if (pattern.size < 2 && pattern.size > 0) {
        expect(pattern).toEqual(new Set(["中文999"]));
      } else {
        expect(pattern).toEqual(new Set(["中文999", "日语999"]));
      }
    });
  });
  test("日语999", () => {
    pattern日语999.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      if (pattern.size < 2 && pattern.size > 0) {
        expect(pattern).toEqual(new Set(["日语999"]));
      } else {
        expect(pattern).toEqual(new Set(["中文999", "日语999"]));
      }
    });
  });

  test("阿语999", () => {
    pattern阿语999.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      expect(patternDetector1.parsePatterns()).toEqual(new Set(["阿语999"]));
    });
  });

  test("国旗999", () => {
    pattern国旗999.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      expect(patternDetector1.parsePatterns()).toEqual(new Set(["国旗999"]));
    });
  });

  it("ABC", () => {
    Object.entries(equal_abcd_3).forEach(([key, val]) => {
      val.split(" ").forEach((segment) => {
        var patternDetector = new PatternDetector({ pos: 0, input: segment });
        expect(patternDetector.parseAbcde()).toEqual([key]);
      });
    });
  });
});

// doc: 单元测试抽象层次太高不利于测试
describe('4位数字', () => {
  [
    ['99乘法表', pattern99乘法表],
    ['10K', pattern10k],
    ['生日号', pattern生日号],
    ['阿语10K', pattern阿语10k]
  ].forEach(([name, pattern]) => {
    it(name, () =>{
      pattern.split(" ").forEach((segment) => {
        const patternDetector1 = new PatternDetector({ pos: 0, input: segment });
  
        const pattern = patternDetector1.parsePatterns();
        expect(pattern).toContain(name);
      });
    })
  });

  const mapConfig = [
    ['4位数字abcd', equal_abcd_4, 'parseAbcde'],
    ['x-pattern', patternX, 'parsePatterns']
  ] as const

  mapConfig.forEach(([name, patternMap, method]) => {
    it(name, () => {
      Object.entries(patternMap).forEach(([key, val]) => {
        val.split(" ").forEach((segment) => {
          var patternDetector = new PatternDetector({ pos: 0, input: segment });
          expect(patternDetector[method]()).toContain(key);
        });
      });
    });
  })

})

describe('5位数字', () => {
  test("100K", () => {
    pattern100k.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("100K");
    });
  });
  Object.entries(patternX5).forEach(([key, val]) => {
    test(key, () => {
      val.split(" ").forEach((segment) => {
        var patternDetector = new PatternDetector({ pos: 0, input: segment });
        const pattern = patternDetector.parsePatterns();
        expect(pattern).toContain(key);
      });
    });
  });

  Object.entries(equal_abcd_5).forEach(([key, val]) => {
    it(key, () => {
      val.split(" ").forEach((segment) => {
        var patternDetector = new PatternDetector({ pos: 0, input: segment });
        const pattern = patternDetector.parseAbcde();
        if (pattern.length < 2 && pattern.length > 0) {
          expect(pattern).toEqual([key]);
        } else {
          expect(pattern).toContain(key);
        }
      });
    });
  });
})

describe('6位数字', () => {


  Object.entries(patternX6).forEach(([key, val]) => {
    it(key, () => {
      val.split(" ").forEach((segment) => {
        var patternDetector = new PatternDetector({ pos: 0, input: segment });
        const pattern = patternDetector.parsePatterns();
        expect(pattern).toContain(key);
      });
    });
  });

  Object.entries(equal_abcd_6).forEach(([key, val]) => {
    it(key, () => {
      val.split(" ").forEach((segment) => {
        var patternDetector = new PatternDetector({ pos: 0, input: segment });
        const pattern = patternDetector.parseAbcde();
        if (pattern.length < 2 && pattern.length > 0) {
          expect(pattern).toEqual([key]);
        } else {
          expect(pattern).toContain(key);
        }
      });
    });
  });

  it('A股代码', () => {
    patternA股代码.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("A股代码");
    });
  })
})

describe('6位数字以上', () => {
  it("WanClub", () => {
    patternWanClub.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("WanClub");
    });
  });
  it("豹子手机号", () => {
    pattern豹子手机号.split(" ").forEach((segment) => {
      const patternDetector1 = new PatternDetector({ pos: 0, input: segment });

      const pattern = patternDetector1.parsePatterns();
      expect(pattern).toContain("豹子手机号");
    });
  });

})

test("生日号", () => {
  const patternDetector1 = new PatternDetector({ pos: 0, input: "0203" });

  expect(patternDetector1.parsePatterns()).toEqual(
    new Set(["生日号", "0X0X", "10K", "0XXX"])
  );
});

test("no pattern", () => {
  const patternDetector1 = new PatternDetector({ pos: 0, input: "01x" });

  expect(patternDetector1.parsePatterns()).toEqual(new Set());
});

test("null set", () => {
  expect(new Set([])).toEqual(new Set());
});

describe("parseAbcde", () => {

  describe("6位数字", () => {
    Object.entries(equal_abcd_6).forEach(([key, val]) => {
      it(key, () => {
        val.split(" ").forEach((segment) => {
          var patternDetector = new PatternDetector({ pos: 0, input: segment });
          const pattern = patternDetector.parseAbcde();
          if (pattern.length < 2 && pattern.length > 0) {
            expect(pattern).toEqual([key]);
          } else {
            expect(pattern).toContain(key);
          }
        });
      });
    });
  });
  describe("6位数字以上", () => {
    Object.entries(equal_abcd_over_6).forEach(([key, val]) => {
      it(key, () => {
        val.split(" ").forEach((segment) => {
          var patternDetector = new PatternDetector({ pos: 0, input: segment });
          const pattern = patternDetector.parseAbcde();
          if (pattern.length < 2 && pattern.length > 0) {
            expect(pattern).toEqual([key]);
          } else {
            expect(pattern).toContain(key);
          }
        });
      });
    });
  });
});
