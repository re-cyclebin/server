module.exports = {
  rewardOne (num) {
    if(Number(num) >= 10000) return Number(num) - 10000
    else return num
  },
  rewardTwo (num) {
    if(Number(num) >= 20000) return Number(num) - 20000
    else return num
  },
  rewardThree (num) {
    if(Number(num) >= 30000) return Number(num) - 30000
    else return num
  },
  rewardFour (num) {
    if(Number(num) >= 50000) return Number(num) - 50000
    else return num
  },
  rewardFive (num) {
    if(Number(num) >= 100000) return Number(num) - 100000
    else return num
  }
}