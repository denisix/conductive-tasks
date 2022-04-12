
const parseLine = line => {
  const values = line.split(',')

  if (line.indexOf('"') > -1) {
    let start = -1, buf = ''

    for (let i = 0; i < values.length; i++) {

      if (values[i].indexOf('"') > -1) { // found "

        if (start > -1) {
          for (let x = start; x <= i; x++) buf += values[x] + (x === i ? '' : ',')

          values.splice(start, i - start)
          values[start] = buf

          buf = ''
          start = -1
        }

        if (start === -1) start = i
      }
    }
  }

  return values
}

// test:
//a = '040006402541,0400064,"LAKE HAVASU, CHARTER SCHOOL, INC.",LAKE HAVASU CHARTER SCHOOL,"LAKE, HA,VASU,, CITY",AZ,34.467700,-114.299000,5,33,3'
//console.log('values ->', parseLine(a))

module.exports = parseLine