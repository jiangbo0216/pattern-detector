/**
 * according to the website https://godid.io/，
 * here we consider
 * - 3 ~ 5 number
 * - > 6 number
 *  0x number
 * @param name
 */
export function detectPatterns(name: string): Set<string> {
  if (!name.endsWith(".bit")) {
    console.warn("argument should endWith .bit");
    return new Set();
  }

  const patternDetector = new PatternDetector({pos: 0, input: name.slice(0, -4)})

  return patternDetector.parsePatterns()
}
/*
G = ( N T S P ）
（P）S = <999> ｜ <AAA> ｜ <ABC> ｜ <ABB> ｜ <ABA> ｜ <360度> ｜ <0x999> 
<digitA> = 0-9
<digitB> = digitA + 1
<digitC> = digitB + 1
<digitD> = digitC + 1
<digitE> = digitD + 1
<digitF> = 0-9 - <digitA>
<digit2> = 0-2
<999> = <digitA>^3
<AAA> = (<digitA>){3}
<ABC> = <digitA><digitB><digitC>
<ABB> = <digitA>(<digitF>){2}
<ABA> = <digitA><digitF><digitA> 其中 digitA = digitA
<360度> = <digit2><digitA><digitA>°
<0x999> = 0x<digitA>^3
*/
export class PatternDetector {
  pos: number;
  input: string;

  constructor({ pos, input }: { pos: number; input: string }) {
    this.pos = pos;
    this.input = input;
  }

  parseArab(inputLen: number): Set<string> {
    if (this.comsumeN(3, (char: string) => !!char.match(/[٠١٢٣٤٥٦٧٨٩]/)).pass) {
      if (inputLen < 4) {
        return new Set(['阿语999'])
      } else if (inputLen === 4) {
        if (this.comsumeN(1, (char: string) => !!char.match(/[٠١٢٣٤٥٦٧٨٩]/)).pass) {
          return new Set(['阿语10K'])
        } else {
          return new Set()
        }
      } else {
        return new Set()
      }
    } else {
      return new Set()
    }
  }

  parseFlag (): Set<string> {
    this.consumeFlag()
    if (this.comsumeN(3, (char: string) => !!char.match(/\d/)).pass) {
      return new Set(['国旗999'])
    } else {
      return new Set()
    }
  }

  parse420Suffix ( inputLen: number, patterns: string[]) {
    switch (inputLen) {
      case 5:
        patterns.push('XX420')
        break;
      case 6:
        patterns.push('XXX420')
        break;
    
      default:
        break;
    }
  }

  parse420Prefix(inputLen: number, patterns: string[]) {
    switch (inputLen) {
      case 5:
        patterns.push('420XX')
        break;
      case 6:
        patterns.push('420XXX')
        break;
    
      default:
        break;
    }
  }

  parseAAA (inputLen: number, patterns: string[]) {
    const normalPattern = inputLen === 3 
                              ? ['999']
                              : inputLen < 5
                                ? ['10K']
                                : inputLen < 6 
                                  ? ['100K']
                                  : []
      patterns.push(new Array(inputLen).fill('A').join(''), ...normalPattern)
  }

  parsePhoneNumber (input: string, patterns: string[]) {
    if ([
      '134', '135', '136', '137',
      '138', '139', '147', '148',
      '150', '151', '152', '157',
      '158', '159', '165', '172',
      '178', '182', '183', '184',
      '187', '188', '195', '198',

      '130', '131', '132',
      '145', '146', '155',
      '156', '166', '171',
      '175', '176', '185',
      '186', '196',

      '133', '149', '153',
      '162', '173', '174',
      '177', '180', '181',
      '189', '191', '193',
      '199'
    ].some(prefix => {
      return input.startsWith(prefix)
    })) {
      if(this.checkEqual(input.slice(3))) {
        patterns.push('豹子手机号')
      }
    }
  }
  // TODO remove ignore
  // @ts-ignore
  parsePatterns(): Set<string> {
    const input = this.input
    const inputLen = this.input.length
    
    // TODO  Complement languages patterns
    if (input.startsWith('0x')) {
      return this.parse0x()
    }

    if (input.endsWith('°')) {
      return this.parse360()
    }

    // 中文和日语 零是相同的
    if (input === '零零零') {
      return new Set(['中文999', '日语999'])
    }
    // 一个字符串对应多个模式，不太适合 递归下降的方式，因为在多模式的情况下需要回溯
    // 我们使用两次遍历的方式
    /*
    p-中文999
    p-日语999
    */
    if (inputLen === 3 ) {
      const numbers = input.split('')
      
      if (numbers.every(number => number.match(/[一二三四五六七八九十零]/))) {
        return new Set(['中文999'])
      }
      if (numbers.every(number => number.match(/[零壱弐参肆伍陸漆捌玖]/))) {
        return new Set(['日语999'])
      }
    }

    /*
    p-阿语999
    p-阿语10K
    */
    if (input.match(/^[٠١٢٣٤٥٦٧٨٩]/)) {
      return this.parseArab(inputLen)
    }
    /*
    p-国旗999
    */
    if (input.match(/^[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/)) {
      return this.parseFlag()
    }




    const { pass, result: numbers} = this.comsumeN(inputLen, (char: string) => !!char.match(/\d/))

    if (!pass) {
      return new Set()
    }


    /*
    p-AAA
    p-AAAA
    p-AAAAA
    p-AAAAAA
    p-999
    p-10K
    p-100K
    */
    let patterns: string[] = []

    if (input.endsWith('420')) {
      this.parse420Suffix(inputLen, patterns)
    }

    if (input.startsWith('420')) {
      this.parse420Prefix(inputLen, patterns)
    }


    if (this.checkEqual(numbers)) {
      this.parseAAA(inputLen, patterns)
    }
    /*
    p-0XXX -
    p-00XX -
    p-00XX0 -
    p-00XX00 -
    p-00XXX -
    p-000XX -
    p-000XXX -
    p-0X0X -
    p-0XX0 -
    p-XX00 -
    p-XX000 -
    p-XXX00 -
    p-XXX000 -
    p-X0X0 -
    p-XX88 -
    p-XX69 -
    p-XXX69 - 
    p-XXXX69 -
    p-69XXX -
    p-99乘法表 -
    p-生日号 -
    */
    if (input.endsWith('69')) {
      const prefix = input.slice(0, -2)
      const prefixLen = prefix.length 
      if (prefixLen > 1 && prefixLen < 5) {
        patterns.push(new Array(prefixLen).fill('X').join('') + '69')
      }
    }

    if (input.startsWith('69')) {
      const suffix = input.slice(2)
      const suffixLen = suffix.length 
      if (suffixLen === 3) {
        patterns.push('69' + new Array(suffixLen).fill('X').join(''))
      }
    }

    if (inputLen === 4) {
      if (this.checkIsValidDate(numbers)) {
        patterns.push('生日号')
      }
      if (numbers[0] !== '0' && Number(numbers[0]) * Number(numbers[1]) === Number(`${numbers[2]}${numbers[3]}`)) {
        patterns.push('99乘法表')
      }

      if (input.endsWith('88')) {
        patterns.push('XX88')
      }
    }

    if (input.startsWith('0')) {
      switch (input.length) {
        case 4:
          patterns.push('0XXX')
          if (this.checkEqual(input.slice(0,2))) {
            patterns.push('00XX')
          }

          if (input[2] === '0') {
            patterns.push('0X0X')
          }

          if (input[3] === '0') {
            patterns.push('0XX0')
          }
          break;
        case 5: 
          if (this.checkEqual(input.slice(0,2))) {
            patterns.push('00XXX')
            if (input[4] ===  '0') {
              patterns.push('00XX0')
            }
            if (input[2] === '0') {
              patterns.push('000XX')
            }
          }
          break;

        case 6: 
          if (this.checkEqual(input.slice(0,2))) {
            if(this.checkEqual(input.slice(4), '0')) {
              patterns.push('00XX00')
            }
            if (input[2] === '0') {
              patterns.push('000XXX')
            }
          }
          break;
        default:
          break;
      }

    }

    if (input.endsWith('0')) {
      switch (inputLen) {
        case 4:
          if (this.checkEqual(input.slice(-2))) {
            patterns.push('XX00')
          }

          if (this.input[1] === '0') {
            patterns.push('X0X0')
          }
          break;
        case 5:
          if (this.checkEqual(this.input.slice(-2))) {
            patterns.push('XXX00')
            if (this.input[2] === '0') {
              patterns.push('XX000')
            }
          }

          break;
        case 6:
          if (this.checkEqual(this.input.slice(-3))) {
            patterns.push('XXX000')
          }

          if (this.input[1] === '0') {
            patterns.push('X0X0')
          }
          break;
        default:
          break;
      }
    }

    if (this.input.length === 3) {


      // const specialPattern = this.parse3AbcPattern(numbers)
      // if (specialPattern) {
      //   patterns.push(specialPattern, '999')
      // } else {
        patterns.push('999')
      // }
    }
    if (this.input.length === 4) {

      // const specialPattern = this.parse4number(numbers)
      // if (specialPattern) {
      //   patterns.push(...specialPattern, '10K')
      // } else {
        patterns.push('10K')
      // }
    }

    if (this.input.length === 5) {
 
      // const specialPattern = this.parse5number(numbers)
      // if (specialPattern) {
      //   patterns.push(...specialPattern, '100K')
      // } else {
        patterns.push( '100K')
      // }
    }
    const allValidPatterns = new Set([
      'AAA',
      'ABC',
      'ABB',
      'ABA',
      'AAB',

      'ABCD', // 这个需要二次确认
      'ABCC',
      'AAAA',
      'ABBB',
      'AABB',
      'AAAB',
      'ABAA',
      'AABA',
      'ABBA',
      'ABAB',
      'AABC',
      'AACC',
      'ABBC',

      'AAAAA',
      'ABCDE',
      'ABBBB',
      'AABBB',
      'AAABB',
      'AAAAB',
      'ABBBA',
      'ABAAA',
      'AABAA',
      'AAABA',
      'ABABA',
      'XABCD',
      'AAABC',
      'AABBC',
      'AABCC',
      'ABCCC',
      'ABBCC',
      'ABBCC',
      'ABCBA',

      'AAAAAA',
      'ABBBBB',
      'AABBBB',
      'AAABBB',
      'AAAABB',
      'AAAAAB',
      'ABBABB',
      'ABBABB',
      'ABABAB',
      'AABBCC',
      'ABCCCC',
      'ABBBBC',
      'AAAABC',
      'ABCABC',

      'AAABBBB',
      'AAAABBBB',
      'ABBCBBA',
    ])
    const abcPatterns = this.parseAbcde()
    for (const abcPattern of abcPatterns) {
      if (allValidPatterns.has(abcPattern)) {
        patterns.push(abcPattern)
      }
    }


    /*
    p-WanClub
    p-豹子手机号
    p-A股代码
    */

    if (inputLen === 6) {
      if (input.startsWith('000') 
      || input.startsWith('600')
      || input.startsWith('601')
      || input.startsWith('603')
      ) {
        patterns.push('A股代码')
      }
    }

    if (input.endsWith('0000')) {
      const prefixLen = input.slice(0, -4).length
      if ( prefixLen> 0 && prefixLen < 4) {
        patterns.push('WanClub')
      }
    }

    if (inputLen === 11) {
      this.parsePhoneNumber(input, patterns)
    }

    return new Set(patterns)

  }

  parse0x(): Set<string> {
    this.consume0x()
    const len = this.input.length - 2
    if (len < 5) {
      let patterns = []
      const {pass, result: numbers} = this.comsumeN(len, (char: string) => !!char.match(/([0-9]|[a-f])/))
      if (!pass) {
        return new Set()
      } else {
        if (this.input.match(/[a-f]/) ) {
          if (len < 4) {
            patterns.push(`${len}Hex`)
          }
        } else {
          if (len < 4) {
            patterns.push(`${len}Hex`)
          }
          patterns.push(len < 4 ? `0x${10**len -1}`: `0x10K`)
        }
      }
      return new Set(patterns)
    } else {
      return new Set()
    }
  }

  parse360(): Set<string> {
    if (this.input <= '360°') {
      return new Set(['360度'])
    } else {
      return new Set()
    }
  }

  // parse3AbcPattern (numbers: string[]) {
  //   if (numbers[0] == numbers[1] ) {
  //     if (numbers[0] == numbers[2]) {
  //       return 'AAA'
  //     } else {
  //       return 'AAB'
  //     }
  //   } else {
  //     if (numbers[0] == numbers[2]) {
  //       return 'ABA'
  //     } else if (numbers[1] == numbers[2]) {
  //       return 'ABB'
  //     } else if (numbers[2].charCodeAt(0) - numbers[1].charCodeAt(0) === 1
  //     && numbers[1].charCodeAt(0) - numbers[0].charCodeAt(0) === 1) {
  //       return 'ABC'
  //     }
  //   }
  // }

  // parse4number (numbers: string[]) {
  //   const specialPattern = this.parse3AbcPattern(numbers)
  //   let patterns = []
  //   if (specialPattern === 'AAA') {
  //     if (this.checkEqual(numbers.slice(2))) {
  //       patterns.push( 'AAAA')
  //     }
  //   }
  //   if (specialPattern === 'ABC') {
  //     if (numbers[3].charCodeAt(0) - numbers[2].charCodeAt(0) === 1 ) {
  //       patterns.push('ABCD')
  //     }
  //   }

  //   if (specialPattern === 'ABB') {
  //     if (numbers[3] === numbers[2]) {
  //       patterns.push( 'ABBB')
  //     } else if (numbers[3] === numbers[0]) {
  //       patterns.push('ABBA')
  //     } else {
  //       patterns.push('ABBC')
  //     }
  //   }
  //   if (specialPattern === 'AAB') {
  //     if (numbers[3] === numbers[2]) {
  //       patterns.push('AABB')
  //     } else if (numbers[3] === numbers[1]) {
  //       patterns.push('AABA')
  //     } else {
  //       patterns.push('AABC')
  //     }
  //   }

  //   if (specialPattern === 'ABA') {
  //     if (numbers[3] === numbers[2]) {
  //       patterns.push('ABAA')
  //     } else if (numbers[3] === numbers[1]) {
  //       patterns.push('ABAB')
  //     }
  //   }

  //   if (numbers[3] === numbers[2] && this.checkAllDiff(numbers.slice(0,3))) {
  //     patterns.push('ABCC')
  //   }

  //   // if (this.input < '1000') {
  //   //   patterns.push('0XXX')
  //   // }
  //   // if (this.input < '0100') {
  //   //   patterns.push('00XX')
  //   // }

  //   // if (numbers[0] === '0' && numbers[2] === '0') {
  //   //   patterns.push('0X0X')
  //   // }
  //   // if (numbers[0] === '0' && numbers[3] === '0') {
  //   //   patterns.push('0XX0')
  //   // }
  //   // if (numbers[2] === '0' && numbers[3] === '0') {
  //   //   patterns.push('XX00')
  //   // }
  //   // if (numbers[1] === '0' && numbers[3] === '0') {
  //   //   patterns.push('X0X0')
  //   // }
  //   // if (numbers[2] === '8' && numbers[3] === '8') {
  //   //   patterns.push('XX88')
  //   // }
  //   // if (numbers[2] === '6' && numbers[3] === '9') {
  //   //   patterns.push('XX69')
  //   // }
    

  //   // // check is a valid date
  //   // if (this.checkIsValidDate(numbers)) {
  //   //   patterns.push('生日号')
  //   // }

  //   return patterns.length === 0 ? undefined : patterns
  // }

  /*
  p-AAAAA
  p-AAABB
  p-AAAAB
  p-ABCDE
  p-ABBBB
  p-ABBBA
  p-AABBB
  */
  // parse5number(numbers: string[]) {
  //   const specialPattern = this.parse3AbcPattern(numbers)
  //   let patterns = []
  //   if (specialPattern === 'AAA') {
  //     this.checkAbc({a: [[3,5]]}) && patterns.push('AAAAA')
  //     this.checkAbc({a: [[3,3]], b: [[4,5]]}) && patterns.push('AAABB')
  //     this.checkAbc({a: [[3,4]], b: [[5,5]]}) && patterns.push('AAAAB')
  //   }

  //   if (specialPattern === 'ABC') {
  //     if (this.checkIsAcc(numbers.slice(2))) {
  //       patterns.push('ABCDE')
  //     }
  //   }

  //   if (specialPattern === 'ABB') {
  //     if (this.checkEqual(numbers.slice(2))) {
  //       patterns.push('ABBBB')
  //     } else if (this.checkEqual(numbers.slice(2, 4)) && numbers[4] === numbers[0]) {
  //       patterns.push('ABBBA')
  //     }
  //   }

  //   if (specialPattern === 'AAB') {
  //     if (this.checkEqual(numbers.slice(2))) {
  //       patterns.push('AABBB')
  //     }
  //   }


  //   return  patterns.length === 0 ? undefined : patterns


  // }

  /**
   * Check whether the following n characters meet test functino
   * @param n 
   */
  comsumeN(n: number, test: (s: string) => boolean): {pass: boolean, result: string[]} {
    let result = []
    while (n > 0 && test(this.nextChar())) {
      n--
      result.push( this.consumeChar())
    }
    return {pass: n === 0, result}
  }

  nextChar() {
    return this.input[this.pos]
  }

  consumeChar () {
    // 处理js字符编码
    const char = this.input[this.pos]
    this.pos++
    return char
  }

  consume0x () {
    // 处理js字符编码
    this.pos += 2
  }

  consumeFlag () {
    // 处理js字符编码
    this.pos += 4
  }

  checkIsValidDate (numbers: string[]) {
    const month = parseInt(numbers[0] + numbers[1]);
    const day = parseInt(numbers[2] + numbers[3]);
    const date = new Date(2020, month - 1, day);
    return (
      !isNaN(date.getTime()) &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  checkEqual (numbers: string[] | string, base?: string) {
    if (!Array.isArray(numbers)) {
      numbers = numbers.split('')
    } 
    let el = base ? base : numbers[0]
    for (let i = 0, len = numbers.length; i < len; i++) {
      if (el !== numbers[i]) {
        return false
      }
    }
    return true

  }

  checkAllDiff (numbers: string[]) {
    const charSet = new Set(numbers);
    return charSet.size === numbers.length;
  }

  checkIsAcc (numbers: string[] | string) {
    if (!Array.isArray(numbers)) {
      numbers = numbers.split('')
    }
    let el = numbers[0]
    for (let i = 1, len = numbers.length; i < len; i++) {
      if (numbers[i].charCodeAt(0) - el.charCodeAt(0) !== i) {
        return false
      }
    }
    return true
  }

  /**
   * here abc is diff，not acc
   * 表示从第一个开始，到第几个结束
   */
  // checkAbc ({a,b,c}: {a: number[][]; b?: number[][]; c?: number[][]}) {
  //   const firstAVal = this.input[a[0][0]]

  //   let pass = true

  //   for (const scope of a) {
  //     for (let i = scope[0]-1; i < scope[1]; i++) {
  //       if (this.input[i] !== firstAVal) {
  //         pass = false
  //       }
  //     }
  //   }
  //   if (b) {
  //     const firstBVal = this.input[b[0][0]]
  //     if (firstBVal === firstAVal) return false
  //     for (const scope of b) {
  //       for (let i = scope[0]-1; i < scope[1]; i++) {
  //         if (this.input[i] !== firstBVal) {
  //           pass = false
  //         }
  //       }
  //     }
  //   }

  //   if (c) {
  //     const firstCVal = this.input[c[0][0]]
  //     if (firstCVal === firstAVal || firstCVal === firstCVal) return false
  //     for (const scope of c) {
  //       for (let i = scope[0]-1; i < scope[1]; i++) {
  //         if (this.input[i] !== firstCVal) {
  //           pass = false
  //         }
  //       }
  //     }
  //   }
  //   return pass
  // }

  parseAbcde (): string[] {
    let map = {
      a: [[0,1]],
      b: [[]] as number[][],
      c: [[]] as number[][],
      d: [[]] as number[][],
      e: [[]] as number[][],
    }
    const input = this.input
    const initialA = input[map.a[0][0]]
    let initialB : string | undefined, 
    initialC : string | undefined, 
    initialD : string | undefined, 
    initialE: string | undefined
    function initialBcde (val: string, i: number) {
      !initialB ? (initialB = val, map.b[0][0] = i, map.b[0][1] = i + 1, pre = 'b')
                : !initialC
                  ? (initialC = val, map.c[0][0] = i, map.c[0][1] = i + 1, pre = 'c')
                    : !initialD
                      ? (initialD = val, map.d[0][0] = i, map.d[0][1] = i + 1,pre = 'd')
                      : !initialE
                        ? (initialE = val, map.e[0][0] = i, map.e[0][1] = i + 1, pre = 'e')
                        : undefined
    }

    let pre = 'a'
    for (let i = 1, inputLen = input.length ; i < inputLen; i++) {
      switch (input[i]) {
        case initialA:
          const aLen = map.a.length
          if(pre !== 'a') {
            map.a.push([i, i+1])
            pre = 'a'
          } else {
            map.a[aLen-1][1] = i+1
          }
          break;
        case initialB:
          if(pre !== 'b') {
            map.b.push([i, i+1])
            pre = 'b'
          } else {
            const bLen = map.b.length
            map.b[bLen-1][1] = i+1
          }
          break;
        case initialC:
          if(pre !== 'c') {
            map.c.push([i, i+1])
            pre = 'c'
          } else {
            const bLen = map.c.length
            map.c[bLen-1][1] = i+1
          }
          break;
        case initialD:
          if(pre !== 'd') {
            map.d.push([i, i+1])
            pre = 'd'
          } else {
            const bLen = map.d.length
            map.d[bLen-1][1] = i+1
          }
          break;
        case initialE:
          if(pre !== 'e') {
            map.e.push([i, i+1])
            pre = 'e'
          } else {
            const bLen = map.e.length
            map.e[bLen-1][1] = i+1
          }
          break;
        default:
          initialBcde(input[i], i)
          break;
      }
    }

    let patternSegment = ['', '', '', '', '']
    Object.entries(map).forEach(([key, val]) => {
      for (const p of val) {
        if (p.length > 0) {
          key = key.toUpperCase()
          const len = p[1] - p[0]
          const patternSegmentIdx = p[0]
          patternSegment[patternSegmentIdx] = new Array(len).fill(key).join('')
        }
      }
    })
    
    const pattern = patternSegment.join('')

    // 顺子
    const set = new Set([
      'ABC',
      'ABCD',
      'ABCDE',
      'AABCD',
      'ABACD',
      'ABCAD',
      'ABCDA',
    ])
    if (set.has(pattern)) {
      if (this.checkIsAcc(this.input.slice(1))) {
        let specialPattern = []
        if (this.input.length === 5) {
          specialPattern.push('XABCD')
        }
        if (this.checkIsAcc(this.input.slice(0,2)) ) {
          specialPattern.push(pattern)
        }
        return specialPattern
      } else {
        return []
      }
      
    }
    return [pattern]
  }
}
